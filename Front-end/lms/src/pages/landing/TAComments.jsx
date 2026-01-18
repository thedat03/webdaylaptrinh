import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faArrowLeft,
    faCheckCircle,
    faBookOpen,
    faSearch,
    faSort,
    faGraduationCap,
    faEye,
    faEyeSlash,
    faTrash,
    faExternalLinkAlt,
    faReply,
    faChevronDown,
    faChevronUp,
    faThumbsUp
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { commentService } from "../../api/comment.service";
import { message, Input, Button, Select, Card, Tag, Space, Empty, Spin, Pagination, Popconfirm, Tooltip, Avatar } from "antd";
const { TextArea } = Input;

function TAComments() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [commentReplies, setCommentReplies] = useState({}); // Map commentId -> replies[]
    const [expandedReplies, setExpandedReplies] = useState({}); // Map commentId -> boolean (show replies)
    const [loadedReplies, setLoadedReplies] = useState({}); // Map commentId -> boolean (replies đã được load)
    const [repliesCount, setRepliesCount] = useState({}); // Map commentId -> number (số lượng replies)
    const [_showMenu, setShowMenu] = useState({}); // Map commentId -> boolean (show menu)
    const [likedComments, setLikedComments] = useState({}); // Map commentId -> boolean (đã like chưa)
    const [likeCounts, setLikeCounts] = useState({}); // Map commentId -> number (số lượng like)

    // Filters and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [sortBy, setSortBy] = useState("newest");
    const [filterBy, setFilterBy] = useState("all"); // all, unanswered, answered, hidden
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadComments();
        loadCourses();

        // Check for commentId in URL params (from notification click)
        const urlParams = new URLSearchParams(window.location.search);
        const commentId = urlParams.get("commentId");
        if (commentId) {
            // Scroll to comment after loading
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    commentElement.classList.add("ring-4", "ring-indigo-500", "ring-opacity-50");
                    setTimeout(() => {
                        commentElement.classList.remove("ring-4", "ring-indigo-500", "ring-opacity-50");
                    }, 3000);
                }
                // Clean up URL
                window.history.replaceState({}, "", "/ta-comments");
            }, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comments, searchTerm, selectedCourse, sortBy, filterBy]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.comment-menu-container')) {
                setShowMenu({});
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Flatten replies beyond depth 3 to depth 3 (tầng 4+ hiển thị song song với tầng 3)
    const flattenDeepReplies = (replies) => {
        return replies.flatMap(reply => {
            const nestedReplies = reply.replies || [];
            // Flatten tất cả replies sâu hơn về cùng level
            const flattened = nestedReplies.flatMap(deepReply => {
                // Recursively flatten all deeper levels
                const allDeep = [deepReply];
                const collectAll = (r) => {
                    if (r.replies && r.replies.length > 0) {
                        r.replies.forEach(nr => {
                            allDeep.push(nr);
                            collectAll(nr);
                        });
                    }
                };
                collectAll(deepReply);
                return allDeep.map(r => ({ ...r, replies: [] }));
            });
            return [reply, ...flattened];
        });
    };

    const loadRepliesRecursive = async (commentId, depth = 0) => {
        if (depth > 3) return []; // Load up to depth 4, but will flatten to depth 3
        try {
            const repliesRes = await commentService.getRepliesByComment(commentId);
            if (repliesRes.success && Array.isArray(repliesRes.data)) {
                const replies = repliesRes.data;
                // Load nested replies for each reply
                for (const reply of replies) {
                    if (depth < 2) {
                        // Depth 0, 1: Load normally
                        const nestedReplies = await loadRepliesRecursive(reply.commentId || reply.id, depth + 1);
                        reply.replies = nestedReplies;
                    } else if (depth === 2) {
                        // At depth 2 (tầng 3), load one more level and flatten all deeper to this level
                        const nestedReplies = await loadRepliesRecursive(reply.commentId || reply.id, depth + 1);
                        // Flatten tất cả replies sâu hơn về cùng level với tầng 3
                        reply.replies = flattenDeepReplies(nestedReplies);
                    }
                }
                return replies;
            }
            return [];
        } catch (error) {
            console.error(`Error loading replies for comment ${commentId}:`, error);
            return [];
        }
    };

    const loadReplies = async (commentId) => {
        try {
            const repliesWithCounts = await loadRepliesRecursive(commentId, 0);

            // Update commentReplies state
            setCommentReplies(prev => ({
                ...prev,
                [commentId]: repliesWithCounts
            }));

            // Update replies count
            setRepliesCount(prev => ({
                ...prev,
                [commentId]: repliesWithCounts.length
            }));

            // Update nested replies count
            const updateReplyCounts = (replies) => {
                replies.forEach(reply => {
                    const replyId = reply.commentId || reply.id;
                    if (reply.replies && reply.replies.length > 0) {
                        setRepliesCount(prev => ({
                            ...prev,
                            [replyId]: reply.replies.length
                        }));
                        updateReplyCounts(reply.replies);
                    }
                });
            };
            updateReplyCounts(repliesWithCounts);

            setLoadedReplies(prev => ({ ...prev, [commentId]: true }));
        } catch (error) {
            console.error("Error loading replies:", error);
        }
    };

    const handleShowReplies = async (commentId) => {
        // Load replies nếu chưa load
        if (!loadedReplies[commentId]) {
            await loadReplies(commentId);
        }
        // Hiển thị replies
        setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    };

    const handleHideReplies = (commentId) => {
        setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
    };

    const handleLike = async (commentId, event) => {
        event.preventDefault();
        event.stopPropagation();

        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            message.warning("Vui lòng đăng nhập để thích bình luận");
            return;
        }

        const isLiked = likedComments[commentId] || false;
        const currentCount = likeCounts[commentId] || 0;

        // Optimistic update
        setLikedComments(prev => ({
            ...prev,
            [commentId]: !isLiked
        }));
        setLikeCounts(prev => ({
            ...prev,
            [commentId]: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1
        }));

        // TODO: Call API to like/unlike comment when backend supports it
        // For now, just update UI state
    };

    const loadComments = async () => {
        setLoading(true);
        try {
            // Lấy TẤT CẢ comment (cả đã trả lời và chưa trả lời) để TA có thể quản lý
            const res = await taService.getAllComments();
            if (res.success) {
                if (Array.isArray(res.data)) {
                    // Không tự động load replies, chỉ load khi user click "Xem thêm"
                    setComments(res.data.map(comment => ({ ...comment, replies: [] })));

                    // Reset expanded và loaded states khi reload để đảm bảo đồng bộ
                    setExpandedReplies({});
                    setLoadedReplies({});
                    setCommentReplies({});

                    // Initialize like counts from comments data
                    const initialLikeCounts = {};
                    const initialLiked = {};
                    const currentUser = authService.getCurrentUser();
                    const updateLikeData = (comment) => {
                        const id = comment.commentId || comment.id;
                        if (id) {
                            initialLikeCounts[id] = comment.likeCount || comment.likes || 0;
                            // Check if current user has liked this comment
                            if (comment.likedByUser !== undefined) {
                                initialLiked[id] = comment.likedByUser;
                            } else if (comment.likedUsers && Array.isArray(comment.likedUsers)) {
                                initialLiked[id] = comment.likedUsers.some(u => u.id === currentUser?.id || u.userId === currentUser?.id);
                            }
                        }
                    };
                    res.data.forEach(updateLikeData);
                    setLikeCounts(initialLikeCounts);
                    setLikedComments(prev => ({ ...prev, ...initialLiked }));

                    // Load reply count cho mỗi comment để biết có replies hay không
                    const countMap = {};
                    await Promise.all(
                        res.data.map(async (comment) => {
                            try {
                                const replyResult = await commentService.getRepliesByComment(comment.commentId || comment.id);
                                if (replyResult.success && Array.isArray(replyResult.data)) {
                                    countMap[comment.commentId || comment.id] = replyResult.data.length;
                                } else {
                                    countMap[comment.commentId || comment.id] = 0;
                                }
                            } catch (error) {
                                console.error(`Error loading reply count for comment ${comment.commentId}:`, error);
                                countMap[comment.commentId || comment.id] = 0;
                            }
                        })
                    );
                    setRepliesCount(countMap);
                } else {
                    console.error("Invalid data format:", res.data);
                    setComments([]);
                    message.warning("Dữ liệu không hợp lệ");
                }
            } else {
                console.error("Error response:", res);
                setComments([]);
                message.error(res.error || "Lỗi khi tải bình luận");
            }
        } catch (error) {
            console.error("Error loading comments:", error);
            setComments([]);
            message.error("Lỗi khi tải bình luận: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            // Load only courses assigned to this TA
            const res = await taService.getAssignedCourses();
            if (res.success && Array.isArray(res.data)) {
                setCourses(res.data);
            } else {
                message.warning(res.error || "Không thể tải danh sách khóa học");
            }
        } catch (error) {
            console.error("Error loading courses:", error);
            message.error("Lỗi khi tải danh sách khóa học");
        }
    };

    const applyFilters = () => {
        let filtered = [...comments];

        // Filter by status
        switch (filterBy) {
            case "unanswered":
                filtered = filtered.filter(c => !c.isAnswered && !c.isHidden);
                break;
            case "answered":
                filtered = filtered.filter(c => c.isAnswered === true && !c.isHidden);
                break;
            case "hidden":
                // Hiển thị tất cả comment đã ẩn
                filtered = filtered.filter(c => c.isHidden === true);
                break;
            default:
                // all - show all except hidden by default
                filtered = filtered.filter(c => !c.isHidden);
                break;
        }

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(comment =>
                comment.content?.toLowerCase().includes(term) ||
                comment.user?.username?.toLowerCase().includes(term) ||
                comment.course?.course_name?.toLowerCase().includes(term) ||
                comment.lesson?.title?.toLowerCase().includes(term)
            );
        }

        // Course filter - compare as strings to handle UUID comparison
        // Comment có thể thuộc course trực tiếp hoặc thuộc lesson (cần lấy course từ lesson)
        if (selectedCourse) {
            filtered = filtered.filter(comment => {
                // Kiểm tra comment thuộc course trực tiếp
                const commentCourseId = comment.course?.course_id;
                if (commentCourseId) {
                    return String(commentCourseId) === String(selectedCourse) ||
                        commentCourseId === selectedCourse;
                }

                // Nếu comment thuộc lesson, kiểm tra course của lesson
                if (comment.lesson) {
                    // Backend đã load đầy đủ, kiểm tra course từ lesson
                    const lessonCourseId = comment.lesson?.module?.course?.course_id ||
                        comment.lesson?.course?.course_id;
                    if (lessonCourseId) {
                        return String(lessonCourseId) === String(selectedCourse) ||
                            lessonCourseId === selectedCourse;
                    }
                }

                // Nếu comment thuộc exercise, kiểm tra course từ exercise -> lesson -> course
                if (comment.exercise) {
                    const exerciseCourseId = comment.exercise?.lesson?.module?.course?.course_id ||
                        comment.exercise?.lesson?.course?.course_id;
                    if (exerciseCourseId) {
                        return String(exerciseCourseId) === String(selectedCourse) ||
                            exerciseCourseId === selectedCourse;
                    }
                }

                return false;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "course":
                    return (a.course?.course_name || "").localeCompare(b.course?.course_name || "");
                default:
                    return 0;
            }
        });

        setFilteredComments(filtered);
        setCurrentPage(1);
    };

    const handleAnswer = async (commentId) => {
        if (!replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung trả lời");
            return;
        }
        try {
            // Check if this is a reply to a comment or a reply to a reply
            const isReplyToReply = replyingTo !== commentId;
            const parentCommentId = isReplyToReply ? replyingTo : commentId;

            if (isReplyToReply) {
                // Use regular comment service for nested replies
                const res = await commentService.createComment(
                    null, // lessonId
                    null, // courseId
                    replyContent,
                    null, // rating
                    parentCommentId, // parentCommentId
                    null // exerciseId
                );
                if (res.success) {
                    message.success("Đã trả lời bình luận. Học viên sẽ nhận được thông báo.");
                    setReplyingTo(null);
                    setReplyContent("");
                    // Load và hiển thị replies sau khi reply
                    await loadReplies(parentCommentId);
                    setExpandedReplies(prev => ({ ...prev, [parentCommentId]: true }));
                    // Update reply count
                    setRepliesCount(prev => {
                        const currentCount = prev[parentCommentId] || 0;
                        return { ...prev, [parentCommentId]: currentCount + 1 };
                    });
                } else {
                    message.error(res.error || "Lỗi khi trả lời");
                }
            } else {
                // Use TA service for top-level replies
                const res = await taService.answerComment(commentId, replyContent);
                if (res.success) {
                    message.success("Đã trả lời bình luận. Học viên sẽ nhận được thông báo.");
                    setReplyingTo(null);
                    setReplyContent("");
                    // Load và hiển thị replies sau khi reply
                    await loadReplies(commentId);
                    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
                    // Update reply count
                    setRepliesCount(prev => {
                        const currentCount = prev[commentId] || 0;
                        return { ...prev, [commentId]: currentCount + 1 };
                    });
                } else {
                    message.error(res.error || "Lỗi khi trả lời");
                }
            }
        } catch (error) {
            console.error("Error answering comment:", error);
            message.error("Lỗi khi trả lời bình luận");
        }
    };

    // Helper function to update reply in nested structure
    const updateReplyInNested = (replies, targetId, updateFn) => {
        return replies.map(reply => {
            const replyId = reply.commentId || reply.id;
            if (replyId === targetId) {
                return updateFn(reply);
            }
            if (reply.replies && reply.replies.length > 0) {
                return {
                    ...reply,
                    replies: updateReplyInNested(reply.replies, targetId, updateFn)
                };
            }
            return reply;
        });
    };

    const handleHide = async (commentId) => {
        try {
            const res = await taService.hideComment(commentId);
            if (res.success) {
                message.success("Đã ẩn bình luận");
                // Update local state immediately for top-level comments
                setComments(prev => prev.map(c =>
                    (c.commentId || c.id) === commentId
                        ? { ...c, isHidden: true }
                        : c
                ));
                // Update replies in commentReplies
                setCommentReplies(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        updated[key] = updateReplyInNested(updated[key], commentId, reply => ({ ...reply, isHidden: true }));
                    });
                    return updated;
                });
                // Reload to ensure sync
                await loadComments();
            } else {
                message.error(res.error || "Lỗi khi ẩn bình luận");
            }
        } catch (error) {
            console.error("Error hiding comment:", error);
            message.error("Lỗi khi ẩn bình luận");
        }
    };

    const handleUnhide = async (commentId) => {
        try {
            const res = await taService.unhideComment(commentId);
            if (res.success) {
                message.success("Đã hiện lại bình luận");
                // Update local state immediately for top-level comments
                setComments(prev => prev.map(c =>
                    (c.commentId || c.id) === commentId
                        ? { ...c, isHidden: false }
                        : c
                ));
                // Update replies in commentReplies
                setCommentReplies(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        updated[key] = updateReplyInNested(updated[key], commentId, reply => ({ ...reply, isHidden: false }));
                    });
                    return updated;
                });
                // Reload to ensure sync
                await loadComments();
            } else {
                message.error(res.error || "Lỗi khi hiện lại bình luận");
            }
        } catch (error) {
            console.error("Error unhiding comment:", error);
            message.error("Lỗi khi hiện lại bình luận");
        }
    };

    // Helper function to remove reply from nested structure
    const removeReplyFromNested = (replies, targetId) => {
        return replies
            .filter(reply => (reply.commentId || reply.id) !== targetId)
            .map(reply => {
                if (reply.replies && reply.replies.length > 0) {
                    return {
                        ...reply,
                        replies: removeReplyFromNested(reply.replies, targetId)
                    };
                }
                return reply;
            });
    };

    const handleDelete = async (commentId) => {
        try {
            const res = await taService.deleteComment(commentId);
            if (res.success) {
                message.success("Đã xóa bình luận");
                // Remove from top-level comments
                setComments(prev => prev.filter(c => (c.commentId || c.id) !== commentId));
                // Remove from commentReplies (including nested)
                setCommentReplies(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        updated[key] = removeReplyFromNested(updated[key], commentId);
                    });
                    return updated;
                });
                // Update reply counts
                setRepliesCount(prev => {
                    const newCounts = { ...prev };
                    // Decrease count for parent if this was a reply
                    Object.keys(commentReplies).forEach(parentId => {
                        const replies = commentReplies[parentId] || [];
                        const hasReply = replies.some(r => (r.commentId || r.id) === commentId) ||
                            replies.some(r => r.replies?.some(nr => (nr.commentId || nr.id) === commentId));
                        if (hasReply && newCounts[parentId]) {
                            newCounts[parentId] = Math.max(0, newCounts[parentId] - 1);
                        }
                    });
                    delete newCounts[commentId];
                    return newCounts;
                });
                // Reload to ensure sync
                await loadComments();
            } else {
                message.error(res.error || "Lỗi khi xóa bình luận");
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            message.error("Lỗi khi xóa bình luận");
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "Vừa xong";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const getAvatarUrl = (user) => {
        if (!user) return null;
        // Check for base64 profileImage first (like CommentSection)
        if (user.profileImage) {
            return `data:image/jpeg;base64,${user.profileImage}`;
        }
        const avatar = user.avatar || user.avatarUrl;
        if (!avatar) return null;
        if (avatar.startsWith("http") || avatar.startsWith("/api/")) return avatar;
        return `/api/files/${avatar}`;
    };


    // Helper function to get course name from various sources
    // Backend đã populate course vào comment.course khi comment thuộc lesson
    // Nên giờ chỉ cần kiểm tra comment.course là đủ
    const getCourseName = (comment) => {
        // Priority 1: From comment.course (backend đã populate khi comment có lesson)
        if (comment.course) {
            const courseName = comment.course.course_name ||
                comment.course.title ||
                comment.course.name;
            if (courseName) return courseName;
        }

        // Priority 2: Fallback to lesson.module.course (nếu backend chưa populate)
        if (comment.lesson?.module?.course) {
            const courseName = comment.lesson.module.course.course_name ||
                comment.lesson.module.course.title ||
                comment.lesson.module.course.name;
            if (courseName) return courseName;
        }

        // Priority 3: Fallback to lesson.course (nếu có)
        if (comment.lesson?.course) {
            const courseName = comment.lesson.course.course_name ||
                comment.lesson.course.title ||
                comment.lesson.course.name;
            if (courseName) return courseName;
        }

        // Priority 4: Fallback to courses list (last resort)
        if (comment.lesson && courses.length > 0) {
            const courseId = comment.course?.course_id ||
                comment.course?.id ||
                comment.lesson.module?.course?.course_id ||
                comment.lesson.module?.course?.id;

            if (courseId) {
                const foundCourse = courses.find(c =>
                    c.course_id === courseId ||
                    c.id === courseId ||
                    String(c.course_id) === String(courseId) ||
                    String(c.id) === String(courseId)
                );
                if (foundCourse) {
                    return foundCourse.course_name || foundCourse.title || foundCourse.name;
                }
            }
        }

        return null;
    };

    const getCommentLink = (comment) => {
        const commentId = comment.commentId || comment.id;
        if (!commentId) return "#";

        // Nếu comment thuộc lesson
        if (comment.lesson) {
            const lessonId = comment.lesson.lessonId || comment.lesson.lesson_id || comment.lesson.id || '';
            if (!lessonId) return "#";

            // Lấy courseId từ nhiều nguồn
            let courseId = comment.course?.course_id || comment.course?.id;

            // Nếu không có courseId từ comment, lấy từ lesson.module.course
            if (!courseId && comment.lesson.module?.course) {
                courseId = comment.lesson.module.course.course_id || comment.lesson.module.course.id;
            }

            // Nếu vẫn không có, lấy từ lesson.course
            if (!courseId && comment.lesson.course) {
                courseId = comment.lesson.course.course_id || comment.lesson.course.id;
            }

            if (courseId && lessonId) {
                return `/lesson/${lessonId}?commentId=${commentId}&courseId=${courseId}`;
            }
        }

        // Nếu comment thuộc exercise (exercise có lesson)
        if (comment.exercise) {
            if (comment.exercise.lesson) {
                const lessonId = comment.exercise.lesson.lessonId || comment.exercise.lesson.lesson_id || comment.exercise.lesson.id || '';
                let courseId = comment.exercise.lesson.module?.course?.course_id ||
                    comment.exercise.lesson.module?.course?.id ||
                    comment.exercise.lesson.course?.course_id ||
                    comment.exercise.lesson.course?.id;
                if (courseId && lessonId) {
                    return `/lesson/${lessonId}?commentId=${commentId}&courseId=${courseId}`;
                }
            }
        }

        // Nếu comment thuộc course trực tiếp
        if (comment.course) {
            const courseId = comment.course.course_id || comment.course.id;
            if (courseId) {
                return `/course/${courseId}?commentId=${commentId}`;
            }
        }

        return "#";
    };

    const stats = {
        total: comments.length,
        // Unanswered: chưa trả lời và chưa ẩn
        unanswered: comments.filter(c => !c.isAnswered && !c.isHidden).length,
        // Answered: đã trả lời và chưa ẩn
        answered: comments.filter(c => c.isAnswered === true && !c.isHidden).length,
        // Hidden: tất cả comment đã ẩn (cả đã trả lời và chưa trả lời)
        hidden: comments.filter(c => c.isHidden === true).length,
    };

    const getUserRoleBadge = (role) => {
        const roleName = role?.replace("ROLE_", "") || "";
        const badgeStyles = {
            ADMIN: "bg-red-500 text-white",
            INSTRUCTOR: "bg-purple-500 text-white",
            TEACHING_ASSISTANT: "bg-orange-500 text-white",
            STUDENT: "bg-green-500 text-white",
            USER: "bg-blue-500 text-white"
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeStyles[roleName] || badgeStyles.USER}`}>
                {roleName === "TEACHING_ASSISTANT" ? "TRỢ GIẢNG" : roleName === "INSTRUCTOR" ? "GIẢNG VIÊN" : roleName === "STUDENT" ? "CỰU HỌC VIÊN" : roleName}
            </span>
        );
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F7FB' }}>
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/teaching-assistant-home")}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Quay lại trang chủ
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Quản lý bình luận</h1>
                            <p className="text-gray-600">Quản lý và trả lời các bình luận từ học viên</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag color="blue" className="text-lg px-4 py-1">
                                {filteredComments.length} bình luận
                            </Tag>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs mb-1 font-medium">Tổng bình luận</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faComments} className="text-indigo-600 text-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs mb-1 font-medium">Chưa trả lời</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.unanswered}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faComments} className="text-orange-600 text-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs mb-1 font-medium">Đã trả lời</p>
                                <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs mb-1 font-medium">Đã ẩn</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faEyeSlash} className="text-gray-600 text-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 shadow-sm mb-6" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Space.Compact style={{ width: "100%" }}>
                                <Input
                                    placeholder="Tìm kiếm theo nội dung, học viên, khóa học..."
                                    allowClear
                                    size="large"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onPressEnter={() => applyFilters()}
                                    prefix={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
                                    style={{ width: "100%" }}
                                />
                            </Space.Compact>
                        </div>
                        <Select
                            placeholder="Lọc theo khóa học"
                            allowClear
                            style={{ width: "100%" }}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            size="large"
                        >
                            {courses.map((course) => (
                                <Select.Option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </Select.Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            style={{ width: "100%" }}
                            value={filterBy}
                            onChange={setFilterBy}
                            size="large"
                        >
                            <Select.Option value="all">Tất cả</Select.Option>
                            <Select.Option value="unanswered">Chưa trả lời</Select.Option>
                            <Select.Option value="answered">Đã trả lời</Select.Option>
                            <Select.Option value="hidden">Đã ẩn</Select.Option>
                        </Select>
                    </div>
                    <div className="mt-4">
                        <Select
                            placeholder="Sắp xếp"
                            style={{ width: 200 }}
                            value={sortBy}
                            onChange={setSortBy}
                            suffixIcon={<FontAwesomeIcon icon={faSort} />}
                            size="large"
                        >
                            <Select.Option value="newest">Mới nhất</Select.Option>
                            <Select.Option value="oldest">Cũ nhất</Select.Option>
                            <Select.Option value="course">Theo khóa học</Select.Option>
                        </Select>
                    </div>
                </div>

                {/* Comments List */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <Spin size="large" />
                        <p className="mt-4 text-gray-500">Đang tải bình luận...</p>
                    </div>
                ) : filteredComments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <Empty
                            image={<FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500" />}
                            description={
                                <span className="text-gray-600 text-base">
                                    {comments.length === 0
                                        ? "Không có bình luận nào cần trả lời"
                                        : "Không tìm thấy bình luận phù hợp"}
                                </span>
                            }
                        />
                    </div>
                ) : (
                    <>
                        <div className="bg-white overflow-hidden" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <div className="space-y-0">
                                {filteredComments
                                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                    .map((comment) => (
                                        <div
                                            id={`comment-${comment.commentId || comment.id}`}
                                            key={comment.commentId || comment.id}
                                            className={`transition-all duration-200 border-b last:border-b-0 ${comment.isHidden === true ? "opacity-60" : ""}`}
                                            style={{ borderColor: '#E5E7EB', padding: '24px' }}
                                        >
                                            <div>
                                                <div className="flex items-start gap-4">
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0 relative">
                                                        <div className="w-11 h-11 rounded-full flex items-center justify-center relative" style={{ width: '44px', height: '44px' }}>
                                                            {getAvatarUrl(comment.user) ? (
                                                                <>
                                                                    <img
                                                                        src={getAvatarUrl(comment.user)}
                                                                        alt={comment.user?.username || "User"}
                                                                        className="w-full h-full rounded-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            const fallback = e.target.nextElementSibling;
                                                                            if (fallback) fallback.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                    <div className={`w-full h-full rounded-full items-center justify-center absolute inset-0 ${comment.isAnswered === true
                                                                        ? 'bg-gradient-to-br from-green-400 to-green-600'
                                                                        : 'bg-gradient-to-br from-indigo-400 to-indigo-600'
                                                                        }`} style={{ display: 'none' }}>
                                                                        <span className="text-white font-semibold text-sm">
                                                                            {getInitials(comment.user?.username || "U")}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className={`w-full h-full rounded-full flex items-center justify-center ${comment.isAnswered === true
                                                                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                                                                    : 'bg-gradient-to-br from-indigo-400 to-indigo-600'
                                                                    }`}>
                                                                    <span className="text-white font-semibold text-sm">
                                                                        {getInitials(comment.user?.username || "U")}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 relative group">
                                                        {/* Header */}
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="font-bold text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                                                {comment.user?.username || "Người dùng"}
                                                            </span>
                                                            {getUserRoleBadge(comment.user?.role)}
                                                            <span className="text-xs text-gray-400">
                                                                {formatTimeAgo(comment.createdAt)}
                                                            </span>
                                                            {comment.isAnswered === true && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white">
                                                                    Đã trả lời
                                                                </span>
                                                            )}
                                                            {!comment.isAnswered && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white">
                                                                    Chưa trả lời
                                                                </span>
                                                            )}
                                                            {comment.isHidden === true && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500 text-white">
                                                                    Đã ẩn
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Comment Content */}
                                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3 mt-0 text-left" style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '0', textAlign: 'left' }}>
                                                            {comment.content}
                                                        </p>

                                                        {/* Course and Lesson Info - Compact */}
                                                        <div className="flex flex-wrap gap-2 mb-2 mt-2">
                                                            {/* Nếu comment thuộc bài học, luôn hiển thị khóa học trước, sau đó là bài học */}
                                                            {comment.lesson && (
                                                                <>
                                                                    {/* Hiển thị khóa học với icon - chỉ hiển thị nếu có tên khóa học */}
                                                                    {getCourseName(comment) && (
                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                            <FontAwesomeIcon icon={faBookOpen} className="mr-1 text-xs" />
                                                                            {getCourseName(comment)}
                                                                        </span>
                                                                    )}
                                                                    {/* Hiển thị bài học */}
                                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                                        <FontAwesomeIcon icon={faGraduationCap} className="mr-1 text-xs" />
                                                                        {comment.lesson.title || comment.lesson.name || "Bài học"}
                                                                    </span>
                                                                </>
                                                            )}
                                                            {/* Nếu chỉ có course (không có lesson) - chỉ hiển thị nếu có tên khóa học */}
                                                            {!comment.lesson && getCourseName(comment) && (
                                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                    <FontAwesomeIcon icon={faBookOpen} className="mr-1 text-xs" />
                                                                    {getCourseName(comment)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons - Modern style */}
                                                        <div className="flex items-center gap-4 mt-3 group flex-wrap">
                                                            <button
                                                                onClick={(e) => handleLike(comment.commentId || comment.id, e)}
                                                                className={`flex items-center gap-1.5 text-xs transition-colors ${likedComments[comment.commentId || comment.id]
                                                                    ? "text-indigo-600 font-semibold"
                                                                    : "text-gray-500 hover:text-indigo-600"
                                                                    }`}
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={faThumbsUp}
                                                                    className={`text-xs ${likedComments[comment.commentId || comment.id] ? "text-indigo-600" : ""}`}
                                                                />
                                                                <span>Thích</span>
                                                                {(likeCounts[comment.commentId || comment.id] || 0) > 0 && (
                                                                    <span className="text-xs">({likeCounts[comment.commentId || comment.id]})</span>
                                                                )}
                                                            </button>
                                                            {replyingTo !== (comment.commentId || comment.id) && (
                                                                <button
                                                                    onClick={() => setReplyingTo(comment.commentId || comment.id)}
                                                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                    style={{ fontSize: '12px' }}
                                                                >
                                                                    <FontAwesomeIcon icon={faReply} className="text-xs" />
                                                                    <span>Trả lời</span>
                                                                </button>
                                                            )}
                                                            {/* Xem tại khóa học button */}
                                                            <button
                                                                onClick={async () => {
                                                                    const link = getCommentLink(comment);
                                                                    console.log("Navigating to:", link, comment);
                                                                    if (link !== "#") {
                                                                        navigate(link);
                                                                        setTimeout(() => {
                                                                            const commentId = comment.commentId || comment.id;
                                                                            let attempts = 0;
                                                                            const maxAttempts = 10;
                                                                            const findAndHighlight = () => {
                                                                                attempts++;
                                                                                const commentElement = document.getElementById(`comment-${commentId}`);
                                                                                if (commentElement) {
                                                                                    commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                                                                                    commentElement.classList.add("ring-4", "ring-indigo-500", "ring-opacity-50", "rounded-lg", "transition-all");
                                                                                    setTimeout(() => {
                                                                                        commentElement.classList.remove("ring-4", "ring-indigo-500", "ring-opacity-50");
                                                                                    }, 3000);
                                                                                } else if (attempts < maxAttempts) {
                                                                                    setTimeout(findAndHighlight, 500);
                                                                                }
                                                                            };
                                                                            findAndHighlight();
                                                                        }, 500);
                                                                    } else {
                                                                        message.warning("Không thể xác định vị trí bình luận");
                                                                    }
                                                                }}
                                                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                style={{ fontSize: '12px' }}
                                                                type="button"
                                                            >
                                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                                                <span>Xem tại khóa học</span>
                                                            </button>
                                                            {/* Ẩn/Hiện lại button */}
                                                            {comment.isHidden === true ? (
                                                                <Popconfirm
                                                                    title="Hiện lại bình luận này?"
                                                                    onConfirm={async () => {
                                                                        await handleUnhide(comment.commentId || comment.id);
                                                                    }}
                                                                    okText="Có"
                                                                    cancelText="Không"
                                                                    trigger="click"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                        style={{ fontSize: '12px' }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                                        <span>Hiện lại</span>
                                                                    </button>
                                                                </Popconfirm>
                                                            ) : (
                                                                <Popconfirm
                                                                    title="Ẩn bình luận này?"
                                                                    description="Bình luận sẽ không hiển thị cho học viên"
                                                                    onConfirm={async () => {
                                                                        await handleHide(comment.commentId || comment.id);
                                                                    }}
                                                                    okText="Có"
                                                                    cancelText="Không"
                                                                    trigger="click"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                        style={{ fontSize: '12px' }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEyeSlash} className="text-xs" />
                                                                        <span>Ẩn</span>
                                                                    </button>
                                                                </Popconfirm>
                                                            )}
                                                            {/* Xóa button */}
                                                            <Popconfirm
                                                                title="Xóa bình luận này?"
                                                                description="Hành động này không thể hoàn tác"
                                                                onConfirm={async () => {
                                                                    await handleDelete(comment.commentId || comment.id);
                                                                }}
                                                                okText="Xóa"
                                                                cancelText="Hủy"
                                                                okButtonProps={{ danger: true }}
                                                                trigger="click"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                                                                    style={{ fontSize: '12px' }}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                                    <span>Xóa</span>
                                                                </button>
                                                            </Popconfirm>
                                                        </div>

                                                        {/* Replies Section - giống CommentSection */}
                                                        {(() => {
                                                            const commentId = comment.commentId || comment.id;
                                                            const replies = commentReplies[commentId] || [];
                                                            const isRepliesExpanded = expandedReplies[commentId] === true; // Chỉ hiển thị khi user click "Xem thêm"
                                                            const repliesCountLoaded = replies.length; // Số replies đã load
                                                            const repliesCountTotal = repliesCount[commentId] !== undefined ? repliesCount[commentId] : repliesCountLoaded; // Tổng số replies (từ state hoặc đã load)
                                                            const hasReplies = repliesCountTotal > 0; // Có replies (chỉ hiển thị nút nếu có)

                                                            if (!hasReplies) return null;

                                                            const renderReply = (reply, depth = 0) => {
                                                                const replyReplies = reply.replies || [];
                                                                const replyIsExpanded = expandedReplies[reply.commentId || reply.id] === true;
                                                                const repliesCountLoaded = replyReplies.length;
                                                                const repliesCountTotal = repliesCount[reply.commentId || reply.id] !== undefined ? repliesCount[reply.commentId || reply.id] : repliesCountLoaded;
                                                                const hasReplies = repliesCountTotal > 0;

                                                                return (
                                                                    <div key={reply.commentId || reply.id} className={`relative ${depth > 0 ? "mt-4" : ""}`}>
                                                                        {/* Vertical thread line - thin gray line */}
                                                                        {depth === 1 && (
                                                                            <div className="absolute left-0 top-0 bottom-0 w-px" style={{ backgroundColor: '#E5E7EB', left: '22px' }}></div>
                                                                        )}
                                                                        {depth >= 2 && (
                                                                            <div className="absolute left-0 top-0 bottom-0 w-px" style={{ backgroundColor: '#E5E7EB', left: '38px' }}></div>
                                                                        )}
                                                                        {/* Indentation: depth 0 = không indent, depth 1 = ml-8, depth >= 2 = ml-16 */}
                                                                        <div className={`flex items-start gap-4 py-3 ${depth === 0 ? "" : depth === 1 ? "ml-8" : "ml-16"}`}>
                                                                            <div className="flex-shrink-0 relative">
                                                                                {/* Small circle on thread line */}
                                                                                {depth > 0 && (
                                                                                    <div className="absolute left-0 top-5 w-2 h-2 rounded-full bg-green-500" style={{
                                                                                        left: depth === 1 ? '-28px' : '-44px',
                                                                                        transform: 'translateX(-50%)'
                                                                                    }}></div>
                                                                                )}
                                                                                <div className="w-11 h-11 rounded-full flex items-center justify-center relative" style={{ width: '44px', height: '44px' }}>
                                                                                    {getAvatarUrl(reply.user) ? (
                                                                                        <>
                                                                                            <img
                                                                                                src={getAvatarUrl(reply.user)}
                                                                                                alt={reply.user?.username || "User"}
                                                                                                className="w-full h-full rounded-full object-cover"
                                                                                                onError={(e) => {
                                                                                                    e.target.style.display = 'none';
                                                                                                    const fallback = e.target.nextElementSibling;
                                                                                                    if (fallback) fallback.style.display = 'flex';
                                                                                                }}
                                                                                            />
                                                                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                                                                                                <span className="text-white font-semibold text-xs">
                                                                                                    {getInitials(reply.user?.username || "T")}
                                                                                                </span>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                                                                            <span className="text-white font-semibold text-xs">
                                                                                                {getInitials(reply.user?.username || "T")}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                                    <span className="font-bold text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                                                                        {reply.user?.username || "Trợ giảng"}
                                                                                    </span>
                                                                                    {getUserRoleBadge(reply.user?.role)}
                                                                                    {reply.createdAt && (
                                                                                        <span className="text-xs text-gray-400">
                                                                                            {formatTimeAgo(reply.createdAt)}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-2" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                                                                    {reply.content}
                                                                                </p>
                                                                                {/* Action buttons for replies */}
                                                                                <div className="flex items-center gap-4 mt-2 group flex-wrap">
                                                                                    <button
                                                                                        onClick={(e) => handleLike(reply.commentId || reply.id, e)}
                                                                                        className={`flex items-center gap-1.5 text-xs transition-colors ${likedComments[reply.commentId || reply.id]
                                                                                            ? "text-indigo-600 font-semibold"
                                                                                            : "text-gray-500 hover:text-indigo-600"
                                                                                            }`}
                                                                                        style={{ fontSize: '12px' }}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            icon={faThumbsUp}
                                                                                            className={`text-xs ${likedComments[reply.commentId || reply.id] ? "text-indigo-600" : ""}`}
                                                                                        />
                                                                                        <span>Thích</span>
                                                                                        {(likeCounts[reply.commentId || reply.id] || 0) > 0 && (
                                                                                            <span className="text-xs">({likeCounts[reply.commentId || reply.id]})</span>
                                                                                        )}
                                                                                    </button>
                                                                                    {/* Reply to reply button - only show if depth < 2 */}
                                                                                    {depth < 2 && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setReplyingTo(reply.commentId || reply.id);
                                                                                                setReplyContent("");
                                                                                            }}
                                                                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                                            style={{ fontSize: '12px' }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faReply} className="text-xs" />
                                                                                            <span>Trả lời</span>
                                                                                        </button>
                                                                                    )}
                                                                                    {/* Ẩn/Hiện lại button for replies */}
                                                                                    {reply.isHidden === true ? (
                                                                                        <Popconfirm
                                                                                            title="Hiện lại bình luận này?"
                                                                                            onConfirm={async () => {
                                                                                                await handleUnhide(reply.commentId || reply.id);
                                                                                            }}
                                                                                            okText="Có"
                                                                                            cancelText="Không"
                                                                                            trigger="click"
                                                                                        >
                                                                                            <button
                                                                                                type="button"
                                                                                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                                                style={{ fontSize: '12px' }}
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                                                                <span>Hiện lại</span>
                                                                                            </button>
                                                                                        </Popconfirm>
                                                                                    ) : (
                                                                                        <Popconfirm
                                                                                            title="Ẩn bình luận này?"
                                                                                            description="Bình luận sẽ không hiển thị cho học viên"
                                                                                            onConfirm={async () => {
                                                                                                await handleHide(reply.commentId || reply.id);
                                                                                            }}
                                                                                            okText="Có"
                                                                                            cancelText="Không"
                                                                                            trigger="click"
                                                                                        >
                                                                                            <button
                                                                                                type="button"
                                                                                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                                                                style={{ fontSize: '12px' }}
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faEyeSlash} className="text-xs" />
                                                                                                <span>Ẩn</span>
                                                                                            </button>
                                                                                        </Popconfirm>
                                                                                    )}
                                                                                    {/* Xóa button for replies */}
                                                                                    <Popconfirm
                                                                                        title="Xóa bình luận này?"
                                                                                        description="Hành động này không thể hoàn tác"
                                                                                        onConfirm={async () => {
                                                                                            await handleDelete(reply.commentId || reply.id);
                                                                                        }}
                                                                                        okText="Xóa"
                                                                                        cancelText="Hủy"
                                                                                        okButtonProps={{ danger: true }}
                                                                                        trigger="click"
                                                                                    >
                                                                                        <button
                                                                                            type="button"
                                                                                            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                                                                                            style={{ fontSize: '12px' }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                                                            <span>Xóa</span>
                                                                                        </button>
                                                                                    </Popconfirm>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Nested Replies Section */}
                                                                        {hasReplies && (
                                                                            <div className="mt-4 relative">
                                                                                {!replyIsExpanded && (
                                                                                    <button
                                                                                        onClick={async () => {
                                                                                            const replyId = reply.commentId || reply.id;
                                                                                            if (!loadedReplies[replyId]) {
                                                                                                await loadReplies(replyId);
                                                                                            }
                                                                                            setExpandedReplies(prev => ({ ...prev, [replyId]: true }));
                                                                                        }}
                                                                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-indigo-50 transition-all duration-200"
                                                                                        style={{ borderRadius: '9999px' }}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                                                                                        Xem {repliesCountTotal} phản hồi
                                                                                    </button>
                                                                                )}
                                                                                {replyIsExpanded && repliesCountLoaded > 0 && (
                                                                                    <button
                                                                                        onClick={() => handleHideReplies(reply.commentId || reply.id)}
                                                                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-indigo-50 transition-all duration-200"
                                                                                        style={{ borderRadius: '9999px' }}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
                                                                                        Ẩn {repliesCountLoaded} phản hồi
                                                                                    </button>
                                                                                )}
                                                                                {replyIsExpanded && repliesCountLoaded > 0 && (
                                                                                    <div className="space-y-0 relative">
                                                                                        {replyReplies.map((nestedReply) => (
                                                                                            <div key={nestedReply.commentId || nestedReply.id} className="relative">
                                                                                                {renderReply(nestedReply, depth >= 2 ? 2 : depth + 1)}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            };

                                                            return (
                                                                <>
                                                                    <div className="mt-4 relative">
                                                                        {/* Show Replies Button - chỉ hiển thị nếu chưa expanded và có replies */}
                                                                        {!isRepliesExpanded && (
                                                                            <button
                                                                                onClick={() => handleShowReplies(commentId)}
                                                                                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-indigo-50 transition-all duration-200"
                                                                                style={{ borderRadius: '9999px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                                                                                Xem {repliesCountTotal} phản hồi
                                                                            </button>
                                                                        )}

                                                                        {/* Hide Replies Button - hiển thị khi đã mở và có replies */}
                                                                        {isRepliesExpanded && repliesCountLoaded > 0 && (
                                                                            <button
                                                                                onClick={() => handleHideReplies(commentId)}
                                                                                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-indigo-50 transition-all duration-200"
                                                                                style={{ borderRadius: '9999px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
                                                                                Ẩn {repliesCountLoaded} phản hồi
                                                                            </button>
                                                                        )}

                                                                        {/* Render replies - chỉ hiển thị khi expanded và có replies */}
                                                                        {isRepliesExpanded && repliesCountLoaded > 0 && (
                                                                            <div className="space-y-0 relative">
                                                                                {replies.map((reply) => (
                                                                                    <div key={reply.commentId || reply.id} className="relative">
                                                                                        {renderReply(reply, 0)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Reply Form */}
                                                                    {replyingTo === commentId && (
                                                                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                                                            <TextArea
                                                                                value={replyContent}
                                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                                placeholder="Nhập câu trả lời của bạn..."
                                                                                rows={4}
                                                                                className="mb-3"
                                                                                autoFocus
                                                                            />
                                                                            <Space>
                                                                                <Button
                                                                                    type="primary"
                                                                                    icon={<FontAwesomeIcon icon={faReply} />}
                                                                                    onClick={() => handleAnswer(commentId)}
                                                                                >
                                                                                    Gửi trả lời
                                                                                </Button>
                                                                                <Button
                                                                                    onClick={() => {
                                                                                        setReplyingTo(null);
                                                                                        setReplyContent("");
                                                                                    }}
                                                                                >
                                                                                    Hủy
                                                                                </Button>
                                                                            </Space>
                                                                        </div>
                                                                    )}

                                                                    {/* Reply Form for nested replies */}
                                                                    {replyingTo && replyingTo !== commentId && (() => {
                                                                        // Find the reply being replied to
                                                                        const findReply = (replies, targetId) => {
                                                                            for (const reply of replies) {
                                                                                if ((reply.commentId || reply.id) === targetId) {
                                                                                    return reply;
                                                                                }
                                                                                if (reply.replies && reply.replies.length > 0) {
                                                                                    const found = findReply(reply.replies, targetId);
                                                                                    if (found) return found;
                                                                                }
                                                                            }
                                                                            return null;
                                                                        };
                                                                        const targetReply = findReply(commentReplies[commentId] || [], replyingTo);

                                                                        if (targetReply) {
                                                                            return (
                                                                                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 ml-4">
                                                                                    <p className="text-sm text-gray-600 mb-2">
                                                                                        Trả lời <span className="font-semibold">{targetReply.user?.username || "người dùng"}</span>:
                                                                                    </p>
                                                                                    <TextArea
                                                                                        value={replyContent}
                                                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                                                        placeholder="Nhập câu trả lời của bạn..."
                                                                                        rows={4}
                                                                                        className="mb-3"
                                                                                        autoFocus
                                                                                    />
                                                                                    <Space>
                                                                                        <Button
                                                                                            type="primary"
                                                                                            icon={<FontAwesomeIcon icon={faReply} />}
                                                                                            onClick={() => handleAnswer(replyingTo)}
                                                                                        >
                                                                                            Gửi trả lời
                                                                                        </Button>
                                                                                        <Button
                                                                                            onClick={() => {
                                                                                                setReplyingTo(null);
                                                                                                setReplyContent("");
                                                                                            }}
                                                                                        >
                                                                                            Hủy
                                                                                        </Button>
                                                                                    </Space>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </>
                                                            );
                                                        })()}

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        {filteredComments.length > pageSize && (
                            <div className="mt-6 flex justify-center">
                                <div className="bg-white p-6 shadow-sm" style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={filteredComments.length}
                                        onChange={(page, size) => {
                                            setCurrentPage(page);
                                            setPageSize(size);
                                        }}
                                        showSizeChanger
                                        showTotal={(total) => `Tổng ${total} bình luận`}
                                        pageSizeOptions={['10', '20', '50']}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default TAComments;

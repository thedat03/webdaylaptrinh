import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faReply,
    faEdit,
    faTrash,
    faUser,
    faCheckCircle,
    faChevronDown,
    faChevronUp,
    faThumbsUp,
    faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";
import { commentService } from "../../api/comment.service";
import { authService } from "../../api/auth.service";
import { messageService } from "../../api/message.service";
import { message } from "antd";

function CommentSection({ lessonId, courseId, exerciseId, enableRating = true, hideForm = false, hideHeader = false }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [expandedReplies, setExpandedReplies] = useState({}); // Map commentId -> boolean (show replies)
    const [loadedReplies, setLoadedReplies] = useState({}); // Map commentId -> boolean (replies đã được load)
    const [repliesCount, setRepliesCount] = useState({}); // Map commentId -> number (số lượng replies)
    const INITIAL_VISIBLE_COUNT = 5;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const [hoveredComment, setHoveredComment] = useState(null);
    const [showMenu, setShowMenu] = useState({});
    const [likedComments, setLikedComments] = useState({}); // Map commentId -> boolean (đã like chưa)
    const [likeCounts, setLikeCounts] = useState({}); // Map commentId -> number (số lượng like)
    const commentInputRef = useRef(null);

    const currentUser = authService.getCurrentUser();
    const isAdmin = authService.isAdminAuthenticated();
    const isInstructor = authService.isInstructorAuthenticated();
    const isTeachingAssistant = authService.isTeachingAssistantAuthenticated();
    const canComment = authService.isUserAuthenticated() || isInstructor || isTeachingAssistant;

    useEffect(() => {
        if (lessonId || courseId || exerciseId) {
            loadComments();
        }
        // Gửi heartbeat khi user tương tác với comments
        if (currentUser?.id) {
            messageService.sendHeartbeat();
            // Gửi heartbeat mỗi 30 giây
            const heartbeatInterval = setInterval(() => {
                messageService.sendHeartbeat();
            }, 30000);
            return () => clearInterval(heartbeatInterval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId, courseId, exerciseId, currentUser?.id]);

    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [lessonId, courseId, exerciseId]);

    useEffect(() => {
        if (commentInputRef.current) {
            commentInputRef.current.style.height = "auto";
            commentInputRef.current.style.height = `${Math.min(commentInputRef.current.scrollHeight, 320)}px`;
        }
    }, [newComment]);

    // Handle commentId from URL for scrolling
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const commentId = urlParams.get("commentId");
        if (commentId && !loading && comments.length > 0) {
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    commentElement.classList.add("ring-2", "ring-indigo-500", "ring-opacity-50", "rounded-xl");
                    setTimeout(() => {
                        commentElement.classList.remove("ring-2", "ring-indigo-500", "ring-opacity-50");
                    }, 3000);
                }
            }, 500);
        }
    }, [loading, comments.length]);

    const loadComments = async () => {
        setLoading(true);
        try {
            // Ensure IDs are strings (UUID format)
            const lessonIdStr = lessonId ? String(lessonId) : null;
            const courseIdStr = courseId ? String(courseId) : null;
            const exerciseIdStr = exerciseId ? String(exerciseId) : null;

            let result;
            if (lessonIdStr) {
                result = await commentService.getCommentsByLesson(lessonIdStr);
            } else if (exerciseIdStr) {
                result = await commentService.getCommentsByExercise(exerciseIdStr);
            } else if (courseIdStr) {
                result = await commentService.getCommentsByCourse(courseIdStr);
            } else {
                return;
            }

            if (result.success) {
                const commentsData = result.data || [];
                console.log("Loaded comments:", commentsData);
                // Filter out hidden comments - chỉ hiển thị comment chưa bị ẩn cho học viên
                const visibleComments = commentsData.filter(comment => 
                    !comment.isHidden || comment.isHidden === false
                );
                // Không tự động load replies, chỉ load khi user click "Xem thêm"
                setComments(visibleComments.map(comment => ({ ...comment, replies: [] })));

                // Reset expanded và loaded states khi reload để đảm bảo đồng bộ
                setExpandedReplies({});
                setLoadedReplies({});

                // Initialize like counts from comments data
                const initialLikeCounts = {};
                const initialLiked = {};
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
                        // Process replies recursively
                        if (comment.replies && Array.isArray(comment.replies)) {
                            comment.replies.forEach(updateLikeData);
                        }
                    }
                };
                commentsData.forEach(updateLikeData);
                setLikeCounts(initialLikeCounts);
                setLikedComments(prev => ({ ...prev, ...initialLiked }));

                // Load reply count cho mỗi comment để biết có replies hay không (chỉ đếm replies chưa bị ẩn)
                const countMap = {};
                await Promise.all(
                    visibleComments.map(async (comment) => {
                        try {
                            const replyResult = await commentService.getRepliesByComment(comment.commentId || comment.id);
                            if (replyResult.success && Array.isArray(replyResult.data)) {
                                // Filter out hidden replies when counting
                                const visibleReplies = replyResult.data.filter(reply => 
                                    !reply.isHidden || reply.isHidden === false
                                );
                                countMap[comment.commentId || comment.id] = visibleReplies.length;
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
                console.error("Failed to load comments:", result.error);
            }
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to load replies recursively and return data (not update state)
    const loadRepliesRecursive = async (commentId, depth = 0) => {
        if (depth > 2) return []; // Stop at depth 2 (tầng 3)
        try {
            const result = await commentService.getRepliesByComment(commentId);
            if (result.success && Array.isArray(result.data)) {
                const replies = result.data || [];
                
                // Filter out hidden replies - chỉ hiển thị reply chưa bị ẩn cho học viên
                const visibleReplies = replies.filter(reply => 
                    !reply.isHidden || reply.isHidden === false
                );

                // Load nested replies for each reply
                const repliesWithNested = await Promise.all(
                    visibleReplies.map(async (reply) => {
                        try {
                            let nestedReplies = [];
                            let replyCount = 0;

                            if (depth < 2) {
                                // Depth 0, 1: Load nested replies normally
                                nestedReplies = await loadRepliesRecursive(reply.commentId || reply.id, depth + 1);
                            } else if (depth === 2) {
                                // At depth 2 (tầng 3), load one more level and flatten all deeper to this level
                                const deepReplies = await loadRepliesRecursive(reply.commentId || reply.id, depth + 1);
                                // Flatten all deeper replies to this level
                                nestedReplies = deepReplies.flatMap(deepReply => {
                                    const allDeep = [deepReply];
                                    const collectAll = (r) => {
                                        if (r.replies && r.replies.length > 0) {
                                            r.replies.forEach(nr => {
                                                allDeep.push({ ...nr, replies: [] });
                                                collectAll(nr);
                                            });
                                        }
                                    };
                                    collectAll(deepReply);
                                    return allDeep.map(r => ({ ...r, replies: [] }));
                                });
                            }

                            // Get reply count
                            const replyCountResult = await commentService.getRepliesByComment(reply.commentId || reply.id);
                            replyCount = replyCountResult.success && Array.isArray(replyCountResult.data)
                                ? replyCountResult.data.length
                                : 0;

                            return { ...reply, replies: nestedReplies, replyCount };
                        } catch {
                            return { ...reply, replies: [], replyCount: 0 };
                        }
                    })
                );

                return repliesWithNested;
            }
            return [];
        } catch (error) {
            console.error(`Error loading replies recursively for ${commentId}:`, error);
            return [];
        }
    };

    const loadReplies = async (commentId) => {
        try {
            const repliesWithCounts = await loadRepliesRecursive(commentId, 0);

            // Update comments state - tìm đệ quy trong nested structure
            setComments(prev => {
                const updateCommentRecursive = (comment) => {
                    const currentCommentId = comment.commentId || comment.id;
                    if (currentCommentId === commentId) {
                        return { ...comment, replies: repliesWithCounts };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => updateCommentRecursive(reply))
                        };
                    }
                    return comment;
                };
                return prev.map(updateCommentRecursive);
            });

            // Update replies count
            setRepliesCount(prev => ({
                ...prev,
                [commentId]: repliesWithCounts.length
            }));

            // Update nested replies count
            repliesWithCounts.forEach(reply => {
                const replyId = reply.commentId || reply.id;
                if (reply.replyCount !== undefined) {
                    setRepliesCount(prev => ({
                        ...prev,
                        [replyId]: reply.replyCount
                    }));
                }
            });

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

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            message.warning("Vui lòng nhập nội dung bình luận");
            return;
        }

        // Ensure IDs are strings (UUID format)
        const lessonIdStr = lessonId ? String(lessonId) : null;
        const courseIdStr = courseId ? String(courseId) : null;
        const exerciseIdStr = exerciseId ? String(exerciseId) : null;

        if (!lessonIdStr && !courseIdStr && !exerciseIdStr) {
            message.error("Không thể xác định bài học, khóa học hoặc bài tập");
            return;
        }

        try {
            const result = await commentService.createComment(
                lessonIdStr,
                courseIdStr,
                newComment,
                enableRating && newRating > 0 ? newRating : null,
                null,
                exerciseIdStr
            );
            if (result.success) {
                message.success("Bình luận đã được đăng");
                setNewComment("");
                setNewRating(0);

                // Thêm comment vào danh sách ngay để user thấy
                if (result.data) {
                    console.log("Comment created:", result.data);
                    const newCommentData = {
                        ...result.data,
                        replies: [],
                        user: result.data.user || {
                            id: currentUser?.id,
                            username: currentUser?.name || currentUser?.username || "Bạn",
                            role: currentUser?.role
                        }
                    };
                    console.log("Adding comment to list:", newCommentData);
                    setComments(prev => {
                        // Kiểm tra xem comment đã tồn tại chưa (tránh trùng lặp)
                        const exists = prev.some(c =>
                            c.commentId === newCommentData.commentId ||
                            (c.commentId && newCommentData.commentId && c.commentId.toString() === newCommentData.commentId.toString())
                        );
                        if (exists) {
                            console.log("Comment already exists, skipping");
                            return prev;
                        }
                        console.log("Adding new comment to list");
                        return [newCommentData, ...prev];
                    });
                }

                // Load lại sau 1 giây để đảm bảo đồng bộ với server
                setTimeout(() => {
                    console.log("Reloading comments...");
                    loadComments();
                }, 1000);
            } else {
                console.error("Failed to create comment:", result.error);
                message.error(result.error || "Không thể đăng bình luận");
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            message.error("Lỗi khi đăng bình luận");
        }
    };

    const handleReply = async (parentCommentId) => {
        if (!replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung phản hồi");
            return;
        }

        // Ensure IDs are strings (UUID format)
        const lessonIdStr = lessonId ? String(lessonId) : null;
        const courseIdStr = courseId ? String(courseId) : null;
        const exerciseIdStr = exerciseId ? String(exerciseId) : null;

        try {
            const result = await commentService.createComment(
                lessonIdStr,
                courseIdStr,
                replyContent,
                null,
                parentCommentId ? String(parentCommentId) : null,
                exerciseIdStr
            );
            if (result.success) {
                message.success("Phản hồi đã được đăng");
                setReplyContent("");
                setReplyingTo(null);
                // Load và hiển thị replies sau khi reply
                await loadReplies(parentCommentId);
                setExpandedReplies(prev => ({ ...prev, [parentCommentId]: true }));
                // Update reply count
                setRepliesCount(prev => {
                    const currentCount = prev[parentCommentId] || 0;
                    return { ...prev, [parentCommentId]: currentCount + 1 };
                });
            } else {
                message.error(result.error || "Không thể đăng phản hồi");
            }
        } catch {
            message.error("Lỗi khi đăng phản hồi");
        }
    };

    const handleEdit = async (commentId) => {
        if (!editContent.trim()) {
            message.warning("Vui lòng nhập nội dung");
            return;
        }

        try {
            const result = await commentService.updateComment(
                commentId,
                editContent,
                editRating > 0 ? editRating : null
            );
            if (result.success) {
                message.success("Bình luận đã được cập nhật thành công!");
                setEditingComment(null);
                setEditContent("");
                setEditRating(0);
                setShowMenu({});
                // Update local state immediately
                setComments(prev => prev.map(comment => {
                    if (comment.commentId === commentId) {
                        return { ...comment, content: editContent, rating: editRating > 0 ? editRating : comment.rating };
                    }
                    // Check in replies
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply.commentId === commentId
                                    ? { ...reply, content: editContent }
                                    : reply
                            )
                        };
                    }
                    return comment;
                }));
                // Reload to ensure sync
                setTimeout(() => loadComments(), 500);
            } else {
                message.error(result.error || "Không thể cập nhật bình luận");
            }
        } catch (error) {
            console.error("Error updating comment:", error);
            message.error("Lỗi khi cập nhật bình luận");
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
            return;
        }

        try {
            const result = await commentService.deleteComment(commentId);
            if (result.success) {
                message.success("Bình luận đã được xóa");
                setShowMenu({});
                loadComments();
            } else {
                message.error(result.error || "Không thể xóa bình luận");
            }
        } catch {
            message.error("Lỗi khi xóa bình luận");
        }
    };

    const handleLike = async (commentId, event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!canComment) {
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
        // try {
        //     const result = await commentService.likeComment(commentId, !isLiked);
        //     if (!result.success) {
        //         // Revert on error
        //         setLikedComments(prev => ({ ...prev, [commentId]: isLiked }));
        //         setLikeCounts(prev => ({ ...prev, [commentId]: currentCount }));
        //         message.error("Không thể thích bình luận");
        //     }
        // } catch (error) {
        //     // Revert on error
        //     setLikedComments(prev => ({ ...prev, [commentId]: isLiked }));
        //     setLikeCounts(prev => ({ ...prev, [commentId]: currentCount }));
        //     message.error("Lỗi khi thích bình luận");
        // }
    };

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                        className={`transition-all duration-200 ${interactive ? "cursor-pointer hover:scale-110 transform" : "cursor-default"}`}
                        disabled={!interactive}
                    >
                        <FontAwesomeIcon
                            icon={faStar}
                            className={`text-sm ${star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                                } ${interactive ? "hover:text-yellow-500" : ""}`}
                        />
                    </button>
                ))}
            </div>
        );
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
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
    };

    const formatOfflineTime = (offlineMinutes) => {
        if (!offlineMinutes) return "";
        if (offlineMinutes < 60) return `Đã offline ${offlineMinutes} phút`;
        const hours = Math.floor(offlineMinutes / 60);
        if (hours < 24) return `Đã offline ${hours} giờ`;
        const days = Math.floor(hours / 24);
        return `Đã offline ${days} ngày`;
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
                {roleName === "TEACHING_ASSISTANT" ? "TEACHING ASSISTANT" : roleName}
            </span>
        );
    };

    const getInitials = (username) => {
        if (!username) return "?";
        const parts = username.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
    };

    const renderComment = (comment, depth = 0) => {
        const isOwner = currentUser?.id === comment.user?.id;
        const canEdit = isOwner || isAdmin;
        const canDelete = isOwner || isAdmin;
        const showReplyButton = canComment;
        const commentId = comment.commentId || comment.id;
        const replies = comment.replies || [];
        const isRepliesExpanded = expandedReplies[commentId] === true; // Chỉ hiển thị khi user click "Xem thêm"
        const repliesCountLoaded = replies.length; // Số replies đã load
        const repliesCountTotal = repliesCount[commentId] !== undefined ? repliesCount[commentId] : repliesCountLoaded; // Tổng số replies (từ state hoặc đã load)
        const hasReplies = repliesCountTotal > 0; // Có replies (chỉ hiển thị nút nếu có)
        const isHovered = hoveredComment === commentId;

        // Indentation for replies
        // depth 0: không indent (tầng 1 - comment gốc)
        // depth 1: ml-8 (tầng 2 - reply đầu tiên)
        // depth >= 2: ml-16 (tầng 3+ - tất cả replies sau đó đều hiển thị cùng level)
        const indentClass = depth === 0 ? "" : depth === 1 ? "ml-8" : "ml-16";

        return (
            <div
                id={depth === 0 ? `comment-${commentId}` : undefined}
                className={`transition-all duration-200 ${indentClass}`}
                onMouseEnter={() => setHoveredComment(commentId)}
                onMouseLeave={() => setHoveredComment(null)}
            >
                {/* Vertical line for nested replies */}
                {depth === 1 && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 -ml-8"></div>
                )}
                {depth >= 2 && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 -ml-16"></div>
                )}

                <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-sm">
                            {comment.user?.profileImage ? (
                                <img
                                    src={`data:image/jpeg;base64,${comment.user.profileImage}`}
                                    alt={comment.user.username}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(comment.user?.username || "U")}
                                </span>
                            )}
                        </div>
                        {/* Online/Offline indicator - góc phải bên dưới */}
                        {comment.user?.isOnline !== undefined && (
                            <span 
                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                    comment.user.isOnline ? "bg-green-500" : "bg-gray-400"
                                }`}
                                style={{ 
                                    bottom: '2px', 
                                    right: '2px' 
                                }}
                            ></span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 relative">
                        {/* Header Row */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">
                                {comment.user?.username || "Người dùng"}
                            </span>
                            {getUserRoleBadge(comment.user?.role)}
                            <span className="text-xs text-gray-400">
                                {formatTimeAgo(comment.createdAt)}
                            </span>
                            {comment.user?.isOnline === false && comment.user?.offlineMinutes && (
                                <span className="text-xs text-gray-400">
                                    • {formatOfflineTime(comment.user.offlineMinutes)}
                                </span>
                            )}

                            {/* Rating stars - top right for first comment only */}
                            {enableRating && comment.rating && depth === 0 && (
                                <div className="ml-auto">
                                    {renderStars(comment.rating)}
                                </div>
                            )}

                            {/* Menu button - show on hover */}
                            {(canEdit || canDelete) && (
                                <div className="ml-auto relative">
                                    <button
                                        onClick={() => setShowMenu(prev => ({
                                            ...prev,
                                            [commentId]: !prev[commentId]
                                        }))}
                                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${isHovered || showMenu[commentId]
                                            ? "opacity-100 bg-gray-100"
                                            : "opacity-0"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faEllipsisVertical} className="text-gray-500 text-xs" />
                                    </button>

                                    {/* Dropdown menu */}
                                    {showMenu[commentId] && (
                                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                                            {canEdit && (
                                                <button
                                                    onClick={() => {
                                                        setEditingComment(commentId);
                                                        setEditContent(comment.content);
                                                        setEditRating(comment.rating || 0);
                                                        setShowMenu({});
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                                    Sửa
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => {
                                                        handleDelete(commentId);
                                                        setShowMenu({});
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Comment Content */}
                        {editingComment === commentId ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-white text-left"
                                    rows="3"
                                    autoFocus
                                />
                                {depth === 0 && enableRating && (
                                    <div className="mt-2">
                                        <label className="text-xs text-gray-600 mb-1 block">Đánh giá:</label>
                                        {renderStars(editRating, true, setEditRating)}
                                    </div>
                                )}
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(commentId)}
                                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingComment(null);
                                            setEditContent("");
                                            setEditRating(0);
                                        }}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-3 text-left">
                                {comment.content}
                            </p>
                        )}

                        {/* Action Buttons */}
                        {editingComment !== commentId && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => handleLike(commentId, e)}
                                    className={`flex items-center gap-1.5 text-xs transition-colors ${likedComments[commentId]
                                        ? "text-indigo-600 font-semibold"
                                        : "text-gray-500 hover:text-indigo-600"
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={faThumbsUp}
                                        className={`text-xs ${likedComments[commentId] ? "text-indigo-600" : ""}`}
                                    />
                                    <span>Thích</span>
                                    {(likeCounts[commentId] || 0) > 0 && (
                                        <span className="text-xs">({likeCounts[commentId]})</span>
                                    )}
                                </button>
                                {showReplyButton && depth < 2 && (
                                    <button
                                        onClick={() => {
                                            setReplyingTo(commentId);
                                            setReplyContent("");
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faReply} className="text-xs" />
                                        <span>Trả lời</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === commentId && (
                            <div className="mt-4 mb-2">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold text-xs">
                                            {getInitials(currentUser?.name || currentUser?.username || "U")}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={`Trả lời ${comment.user?.username || "người dùng"}...`}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-white text-left"
                                            rows="2"
                                            autoFocus
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => handleReply(commentId)}
                                                className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                            >
                                                Gửi
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyContent("");
                                                }}
                                                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Replies Section */}
                        {/* Chỉ hiển thị nút "Xem phản hồi" nếu có replies */}
                        {hasReplies && (
                            <div className="mt-4 relative">
                                {/* Show Replies Button - chỉ hiển thị nếu chưa expanded và có replies */}
                                {!isRepliesExpanded && (
                                    <button
                                        onClick={() => handleShowReplies(commentId)}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all duration-200"
                                    >
                                        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                                        Xem {repliesCountTotal} phản hồi
                                    </button>
                                )}

                                {/* Hide Replies Button - hiển thị khi đã mở và có replies */}
                                {isRepliesExpanded && repliesCountLoaded > 0 && (
                                    <button
                                        onClick={() => handleHideReplies(commentId)}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all duration-200"
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
                                                {/* Giới hạn depth ở tầng 3 (depth 2), tất cả replies sau đó hiển thị cùng level */}
                                                {renderComment(reply, depth >= 2 ? 2 : depth + 1)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (!lessonId && !courseId && !exerciseId) {
        return null;
    }

    const title = lessonId ? "Thảo luận bài học" : exerciseId ? "Thảo luận bài tập" : "Bình luận và Đánh giá";
    const subtitle = lessonId
        ? "Trao đổi thắc mắc, chia sẻ mẹo học và hỗ trợ nhau ngay dưới bài giảng này."
        : exerciseId
            ? "Trao đổi thắc mắc, chia sẻ mẹo học và hỗ trợ nhau ngay dưới bài tập này."
            : "Chia sẻ cảm nhận và đánh giá tổng thể về khóa học.";

    const visibleComments = comments.slice(0, visibleCount);
    const hasMoreComments = comments.length > visibleCount;
    const isExpanded = visibleCount > INITIAL_VISIBLE_COUNT;

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + 5, comments.length));
    };

    const handleShowLess = () => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    return (
        <div className={`w-full ${hideForm && hideHeader ? '' : 'bg-gray-50 min-h-screen py-8'}`}>
            {/* Main Container - White Card */}
            <div className={`${hideForm && hideHeader ? '' : 'max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'}`}>
                {/* Header */}
                {!hideHeader && (
                    <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 text-sm">{subtitle}</p>
                    </div>
                )}

                {/* Comment form */}
                {!hideForm && canComment ? (
                    <div className="px-8 py-6 border-b border-gray-100">
                        <form onSubmit={handleSubmitComment}>
                            {enableRating && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Đánh giá (tùy chọn):
                                    </label>
                                    {renderStars(newRating, true, setNewRating)}
                                </div>
                            )}
                            <textarea
                                ref={commentInputRef}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={lessonId || exerciseId ? "Đặt câu hỏi hoặc chia sẻ kinh nghiệm học tập của bạn..." : "Viết bình luận của bạn..."}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-white text-left"
                                rows="4"
                                required
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors"
                                >
                                    Đăng bình luận
                                </button>
                            </div>
                        </form>
                    </div>
                ) : !hideForm ? (
                    <div className="px-8 py-6 border-b border-gray-100">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-amber-800 text-sm">
                                Vui lòng đăng nhập để bình luận và đánh giá.
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* Comments list */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500 text-sm">Đang tải bình luận...</p>
                    </div>
                ) : comments.length > 0 ? (
                    <div className={hideForm && hideHeader ? "" : "px-8 py-6"}>
                        {visibleComments.map((comment, idx) => (
                            <div key={comment.commentId || comment.id || `comment-${idx}`} className="relative">
                                {renderComment(comment, 0)}
                            </div>
                        ))}

                        {/* Show More / Show Less Buttons - luôn hiển thị nếu có nhiều hơn INITIAL_VISIBLE_COUNT */}
                        {comments.length > INITIAL_VISIBLE_COUNT && (
                            <div className="pt-6 border-t border-gray-100 mt-6">
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    {hasMoreComments && (
                                        <button
                                            onClick={handleShowMore}
                                            className="px-6 py-2.5 text-indigo-600 font-medium text-sm bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                        >
                                            <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                                            Xem thêm {Math.min(5, comments.length - visibleCount)} thảo luận
                                        </button>
                                    )}
                                    {isExpanded && (
                                        <button
                                            onClick={handleShowLess}
                                            className="px-6 py-2.5 text-gray-600 font-medium text-sm bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                        >
                                            <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
                                            Thu gọn ({visibleCount - INITIAL_VISIBLE_COUNT} bình luận)
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FontAwesomeIcon icon={faUser} className="text-2xl text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">Chưa có thảo luận nào</p>
                        <p className="text-gray-500 text-sm">Hãy đặt câu hỏi hoặc chia sẻ cảm nhận của bạn!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommentSection;

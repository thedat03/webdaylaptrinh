import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faReply,
    faEdit,
    faTrash,
    faUser,
    faCheckCircle,
    faClock
} from "@fortawesome/free-solid-svg-icons";
import { commentService } from "../../api/comment.service";
import { authService } from "../../api/auth.service";
import { message } from "antd";

function CommentSection({ lessonId, courseId, enableRating = true }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [visibleCount, setVisibleCount] = useState(5);
    const commentInputRef = useRef(null);

    const currentUser = authService.getCurrentUser();
    const isAdmin = authService.isAdminAuthenticated();
    const isInstructor = authService.isInstructorAuthenticated();
    const isTeachingAssistant = authService.isTeachingAssistantAuthenticated();
    const canComment = authService.isUserAuthenticated() || isInstructor || isTeachingAssistant;

    useEffect(() => {
        if (lessonId || courseId) {
            loadComments();
        }
    }, [lessonId, courseId]);

    useEffect(() => {
        setVisibleCount(5);
    }, [comments.length, lessonId, courseId]);

    useEffect(() => {
        if (commentInputRef.current) {
            commentInputRef.current.style.height = "auto";
            commentInputRef.current.style.height = `${Math.min(commentInputRef.current.scrollHeight, 320)}px`;
        }
    }, [newComment]);

    const loadComments = async () => {
        setLoading(true);
        try {
            // Ensure lessonId and courseId are strings (UUID format)
            const lessonIdStr = lessonId ? String(lessonId) : null;
            const courseIdStr = courseId ? String(courseId) : null;

            let result;
            if (lessonIdStr) {
                result = await commentService.getCommentsByLesson(lessonIdStr);
            } else if (courseIdStr) {
                result = await commentService.getCommentsByCourse(courseIdStr);
            } else {
                return;
            }

            if (result.success) {
                const commentsData = result.data || [];
                console.log("Loaded comments:", commentsData);
                setComments(commentsData);
                // Load replies for each comment
                for (const comment of commentsData) {
                    await loadReplies(comment.commentId);
                }
            } else {
                console.error("Failed to load comments:", result.error);
            }
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadReplies = async (commentId) => {
        try {
            const result = await commentService.getRepliesByComment(commentId);
            if (result.success) {
                setComments(prev => prev.map(comment =>
                    comment.commentId === commentId
                        ? { ...comment, replies: result.data || [] }
                        : comment
                ));
            }
        } catch (error) {
            console.error("Error loading replies:", error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            message.warning("Vui lòng nhập nội dung bình luận");
            return;
        }

        // Ensure lessonId and courseId are strings (UUID format)
        const lessonIdStr = lessonId ? String(lessonId) : null;
        const courseIdStr = courseId ? String(courseId) : null;

        if (!lessonIdStr && !courseIdStr) {
            message.error("Không thể xác định bài học hoặc khóa học");
            return;
        }

        try {
            const result = await commentService.createComment(
                lessonIdStr,
                courseIdStr,
                newComment,
                enableRating && newRating > 0 ? newRating : null
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

        // Ensure lessonId and courseId are strings (UUID format)
        const lessonIdStr = lessonId ? String(lessonId) : null;
        const courseIdStr = courseId ? String(courseId) : null;

        try {
            const result = await commentService.createComment(
                lessonIdStr,
                courseIdStr,
                replyContent,
                null,
                parentCommentId ? String(parentCommentId) : null
            );
            if (result.success) {
                message.success("Phản hồi đã được đăng");
                setReplyContent("");
                setReplyingTo(null);
                loadReplies(parentCommentId);
            } else {
                message.error(result.error || "Không thể đăng phản hồi");
            }
        } catch (error) {
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
                message.success("Bình luận đã được cập nhật");
                setEditingComment(null);
                setEditContent("");
                setEditRating(0);
                loadComments();
            } else {
                message.error(result.error || "Không thể cập nhật bình luận");
            }
        } catch (error) {
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
                loadComments();
            } else {
                message.error(result.error || "Không thể xóa bình luận");
            }
        } catch (error) {
            message.error("Lỗi khi xóa bình luận");
        }
    };

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                        className={interactive ? "cursor-pointer" : "cursor-default"}
                        disabled={!interactive}
                    >
                        <FontAwesomeIcon
                            icon={faStar}
                            className={`text-lg ${star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                                } ${interactive ? "hover:text-yellow-500" : ""}`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getUserRoleBadge = (role) => {
        const roleName = role?.replace("ROLE_", "") || "";
        const colors = {
            ADMIN: "bg-red-100 text-red-700",
            INSTRUCTOR: "bg-purple-100 text-purple-700",
            TEACHING_ASSISTANT: "bg-orange-100 text-orange-700",
            STUDENT: "bg-green-100 text-green-700",
            USER: "bg-blue-100 text-blue-700"
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[roleName] || colors.USER}`}>
                {roleName}
            </span>
        );
    };

    const renderComment = (comment, isReply = false) => {
        const isOwner = currentUser?.id === comment.user?.id;
        const canEdit = isOwner || isAdmin;
        const canDelete = isOwner || isAdmin;
        const showReplyButton = !isReply && canComment;

        return (
            <div className={`${isReply ? "ml-8 mt-3 border-l-2 border-indigo-200 pl-4" : ""}`}>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            {comment.user?.profileImage ? (
                                <img
                                    src={`data:image/jpeg;base64,${comment.user.profileImage}`}
                                    alt={comment.user.username}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="text-indigo-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900">
                                    {comment.user?.username || "Người dùng"}
                                </span>
                                {getUserRoleBadge(comment.user?.role)}
                                {comment.isApproved ? (
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
                                ) : (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-xs" />
                                        Chờ duyệt
                                    </span>
                                )}
                            </div>
                            {enableRating && comment.rating && (
                                <div className="mb-2">
                                    {renderStars(comment.rating)}
                                </div>
                            )}
                            <p className="text-gray-700 whitespace-pre-wrap mb-2 text-left">{comment.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{formatDate(comment.createdAt)}</span>
                                {showReplyButton && (
                                    <button
                                        onClick={() => {
                                            setReplyingTo(comment.commentId);
                                            setReplyContent("");
                                        }}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faReply} className="text-xs" />
                                        Phản hồi
                                    </button>
                                )}
                                {canEdit && (
                                    <button
                                        onClick={() => {
                                            setEditingComment(comment.commentId);
                                            setEditContent(comment.content);
                                            setEditRating(comment.rating || 0);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                        Sửa
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => handleDelete(comment.commentId)}
                                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment.commentId && (
                        <div className="mt-4 pl-4 border-l-2 border-indigo-300">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Viết phản hồi..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => handleReply(comment.commentId)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Gửi phản hồi
                                </button>
                                <button
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent("");
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Edit form */}
                    {editingComment === comment.commentId && (
                        <div className="mt-4 pl-4 border-l-2 border-blue-300">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                            />
                            {!isReply && enableRating && (
                                <div className="mt-2">
                                    <label className="text-sm text-gray-700 mb-1 block">Đánh giá:</label>
                                    {renderStars(editRating, true, setEditRating)}
                                </div>
                            )}
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => handleEdit(comment.commentId)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Lưu
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingComment(null);
                                        setEditContent("");
                                        setEditRating(0);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setExpandedReplies(prev => ({
                                    ...prev,
                                    [comment.commentId]: !prev[comment.commentId]
                                }))}
                                className="text-sm text-indigo-600 hover:text-indigo-700 mb-2"
                            >
                                {expandedReplies[comment.commentId] ? "Ẩn" : "Hiện"} {comment.replies.length} phản hồi
                            </button>
                            {expandedReplies[comment.commentId] && (
                                <div className="space-y-3">
                                    {comment.replies.map((reply, replyIdx) => (
                                        <div key={reply.commentId || reply.id || `reply-${replyIdx}`}>
                                            {renderComment(reply, true)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!lessonId && !courseId) {
        return null;
    }

    const title = lessonId ? "Thảo luận bài học" : "Bình luận và Đánh giá";
    const subtitle = lessonId
        ? "Trao đổi thắc mắc, chia sẻ mẹo học và hỗ trợ nhau ngay dưới bài giảng này."
        : "Chia sẻ cảm nhận và đánh giá tổng thể về khóa học.";

    const visibleComments = comments.slice(0, visibleCount);

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + 5, comments.length));
    };

    return (
        <div className="mt-8">
            <div className="mb-6 text-left">
                <h3 className="text-2xl font-bold text-gray-900 text-left">{title}</h3>
                <p className="text-gray-600 mt-1 text-left">{subtitle}</p>
            </div>

            {/* Comment form */}
            {canComment ? (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
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
                            placeholder={lessonId ? "Đặt câu hỏi hoặc chia sẻ kinh nghiệm học tập của bạn..." : "Viết bình luận của bạn..."}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            rows="1"
                            required
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                            >
                                Đăng bình luận
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800">
                        Vui lòng đăng nhập để bình luận và đánh giá bài học.
                    </p>
                </div>
            )}

            {/* Comments list */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {visibleComments.map((comment, idx) => (
                        <div key={comment.commentId || comment.id || `comment-${idx}`}>
                            {renderComment(comment, false)}
                        </div>
                    ))}
                    {comments.length > visibleCount && (
                        <div className="text-center pt-2">
                            <button
                                onClick={handleShowMore}
                                className="px-4 py-2 text-indigo-600 font-semibold hover:text-indigo-700"
                            >
                                Xem thêm {Math.min(5, comments.length - visibleCount)} thảo luận nữa
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>Chưa có thảo luận nào. Hãy đặt câu hỏi hoặc chia sẻ cảm nhận của bạn!</p>
                </div>
            )}
        </div>
    );
}

export default CommentSection;


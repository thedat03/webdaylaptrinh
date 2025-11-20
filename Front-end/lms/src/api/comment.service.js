import api from "./api";

// Lấy tất cả comment đã duyệt của một lesson
async function getCommentsByLesson(lessonId) {
    try {
        const { data } = await api.get(`/api/comments/lesson/${lessonId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { success: false, error: "Could not fetch comments" };
    }
}

// Lấy tất cả comment đã duyệt của một course
async function getCommentsByCourse(courseId) {
    try {
        const { data } = await api.get(`/api/comments/course/${courseId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching course comments:", error);
        return { success: false, error: "Could not fetch comments" };
    }
}

// Lấy tất cả comment (bao gồm chưa duyệt) - cho admin
async function getAllCommentsByLesson(lessonId) {
    try {
        const { data } = await api.get(`/api/comments/lesson/${lessonId}/all`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching all comments:", error);
        return { success: false, error: "Could not fetch comments" };
    }
}

// Lấy reply của một comment
async function getRepliesByComment(commentId) {
    try {
        const { data } = await api.get(`/api/comments/${commentId}/replies`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching replies:", error);
        return { success: false, error: "Could not fetch replies" };
    }
}

// Tạo comment mới (cho lesson hoặc course)
async function createComment(lessonId, courseId, content, rating = null, parentCommentId = null) {
    try {
        const requestBody = {
            content: content?.trim() || "",
        };

        // Only add rating if it's a valid number
        if (rating != null && rating > 0) {
            requestBody.rating = rating;
        }

        // Only add parentCommentId if it exists
        if (parentCommentId) {
            requestBody.parentCommentId = parentCommentId;
        }

        // Add lessonId or courseId (but not both)
        if (lessonId) {
            requestBody.lessonId = lessonId;
        } else if (courseId) {
            requestBody.courseId = courseId;
        }

        console.log("Creating comment with body:", requestBody);

        const { data } = await api.post("/api/comments", requestBody);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating comment:", error);
        console.error("Error response:", error.response?.data);

        // Extract error message from response
        let errorMessage = "Could not create comment";
        if (error.response?.data) {
            if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            }
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

// Cập nhật comment
async function updateComment(commentId, content, rating = null) {
    try {
        const { data } = await api.put(`/api/comments/${commentId}`, {
            content,
            rating
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error updating comment:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Could not update comment"
        };
    }
}

// Xóa comment
async function deleteComment(commentId) {
    try {
        await api.delete(`/api/comments/${commentId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        const status = error.response?.status;
        let errorMessage = "Could not delete comment";

        if (status === 403) {
            errorMessage = "Bạn không có quyền xóa bình luận này";
        } else if (status === 404) {
            errorMessage = "Bình luận không tồn tại";
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

// Admin duyệt comment
async function approveComment(commentId) {
    try {
        const { data } = await api.post(`/api/comments/${commentId}/approve`);
        return { success: true, data };
    } catch (error) {
        console.error("Error approving comment:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Could not approve comment"
        };
    }
}

// Admin từ chối comment
async function rejectComment(commentId) {
    try {
        await api.delete(`/api/comments/${commentId}/reject`);
        return { success: true };
    } catch (error) {
        console.error("Error rejecting comment:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Could not reject comment"
        };
    }
}

// Lấy tất cả comment (cho admin)
async function getAllComments() {
    try {
        const { data } = await api.get("/api/comments/all");
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching all comments:", error);
        return { success: false, error: "Could not fetch comments" };
    }
}

// Lấy tất cả comment chưa duyệt (nếu cần trong tương lai)
async function getPendingComments() {
    try {
        const { data } = await api.get("/api/comments/pending");
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching pending comments:", error);
        return { success: false, error: "Could not fetch pending comments" };
    }
}

export const commentService = {
    getCommentsByLesson,
    getCommentsByCourse,
    getAllCommentsByLesson,
    getRepliesByComment,
    createComment,
    updateComment,
    deleteComment,
    approveComment,
    rejectComment,
    getAllComments,
    getPendingComments,
};


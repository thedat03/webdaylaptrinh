import api from "./api";

// Direct Questions API
async function getMyAssignedQuestions() {
    try {
        const { data } = await api.get("/api/direct-questions/ta/my-assigned");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting assigned questions:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get questions" };
    }
}

async function getPendingQuestions() {
    try {
        const { data } = await api.get("/api/direct-questions/pending");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting pending questions:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get pending questions" };
    }
}

async function answerQuestion(questionId, response) {
    try {
        const { data } = await api.post(`/api/direct-questions/${questionId}/answer`, { response });
        return { success: true, data };
    } catch (error) {
        console.error("Error answering question:", error);
        return { success: false, error: error.response?.data?.error || "Failed to answer question" };
    }
}

async function claimQuestion(questionId) {
    try {
        const { data } = await api.post(`/api/direct-questions/${questionId}/claim`);
        return { success: true, data };
    } catch (error) {
        console.error("Error claiming question:", error);
        return { success: false, error: error.response?.data?.error || "Failed to claim question" };
    }
}

// Comments API for TA
async function getUnansweredComments() {
    try {
        const { data } = await api.get("/api/comments/unanswered");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting unanswered comments:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get unanswered comments" };
    }
}

async function getAllComments() {
    try {
        const { data } = await api.get("/api/comments/ta/all");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting all comments:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get all comments" };
    }
}

async function getCommentsByCourse(courseId) {
    try {
        const { data } = await api.get(`/api/comments/course/${courseId}/ta`);
        return { success: true, data };
    } catch (error) {
        console.error("Error getting comments by course:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get comments" };
    }
}

async function getCommentsByLesson(lessonId) {
    try {
        const { data } = await api.get(`/api/comments/lesson/${lessonId}/ta`);
        return { success: true, data };
    } catch (error) {
        console.error("Error getting comments by lesson:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get comments" };
    }
}

async function answerComment(commentId, content) {
    try {
        const { data } = await api.post(`/api/comments/${commentId}/ta-answer`, { content });
        return { success: true, data };
    } catch (error) {
        console.error("Error answering comment:", error);
        return { success: false, error: error.response?.data?.error || "Failed to answer comment" };
    }
}

async function hideComment(commentId) {
    try {
        const { data } = await api.put(`/api/comments/${commentId}/ta-hide`);
        return { success: true, data };
    } catch (error) {
        console.error("Error hiding comment:", error);
        return { success: false, error: error.response?.data?.error || "Failed to hide comment" };
    }
}

async function unhideComment(commentId) {
    try {
        const { data } = await api.put(`/api/comments/${commentId}/ta-unhide`);
        return { success: true, data };
    } catch (error) {
        console.error("Error unhiding comment:", error);
        return { success: false, error: error.response?.data?.error || "Failed to unhide comment" };
    }
}

async function deleteComment(commentId) {
    try {
        await api.delete(`/api/comments/${commentId}/ta-delete`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { success: false, error: error.response?.data?.error || "Failed to delete comment" };
    }
}

// TA Progress API
async function getStudentsProgress(courseId) {
    try {
        const { data } = await api.get(`/api/ta-progress/course/${courseId}/students`);
        return { success: true, data };
    } catch (error) {
        console.error("Error getting students progress:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get progress" };
    }
}

async function getStudentProgress(courseId, studentId) {
    try {
        const { data } = await api.get(`/api/ta-progress/course/${courseId}/student/${studentId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error getting student progress:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get student progress" };
    }
}

async function getStudentActivityDetails(courseId, studentId) {
    try {
        const { data } = await api.get(`/api/ta-progress/course/${courseId}/student/${studentId}/activities`);
        return { success: true, data };
    } catch (error) {
        console.error("Error getting student activity details:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get student activity details" };
    }
}

async function getStudentsNeedingReminder(courseId, daysInactive = 7) {
    try {
        const { data } = await api.get(`/api/ta-progress/course/${courseId}/students-needing-reminder`, {
            params: { daysInactive }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error getting students needing reminder:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get students" };
    }
}

// TA Reminders API
async function sendReminder(studentId, message, type = "GENERAL", courseId = null, lessonId = null) {
    try {
        const { data } = await api.post("/api/ta-reminders", {
            studentId,
            message,
            type,
            courseId,
            lessonId
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error sending reminder:", error);
        return { success: false, error: error.response?.data?.error || "Failed to send reminder" };
    }
}

async function getMyReminders() {
    try {
        const { data } = await api.get("/api/ta-reminders/ta/my-reminders");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting reminders:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get reminders" };
    }
}

// Get TA assigned courses
async function getAssignedCourses() {
    try {
        const { data } = await api.get("/api/ta-progress/assigned-courses");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting assigned courses:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get courses" };
    }
}

// Get students in a course (for reminder selection)
async function getStudentsInCourse(courseId) {
    try {
        const { data } = await api.get(`/api/ta-progress/course/${courseId}/students-list`);
        return { success: true, data };
    } catch (error) {
        console.error("Error getting students in course:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get students" };
    }
}

// Student: Create direct question
async function createDirectQuestion(content, courseId, lessonId) {
    try {
        const { data } = await api.post("/api/direct-questions", {
            content,
            courseId,
            lessonId
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error creating direct question:", error);
        return { success: false, error: error.response?.data?.error || "Failed to create question" };
    }
}

// Student: Get my questions
async function getMyQuestions() {
    try {
        const { data } = await api.get("/api/direct-questions/my-questions");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting my questions:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get questions" };
    }
}

// Student: Get my answered questions (for chat display)
async function getMyAnsweredQuestions() {
    try {
        const { data } = await api.get("/api/direct-questions/my-answered-questions");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting answered questions:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get answered questions" };
    }
}

// Student: Mark question as resolved with rating
async function markAsResolved(questionId, rating) {
    try {
        const { data } = await api.post(`/api/direct-questions/${questionId}/mark-resolved`, {
            rating
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error marking as resolved:", error);
        return { success: false, error: error.response?.data?.error || "Failed to mark as resolved" };
    }
}

export const taService = {
    // Direct Questions
    getMyAssignedQuestions,
    getPendingQuestions,
    answerQuestion,
    claimQuestion,
    
    // Comments
    getUnansweredComments,
    getAllComments,
    getCommentsByCourse,
    getCommentsByLesson,
    answerComment,
    hideComment,
    unhideComment,
    deleteComment,
    
    // Progress
    getStudentsProgress,
    getStudentProgress,
    getStudentsNeedingReminder,
    getStudentActivityDetails,
    
    // Reminders
    sendReminder,
    getMyReminders,
    
    // Courses
    getAssignedCourses,
    
    // Students
    getStudentsInCourse,
    
    // Direct Questions - Student
    createDirectQuestion,
    getMyQuestions,
    getMyAnsweredQuestions,
    markAsResolved
};

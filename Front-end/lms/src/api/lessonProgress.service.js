import api from "./api";

async function markLessonCompleted(userId, lessonId) {
    try {
        await api.post("/api/lesson-progress/complete", {
            userId,
            lessonId,
            isCompleted: true
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking lesson as completed:", error);
        return { success: false, error: error.response?.data?.message || "Unable to mark lesson as completed" };
    }
}

async function updateLessonAccess(userId, lessonId) {
    try {
        await api.put("/api/lesson-progress/access", {
            userId,
            lessonId
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating lesson access:", error);
        return { success: false, error: error.response?.data?.message || "Unable to update lesson access" };
    }
}

async function checkLessonCompleted(userId, lessonId) {
    try {
        const { data } = await api.get(`/api/lesson-progress/check/${userId}/${lessonId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error checking lesson completion:", error);
        return { success: false, error: error.response?.data?.message || "Unable to check lesson completion" };
    }
}

async function getLessonsProgressByCourse(userId, courseId) {
    try {
        const { data } = await api.get(`/api/lesson-progress/course/${userId}/${courseId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching lessons progress:", error);
        return { success: false, error: error.response?.data?.message || "Unable to fetch lessons progress" };
    }
}

export const lessonProgressService = {
    markLessonCompleted,
    updateLessonAccess,
    checkLessonCompleted,
    getLessonsProgressByCourse,
};


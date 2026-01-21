import api from "./api";

async function markLessonCompleted(userId, lessonId, watchedSeconds = null, watchedPercentage = null) {
    try {
        const payload = {
            userId,
            lessonId,
            isCompleted: true
        };
        
        // Thêm watchedSeconds và watchedPercentage nếu có
        if (watchedSeconds !== null && watchedSeconds !== undefined) {
            payload.watchedSeconds = Math.floor(watchedSeconds);
        }
        if (watchedPercentage !== null && watchedPercentage !== undefined) {
            payload.watchedPercentage = Math.round(watchedPercentage * 100) / 100; // Round to 2 decimals
        }
        
        await api.post("/api/lesson-progress/complete", payload);
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


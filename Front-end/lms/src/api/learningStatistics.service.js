import api from "./api";

async function getLearningStatistics(userId) {
    try {
        const { data } = await api.get(`/api/learning-statistics/${userId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching learning statistics:", error);
        return { success: false, error: error.response?.data?.message || "Unable to fetch learning statistics" };
    }
}

async function getLearningPath(userId) {
    try {
        const { data } = await api.get(`/api/learning-path/${userId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching learning path:", error);
        return { success: false, error: error.response?.data?.message || "Unable to fetch learning path" };
    }
}

export const learningStatisticsService = {
    getLearningStatistics,
    getLearningPath,
};


import api from "./api";

async function getDashboardStats() {
    try {
        const { data } = await api.get("/api/statistics/dashboard");
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { success: false, error: error.response?.data?.message || "Could not fetch dashboard statistics" };
    }
}

async function getRevenueChart(period = "month") {
    try {
        const { data } = await api.get(`/api/statistics/revenue-chart?period=${period}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching revenue chart:", error);
        return { success: false, error: error.response?.data?.message || "Could not fetch revenue chart" };
    }
}

async function getTopCourses(limit = 10) {
    try {
        const { data } = await api.get(`/api/statistics/top-courses?limit=${limit}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching top courses:", error);
        return { success: false, error: error.response?.data?.message || "Could not fetch top courses" };
    }
}

export const statisticsService = {
    getDashboardStats,
    getRevenueChart,
    getTopCourses,
};


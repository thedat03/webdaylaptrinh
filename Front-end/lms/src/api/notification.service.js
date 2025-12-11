import api from "./api";

// Helper để tạo request config với skipAuthRedirect
const createRequestConfig = () => ({
    headers: {
        'X-Skip-Auth-Redirect': 'true'
    },
    skipAuthRedirect: true,
    metadata: {
        skipAuthRedirect: true
    }
});

// Lấy tất cả thông báo của user
async function getNotifications() {
    try {
        const config = createRequestConfig();
        const { data } = await api.get("/api/notifications", config);
        return { success: true, data: data?.data || data };
    } catch (error) {
        // Nếu lỗi 401 (unauthorized), không throw để tránh redirect
        if (error.response?.status === 401) {
            return {
                success: false,
                error: "Vui lòng đăng nhập để xem thông báo",
                unauthorized: true
            };
        }
        console.error("Error getting notifications:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy danh sách thông báo"
        };
    }
}

// Đếm số thông báo chưa đọc
async function getUnreadCount() {
    try {
        const config = createRequestConfig();
        const { data } = await api.get("/api/notifications/unread/count", config);
        return { success: true, data: data?.data || data };
    } catch (error) {
        // Nếu lỗi 401 (unauthorized), không throw để tránh redirect
        if (error.response?.status === 401) {
            return {
                success: false,
                data: 0,
                unauthorized: true
            };
        }
        console.error("Error getting unread count:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy số thông báo chưa đọc"
        };
    }
}

// Lấy thông báo chưa đọc
async function getUnreadNotifications() {
    try {
        const config = createRequestConfig();
        const { data } = await api.get("/api/notifications/unread", config);
        return { success: true, data: data?.data || data };
    } catch (error) {
        // Nếu lỗi 401 (unauthorized), không throw để tránh redirect
        if (error.response?.status === 401) {
            return {
                success: false,
                data: [],
                unauthorized: true
            };
        }
        console.error("Error getting unread notifications:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy thông báo chưa đọc"
        };
    }
}

// Đánh dấu thông báo là đã đọc
async function markAsRead(notificationId) {
    try {
        const { data } = await api.post(`/api/notifications/${notificationId}/read`);
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể đánh dấu đã đọc"
        };
    }
}

// Đánh dấu tất cả thông báo là đã đọc
async function markAllAsRead() {
    try {
        const { data } = await api.post("/api/notifications/read-all");
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error marking all as read:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể đánh dấu tất cả là đã đọc"
        };
    }
}

// Xóa thông báo
async function deleteNotification(notificationId) {
    try {
        await api.delete(`/api/notifications/${notificationId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể xóa thông báo"
        };
    }
}

export const notificationService = {
    getNotifications,
    getUnreadCount,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};


import api from "./api";

// Gửi tin nhắn
async function sendMessage(receiverId, content) {
    try {
        const { data } = await api.post("/api/messages", {
            receiverId,
            content
        });
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error sending message:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể gửi tin nhắn"
        };
    }
}

// Lấy cuộc trò chuyện giữa 2 người dùng
async function getConversation(otherUserId) {
    try {
        const { data } = await api.get(`/api/messages/conversation/${otherUserId}`);
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error getting conversation:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy cuộc trò chuyện"
        };
    }
}

// Lấy danh sách người đã chat
async function getConversations() {
    try {
        const { data } = await api.get("/api/messages/conversations");
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error getting conversations:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy danh sách cuộc trò chuyện"
        };
    }
}

// Lấy danh sách người dùng có thể chat
async function getAvailableChatUsers() {
    try {
        const { data } = await api.get("/api/messages/available-users");
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error getting available users:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy danh sách người dùng"
        };
    }
}

// Đếm số tin nhắn chưa đọc
async function getUnreadCount() {
    try {
        const { data } = await api.get("/api/messages/unread/count");
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error getting unread count:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy số tin nhắn chưa đọc"
        };
    }
}

// Lấy tin nhắn chưa đọc
async function getUnreadMessages() {
    try {
        const { data } = await api.get("/api/messages/unread");
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error getting unread messages:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể lấy tin nhắn chưa đọc"
        };
    }
}

// Đánh dấu tin nhắn là đã đọc
async function markAsRead(senderId) {
    try {
        const { data } = await api.post(`/api/messages/read/${senderId}`);
        return { success: true, data: data?.data || data };
    } catch (error) {
        console.error("Error marking as read:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể đánh dấu đã đọc"
        };
    }
}

// Xóa tin nhắn
async function deleteMessage(messageId) {
    try {
        await api.delete(`/api/messages/${messageId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể xóa tin nhắn"
        };
    }
}

export const messageService = {
    sendMessage,
    getConversation,
    getConversations,
    getAvailableChatUsers,
    getUnreadCount,
    getUnreadMessages,
    markAsRead,
    deleteMessage,
};


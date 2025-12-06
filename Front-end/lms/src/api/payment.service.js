import api from "./api";

async function createPayment({ userId, courseId, bankCode, locale }) {
    try {
        const { data } = await api.post("/api/payments", {
            userId,
            courseId,
            bankCode,
            locale,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Payment creation error:", error);
        const message = error?.response?.data?.message || "Không thể khởi tạo thanh toán";
        return { success: false, error: message };
    }
}

async function getUserPayments(userId) {
    try {
        const { data } = await api.get(`/api/payments/user/${userId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Fetch payments error:", error);
        return { success: false, error: "Không thể tải lịch sử thanh toán" };
    }
}

async function getAllPayments() {
    try {
        const { data } = await api.get("/api/payments");
        return { success: true, data };
    } catch (error) {
        console.error("Fetch all payments error:", error);
        return { success: false, error: "Không thể tải danh sách thanh toán" };
    }
}

export const paymentService = {
    createPayment,
    getUserPayments,
    getAllPayments,
};


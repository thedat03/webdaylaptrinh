import api from "./api";

async function addToCart(userId, courseId) {
    try {
        const { data } = await api.post("/api/cart", {
            userId,
            courseId,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Add to cart error:", error);
        const message = error?.response?.data?.message || "Không thể thêm vào giỏ hàng";
        return { success: false, error: message };
    }
}

async function getCartItems(userId) {
    try {
        const { data } = await api.get(`/api/cart/user/${userId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Fetch cart items error:", error);
        return { success: false, error: "Không thể tải giỏ hàng" };
    }
}

async function getCartCount(userId) {
    try {
        const { data } = await api.get(`/api/cart/count/${userId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Fetch cart count error:", error);
        return { success: false, data: 0 };
    }
}

async function removeFromCart(userId, courseId) {
    try {
        await api.delete(`/api/cart/user/${userId}/course/${courseId}`);
        return { success: true };
    } catch (error) {
        console.error("Remove from cart error:", error);
        return { success: false, error: "Không thể xóa khỏi giỏ hàng" };
    }
}

async function clearCart(userId) {
    try {
        await api.delete(`/api/cart/user/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Clear cart error:", error);
        return { success: false, error: "Không thể xóa giỏ hàng" };
    }
}

async function createCartPayment(userId, courseIds, bankCode, locale, promotionCode) {
    try {
        const { data } = await api.post("/api/payments/cart", {
            userId,
            courseIds,
            bankCode,
            locale,
            promotionCode,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Cart payment creation error:", error);
        const message = error?.response?.data?.message || "Không thể khởi tạo thanh toán";
        return { success: false, error: message };
    }
}

export const cartService = {
    addToCart,
    getCartItems,
    getCartCount,
    removeFromCart,
    clearCart,
    createCartPayment,
};


import api from "./api";

async function getAllPromotions() {
    try {
        const { data } = await api.get("/api/promotions", {
            skipAuthRedirect: true,
            metadata: { skipAuthRedirect: true }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return { success: false, error: "Could not fetch promotions" };
    }
}

async function getAllPromotionsAdmin() {
    try {
        const { data } = await api.get("/api/promotions/all");
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return { success: false, error: "Could not fetch promotions" };
    }
}

async function getPromotionById(promotionId) {
    try {
        const { data } = await api.get(`/api/promotions/${promotionId}`, {
            skipAuthRedirect: true,
            metadata: { skipAuthRedirect: true }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching promotion:", error);
        return { success: false, error: "Could not fetch promotion details" };
    }
}

async function getPromotionByCode(code) {
    try {
        const { data } = await api.get(`/api/promotions/code/${code}`, {
            skipAuthRedirect: true,
            metadata: { skipAuthRedirect: true }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching promotion by code:", error);
        return { success: false, error: "Could not fetch promotion" };
    }
}

async function createPromotion(promotionData) {
    try {
        console.log("Creating promotion with data:", promotionData);
        const { data } = await api.post("/api/promotions", promotionData);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating promotion:", error);
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Could not create promotion";
        return { success: false, error: errorMessage };
    }
}

async function updatePromotion(promotionId, promotionData) {
    try {
        const { data } = await api.put(`/api/promotions/${promotionId}`, promotionData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating promotion:", error);
        return { success: false, error: error.response?.data?.message || "Could not update promotion" };
    }
}

async function deletePromotion(promotionId) {
    try {
        await api.delete(`/api/promotions/${promotionId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting promotion:", error);
        return { success: false, error: error.response?.data?.message || "Could not delete promotion" };
    }
}

export const promotionService = {
    getAllPromotions,
    getAllPromotionsAdmin,
    getPromotionById,
    getPromotionByCode,
    createPromotion,
    updatePromotion,
    deletePromotion,
};


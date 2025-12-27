import api from "./api";

async function getAllBanners() {
    try {
        const { data } = await api.get("/api/banners", {
            skipAuthRedirect: true, // Public endpoint, không redirect khi 401
            metadata: { skipAuthRedirect: true }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching banners:", error);
        return { success: false, error: "Could not fetch banners" };
    }
}

async function getAllBannersAdmin() {
    try {
        const { data } = await api.get("/api/banners/all");
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching banners:", error);
        return { success: false, error: "Could not fetch banners" };
    }
}

async function getBannerById(bannerId) {
    try {
        const { data } = await api.get(`/api/banners/${bannerId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching banner:", error);
        return { success: false, error: "Could not fetch banner details" };
    }
}

async function createBanner(bannerData) {
    try {
        const { data } = await api.post("/api/banners", bannerData);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating banner:", error);
        return { success: false, error: "Could not create banner" };
    }
}

async function updateBanner(bannerId, bannerData) {
    try {
        const { data } = await api.put(`/api/banners/${bannerId}`, bannerData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating banner:", error);
        return { success: false, error: "Could not update banner" };
    }
}

async function deleteBanner(bannerId) {
    try {
        await api.delete(`/api/banners/${bannerId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting banner:", error);
        return { success: false, error: "Could not delete banner" };
    }
}

export const bannerService = {
    getAllBanners,
    getAllBannersAdmin,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
};


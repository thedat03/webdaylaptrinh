import api from "./api";

async function getFeaturedNews() {
    try {
        const { data } = await api.get("/api/news");
        return { success: true, data };
    } catch (e) {
        return { success: false, error: "Failed to fetch featured news" };
    }
}

async function getAllNewsAdmin() {
    try {
        const { data } = await api.get("/api/news/all");
        return { success: true, data };
    } catch (e) {
        return { success: false, error: "Failed to fetch news" };
    }
}

async function createNews(payload) {
    try {
        const { data } = await api.post("/api/news", payload);
        return { success: true, data };
    } catch (e) { return { success: false, error: "Failed to create news" }; }
}

async function updateNews(id, payload) {
    try {
        const { data } = await api.put(`/api/news/${id}`, payload);
        return { success: true, data };
    } catch (e) { return { success: false, error: "Failed to update news" }; }
}

async function deleteNews(id) {
    try {
        await api.delete(`/api/news/${id}`);
        return { success: true };
    } catch (e) { return { success: false, error: "Failed to delete news" }; }
}

export const newsService = { getFeaturedNews, getAllNewsAdmin, createNews, updateNews, deleteNews };

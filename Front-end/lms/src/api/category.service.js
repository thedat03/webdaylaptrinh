import api from "./api";

async function getAllCategories() {
    try {
        const { data } = await api.get("/api/categories");
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: "Could not fetch categories" };
    }
}

async function getCategoryById(categoryId) {
    try {
        const { data } = await api.get(`/api/categories/${categoryId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching category:", error);
        return { success: false, error: "Could not fetch category details" };
    }
}

async function createCategory(categoryData) {
    try {
        const { data } = await api.post("/api/categories", categoryData);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, error: "Could not create category" };
    }
}

async function updateCategory(categoryId, categoryData) {
    try {
        const { data } = await api.put(`/api/categories/${categoryId}`, categoryData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, error: "Could not update category" };
    }
}

async function deleteCategory(categoryId) {
    try {
        await api.delete(`/api/categories/${categoryId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, error: "Could not delete category" };
    }
}

export const categoryService = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};


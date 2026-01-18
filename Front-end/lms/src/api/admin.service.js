import api from "./api";

// TA Assignment API
async function getAllAssignments() {
    try {
        const { data } = await api.get("/api/admin/ta-assignments");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting assignments:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get assignments" };
    }
}

async function getAllTAs() {
    try {
        const { data } = await api.get("/api/admin/ta-assignments/tas");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting TAs:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get TAs" };
    }
}

async function getAllCourses() {
    try {
        const { data } = await api.get("/api/admin/ta-assignments/courses");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting courses:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get courses" };
    }
}

async function assignTAToCourse(taId, courseId) {
    try {
        const { data } = await api.post("/api/admin/ta-assignments", { taId, courseId });
        return { success: true, data };
    } catch (error) {
        console.error("Error assigning TA to course:", error);
        return { success: false, error: error.response?.data?.error || "Failed to assign TA to course" };
    }
}

async function deleteAssignment(assignmentId) {
    try {
        await api.delete(`/api/admin/ta-assignments/${assignmentId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting assignment:", error);
        return { success: false, error: error.response?.data?.error || "Failed to delete assignment" };
    }
}

async function removeAssignment(taId, courseId) {
    try {
        await api.delete(`/api/admin/ta-assignments/ta/${taId}/course/${courseId}`);
        return { success: true };
    } catch (error) {
        console.error("Error removing assignment:", error);
        return { success: false, error: error.response?.data?.error || "Failed to remove assignment" };
    }
}

// User Management APIs
async function getAllUsers() {
    try {
        const { data } = await api.get("/api/users");
        return { success: true, data };
    } catch (error) {
        console.error("Error getting users:", error);
        return { success: false, error: error.response?.data?.error || "Failed to get users" };
    }
}

async function createUser(userData) {
    try {
        const { data } = await api.post("/api/users", userData);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: error.response?.data?.error || "Failed to create user" };
    }
}

async function updateUser(userId, userData) {
    try {
        const { data } = await api.put(`/api/users/${userId}`, userData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: error.response?.data?.error || "Failed to update user" };
    }
}

async function deleteUser(userId) {
    try {
        await api.delete(`/api/users/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.response?.data?.error || "Failed to delete user" };
    }
}

export const adminService = {
    getAllAssignments,
    getAllTAs,
    getAllCourses,
    assignTAToCourse,
    deleteAssignment,
    removeAssignment,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};

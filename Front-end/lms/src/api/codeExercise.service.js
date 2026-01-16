import api from "./api";

/**
 * Service để tương tác với API CodeExercise
 * Cung cấp các phương thức CRUD cho bài tập code
 */

async function getCodeExercisesByCourseId(courseId) {
    try {
        const { data } = await api.get(`/api/code-exercises/course/${courseId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching code exercises:", error);
        return { success: false, error: error?.response?.data?.message || "Không thể tải danh sách bài tập code" };
    }
}

async function getCodeExerciseById(exerciseId) {
    try {
        const { data } = await api.get(`/api/code-exercises/${exerciseId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching code exercise:", error);
        return { success: false, error: error?.response?.data?.message || "Không thể tải bài tập code" };
    }
}

async function createCodeExercise(exerciseData) {
    try {
        const { data } = await api.post("/api/code-exercises", exerciseData);
        return { success: true, data };
    } catch (error) {
        console.error("Error creating code exercise:", error);
        return { success: false, error: error?.response?.data?.message || "Không thể tạo bài tập code" };
    }
}

async function updateCodeExercise(exerciseId, exerciseData) {
    try {
        console.log("Updating code exercise:", exerciseId, exerciseData);
        const { data } = await api.put(`/api/code-exercises/${exerciseId}`, exerciseData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating code exercise:", error);
        console.error("Error response:", error?.response?.data);
        const errorMessage = error?.response?.data?.message 
            || error?.response?.data?.error 
            || error?.message 
            || "Không thể cập nhật bài tập code";
        return { success: false, error: errorMessage };
    }
}

async function deleteCodeExercise(exerciseId) {
    try {
        await api.delete(`/api/code-exercises/${exerciseId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting code exercise:", error);
        return { success: false, error: error?.response?.data?.message || "Không thể xóa bài tập code" };
    }
}

async function runCodeExercise(exerciseId, payload) {
    try {
        const { data } = await api.post(`/api/code/exercises/${exerciseId}/run`, payload);
        return { success: true, data };
    } catch (error) {
        console.error("Judge0 execution error:", error);
        const message = error?.response?.data?.message || "Không thể chạy code. Vui lòng thử lại.";
        return { success: false, error: message };
    }
}

export const codeExerciseService = {
    getCodeExercisesByCourseId,
    getCodeExerciseById,
    createCodeExercise,
    updateCodeExercise,
    deleteCodeExercise,
    runCodeExercise,
};

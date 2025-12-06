import api from "./api";

async function runLessonCode(lessonId, payload) {
    try {
        const { data } = await api.post(`/api/code/lessons/${lessonId}/run`, payload);
        return { success: true, data };
    } catch (error) {
        console.error("Judge0 execution error:", error);
        const message = error?.response?.data?.message || "Không thể chạy code. Vui lòng thử lại.";
        return { success: false, error: message };
    }
}

export const codeService = {
    runLessonCode,
};



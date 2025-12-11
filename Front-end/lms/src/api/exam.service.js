import api from "./api";

async function createExam(courseId, payload) {
    try {
        const { data } = await api.post(`/api/courses/${courseId}/exams`, payload);
        return { success: true, data };
    } catch (err) {
        console.error("Error creating exam", err);
        return { success: false, error: err.response?.data?.message || "Không thể tạo đề thi" };
    }
}

async function updateExam(examId, payload) {
    try {
        const { data } = await api.put(`/api/exams/${examId}`, payload);
        return { success: true, data };
    } catch (err) {
        console.error("Error updating exam", err);
        return { success: false, error: err.response?.data?.message || "Không thể cập nhật đề thi" };
    }
}

async function addQuestion(examId, payload) {
    try {
        const { data } = await api.post(`/api/exams/${examId}/questions`, payload);
        return { success: true, data };
    } catch (err) {
        console.error("Error adding question", err);
        return { success: false, error: err.response?.data?.message || "Không thể thêm câu hỏi" };
    }
}

async function updateQuestion(questionId, payload) {
    try {
        const { data } = await api.put(`/api/exams/questions/${questionId}`, payload);
        return { success: true, data };
    } catch (err) {
        console.error("Error updating question", err);
        return { success: false, error: err.response?.data?.message || "Không thể cập nhật câu hỏi" };
    }
}

async function deleteQuestion(questionId) {
    try {
        await api.delete(`/api/exams/questions/${questionId}`);
        return { success: true };
    } catch (err) {
        console.error("Error deleting question", err);
        return { success: false, error: err.response?.data?.message || "Không thể xóa câu hỏi" };
    }
}

async function getOwnerExam(courseId) {
    try {
        const { data } = await api.get(`/api/courses/${courseId}/exams/owner`);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Chưa có đề thi" };
    }
}

async function getPublishedExams(courseId) {
    try {
        const { data } = await api.get(`/api/courses/${courseId}/exams/published`);
        return { success: true, data: Array.isArray(data) ? data : [data] };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Chưa có đề thi công bố", data: [] };
    }
}

async function getPublishedExam(courseId, examId) {
    try {
        const { data } = await api.get(`/api/courses/${courseId}/exams/published/${examId}`);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Không tìm thấy đề thi" };
    }
}

async function getAllExams(courseId) {
    try {
        const { data } = await api.get(`/api/courses/${courseId}/exams`);
        return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Không thể tải danh sách đề thi", data: [] };
    }
}

async function submitExam(examId, payload) {
    try {
        const { data } = await api.post(`/api/exams/${examId}/submit`, payload);
        return { success: true, data };
    } catch (err) {
        console.error("Error submitting exam", err);
        return { success: false, error: err.response?.data?.message || "Không thể nộp bài" };
    }
}

async function getSubmissions(examId) {
    try {
        const { data } = await api.get(`/api/exams/${examId}/submissions`);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Không thể tải danh sách bài nộp" };
    }
}

async function getSubmissionDetail(examId, submissionId) {
    try {
        const { data } = await api.get(`/api/exams/${examId}/submissions/${submissionId}`);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Không thể tải bài nộp" };
    }
}

async function getMySubmission(examId) {
    try {
        const { data } = await api.get(`/api/exams/${examId}/my-submission`);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Chưa có bài làm" };
    }
}

async function getMySubmissions(examId) {
    try {
        const { data } = await api.get(`/api/exams/${examId}/my-submissions`);
        return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Chưa có bài làm", data: [] };
    }
}

async function runCodeQuestion(examId, questionId, payload) {
    try {
        const { data } = await api.post(`/api/exams/${examId}/questions/${questionId}/run`, payload);
        return { success: true, data: data.data || data };
    } catch (err) {
        return { success: false, error: err.response?.data?.message || "Không thể chạy test" };
    }
}

export const examService = {
    createExam,
    updateExam,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getOwnerExam,
    getAllExams,
    getPublishedExams,
    getPublishedExam,
    submitExam,
    getSubmissions,
    getSubmissionDetail,
    getMySubmission,
    getMySubmissions,
    runCodeQuestion,
};


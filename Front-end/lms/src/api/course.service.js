import api from "./api";

function buildQuery(params) {
    if (!params) return "";
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.append(k, v);
    });
    const s = q.toString();
    return s ? `?${s}` : "";
}

async function getAllCourses(params) {
    try {
        const { data } = await api.get(`/api/courses${buildQuery(params)}`, {
            skipAuthRedirect: true, // Public endpoint khi xem danh sách khóa học, không redirect khi 401
            metadata: { skipAuthRedirect: true }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching courses:", error);
        return { success: false, error: "Could not fetch courses" };
    }
}

async function getCourseById(courseId) {
    try {
        const { data } = await api.get(`/api/courses/${courseId}`, {
            skipAuthRedirect: true, // Public endpoint khi xem chi tiết khóa học, không redirect khi 401
            metadata: { skipAuthRedirect: true }
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching course:", error);
        return { success: false, error: "Could not fetch course details" };
    }
}

async function getModules(courseId) {
    try {
        const { data } = await api.get(`/api/courses/${courseId}/modules`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching modules:", error);
        return { success: false, error: "Could not fetch modules" };
    }
}

async function getLessons(moduleId) {
    try {
        const { data } = await api.get(`/api/courses/modules/${moduleId}/lessons`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return { success: false, error: "Could not fetch lessons" };
    }
}


async function addModule(courseId, moduleData) {
    try {
        const { data } = await api.post(`/api/courses/${courseId}/modules`, moduleData);
        return { success: true, data };
    } catch (error) {
        console.error("Error adding module:", error);
        return { success: false, error: "Could not add module" };
    }
}

async function updateModule(moduleId, moduleData) {
    try {
        const { data } = await api.put(`/api/courses/modules/${moduleId}`, moduleData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating module:", error);
        return { success: false, error: "Could not update module" };
    }
}

async function deleteModule(moduleId) {
    try {
        const { data } = await api.delete(`/api/courses/modules/${moduleId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error deleting module:", error);
        return { success: false, error: "Could not delete module" };
    }
}

async function addLesson(moduleId, lessonData) {
    try {
        const { data } = await api.post(`/api/courses/modules/${moduleId}/lessons`, lessonData);
        return { success: true, data };
    } catch (error) {
        console.error("Error adding lesson:", error);
        return { success: false, error: "Could not add lesson" };
    }
}

async function updateLesson(lessonId, lessonData) {
    try {
        const { data } = await api.put(`/api/courses/lessons/${lessonId}`, lessonData);
        return { success: true, data };
    } catch (error) {
        console.error("Error updating lesson:", error);
        return { success: false, error: "Could not update lesson" };
    }
}

async function deleteLesson(lessonId) {
    try {
        const { data } = await api.delete(`/api/courses/lessons/${lessonId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error deleting lesson:", error);
        return { success: false, error: "Could not delete lesson" };
    }
}

export const courseService = {
    getAllCourses,
    getCourseById,
    getModules,
    getLessons,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
};
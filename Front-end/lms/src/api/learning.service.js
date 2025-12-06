import api from "./api";

async function getEnrollments(userId) {
    try {
        const { data } = await api.get(`/api/learning/${userId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return { success: false, error: "Could not fetch enrollments" };
    }
}

async function enrollCourse(userId, courseId) {
    try {
        const { data } = await api.post("/api/learning", { userId, courseId });
        return { success: true, data };
    } catch (error) {
        console.error("Enrollment error:", error);
        return { success: false, error: "Could not enroll in course" };
    }
}

async function getStudentsByCourse(courseId) {
    try {
        const { data } = await api.get(`/api/learning/course/${courseId}`);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching students by course:", error);
        return { success: false, error: "Could not fetch students" };
    }
}

export const learningService = {
    getEnrollments,
    enrollCourse,
    getStudentsByCourse,
};
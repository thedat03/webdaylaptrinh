import api from "./api";

async function login(email, password) {
    try {
        const { data: result } = await api.post(`/api/auth/login`, { email, password });

        // Accept multiple backend response shapes
        const payload = result?.data ?? result ?? {};
        const token = payload.token ?? payload.accessToken ?? payload.jwt ?? payload?.authToken;
        const id = payload.id ?? payload.userId ?? payload.uid;
        const name = payload.name ?? payload.username ?? payload.fullName;
        const emailResp = payload.email ?? payload.userEmail;
        const roleRaw = payload.role
            ?? payload.authority
            ?? payload?.authorities?.[0]?.authority
            ?? payload?.roles?.[0];

        if (token) {
            const normalizedRole = roleRaw
                ? (roleRaw.startsWith("ROLE_") ? roleRaw : `ROLE_${roleRaw}`)
                : undefined;

            localStorage.setItem("token", token);
            if (emailResp) localStorage.setItem("email", emailResp);
            if (name) localStorage.setItem("name", name);
            if (id !== undefined) localStorage.setItem("id", String(id));
            if (normalizedRole) localStorage.setItem("role", normalizedRole);

            return {
                success: true,
                token,
                user: {
                    id,
                    name,
                    email: emailResp,
                    role: normalizedRole,
                },
            };
        }
        return { success: false, error: result?.message || "Login failed" };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}

async function register(formData) {
    try {
        const { data } = await api.post(`/api/auth/register`, formData);
        return { success: true, message: data?.message || "Registration successful" };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}

async function getUserDetails(email) {
    try {
        const { data } = await api.get(`/api/users/details`, { params: { email } });
        return { success: true, data };
    } catch (error) {
        console.error("Get user details error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}

async function logout() {
    try {
        await api.post(`/api/auth/logout`);
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        localStorage.clear()
        window.location.href = "/login";
    }
}

function isAdminAuthenticated() {
    return !!localStorage.getItem("token") && localStorage.getItem("role") === "ROLE_ADMIN";
}

function isUserAuthenticated() {
    const role = localStorage.getItem("role");
    return !!localStorage.getItem("token") && (role === "ROLE_USER" || role === "ROLE_STUDENT");
}

function isStudentAuthenticated() {
    return !!localStorage.getItem("token") && localStorage.getItem("role") === "ROLE_STUDENT";
}

function isInstructorAuthenticated() {
    return !!localStorage.getItem("token") && localStorage.getItem("role") === "ROLE_INSTRUCTOR";
}

function isTeachingAssistantAuthenticated() {
    return !!localStorage.getItem("token") && localStorage.getItem("role") === "ROLE_TEACHING_ASSISTANT";
}

function getCurrentUser() {
    return {
        token: localStorage.getItem("token"),
        id: localStorage.getItem("id"),
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
        role: localStorage.getItem("role"),
    };
}

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authService = {
    login,
    register,
    getUserDetails,
    logout,
    isAdminAuthenticated,
    isUserAuthenticated,
    isStudentAuthenticated,
    isInstructorAuthenticated,
    isTeachingAssistantAuthenticated,
    getCurrentUser,
    getAuthHeader,
};
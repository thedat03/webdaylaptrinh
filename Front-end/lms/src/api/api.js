import axios from "axios";
import { API_BASE_URL } from "./constant";
import { message } from "antd";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Kiểm tra nếu request có skipAuthRedirect flag thì không redirect
        // Hoặc nếu đang ở trong notification dropdown
        const skipRedirect = error.config?.skipAuthRedirect ||
            error.config?.metadata?.skipAuthRedirect ||
            error.config?.headers?.['X-Skip-Auth-Redirect'];

        // Danh sách các route public - không redirect về login khi ở các route này
        const publicRoutes = ['/', '/home', '/public-home', '/login', '/register'];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.includes(currentPath);

        if (error.response?.status === 401 && !skipRedirect && !isPublicRoute) {
            message.destroy()
            message.error("Session expired or unauthorized. Please log in again.");
            localStorage.clear();
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        } else if (error.response?.status === 401 && (skipRedirect || isPublicRoute)) {
            // Vẫn reject error nhưng không redirect khi ở route public hoặc có flag skip
            return Promise.reject(error);
        } else if (error.response?.status === 403) {
            message.error("You don't have permission to perform this action.");
        } else if (error.response?.status === 404) {
            message.error("Requested resource not found.");
        } else if (error.response?.status >= 500) {
            message.error("Server error. Please try again later.");
        }
        return Promise.reject(error);
    }
);

export default api;
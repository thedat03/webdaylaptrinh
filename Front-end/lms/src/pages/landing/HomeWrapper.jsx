import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";

function HomeWrapper() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Chỉ redirect khi đang ở route `/` hoặc `/home`
        // Không redirect khi đã ở các route khác như `/admin`, `/teacher-home`, etc.
        const currentPath = location.pathname;
        const isHomeRoute = currentPath === "/" || currentPath === "/home";

        if (!isHomeRoute) {
            // Nếu không phải route home, không làm gì cả
            return;
        }

        // Chỉ redirect nếu user đã đăng nhập (có token hợp lệ)
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // Kiểm tra token có tồn tại và không rỗng
        if (token && token.trim() !== "" && role) {
            if (role === "ROLE_INSTRUCTOR") {
                navigate("/teacher-home", { replace: true });
                return;
            } else if (role === "ROLE_TEACHING_ASSISTANT") {
                navigate("/teaching-assistant-home", { replace: true });
                return;
            } else if (role === "ROLE_ADMIN") {
                navigate("/admin", { replace: true });
                return;
            }
        }
        // Nếu không có token hoặc role không phải các role đặc biệt, hiển thị trang Home bình thường
        // Không redirect, chỉ hiển thị Home component
    }, [navigate, location.pathname]);

    // Luôn render Home component, redirect chỉ xảy ra trong useEffect
    return <Home />;
}

export default HomeWrapper;


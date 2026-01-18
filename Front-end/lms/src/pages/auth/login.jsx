import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/User.Context";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { Mail, Lock, LogIn, User, GraduationCap, Shield } from "lucide-react";
import { InputField } from "../../Components/common/InputFeild";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState(""); // "ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_TEACHING_ASSISTANT"
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { setUser } = useUserContext();

    const login = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!selectedRole) {
            setError("Vui lòng chọn vai trò đăng nhập");
            setIsLoading(false);
            return;
        }

        try {
            const result = await authService.login(email, password);

            if (result.success) {
                if (result.user) {
                    setUser(result.user);
                }
                const role = result.user?.role;

                // Map role backend -> nhóm vai trò hiển thị
                const isStudentRole = role === "ROLE_STUDENT" || role === "ROLE_USER";
                const isInstructorRole = role === "ROLE_INSTRUCTOR";
                const isTARole = role === "ROLE_TEACHING_ASSISTANT";

                let match = false;
                if (selectedRole === "ROLE_STUDENT") {
                    match = isStudentRole;
                } else if (selectedRole === "ROLE_INSTRUCTOR") {
                    match = isInstructorRole;
                } else if (selectedRole === "ROLE_TEACHING_ASSISTANT") {
                    match = isTARole;
                }

                if (!match) {
                    const label =
                        selectedRole === "ROLE_TEACHING_ASSISTANT"
                            ? "Trợ giảng"
                            : selectedRole === "ROLE_INSTRUCTOR"
                                ? "Giáo viên"
                                : "Học viên";
                    setError(`Tài khoản này không có quyền ${label}. Vui lòng chọn đúng vai trò.`);
                    setIsLoading(false);
                    return;
                }

                if (isTARole) {
                    navigate("/teaching-assistant-home");
                } else if (isInstructorRole) {
                    navigate("/teacher-home");
                } else {
                    // Học viên (ROLE_STUDENT / ROLE_USER) và các role mặc định khác
                    navigate("/home");
                }
            } else {
                setError(result.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-4">
                    <div className="text-center">
                        <div className="mx-auto h-14 w-14 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <LogIn className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Chào mừng bạn trở lại!</h2>
                        <p className="text-gray-600">Đăng nhập vào tài khoản để tiếp tục</p>
                    </div>

                    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
                        <form autoComplete="off" onSubmit={login} className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đăng nhập với vai trò
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("ROLE_STUDENT")}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === "ROLE_STUDENT"
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                                            }`}
                                    >
                                        <User className="h-6 w-6" />
                                        <span className="text-sm font-semibold">Học viên</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("ROLE_INSTRUCTOR")}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === "ROLE_INSTRUCTOR"
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                                            }`}
                                    >
                                        <GraduationCap className="h-6 w-6" />
                                        <span className="text-sm font-semibold">Giáo viên</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("ROLE_TEACHING_ASSISTANT")}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === "ROLE_TEACHING_ASSISTANT"
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                                            }`}
                                    >
                                        <Shield className="h-6 w-6" />
                                        <span className="text-sm font-semibold">Trợ giảng</span>
                                    </button>
                                </div>
                            </div>

                            <InputField
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Nhập email của bạn"
                                icon={<Mail className="h-5 w-5 text-gray-500" />}
                            />

                            <InputField
                                id="password"
                                name="password"
                                type="password"
                                label="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Nhập mật khẩu"
                                icon={<Lock className="h-5 w-5 text-gray-500" />}
                            />

                            <div className="flex items-center justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-1">
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-300 ${isLoading
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Đang đăng nhập...
                                    </div>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Mới sử dụng nền tảng?</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Chưa có tài khoản?{" "}
                                    <Link
                                        to="/register"
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                    >
                                        Tạo tài khoản tại đây
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Khi đăng nhập, bạn đồng ý với {" "}
                            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Điều khoản dịch vụ</a>
                            {" "}và {" "}
                            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Chính sách bảo mật</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
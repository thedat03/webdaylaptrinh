import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/User.Context";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { Mail, Lock, LogIn, User, GraduationCap, Shield, Eye, EyeOff } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState(""); // "ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_TEACHING_ASSISTANT"
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();
    const { setUser } = useUserContext();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError("Email không đúng định dạng");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value && value.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
        } else {
            setPasswordError("");
        }
    };

    const login = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setEmailError("");
        setPasswordError("");

        // Validation
        if (!selectedRole) {
            setError("Vui lòng chọn vai trò đăng nhập");
            setIsLoading(false);
            return;
        }

        if (!email) {
            setEmailError("Vui lòng nhập email");
            setIsLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Email không đúng định dạng");
            setIsLoading(false);
            return;
        }

        if (!password) {
            setPasswordError("Vui lòng nhập mật khẩu");
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
            <div className="flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-3">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">Chào mừng bạn trở lại!</h2>
                        <p className="text-sm text-gray-500">Đăng nhập vào tài khoản để tiếp tục</p>
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
                        <form autoComplete="off" onSubmit={login} className="space-y-4">
                            {/* Role Selection - Segmented Control */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đăng nhập với vai trò
                                </label>
                                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("ROLE_STUDENT")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${selectedRole === "ROLE_STUDENT"
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Học viên</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("ROLE_INSTRUCTOR")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${selectedRole === "ROLE_INSTRUCTOR"
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <GraduationCap className="h-4 w-4" />
                                        <span>Giáo viên</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("ROLE_TEACHING_ASSISTANT")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${selectedRole === "ROLE_TEACHING_ASSISTANT"
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <Shield className="h-4 w-4" />
                                        <span>Trợ giảng</span>
                                    </button>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                        placeholder="Nhập email của bạn"
                                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all
                                            ${emailError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
                                        `}
                                    />
                                </div>
                                {emailError && (
                                    <p className="text-xs text-red-600 mt-1">{emailError}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        placeholder="Nhập mật khẩu"
                                        className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all
                                            ${passwordError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* General Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 
                                    shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                                    ${isLoading
                                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 active:scale-[0.98]"
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
                                    <span className="flex items-center justify-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Đăng nhập
                                    </span>
                                )}
                            </button>

                            {/* Social Login Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-white text-gray-500">Hoặc tiếp tục với</span>
                                </div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg 
                                        hover:bg-gray-50 transition-colors font-medium text-sm text-[#4285F4] hover:border-[#4285F4]/30"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="text-[#4285F4]">Google</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg 
                                        hover:bg-gray-50 transition-colors font-medium text-sm text-[#1877F2] hover:border-[#1877F2]/30"
                                >
                                    <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="text-[#1877F2]">Facebook</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-5 text-center">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <Link
                                    to="/register"
                                    className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                >
                                    Tạo tài khoản tại đây
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Khi đăng nhập, bạn đồng ý với {" "}
                            <a href="#" className="text-indigo-600 hover:text-indigo-700 transition-colors">Điều khoản dịch vụ</a>
                            {" "}và {" "}
                            <a href="#" className="text-indigo-600 hover:text-indigo-700 transition-colors">Chính sách bảo mật</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
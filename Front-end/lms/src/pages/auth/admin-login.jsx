import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/User.Context";
import { authService } from "../../api/auth.service";
import { Mail, Lock, LogIn, Shield, ArrowLeft } from "lucide-react";
import { InputField } from "../../Components/common/InputFeild";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { setUser } = useUserContext();

    const login = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await authService.login(email, password);

            if (result.success) {
                if (result.user) {
                    setUser(result.user);
                }
                const role = result.user?.role;

                // Chỉ cho phép ADMIN đăng nhập
                const isAdminRole = role === "ROLE_ADMIN";

                if (!isAdminRole) {
                    setError("Tài khoản này không có quyền Admin. Vui lòng sử dụng trang đăng nhập thông thường.");
                    setIsLoading(false);
                    return;
                }

                // Chuyển đến trang admin
                navigate("/admin");
            } else {
                setError(result.error || "Đăng nhập thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
            <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-4">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <Shield className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Đăng nhập Admin</h2>
                        <p className="text-gray-600">Trang đăng nhập dành riêng cho quản trị viên</p>
                    </div>

                    <div className="bg-white shadow-2xl rounded-2xl p-8 border-2 border-red-100">
                        <div className="mb-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại trang đăng nhập thông thường
                            </Link>
                        </div>

                        <form autoComplete="off" onSubmit={login} className="space-y-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-red-800">
                                    <strong>Lưu ý:</strong> Trang này chỉ dành cho quản trị viên. Nếu bạn là học viên, giáo viên hoặc trợ giảng, vui lòng sử dụng trang đăng nhập thông thường.
                                </p>
                            </div>

                            <InputField
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Nhập email admin"
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
                                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300 ${
                                    isLoading
                                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                        : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700"
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
                                    <div className="flex items-center justify-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Đăng nhập Admin
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Bạn không phải Admin?</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    <Link
                                        to="/login"
                                        className="text-red-600 font-semibold hover:text-red-700 transition-colors"
                                    >
                                        Đăng nhập với vai trò khác
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Khi đăng nhập, bạn đồng ý với {" "}
                            <a href="#" className="text-red-600 hover:text-red-700 transition-colors">Điều khoản dịch vụ</a>
                            {" "}và {" "}
                            <a href="#" className="text-red-600 hover:text-red-700 transition-colors">Chính sách bảo mật</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;

// RegistrationForm.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { User, Mail, Phone, Lock, Calendar, MapPin, Briefcase, Github, Linkedin, UserPlus, Eye, EyeOff } from "lucide-react";

function RegistrationForm() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        mobileNumber: "",
        password: "",
        dob: "",
        gender: "",
        location: "",
        profession: "",
        linkedin_url: "",
        github_url: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await authService.register(formData);

            if (result.success) {
                console.log("Registration successful!");
                navigate("/login", {
                    state: { message: "Registration successful! Please sign in to continue." }
                });
            } else {
                setError(result.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            <div className="flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-3">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-3 shadow-md">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">Tạo tài khoản</h2>
                        <p className="text-sm text-gray-500">Tham gia cộng đồng và bắt đầu hành trình học tập</p>
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Thông tin cơ bản */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Họ và tên */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                            Họ và tên
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập họ và tên"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
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
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập email"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Số điện thoại */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                                            Số điện thoại
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="mobileNumber"
                                                name="mobileNumber"
                                                type="tel"
                                                value={formData.mobileNumber}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập số điện thoại"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Mật khẩu */}
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
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                placeholder="Tạo mật khẩu mạnh"
                                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin cá nhân */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Thông tin cá nhân
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Ngày sinh */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                                            Ngày sinh
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="dob"
                                                name="dob"
                                                type="date"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Giới tính */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                            Giới tính
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="block w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg 
                                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                                                text-gray-900 bg-white transition-all"
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="Male">Nam</option>
                                            <option value="Female">Nữ</option>
                                            <option value="Other">Khác</option>
                                            <option value="Prefer not to say">Không tiết lộ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin nghề nghiệp */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Thông tin nghề nghiệp
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                            Địa chỉ
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MapPin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="location"
                                                name="location"
                                                type="text"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Nhập địa chỉ"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                                            Nghề nghiệp
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="profession"
                                                name="profession"
                                                type="text"
                                                value={formData.profession}
                                                onChange={handleChange}
                                                placeholder="Nhập nghề nghiệp"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Liên kết mạng xã hội */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Liên kết mạng xã hội
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                                            LinkedIn
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Linkedin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="linkedin_url"
                                                name="linkedin_url"
                                                type="url"
                                                value={formData.linkedin_url}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/in/ten-cua-ban"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                                            GitHub
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Github className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="github_url"
                                                name="github_url"
                                                type="url"
                                                value={formData.github_url}
                                                onChange={handleChange}
                                                placeholder="https://github.com/tai-khoan-cua-ban"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            )}

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
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang tạo tài khoản...
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Tạo tài khoản
                                    </span>
                                )}
                            </button>
                        </form>
                        <div className="mt-5 text-center">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link
                                    to="/login"
                                    className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                >
                                    Đăng nhập tại đây
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Terms and Privacy */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Khi tạo tài khoản, bạn đồng ý với {" "}
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

export default RegistrationForm;
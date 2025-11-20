// RegistrationForm.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { User, Mail, Phone, Lock, Calendar, MapPin, Briefcase, Github, Linkedin, UserPlus } from "lucide-react";
import { InputField } from "../../Components/common/InputFeild";

function RegistrationForm() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
            <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-4">
                    <div className="text-center">
                        <div className="mx-auto h-14 w-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Tạo tài khoản</h2>
                        <p className="text-gray-600">Tham gia cộng đồng và bắt đầu hành trình học tập</p>
                    </div>

                    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Thông tin cơ bản */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Họ và tên */}
                                    <InputField
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        icon={<User className="h-5 w-5 text-gray-400" />}
                                        label="Họ và tên"
                                        required
                                        placeholder="Nhập họ và tên"
                                    />

                                    {/* Email */}
                                    <InputField
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        icon={<Mail className="h-5 w-5 text-gray-400" />}
                                        label="Email"
                                        required
                                        placeholder="Nhập email"
                                    />

                                    {/* Số điện thoại */}
                                    <InputField
                                        id="mobileNumber"
                                        name="mobileNumber"
                                        type="tel"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        icon={<Phone className="h-5 w-5 text-gray-400" />}
                                        label="Số điện thoại"
                                        required
                                        placeholder="Nhập số điện thoại"
                                    />

                                    {/* Mật khẩu */}
                                    <InputField
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        icon={<Lock className="h-5 w-5 text-gray-400" />}
                                        label="Mật khẩu"
                                        required
                                        placeholder="Tạo mật khẩu mạnh"
                                    />
                                </div>
                            </div>

                            {/* Thông tin cá nhân */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Thông tin cá nhân
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Ngày sinh */}
                                    <InputField
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        icon={<Calendar className="h-5 w-5 text-gray-400" />}
                                        label="Ngày sinh"
                                    />

                                    {/* Giới tính */}
                                    <div className="space-y-2">
                                        <label htmlFor="gender" className="block font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                            Giới tính
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Thông tin nghề nghiệp
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <InputField
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        icon={<MapPin className="h-5 w-5 text-gray-400" />}
                                        label="Địa chỉ"
                                        placeholder="Nhập địa chỉ"
                                    />

                                    <InputField
                                        id="profession"
                                        name="profession"
                                        value={formData.profession}
                                        onChange={handleChange}
                                        icon={<Briefcase className="h-5 w-5 text-gray-400" />}
                                        label="Nghề nghiệp"
                                        placeholder="Nhập nghề nghiệp"
                                    />
                                </div>
                            </div>

                            {/* Liên kết mạng xã hội */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Liên kết mạng xã hội
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <InputField
                                        id="linkedin_url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        icon={<Linkedin className="h-5 w-5 text-gray-400" />}
                                        label="LinkedIn"
                                        placeholder="https://linkedin.com/in/ten-cua-ban"
                                    />

                                    <InputField
                                        id="github_url"
                                        name="github_url"
                                        value={formData.github_url}
                                        onChange={handleChange}
                                        icon={<Github className="h-5 w-5 text-gray-400" />}
                                        label="GitHub"
                                        placeholder="https://github.com/tai-khoan-cua-ban"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang tạo tài khoản...
                                    </div>
                                ) : (
                                    "Tạo tài khoản"
                                )}
                            </button>
                        </form>
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Đã có tài khoản?</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    <Link
                                        to="/login"
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-lg"
                                    >
                                        Đăng nhập tại đây
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Privacy */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Khi tạo tài khoản, bạn đồng ý với {" "}
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

export default RegistrationForm;
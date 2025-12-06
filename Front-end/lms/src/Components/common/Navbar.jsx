import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSearch, faEnvelope, faShoppingCart, faBell, faBars, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";

function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(
        authService.isUserAuthenticated() ||
        authService.isInstructorAuthenticated() ||
        authService.isAdminAuthenticated()
    );
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Update authentication state when component mounts or when navigating
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(
                authService.isUserAuthenticated() ||
                authService.isInstructorAuthenticated() ||
                authService.isAdminAuthenticated()
            );
        };
        checkAuth();
        // Check auth on storage change (when login/logout happens)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const getHomePath = () => {
        const role = localStorage.getItem("role");
        if (role === "ROLE_INSTRUCTOR") return "/teacher-home";
        if (role === "ROLE_TEACHING_ASSISTANT") return "/teaching-assistant-home";
        if (role === "ROLE_ADMIN") return "/admin";
        return "/home";
    };

    const handleLogOut = async () => {
        await authService.logout();
        navigate("/login");
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div>
            <nav className="bg-white/95 backdrop-blur sticky top-0 w-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] z-[999]">
                {/* Top bar */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
                    <div className="flex items-center">
                        <img src={logo} alt="Logo" className="h-20 w-auto cursor-pointer" onClick={() => navigate(getHomePath())} />
                    </div>
                    {/* Center search (desktop) */}
                    <div className="hidden md:block flex-1 max-w-xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm khóa học, chủ đề, giảng viên..."
                                className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Right icons */}
                    <div className="ml-auto hidden md:flex items-center gap-3">
                        <button className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100" aria-label="Liên hệ">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </button>
                        <button className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100" aria-label="Giỏ hàng">
                            <FontAwesomeIcon icon={faShoppingCart} />
                        </button>
                        <button className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100" aria-label="Thông báo">
                            <FontAwesomeIcon icon={faBell} />
                        </button>
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
                                    aria-label="Hồ sơ"
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                </button>
                                <button
                                    onClick={handleLogOut}
                                    className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                                    aria-label="Đăng xuất"
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate("/login")} className="px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-50">Đăng nhập</button>
                                <button onClick={() => navigate("/register")} className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Đăng ký</button>
                            </>
                        )}
                    </div>

                    {/* mobile menu toggle */}
                    <button className="md:hidden ml-auto text-gray-700" onClick={toggleMobileMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>


                {/* Search bar strip removed as search moved to center */}

                {/* Mobile dropdown content */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-white px-4 pb-4">
                        <div className="relative my-3">
                            <input
                                type="text"
                                placeholder="Tìm kiếm khóa học"
                                className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 outline-none"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex gap-3 mb-3">
                            {isAuthenticated ? (
                                <>
                                    <button onClick={() => { closeMobileMenu(); navigate("/profile"); }} className="flex-1 px-4 py-2 rounded-md border">Hồ sơ</button>
                                    <button onClick={handleLogOut} className="flex-1 px-4 py-2 rounded-md bg-indigo-600 text-white">Đăng xuất</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { closeMobileMenu(); navigate("/login"); }} className="flex-1 px-4 py-2 rounded-md border">Đăng Nhập</button>
                                    <button onClick={() => { closeMobileMenu(); navigate("/register"); }} className="flex-1 px-4 py-2 rounded-md bg-[#ff9f0a] text-white">Đăng Ký</button>
                                </>
                            )}
                        </div>
                        <ul className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                            <li><Link to="#" onClick={closeMobileMenu}>Giới thiệu</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Giáo viên</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Phòng luyện</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>iChat - Hỏi đáp với AI</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Hướng nghiệp</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Thư viện</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Hướng dẫn Đăng ký học</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Hỗ trợ</Link></li>
                            <li><Link to="#" onClick={closeMobileMenu}>Tra cứu Tuyển sinh 2025</Link></li>
                        </ul>
                    </div>
                )}
            </nav>
        </div>
    );
}

export default Navbar;
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSearch, faEnvelope, faShoppingCart, faBell, faBars, faComments } from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { messageService } from "../../api/message.service";
import { notificationService } from "../../api/notification.service";
import { profileService } from "../../api/profile.service";
import { cartService } from "../../api/cart.service";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(
        authService.isUserAuthenticated() ||
        authService.isInstructorAuthenticated() ||
        authService.isAdminAuthenticated() ||
        authService.isTeachingAssistantAuthenticated()
    );
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const notificationButtonRef = useRef(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userButtonRef = useRef(null);
    const [userAvatar, setUserAvatar] = useState(null);
    const [loadingAvatar, setLoadingAvatar] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Update authentication state when component mounts or when navigating
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(
                authService.isUserAuthenticated() ||
                authService.isInstructorAuthenticated() ||
                authService.isAdminAuthenticated() ||
                authService.isTeachingAssistantAuthenticated()
            );
        };
        checkAuth();
        // Check auth on storage change (when login/logout happens)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Load unread message count
    useEffect(() => {
        if (isAuthenticated) {
            const loadUnreadCount = async () => {
                try {
                    const result = await messageService.getUnreadCount();
                    if (result.success) {
                        setUnreadCount(result.data || 0);
                    }
                } catch (error) {
                    console.error("Error loading unread count:", error);
                }
            };
            loadUnreadCount();
            // Refresh every 30 seconds
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Load unread notification count
    useEffect(() => {
        if (isAuthenticated) {
            const loadNotificationCount = async () => {
                try {
                    const result = await notificationService.getUnreadCount();
                    if (result.success) {
                        setNotificationUnreadCount(result.data || 0);
                    }
                } catch (error) {
                    console.error("Error loading notification count:", error);
                }
            };
            loadNotificationCount();
            // Refresh every 30 seconds
            const interval = setInterval(loadNotificationCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Load user avatar
    useEffect(() => {
        if (isAuthenticated) {
            const loadAvatar = async () => {
                const userId = localStorage.getItem("id");
                if (userId) {
                    try {
                        const imgRes = await profileService.getProfileImage(userId);
                        if (imgRes.success && imgRes.data) {
                            setUserAvatar(imgRes.data);
                        } else {
                            const storedImage = localStorage.getItem("profileImage");
                            if (storedImage) {
                                setUserAvatar(storedImage);
                            }
                        }
                    } catch (error) {
                        console.error("Error loading avatar:", error);
                        const storedImage = localStorage.getItem("profileImage");
                        if (storedImage) {
                            setUserAvatar(storedImage);
                        }
                    } finally {
                        setLoadingAvatar(false);
                    }
                } else {
                    setLoadingAvatar(false);
                }
            };
            loadAvatar();
        } else {
            setLoadingAvatar(false);
        }
    }, [isAuthenticated]);

    // Load cart count
    useEffect(() => {
        const loadCartCount = async () => {
            if (isAuthenticated && authService.isUserAuthenticated()) {
                const userId = localStorage.getItem("id");
                if (userId) {
                    try {
                        const result = await cartService.getCartCount(userId);
                        if (result.success) {
                            setCartCount(result.data || 0);
                        }
                    } catch (error) {
                        console.error("Error loading cart count:", error);
                    }
                }
            } else {
                setCartCount(0);
            }
        };

        loadCartCount();
        // Refresh every 10 seconds
        const interval = setInterval(loadCartCount, 10000);

        // Listen for cart update events
        const handleCartUpdate = () => {
            loadCartCount();
        };
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [isAuthenticated]);

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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
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
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                placeholder="Tìm kiếm khóa học, chủ đề, giảng viên..."
                                className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </form>
                    </div>

                    {/* Right icons */}
                    <div className="ml-auto hidden md:flex items-center gap-3">
                        {isAuthenticated && (
                            <button
                                onClick={() => navigate("/chat")}
                                className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100 relative"
                                aria-label="Chat"
                            >
                                <FontAwesomeIcon icon={faComments} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100" aria-label="Liên hệ">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </button>
                        <button
                            onClick={() => navigate("/cart")}
                            className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100 relative"
                            aria-label="Giỏ hàng"
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </button>
                        <div className="relative">
                            <button
                                ref={notificationButtonRef}
                                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                                className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100 relative"
                                aria-label="Thông báo"
                            >
                                <FontAwesomeIcon icon={faBell} />
                                {notificationUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown
                                isOpen={isNotificationDropdownOpen}
                                onClose={() => {
                                    setIsNotificationDropdownOpen(false);
                                    // Refresh notification count when dropdown closes
                                    if (isAuthenticated) {
                                        notificationService.getUnreadCount().then(result => {
                                            if (result.success) {
                                                setNotificationUnreadCount(result.data || 0);
                                            }
                                        });
                                    }
                                }}
                                buttonRef={notificationButtonRef}
                            />
                        </div>
                        {isAuthenticated ? (
                            <div
                                className="relative p-3 -m-3"
                                onMouseEnter={() => setIsUserDropdownOpen(true)}
                                onMouseLeave={() => setIsUserDropdownOpen(false)}
                            >
                                <button
                                    ref={userButtonRef}
                                    className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors overflow-hidden border-2 border-transparent hover:border-indigo-300 relative"
                                    aria-label="Hồ sơ"
                                >
                                    {loadingAvatar ? (
                                        <div className="w-full h-full bg-gray-200 animate-pulse rounded-full"></div>
                                    ) : userAvatar ? (
                                        <>
                                            <img
                                                src={userAvatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover rounded-full"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.parentElement.querySelector('.avatar-fallback-icon');
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <FontAwesomeIcon
                                                icon={faUser}
                                                className="avatar-fallback-icon hidden absolute inset-0 m-auto"
                                            />
                                        </>
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} />
                                    )}
                                </button>
                                <UserDropdown
                                    isOpen={isUserDropdownOpen}
                                    onClose={() => setIsUserDropdownOpen(false)}
                                    buttonRef={userButtonRef}
                                />
                            </div>
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
                        <form onSubmit={handleSearch} className="relative my-3">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                placeholder="Tìm kiếm khóa học, chủ đề, giảng viên..."
                                className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </form>
                        <div className="flex gap-3 mb-3">
                            {isAuthenticated ? (
                                <>
                                    <button onClick={() => { closeMobileMenu(); navigate("/chat"); }} className="flex-1 px-4 py-2 rounded-md border relative">
                                        Chat
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeMobileMenu();
                                            setIsNotificationDropdownOpen(true);
                                        }}
                                        className="flex-1 px-4 py-2 rounded-md border relative"
                                    >
                                        Thông báo
                                        {notificationUnreadCount > 0 && (
                                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
                                            </span>
                                        )}
                                    </button>
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
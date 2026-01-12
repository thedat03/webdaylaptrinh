import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faTrophy,
    faUsers,
    faCreditCard,
    faRightFromBracket,
    faChevronDown,
    faRoute
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { profileService } from "../../api/profile.service";

export default function UserDropdown({ isOpen, onClose, buttonRef }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loadingImage, setLoadingImage] = useState(true);
    const [userName, setUserName] = useState("Người dùng");

    // Load profile image and user name
    useEffect(() => {
        const loadUserData = async () => {
            const userId = localStorage.getItem("id");
            if (userId) {
                try {
                    // Load user details để lấy tên
                    const userRes = await profileService.getUserDetails(userId);
                    if (userRes.success && userRes.data) {
                        // Lấy tên từ userDetails, ưu tiên các trường có thể có
                        const name = userRes.data.name ||
                            userRes.data.username ||
                            (userRes.data.firstName && userRes.data.lastName
                                ? `${userRes.data.firstName} ${userRes.data.lastName}`.trim()
                                : null) ||
                            localStorage.getItem("username") ||
                            "Người dùng";
                        setUserName(name);
                    } else {
                        setUserName(localStorage.getItem("username") || "Người dùng");
                    }

                    // Load profile image
                    const imgRes = await profileService.getProfileImage(userId);
                    if (imgRes.success && imgRes.data) {
                        setProfileImage(imgRes.data);
                    } else {
                        // Fallback to localStorage
                        const storedImage = localStorage.getItem("profileImage");
                        if (storedImage) {
                            setProfileImage(storedImage);
                        }
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                    setUserName(localStorage.getItem("username") || "Người dùng");
                    const storedImage = localStorage.getItem("profileImage");
                    if (storedImage) {
                        setProfileImage(storedImage);
                    }
                } finally {
                    setLoadingImage(false);
                }
            } else {
                setLoadingImage(false);
            }
        };

        if (isOpen) {
            loadUserData();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef?.current &&
                !buttonRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isOpen, onClose, buttonRef]);

    const handleLogout = async () => {
        await authService.logout();
        navigate("/login");
        onClose();
    };

    const handleMenuItemClick = (path) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full pt-1 w-64 z-[1000]"
            onMouseEnter={(e) => e.stopPropagation()}
        >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        {loadingImage ? (
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
                        ) : profileImage ? (
                            <img
                                src={profileImage}
                                alt={userName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 avatar-fallback"
                            style={{ display: (profileImage && !loadingImage) ? 'none' : 'flex' }}
                        >
                            <FontAwesomeIcon icon={faUser} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <button
                        onClick={() => handleMenuItemClick("/profile")}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <FontAwesomeIcon icon={faUser} className="text-gray-500 w-5" />
                        <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                    </button>

                    <button
                        onClick={() => {
                            navigate("/profile?tab=performance");
                            onClose();
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 w-5" />
                        <span className="text-sm font-medium">Thành tích</span>
                    </button>

                    <button
                        onClick={() => {
                            navigate("/profile?tab=learningPath");
                            onClose();
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <FontAwesomeIcon icon={faRoute} className="text-indigo-500 w-5" />
                        <span className="text-sm font-medium">Lộ trình học tập</span>
                    </button>

                    <button
                        onClick={() => handleMenuItemClick("/friends")}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <FontAwesomeIcon icon={faUsers} className="text-blue-500 w-5" />
                        <span className="text-sm font-medium">Bạn bè</span>
                    </button>

                    <button
                        onClick={() => handleMenuItemClick("/payment-history")}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <FontAwesomeIcon icon={faCreditCard} className="text-green-500 w-5" />
                        <span className="text-sm font-medium">Lịch sử thanh toán</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="w-5" />
                        <span className="text-sm font-medium">Thoát</span>
                    </button>
                </div>
            </div>
        </div>
    );
}


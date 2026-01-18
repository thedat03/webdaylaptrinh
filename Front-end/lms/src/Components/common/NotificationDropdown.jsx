import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faBell, faTrash } from "@fortawesome/free-solid-svg-icons";
import { notificationService } from "../../api/notification.service";
import { authService } from "../../api/auth.service";

export default function NotificationDropdown({ isOpen, onClose, buttonRef }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
            loadUnreadCount();
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

    const loadNotifications = async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Load all notifications, not just unread
            const result = await notificationService.getNotifications();
            if (result.success) {
                // Sort by createdAt descending (newest first)
                const sorted = (result.data || []).sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB - dateA;
                });
                setNotifications(sorted);
            } else if (result.unauthorized) {
                // User not authenticated, just show empty
                setNotifications([]);
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            setUnreadCount(0);
            return;
        }

        try {
            const result = await notificationService.getUnreadCount();
            if (result.success) {
                setUnreadCount(result.data || 0);
            } else if (result.unauthorized) {
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Error loading unread count:", error);
            setUnreadCount(0);
        }
    };

    const handleMarkAsRead = async (notificationId, e) => {
        if (e) e.stopPropagation();
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
            );
            loadUnreadCount();
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        if (e) e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            loadUnreadCount();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleDelete = async (notificationId, e) => {
        e.stopPropagation();

        // Hiển thị confirm dialog
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa thông báo này?");
        if (!confirmed) {
            return;
        }

        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
            loadUnreadCount();
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.notificationId);
        }

        // Navigate based on notification type
        if (notification.type === "NEW_COMMENT" && notification.relatedId) {
            // Lấy thông tin comment để navigate đến đúng vị trí
            try {
                const { commentService } = await import("../../api/comment.service");
                // Navigate đến trang quản lý bình luận của TA với comment ID
                navigate(`/ta-comments?commentId=${notification.relatedId}`);
                onClose();
            } catch (error) {
                console.error("Error navigating to comment:", error);
                navigate("/ta-comments");
                onClose();
            }
        } else if (notification.type === "TA_REMINDER" && notification.relatedId) {
            // Navigate to chat page - TA will appear in conversations because message was already sent
            navigate("/chat");
            onClose();
        } else if (notification.type === "TA_REMINDER_CONFIRMATION" && notification.relatedId) {
            // Navigate to reminders page for TA
            navigate("/ta-reminders");
            onClose();
        } else if (notification.relatedType === "COURSE" && notification.relatedId) {
            navigate(`/course/${notification.relatedId}`);
            onClose();
        } else if (notification.relatedType === "LESSON" && notification.relatedId) {
            // For lesson notifications, we need to get course info
            // For now, navigate to TA comments page
            navigate(`/ta-comments?commentId=${notification.relatedId}`);
            onClose();
        } else if (notification.relatedType === "PAYMENT") {
            navigate("/profile");
            onClose();
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;

        return date.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "short",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "PAYMENT_SUCCESS":
                return "💰";
            case "COURSE_ENROLLMENT":
                return "📚";
            case "COURSE_UPDATE":
                return "🆕";
            case "PROMOTION":
                return "🎉";
            case "COMPETITION":
                return "🏆";
            case "NEW_COMMENT":
                return "💬";
            case "TA_REMINDER":
                return "📬";
            case "TA_REMINDER_CONFIRMATION":
                return "✅";
            default:
                return "🔔";
        }
    };

    if (!isOpen) return null;

    const currentUser = authService.getCurrentUser();

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[1000] max-h-[600px] flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBell} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                </div>
                {currentUser && unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {!currentUser ? (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faBell} className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-600 font-medium">Vui lòng đăng nhập để xem thông báo</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faBell} className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-500">Không có thông báo</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${!notification.isRead ? "bg-blue-50" : ""
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar/Icon */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        {!notification.isRead && (
                                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            {notification.title}
                                        </p>
                                        {notification.content && (
                                            <p className="text-sm text-gray-600 mb-1 whitespace-normal break-words">
                                                {notification.content}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex items-center gap-1">
                                        {!notification.isRead && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                                                className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-xs" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(notification.notificationId, e)}
                                            className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center transition"
                                            title="Xóa thông báo"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}


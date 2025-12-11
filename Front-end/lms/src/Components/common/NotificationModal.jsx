import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckCircle, faBell, faTrash } from "@fortawesome/free-solid-svg-icons";
import { notificationService } from "../../api/notification.service";
import { authService } from "../../api/auth.service";

export default function NotificationModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [isOpen]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const result = await notificationService.getUnreadNotifications();
            if (result.success) {
                setNotifications(result.data || []);
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const result = await notificationService.getUnreadCount();
            if (result.success) {
                setUnreadCount(result.data || 0);
            }
        } catch (error) {
            console.error("Error loading unread count:", error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
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

    const handleMarkAllAsRead = async () => {
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
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
            loadUnreadCount();
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkAsRead(notification.notificationId);

        // Navigate based on notification type
        if (notification.relatedType === "COURSE" && notification.relatedId) {
            navigate(`/courses/${notification.relatedId}`);
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
            case "PROMOTION":
                return "🎉";
            case "COMPETITION":
                return "🏆";
            default:
                return "🔔";
        }
    };

    if (!isOpen) return null;

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-6">
                        <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-5xl">👤</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập để xem Thông báo</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { onClose(); navigate("/register"); }}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                        >
                            Đăng ký
                        </button>
                        <button
                            onClick={() => { onClose(); navigate("/login"); }}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faBell} className="text-orange-600 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Thông báo</h2>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-500">{unreadCount} thông báo chưa đọc</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faBell} className="text-gray-400 text-3xl" />
                            </div>
                            <p className="text-gray-500 text-lg">Không có thông báo mới</p>
                            <button
                                onClick={() => { onClose(); navigate("/notifications"); }}
                                className="mt-4 text-orange-600 hover:text-orange-700 underline"
                            >
                                Xem tất cả thông báo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.notificationId}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition hover:shadow-md ${notification.isRead
                                            ? "bg-gray-50 border-gray-200"
                                            : "bg-orange-50 border-orange-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-xl">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notification.content}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.notificationId);
                                                            }}
                                                            className="w-6 h-6 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center transition"
                                                            title="Đánh dấu đã đọc"
                                                        >
                                                            <FontAwesomeIcon icon={faCheckCircle} className="text-orange-700 text-xs" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(notification.notificationId, e)}
                                                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
                                                        title="Xóa"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-red-600 text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => { onClose(); navigate("/notifications"); }}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                    >
                        Xem tất cả thông báo
                    </button>
                </div>
            </div>
        </div>
    );
}


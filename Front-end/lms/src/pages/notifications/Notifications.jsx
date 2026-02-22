import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheckCircle, faTrash, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { notificationService } from "../../api/notification.service";
import { authService } from "../../api/auth.service";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        loadNotifications();
        loadUnreadCount();
    }, [navigate]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const result = await notificationService.getNotifications();
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

    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
            loadUnreadCount();
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.notificationId);
        }

        // Navigate based on notification type
        if (notification.type === "TA_REMINDER" && notification.relatedId) {
            // Navigate to chat page - TA will appear in conversations because message was already sent
            navigate("/chat");
        } else if (notification.type === "TA_REMINDER_CONFIRMATION" && notification.relatedId) {
            // Navigate to reminders page for TA
            navigate("/ta-reminders");
        } else if (notification.relatedType === "COURSE" && notification.relatedId) {
            navigate(`/courses/${notification.relatedId}`);
        } else if (notification.relatedType === "PAYMENT") {
            navigate("/profile");
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
            case "TA_REMINDER":
                return "📬";
            case "TA_REMINDER_CONFIRMATION":
                return "✅";
            case "EXAM_FEEDBACK":
                return "📝";
            default:
                return "🔔";
        }
    };

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faBell} className="text-orange-600 text-xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-500">{unreadCount} thông báo chưa đọc</p>
                                )}
                            </div>
                        </div>
                        {unreadNotifications.length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faCheckDouble} />
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faBell} className="text-gray-400 text-3xl" />
                            </div>
                            <p className="text-gray-500 text-lg">Không có thông báo nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Unread Notifications */}
                            {unreadNotifications.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Chưa đọc</h2>
                                    <div className="space-y-3">
                                        {unreadNotifications.map((notification) => (
                                            <div
                                                key={notification.notificationId}
                                                onClick={() => handleNotificationClick(notification)}
                                                className="p-4 rounded-xl border-2 bg-orange-50 border-orange-200 cursor-pointer transition hover:shadow-md"
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
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkAsRead(notification.notificationId);
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center transition"
                                                                    title="Đánh dấu đã đọc"
                                                                >
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-orange-700 text-sm" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(notification.notificationId);
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
                                                                    title="Xóa"
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-red-600 text-sm" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Read Notifications */}
                            {readNotifications.length > 0 && (
                                <div>
                                    {unreadNotifications.length > 0 && <div className="my-6 border-t border-gray-200"></div>}
                                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Đã đọc</h2>
                                    <div className="space-y-3">
                                        {readNotifications.map((notification) => (
                                            <div
                                                key={notification.notificationId}
                                                onClick={() => handleNotificationClick(notification)}
                                                className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200 cursor-pointer transition hover:shadow-md"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-700 mb-1">
                                                                    {notification.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 mb-2">
                                                                    {notification.content}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {formatTime(notification.createdAt)}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(notification.notificationId);
                                                                }}
                                                                className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
                                                                title="Xóa"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="text-red-600 text-sm" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

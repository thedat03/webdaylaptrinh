import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { messageService } from "../../api/message.service";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import Navbar from "../../Components/common/Navbar";


export default function Chat() {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [taAnswers, setTaAnswers] = useState([]);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [myQuestions, setMyQuestions] = useState([]);

    useEffect(() => {
        if (!currentUser?.id) {
            message.warning("Vui lòng đăng nhập để sử dụng tính năng chat");
            navigate("/login");
            return;
        }
        loadConversations();
        loadAvailableUsers();
        loadUnreadCount();
        loadTaAnswers();

        // Gửi heartbeat ngay khi vào trang
        messageService.sendHeartbeat();

        // Gửi heartbeat mỗi 30 giây để cập nhật online status
        const heartbeatInterval = setInterval(() => {
            messageService.sendHeartbeat();
        }, 30000);

        // Refresh unread count every 30 seconds
        const interval = setInterval(() => {
            loadUnreadCount();
        }, 30000);

        // Polling để kiểm tra câu trả lời mới từ TA mỗi 5 giây
        const taAnswersInterval = setInterval(() => {
            loadTaAnswers();
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(heartbeatInterval);
            clearInterval(taAnswersInterval);
        };
    }, [currentUser?.id, navigate]);

    useEffect(() => {
        if (selectedUser) {
            loadConversation(selectedUser.id);
            markAsRead(selectedUser.id);

            // Polling để cập nhật tin nhắn mới mỗi 2 giây
            const conversationInterval = setInterval(() => {
                refreshConversation(selectedUser.id);
            }, 2000);

            // Refresh conversations để cập nhật online status mỗi 10 giây
            const statusInterval = setInterval(() => {
                loadConversations();
                loadAvailableUsers();
            }, 10000);

            return () => {
                clearInterval(conversationInterval);
                clearInterval(statusInterval);
            };
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadConversations = async () => {
        try {
            const result = await messageService.getConversations();
            if (result.success) {
                setConversations(result.data || []);
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
    };

    const loadAvailableUsers = async () => {
        try {
            const result = await messageService.getAvailableChatUsers();
            if (result.success) {
                setAvailableUsers(result.data || []);
            }
        } catch (error) {
            console.error("Error loading available users:", error);
        }
    };

    const loadConversation = async (otherUserId, showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        try {
            const result = await messageService.getConversation(otherUserId);
            if (result.success) {
                setMessages(result.data || []);
            } else {
                if (showLoading) {
                    message.error(result.error || "Không thể tải cuộc trò chuyện");
                }
            }
        } catch (error) {
            console.error("Error loading conversation:", error);
            if (showLoading) {
                message.error("Lỗi khi tải cuộc trò chuyện");
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // Refresh conversation silently (không hiển thị loading)
    const refreshConversation = async (otherUserId) => {
        try {
            const result = await messageService.getConversation(otherUserId);
            if (result.success) {
                const newMessages = result.data || [];
                // Chỉ cập nhật nếu có tin nhắn mới (so sánh số lượng hoặc timestamp)
                setMessages(prevMessages => {
                    // Nếu số lượng tin nhắn khác nhau hoặc có tin nhắn mới hơn
                    if (newMessages.length !== prevMessages.length) {
                        return newMessages;
                    }
                    // Kiểm tra tin nhắn mới nhất
                    if (newMessages.length > 0 && prevMessages.length > 0) {
                        const lastNewMessage = newMessages[newMessages.length - 1];
                        const lastPrevMessage = prevMessages[prevMessages.length - 1];
                        if (lastNewMessage.messageId !== lastPrevMessage.messageId) {
                            return newMessages;
                        }
                    }
                    return prevMessages; // Không có thay đổi
                });
            }
        } catch (error) {
            console.error("Error refreshing conversation:", error);
        }
    };

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

    const markAsRead = async (senderId) => {
        try {
            await messageService.markAsRead(senderId);
            loadUnreadCount();
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) {
            return;
        }

        const content = newMessage.trim();
        setNewMessage("");

        // Tạo tin nhắn tạm thời để hiển thị ngay (optimistic update)
        const tempMessage = {
            messageId: `temp-${Date.now()}`,
            sender: {
                id: currentUser.id,
                username: currentUser.name || currentUser.username,
                role: currentUser.role
            },
            receiver: selectedUser,
            content: content,
            isRead: false,
            createdAt: new Date().toISOString()
        };

        // Thêm tin nhắn tạm vào danh sách ngay lập tức
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        try {
            const result = await messageService.sendMessage(selectedUser.id, content);
            if (result.success) {
                // Thay thế tin nhắn tạm bằng tin nhắn thật từ server
                setMessages(prev => {
                    const filtered = prev.filter(m => m.messageId !== tempMessage.messageId);
                    return [...filtered, result.data];
                });
                // Refresh conversations để cập nhật thứ tự
                loadConversations();
                // Refresh unread count
                loadUnreadCount();
            } else {
                // Xóa tin nhắn tạm nếu gửi thất bại
                setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
                message.error(result.error || "Không thể gửi tin nhắn");
                setNewMessage(content);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Xóa tin nhắn tạm nếu có lỗi
            setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
            message.error("Lỗi khi gửi tin nhắn");
            setNewMessage(content);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        // Refresh conversations để đảm bảo user mới được thêm vào danh sách
        setTimeout(() => {
            loadConversations();
        }, 1000);
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

    const formatOfflineTime = (offlineMinutes) => {
        if (!offlineMinutes) return "";
        if (offlineMinutes < 60) return `Đã offline ${offlineMinutes} phút`;
        const hours = Math.floor(offlineMinutes / 60);
        if (hours < 24) return `Đã offline ${hours} giờ`;
        const days = Math.floor(hours / 24);
        return `Đã offline ${days} ngày`;
    };

    const getUserRoleBadge = (role) => {
        const roleName = role?.replace("ROLE_", "") || "";
        const colors = {
            ADMIN: "bg-red-100 text-red-700",
            INSTRUCTOR: "bg-purple-100 text-purple-700",
            TEACHING_ASSISTANT: "bg-orange-100 text-orange-700",
            STUDENT: "bg-green-100 text-green-700",
            USER: "bg-blue-100 text-blue-700"
        };
        const roleLabels = {
            ADMIN: "Admin",
            INSTRUCTOR: "Giáo viên",
            TEACHING_ASSISTANT: "Trợ giảng",
            STUDENT: "Học viên",
            USER: "Học viên"
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[roleName] || colors.USER}`}>
                {roleLabels[roleName] || roleName}
            </span>
        );
    };

    // Debounce search để tránh giật khi gõ nhanh
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 200);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter conversations based on debounced search
    const filteredConversations = conversations.filter(user => {
        return !debouncedQuery ||
            user.username?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedQuery.toLowerCase());
    });

    // Khi tìm kiếm, cho phép tìm cả người chưa chat: gộp conversations + availableUsers, loại trùng id
    const filteredSearchResults = (() => {
        if (!debouncedQuery) return [];
        const pool = [...conversations, ...availableUsers];
        const unique = new Map();
        pool.forEach(u => {
            if (u?.id && !unique.has(u.id)) {
                unique.set(u.id, u);
            }
        });
        return Array.from(unique.values()).filter(user =>
            user.username?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
    })();

    const getUnreadCountForUser = async (userId) => {
        try {
            const unreadResult = await messageService.getUnreadMessages();
            if (unreadResult.success) {
                const unreadMessages = unreadResult.data || [];
                return unreadMessages.filter(m => m.sender?.id === userId).length;
            }
        } catch (error) {
            console.error("Error getting unread count for user:", error);
        }
        return 0;
    };

    // Load TA answers
    const loadTaAnswers = async () => {
        try {
            const result = await taService.getMyAnsweredQuestions();
            if (result.success) {
                setTaAnswers(result.data || []);
            }
        } catch (error) {
            console.error("Error loading TA answers:", error);
        }
    };

    // Load my questions
    const loadMyQuestions = async () => {
        try {
            const result = await taService.getMyQuestions();
            if (result.success) {
                setMyQuestions(result.data || []);
            }
        } catch (error) {
            console.error("Error loading my questions:", error);
        }
    };

    // Merge messages with TA answers
    const getMergedMessages = () => {
        const regularMessages = messages.map(msg => ({
            ...msg,
            type: 'message',
            timestamp: new Date(msg.createdAt).getTime()
        }));

        // Only show TA answers if chatting with a TA, or show all TA answers if no specific user selected
        const shouldShowTaAnswers = !selectedUser || 
            (selectedUser && selectedUser.role?.includes("TEACHING_ASSISTANT"));

        if (!shouldShowTaAnswers) {
            return regularMessages.sort((a, b) => a.timestamp - b.timestamp);
        }

        const taAnswerMessages = taAnswers.map(answer => {
            // Find the TA user from available users or conversations
            const taUser = availableUsers.find(u => 
                u.role?.includes("TEACHING_ASSISTANT") && 
                answer.ta?.id === u.id
            ) || conversations.find(u => 
                u.role?.includes("TEACHING_ASSISTANT") && 
                answer.ta?.id === u.id
            ) || (answer.ta ? {
                id: answer.ta.id,
                username: answer.ta.username || "Trợ giảng",
                role: "ROLE_TEACHING_ASSISTANT",
                email: answer.ta.email || "",
                profileImage: answer.ta.profileImage
            } : null);

            if (!taUser) return null;

            // If chatting with a specific TA, only show answers from that TA
            if (selectedUser && selectedUser.id !== taUser.id) {
                return null;
            }

            return {
                messageId: `ta-answer-${answer.id}`,
                type: 'ta_answer',
                sender: taUser,
                receiver: currentUser,
                content: answer.taResponse,
                question: answer.content,
                questionId: answer.id,
                isRead: false,
                createdAt: answer.respondedAt || answer.createdAt,
                timestamp: new Date(answer.respondedAt || answer.createdAt).getTime()
            };
        }).filter(Boolean);

        // Merge and sort by timestamp
        const allMessages = [...regularMessages, ...taAnswerMessages];
        return allMessages.sort((a, b) => a.timestamp - b.timestamp);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex overflow-hidden min-h-0" style={{ height: "calc(100vh - 140px)" }}>
                {/* Sidebar - Danh sách cuộc trò chuyện */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Tin nhắn</h2>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Search box */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm người dùng..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Không cần nút “bắt đầu chat mới”. Gõ tên/email vào ô tìm kiếm để tìm cả người mới */}
                    </div>

                    {/* Danh sách: ưu tiên kết quả tìm kiếm nếu có, ngược lại hiển thị người đã chat */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div>
                            {/* Nếu có search -> dùng kết quả gộp (đã chat + user mới). Ngược lại chỉ hiện người đã chat */}
                            {searchQuery
                                ? (
                                    filteredSearchResults.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            <p className="mb-2">Không tìm thấy người dùng nào</p>
                                            <p className="text-xs">Thử đổi tên/email khác</p>
                                        </div>
                                    ) : (
                                        filteredSearchResults.map((user) => {
                                            const hasConversation = conversations.some(c => c.id === user.id);
                                            return (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleSelectUser(user)}
                                                    className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${selectedUser?.id === user.id ? "bg-blue-50" : ""
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 relative">
                                                            {user.profileImage ? (
                                                                <img
                                                                    src={`data:image/jpeg;base64,${user.profileImage}`}
                                                                    alt={user.username}
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-blue-600 font-semibold text-lg">
                                                                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                                                                </span>
                                                            )}
                                                            {/* Online/Offline indicator */}
                                                            <span 
                                                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                                                    user.isOnline ? "bg-green-500" : "bg-gray-400"
                                                                }`}
                                                            ></span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold text-gray-900 truncate">
                                                                    {user.username || "Người dùng"}
                                                                </p>
                                                                {getUserRoleBadge(user.role)}
                                                                {!hasConversation && (
                                                                    <span className="text-xs text-blue-600">Người mới</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )
                                )
                                : (
                                    conversations.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            <p className="mb-2">Chưa có cuộc trò chuyện nào</p>
                                            <p className="text-xs">Nhập tên hoặc email để tìm người mới và bắt đầu chat</p>
                                        </div>
                                    ) : filteredConversations.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            <p className="mb-2">Không tìm thấy cuộc trò chuyện nào</p>
                                            <p className="text-xs">Thử thay đổi từ khóa tìm kiếm</p>
                                        </div>
                                    ) : (
                                        filteredConversations.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${selectedUser?.id === user.id ? "bg-blue-50" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 relative">
                                                        {user.profileImage ? (
                                                            <img
                                                                src={`data:image/jpeg;base64,${user.profileImage}`}
                                                                alt={user.username}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-blue-600 font-semibold text-lg">
                                                                {user.username?.charAt(0)?.toUpperCase() || "U"}
                                                            </span>
                                                        )}
                                                        {/* Online/Offline indicator */}
                                                        <span 
                                                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                                                user.isOnline ? "bg-green-500" : "bg-gray-400"
                                                            }`}
                                                        ></span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {user.username || "Người dùng"}
                                                            </p>
                                                            {getUserRoleBadge(user.role)}
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col bg-white min-h-0">
                    {selectedUser ? (
                        <>
                            {/* Chat header */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center relative">
                                        {selectedUser.profileImage ? (
                                            <img
                                                src={`data:image/jpeg;base64,${selectedUser.profileImage}`}
                                                alt={selectedUser.username}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-blue-600 font-semibold">
                                                {selectedUser.username?.charAt(0)?.toUpperCase() || "U"}
                                            </span>
                                        )}
                                        {/* Online/Offline indicator */}
                                        <span 
                                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                                selectedUser.isOnline ? "bg-green-500" : "bg-gray-400"
                                            }`}
                                        ></span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">
                                                {selectedUser.username || "Người dùng"}
                                            </p>
                                            {getUserRoleBadge(selectedUser.role)}
                                        </div>
                                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                        {!selectedUser.isOnline && selectedUser.offlineMinutes && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatOfflineTime(selectedUser.offlineMinutes)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0"
                                style={{
                                    maxHeight: "calc(100vh - 240px)",
                                    minHeight: "320px" // giữ chiều cao ổn định kể cả khi chưa có tin nhắn
                                }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                                    </div>
                                ) : getMergedMessages().length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {getMergedMessages().map((msg) => {
                                            const isOwn = msg.sender?.id === currentUser?.id;
                                            const isTaAnswer = msg.type === 'ta_answer';
                                            return (
                                                <div
                                                    key={msg.messageId}
                                                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                                                            ? "bg-blue-600 text-white"
                                                            : isTaAnswer
                                                            ? "bg-green-50 text-gray-900 border-2 border-green-300"
                                                            : "bg-white text-gray-900 border border-gray-200"
                                                            }`}
                                                    >
                                                        {!isOwn && (
                                                            <p className={`text-xs font-semibold mb-1 ${isTaAnswer ? "text-green-700" : "text-gray-600"}`}>
                                                                {msg.sender?.username || "Người dùng"}
                                                                {isTaAnswer && (
                                                                    <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                                                                        Trợ giảng
                                                                    </span>
                                                                )}
                                                            </p>
                                                        )}
                                                        {isTaAnswer && msg.question && (
                                                            <div className="mb-2 p-2 bg-gray-100 rounded text-xs text-gray-600 border-l-2 border-gray-400">
                                                                <p className="font-semibold mb-1">Câu hỏi của bạn:</p>
                                                                <p className="whitespace-pre-wrap">{msg.question}</p>
                                                            </div>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : isTaAnswer ? "text-green-600" : "text-gray-500"}`}>
                                                            {formatTime(msg.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={() => {
                                            setShowQuestionsModal(true);
                                            loadMyQuestions();
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Xem câu hỏi đã hỏi
                                    </button>
                                </div>
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
                                    >
                                        Gửi
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xem câu hỏi đã hỏi */}
            {showQuestionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Câu hỏi đã hỏi</h3>
                            <button
                                onClick={() => setShowQuestionsModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {myQuestions.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <p>Bạn chưa có câu hỏi nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myQuestions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
                                        >
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                <p className="font-semibold mb-2">Câu hỏi:</p>
                                                <p>{question.content}</p>
                                            </div>
                                            
                                            {question.taResponse && (
                                                <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                                    <p className="text-xs font-semibold text-green-700 mb-1">
                                                        Phản hồi từ TA:
                                                    </p>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                        {question.taResponse}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    {formatTime(question.respondedAt || question.createdAt)}
                                                    {question.status === "ANSWERED" && " • Đã trả lời"}
                                                    {question.status === "PENDING" && " • Đang chờ"}
                                                    {question.status === "ASSIGNED" && " • Đã phân công"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}


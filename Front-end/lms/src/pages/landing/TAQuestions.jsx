import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faQuestionCircle, 
    faArrowLeft, 
    faCheckCircle, 
    faClock,
    faUser,
    faSearch,
    faHandPaper,
    faReply,
    faGraduationCap,
    faBookOpen,
    faExclamationCircle,
    faStar
} from "@fortawesome/free-solid-svg-icons";

function TAQuestions() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [assignedQuestions, setAssignedQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("pending");

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadQuestions();
        
        // Auto refresh every 5 seconds
        const interval = setInterval(() => {
            loadQuestions();
        }, 5000);
        
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedQuestion]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadQuestions = async () => {
        setLoading(true);
        try {
            if (activeTab === "pending") {
                const res = await taService.getPendingQuestions();
                if (res.success && Array.isArray(res.data)) {
                    setPendingQuestions(res.data);
                }
            } else {
                const res = await taService.getMyAssignedQuestions();
                if (res.success && Array.isArray(res.data)) {
                    setAssignedQuestions(res.data);
                }
            }
        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (questionId) => {
        try {
            const res = await taService.claimQuestion(questionId);
            if (res.success) {
                message.success("Đã nhận câu hỏi thành công");
                await loadQuestions();
                // Select the claimed question
                const updated = await taService.getMyAssignedQuestions();
                if (updated.success && Array.isArray(updated.data)) {
                    const claimed = updated.data.find(q => q.id === questionId);
                    if (claimed) {
                        setSelectedQuestion(claimed);
                        setActiveTab("assigned");
                    }
                }
            } else {
                message.error(res.error || "Lỗi khi nhận câu hỏi");
            }
        } catch (error) {
            message.error("Lỗi khi nhận câu hỏi");
        }
    };

    const handleAnswer = async () => {
        if (!selectedQuestion || !replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung trả lời");
            return;
        }
        try {
            const res = await taService.answerQuestion(selectedQuestion.id, replyContent);
            if (res.success) {
                message.success("Đã trả lời câu hỏi thành công");
                setReplyContent("");
                await loadQuestions();
                // Refresh selected question
                const updated = await taService.getMyAssignedQuestions();
                if (updated.success && Array.isArray(updated.data)) {
                    const updatedQuestion = updated.data.find(q => q.id === selectedQuestion.id);
                    if (updatedQuestion) {
                        setSelectedQuestion(updatedQuestion);
                    }
                }
            } else {
                message.error(res.error || "Lỗi khi trả lời");
            }
        } catch (error) {
            message.error("Lỗi khi trả lời câu hỏi");
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
        return `${days} ngày trước`;
    };

    const getInitials = (name) => {
        if (!name) return "H";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const filteredQuestions = (activeTab === "pending" ? pendingQuestions : assignedQuestions).filter(q => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            q.content?.toLowerCase().includes(query) ||
            q.student?.username?.toLowerCase().includes(query) ||
            q.course?.course_name?.toLowerCase().includes(query) ||
            q.lesson?.title?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex overflow-hidden min-h-0" style={{ height: "calc(100vh - 140px)" }}>
                {/* Sidebar - Danh sách câu hỏi */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Câu hỏi giải đáp</h2>
                            <button
                                onClick={() => navigate("/teaching-assistant-home")}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => {
                                    setActiveTab("pending");
                                    setSelectedQuestion(null);
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    activeTab === "pending"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Đang chờ ({pendingQuestions.length})
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("assigned");
                                    setSelectedQuestion(null);
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    activeTab === "assigned"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Đã nhận ({assignedQuestions.length})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm câu hỏi..."
                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {filteredQuestions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <p>Không có câu hỏi nào</p>
                            </div>
                        ) : (
                            filteredQuestions.map((question) => (
                                <button
                                    key={question.id}
                                    onClick={() => setSelectedQuestion(question)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${
                                        selectedQuestion?.id === question.id ? "bg-blue-50" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            question.status === "ANSWERED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-orange-100 text-orange-700"
                                        }`}>
                                            <FontAwesomeIcon icon={faQuestionCircle} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-gray-900 truncate text-sm">
                                                    {question.student?.username || "Học viên"}
                                                </p>
                                                {question.status === "ANSWERED" && (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mb-1">
                                                {question.content?.substring(0, 50)}...
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <FontAwesomeIcon icon={faClock} />
                                                {formatTime(question.createdAt)}
                                            </div>
                                            {question.course && (
                                                <div className="mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                        {question.course.course_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col bg-white min-h-0">
                    {selectedQuestion ? (
                        <>
                            {/* Chat header */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {selectedQuestion.student?.username || "Học viên"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatTime(selectedQuestion.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    {!selectedQuestion.ta && activeTab === "pending" && (
                                        <button
                                            onClick={() => handleClaim(selectedQuestion.id)}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold text-sm flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faHandPaper} />
                                            Nhận câu hỏi
                                        </button>
                                    )}
                                </div>
                                {selectedQuestion.course && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBookOpen} className="text-gray-400 text-xs" />
                                        <span className="text-xs text-gray-600">{selectedQuestion.course.course_name}</span>
                                        {selectedQuestion.lesson && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <FontAwesomeIcon icon={faGraduationCap} className="text-gray-400 text-xs" />
                                                <span className="text-xs text-gray-600">{selectedQuestion.lesson.title}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0"
                                style={{
                                    maxHeight: "calc(100vh - 240px)",
                                    minHeight: "320px"
                                }}
                            >
                                <div className="space-y-4">
                                    {/* Question */}
                                    <div className="flex justify-start">
                                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200">
                                            <p className="text-xs font-semibold mb-1 text-gray-600">
                                                Câu hỏi:
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap">{selectedQuestion.content}</p>
                                            <p className="text-xs mt-1 text-gray-500">
                                                {formatTime(selectedQuestion.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* TA Response */}
                                    {selectedQuestion.taResponse && (
                                        <div className="flex justify-end">
                                            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-600 text-white">
                                                <p className="text-xs font-semibold mb-1 text-blue-100">
                                                    Trả lời của bạn:
                                                </p>
                                                <p className="text-sm whitespace-pre-wrap">{selectedQuestion.taResponse}</p>
                                                <p className="text-xs mt-1 text-blue-100">
                                                    {formatTime(selectedQuestion.respondedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rating if resolved */}
                                    {selectedQuestion.isResolved && selectedQuestion.rating && (
                                        <div className="flex justify-start">
                                            <div className="px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                                                <p className="text-xs text-green-700 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Đã giải quyết
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FontAwesomeIcon
                                                            key={star}
                                                            icon={faStar}
                                                            className={`text-sm ${
                                                                star <= selectedQuestion.rating
                                                                    ? "text-yellow-400"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-gray-600 ml-1">
                                                        ({selectedQuestion.rating}/5)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input */}
                            {selectedQuestion.status !== "ANSWERED" && selectedQuestion.ta && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleAnswer();
                                        }}
                                        className="flex gap-2"
                                    >
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Nhập câu trả lời..."
                                            rows={3}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyContent.trim()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faReply} />
                                            Gửi
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <FontAwesomeIcon
                                    icon={faQuestionCircle}
                                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                />
                                <p className="text-lg">Chọn một câu hỏi để xem chi tiết</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TAQuestions;

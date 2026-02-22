import React, { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { taService } from "../../api/ta.service";
import { messageService } from "../../api/message.service";

const QUESTION_TYPES = [
    { value: "CONCEPT", label: "Không hiểu khái niệm" },
    { value: "CODE_ERROR", label: "Bị lỗi code" },
    { value: "TEST_FAILED", label: "Không qua test" },
    { value: "DONT_KNOW_START", label: "Không biết bắt đầu từ đâu" },
    { value: "OTHER", label: "Khác" }
];

export default function TAAssistantButton({ lessonId, courseId, lessonType, lessonTitle, code, testResults }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [taOnline, setTaOnline] = useState(false);
    const [availableTAs, setAvailableTAs] = useState([]);
    const [questionContent, setQuestionContent] = useState("");
    const [questionType, setQuestionType] = useState("CONCEPT");
    const [includeContext, setIncludeContext] = useState(true);
    const [myQuestions, setMyQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [showRating, setShowRating] = useState(null);
    const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Drag and drop state
    const [position, setPosition] = useState(null); // null means use default bottom-right
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    // Load saved position from localStorage
    useEffect(() => {
        const savedPosition = localStorage.getItem('taAssistantButtonPosition');
        if (savedPosition) {
            try {
                const { x, y } = JSON.parse(savedPosition);
                if (x !== undefined && y !== undefined) {
                    setPosition({ x, y });
                }
            } catch (e) {
                console.error("Error loading saved position:", e);
            }
        }
    }, []);

    // Check TA online status
    useEffect(() => {
        const checkTAStatus = async () => {
            try {
                const result = await messageService.getAvailableChatUsers();
                if (result.success) {
                    const tas = (result.data || []).filter(user => 
                        user.role?.includes("TEACHING_ASSISTANT")
                    );
                    setAvailableTAs(tas);
                    setTaOnline(tas.some(ta => ta.isOnline));
                }
            } catch (error) {
                console.error("Error checking TA status:", error);
            }
        };

        checkTAStatus();
        const interval = setInterval(checkTAStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handle drag start
    const handleMouseDown = (e) => {
        e.preventDefault();
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const currentX = position ? position.x : rect.left;
            const currentY = position ? position.y : rect.top;
            
            setDragOffset({
                x: e.clientX - currentX,
                y: e.clientY - currentY
            });
            setIsDragging(true);
        }
    };

    // Handle drag
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && buttonRef.current) {
                const buttonWidth = buttonRef.current.offsetWidth;
                const buttonHeight = buttonRef.current.offsetHeight;
                
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                
                // Constrain to viewport
                const maxX = window.innerWidth - buttonWidth;
                const maxY = window.innerHeight - buttonHeight;
                
                const constrainedX = Math.max(0, Math.min(newX, maxX));
                const constrainedY = Math.max(0, Math.min(newY, maxY));
                
                const newPosition = {
                    x: constrainedX,
                    y: constrainedY
                };
                
                setPosition(newPosition);
                
                // Save position to localStorage
                localStorage.setItem('taAssistantButtonPosition', JSON.stringify(newPosition));
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    // Load my questions when panel opens
    useEffect(() => {
        if (isPanelOpen) {
            loadMyQuestions();
            // Polling để kiểm tra câu trả lời mới mỗi 5 giây
            const interval = setInterval(() => {
                loadMyQuestions();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isPanelOpen]);

    const loadMyQuestions = async () => {
        try {
            const result = await taService.getMyQuestions();
            if (result.success) {
                const allQuestions = result.data || [];
                
                // Log để debug
                console.log("All questions from API:", allQuestions);
                console.log("Questions with taResponse:", allQuestions.filter(q => q.taResponse));
                console.log("Questions with status ANSWERED:", allQuestions.filter(q => q.status === "ANSWERED"));
                
                // Filter: 
                // 1. Luôn hiển thị các câu hỏi có câu trả lời (taResponse)
                // 2. Nếu có lessonId hoặc courseId, cũng hiển thị các câu hỏi match với lesson/course đó
                let filtered = allQuestions;
                if (lessonId || courseId) {
                    filtered = allQuestions.filter(q => {
                        // Luôn hiển thị nếu có câu trả lời
                        const hasResponse = q.taResponse && q.taResponse.trim() !== "";
                        if (hasResponse) {
                            return true;
                        }
                        
                        // Nếu không có câu trả lời, chỉ hiển thị nếu match với lessonId hoặc courseId
                        let matches = false;
                        
                        if (lessonId) {
                            const qLessonId = q.lesson?.lesson_id || q.lessonId;
                            if (qLessonId === lessonId || qLessonId === String(lessonId)) {
                                matches = true;
                            }
                        }
                        
                        if (courseId) {
                            const qCourseId = q.course?.course_id || q.courseId;
                            if (qCourseId === courseId || qCourseId === String(courseId)) {
                                matches = true;
                            }
                        }
                        
                        return matches;
                    });
                }
                
                console.log("Filtered questions:", filtered);
                console.log("Filtered with taResponse:", filtered.filter(q => q.taResponse));
                
                // Kiểm tra xem có câu trả lời mới không
                const previousAnsweredCount = myQuestions.filter(q => 
                    (q.status === "ANSWERED" || q.status === "ASSIGNED") && q.taResponse
                ).length;
                const newAnsweredCount = filtered.filter(q => 
                    (q.status === "ANSWERED" || q.status === "ASSIGNED") && q.taResponse
                ).length;
                
                if (newAnsweredCount > previousAnsweredCount && isPanelOpen && previousAnsweredCount > 0) {
                    message.success("Bạn có câu trả lời mới từ trợ giảng!");
                }
                
                setMyQuestions(filtered);
            } else {
                console.error("Failed to load questions:", result.error);
            }
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    };

    const getContextData = () => {
        if (!includeContext) return "";

        let context = `\n\n--- Ngữ cảnh bài học ---\n`;
        context += `Bài học: ${lessonTitle}\n`;
        context += `Loại: ${lessonType}\n`;

        if (lessonType === "CODE" && code) {
            context += `\nCode hiện tại:\n\`\`\`\n${code}\n\`\`\`\n`;
        }

        if (lessonType === "CODE" && testResults && testResults.length > 0) {
            const failed = testResults.filter(r => !r.passed);
            if (failed.length > 0) {
                context += `\nTest cases thất bại:\n`;
                failed.forEach((result, idx) => {
                    context += `- Test ${idx + 1}: ${result.status}\n`;
                    if (result.stderr) context += `  Lỗi: ${result.stderr}\n`;
                });
            }
        }

        return context;
    };

    const handleSubmitQuestion = async () => {
        if (!questionContent.trim()) {
            message.warning("Vui lòng nhập câu hỏi");
            return;
        }

        setLoading(true);
        try {
            const questionTypeLabel = QUESTION_TYPES.find(t => t.value === questionType)?.label || "";
            let fullContent = `[${questionTypeLabel}] ${questionContent.trim()}`;
            
            if (includeContext) {
                fullContent += getContextData();
            }

            const result = await taService.createDirectQuestion(
                fullContent,
                courseId,
                lessonId
            );

            if (result.success) {
                message.success(
                    taOnline 
                        ? "Câu hỏi đã được gửi! TA sẽ phản hồi sớm." 
                        : "Câu hỏi đã được gửi dạng ticket. TA sẽ trả lời sau."
                );
                setQuestionContent("");
                setQuestionType("CONCEPT");
                setShowNewQuestionForm(false); // Ẩn form sau khi gửi thành công
                await loadMyQuestions();
            } else {
                message.error(result.error || "Không thể gửi câu hỏi");
            }
        } catch (error) {
            console.error("Error submitting question:", error);
            message.error("Lỗi khi gửi câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkResolved = (questionId) => {
        setShowRating(questionId);
        setRating(0);
    };

    const handleSubmitRating = async (questionId, ratingValue) => {
        if (ratingValue === 0) {
            message.warning("Vui lòng chọn đánh giá");
            return;
        }

        try {
            const result = await taService.markAsResolved(questionId, ratingValue);
            if (result.success) {
                setMyQuestions(prev => 
                    prev.map(q => 
                        q.id === questionId ? { ...q, isResolved: true, rating: ratingValue } : q
                    )
                );
                setShowRating(null);
                setRating(0);
                message.success("Cảm ơn bạn đã đánh giá!");
            } else {
                message.error(result.error || "Không thể đánh dấu đã giải quyết");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            message.error("Lỗi khi gửi đánh giá");
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

    return (
        <>
            {/* Floating Button */}
            <button
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onClick={(e) => {
                    // Only open panel if not dragging
                    if (!isDragging) {
                        setIsPanelOpen(true);
                    }
                }}
                style={{
                    position: 'fixed',
                    left: position ? `${position.x}px` : 'auto',
                    right: position ? 'auto' : '24px',
                    bottom: position ? 'auto' : '24px',
                    top: position ? `${position.y}px` : 'auto',
                    zIndex: 9999,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none'
                }}
                className={`w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center group ${isDragging ? 'opacity-80' : ''}`}
                aria-label="Hỏi trợ giảng"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Status indicator */}
                <span 
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        taOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={taOnline ? "TA online" : "TA offline"}
                />
            </button>

            {/* Panel Overlay */}
            {isPanelOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50" 
                        onClick={() => setIsPanelOpen(false)}
                    />
                    
                    {/* Panel */}
                    <div className="relative w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col" style={{ animation: "slideInRight 0.3s ease-out" }}>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800">Hỏi trợ giảng</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {taOnline ? (
                                        <span className="text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            TA online - Có thể chat nhanh
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                            TA offline - Gửi ticket, sẽ trả lời sau
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPanelOpen(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Action Bar - Nút tạo câu hỏi và tìm kiếm */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                            {/* Nút tạo câu hỏi mới */}
                            <button
                                onClick={() => {
                                    setShowNewQuestionForm(!showNewQuestionForm);
                                    if (!showNewQuestionForm) {
                                        // Scroll to form sau khi mở
                                        setTimeout(() => {
                                            const formElement = document.querySelector('[data-new-question-form]');
                                            if (formElement) {
                                                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }, 100);
                                    }
                                }}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {showNewQuestionForm ? "Ẩn form tạo câu hỏi" : "Tạo câu hỏi mới"}
                            </button>

                            {/* Tìm kiếm câu trả lời */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm trong câu hỏi và câu trả lời..."
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <svg 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Answered Questions - Hiển thị trước */}
                            {(() => {
                                // Lọc các câu hỏi có câu trả lời
                                let answeredQuestions = myQuestions.filter(q => {
                                    // Kiểm tra có taResponse không
                                    const hasResponse = q.taResponse && q.taResponse.trim() !== "";
                                    // Kiểm tra status
                                    const isAnswered = q.status === "ANSWERED" || (q.status === "ASSIGNED" && hasResponse);
                                    return isAnswered && hasResponse;
                                });

                                // Filter theo search query nếu có
                                if (searchQuery.trim()) {
                                    const query = searchQuery.toLowerCase().trim();
                                    answeredQuestions = answeredQuestions.filter(q => {
                                        const contentMatch = q.content?.toLowerCase().includes(query);
                                        const responseMatch = q.taResponse?.toLowerCase().includes(query);
                                        return contentMatch || responseMatch;
                                    });
                                }
                                
                                console.log("Questions to display:", answeredQuestions);
                                
                                if (answeredQuestions.length > 0) {
                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-800">
                                                    {searchQuery ? `Kết quả tìm kiếm (${answeredQuestions.length})` : "Câu trả lời từ trợ giảng"}
                                                </h4>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                    {answeredQuestions.length} câu trả lời
                                                </span>
                                            </div>
                                            
                                            {answeredQuestions
                                                .sort((a, b) => {
                                                    // Sắp xếp: câu trả lời mới nhất lên đầu
                                                    const timeA = new Date(a.respondedAt || a.createdAt || 0).getTime();
                                                    const timeB = new Date(b.respondedAt || b.createdAt || 0).getTime();
                                                    return timeB - timeA;
                                                })
                                                .map((question) => (
                                            <div
                                                key={question.id}
                                                className="p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm space-y-3 hover:shadow-md transition"
                                            >
                                                {/* Câu hỏi của học viên */}
                                                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Câu hỏi của bạn:
                                                    </p>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                        {question.content}
                                                    </p>
                                                </div>
                                                
                                                {/* Câu trả lời từ TA - Luôn hiển thị vì đã filter */}
                                                {question.taResponse && question.taResponse.trim() !== "" ? (
                                                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-400 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-green-700">
                                                                    Trợ giảng đã trả lời
                                                                </p>
                                                                {question.ta && (
                                                                    <p className="text-xs text-gray-600">
                                                                        {question.ta.username || question.ta.name || "Trợ giảng"}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                                {question.taResponse}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            {formatTime(question.respondedAt || question.createdAt)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                        <p className="text-xs text-yellow-700">
                                                            Đang chờ trợ giảng trả lời...
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                    {question.status === "ANSWERED" && !question.isResolved && (
                                                        <button
                                                            onClick={() => handleMarkResolved(question.id)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Đánh dấu đã giải quyết
                                                        </button>
                                                    )}
                                                    {question.isResolved && question.rating && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <span className="font-medium">Đã giải quyết</span>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`text-lg ${
                                                                            i < question.rating ? "text-yellow-400" : "text-gray-300"
                                                                        }`}
                                                                    >
                                                                        ★
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rating Form */}
                                                {showRating === question.id && (
                                                    <div className="p-4 bg-white rounded-lg border-2 border-yellow-300 shadow-sm">
                                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                                            Đánh giá câu trả lời:
                                                        </p>
                                                        <div className="flex items-center gap-2 mb-4 justify-center">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setRating(star)}
                                                                    className={`text-3xl transition-transform hover:scale-110 ${
                                                                        star <= rating 
                                                                            ? "text-yellow-400" 
                                                                            : "text-gray-300"
                                                                    }`}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSubmitRating(question.id, rating)}
                                                                disabled={rating === 0}
                                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
                                                            >
                                                                Gửi đánh giá
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowRating(null);
                                                                    setRating(0);
                                                                }}
                                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        </div>
                                    );
                                } else {
                                    // Hiển thị thông báo nếu chưa có câu trả lời
                                    if (searchQuery.trim()) {
                                        return (
                                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                                                <svg className="w-12 h-12 mx-auto mb-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Không tìm thấy kết quả
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Thử tìm kiếm với từ khóa khác
                                                </p>
                                            </div>
                                        );
                                    }
                                    const hasPendingQuestions = myQuestions.length > 0;
                                    return hasPendingQuestions ? (
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Chưa có câu trả lời nào
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Trợ giảng sẽ trả lời câu hỏi của bạn sớm nhất có thể
                                            </p>
                                        </div>
                                    ) : null;
                                }
                            })()}

                            {/* New Question Form - Chỉ hiển thị khi click nút */}
                            {showNewQuestionForm && (
                                <div className="space-y-4 pt-4 border-t-2 border-gray-300" data-new-question-form>
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Gửi câu hỏi mới
                                </h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại câu hỏi
                                    </label>
                                    <select
                                        value={questionType}
                                        onChange={(e) => setQuestionType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {QUESTION_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Câu hỏi của bạn
                                    </label>
                                    <textarea
                                        value={questionContent}
                                        onChange={(e) => setQuestionContent(e.target.value)}
                                        placeholder="Mô tả vấn đề bạn gặp phải..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="includeContext"
                                        checked={includeContext}
                                        onChange={(e) => setIncludeContext(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="includeContext" className="text-sm text-gray-700">
                                        Gửi kèm ngữ cảnh bài học
                                    </label>
                                </div>

                                <button
                                    onClick={handleSubmitQuestion}
                                    disabled={loading || !questionContent.trim()}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold shadow-md hover:shadow-lg"
                                >
                                    {loading ? "Đang gửi..." : "Gửi câu hỏi"}
                                </button>
                                </div>
                            )}

                            {/* Pending Questions */}
                            {myQuestions.filter(q => q.status === "PENDING" || (q.status === "ASSIGNED" && !q.taResponse)).length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Câu hỏi đang chờ trả lời
                                    </h4>
                                    
                                    {myQuestions
                                        .filter(q => q.status === "PENDING" || (q.status === "ASSIGNED" && !q.taResponse))
                                        .map((question) => (
                                            <div
                                                key={question.id}
                                                className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                                            >
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                                                    {question.content}
                                                </p>
                                                <p className="text-xs text-yellow-700">
                                                    {formatTime(question.createdAt)} • Đang chờ trả lời...
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
}

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
        }
    }, [isPanelOpen]);

    const loadMyQuestions = async () => {
        try {
            const result = await taService.getMyQuestions();
            if (result.success) {
                const filtered = (result.data || []).filter(q => {
                    if (lessonId && q.lesson?.lesson_id === lessonId) return true;
                    if (courseId && q.course?.course_id === courseId) return true;
                    return false;
                });
                setMyQuestions(filtered);
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

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* New Question Form */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800">Gửi câu hỏi</h4>
                                
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
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
                                >
                                    {loading ? "Đang gửi..." : "Gửi câu hỏi"}
                                </button>
                            </div>

                            {/* Answered Questions */}
                            {myQuestions.filter(q => q.status === "ANSWERED" || (q.status === "ASSIGNED" && q.taResponse)).length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-800">Câu hỏi giải đáp</h4>
                                    
                                    {myQuestions
                                        .filter(q => q.status === "ANSWERED" || (q.status === "ASSIGNED" && q.taResponse))
                                        .map((question) => (
                                            <div
                                                key={question.id}
                                                className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
                                            >
                                                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {question.content}
                                                </div>
                                                
                                                {question.taResponse && (
                                                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                                        <p className="text-xs font-semibold text-blue-700 mb-1">
                                                            Phản hồi từ TA:
                                                        </p>
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                            {question.taResponse}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>{formatTime(question.respondedAt || question.createdAt)}</span>
                                                    {question.status === "ANSWERED" && !question.isResolved && (
                                                        <button
                                                            onClick={() => handleMarkResolved(question.id)}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-medium"
                                                        >
                                                            Đánh dấu đã giải quyết
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                {showRating === question.id && (
                                                    <div className="p-3 bg-white rounded border border-gray-200">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                                            Đánh giá câu trả lời:
                                                        </p>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setRating(star)}
                                                                    className={`text-2xl ${
                                                                        star <= rating 
                                                                            ? "text-yellow-400" 
                                                                            : "text-gray-300"
                                                                    } hover:text-yellow-400 transition`}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSubmitRating(question.id, rating)}
                                                                disabled={rating === 0}
                                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
                                                            >
                                                                Gửi đánh giá
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowRating(null);
                                                                    setRating(0);
                                                                }}
                                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {question.isResolved && question.rating && (
                                                    <div className="text-xs text-gray-500">
                                                        Đã giải quyết • Đánh giá: {question.rating}/5 ⭐
                                                    </div>
                                                )}
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

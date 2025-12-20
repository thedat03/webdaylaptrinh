import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import CommentSection from "../../Components/common/CommentSection";
import logo from "../../assets/images/logo.jpg";
import { learningService } from "../../api/learning.service";
import { codeService } from "../../api/code.service";
import { JUDGE0_LANGUAGE_MAP } from "../../constants/judge0Languages";

// --- Logic Helpers (Giữ nguyên) ---
function toYouTubeEmbed(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        if (u.hostname === "youtu.be") {
            return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
        }
        if (u.hostname.includes("youtube.com")) {
            const videoId = u.searchParams.get("v");
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    } catch {
        return url;
    }
}

function parseMarkdownToHTML(text) {
    if (!text) return "";

    const lines = text.split(/\r?\n/);
    let html = "";
    let inList = false;
    let listType = null;
    let inCodeBlock = false;
    let codeBlockContent = "";
    let inSpecialBlock = false;
    let specialBlockType = "";
    let specialBlockContent = "";

    const closeList = () => {
        if (inList) {
            html += listType === "ul" ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
        }
    };

    const closeCodeBlock = () => {
        if (inCodeBlock) {
            html += `<div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded my-6 font-mono text-sm text-gray-900 overflow-x-auto text-left"><pre class="m-0 text-left"><code class="text-left">${escapeHtml(codeBlockContent.trim())}</code></pre></div>`;
            inCodeBlock = false;
            codeBlockContent = "";
        }
    };

    const closeSpecialBlock = () => {
        if (inSpecialBlock) {
            const bgClass = specialBlockType === "INPUT"
                ? "bg-blue-50 border-l-4 border-blue-400"
                : specialBlockType === "OUTPUT"
                    ? "bg-green-50 border-l-4 border-green-400"
                    : "bg-blue-50 border-l-4 border-blue-400";

            html += `<div class="${bgClass} p-4 rounded my-6 font-mono text-sm text-gray-900 overflow-x-auto whitespace-pre-wrap text-left"><pre class="m-0 text-left">${escapeHtml(specialBlockContent.trim())}</pre></div>`;
            inSpecialBlock = false;
            specialBlockType = "";
            specialBlockContent = "";
        }
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        // Special blocks: [INPUT], [OUTPUT], [CODE]
        if (trimmed.match(/^\[(INPUT|OUTPUT|CODE)\]$/i)) {
            closeList();
            closeCodeBlock();
            if (inSpecialBlock) {
                closeSpecialBlock();
            } else {
                specialBlockType = trimmed.slice(1, -1).toUpperCase();
                inSpecialBlock = true;
            }
            return;
        }

        if (inSpecialBlock) {
            specialBlockContent += line + "\n";
            return;
        }

        closeSpecialBlock();

        // Code blocks
        if (trimmed.startsWith("```")) {
            if (inCodeBlock) {
                closeCodeBlock();
            } else {
                closeList();
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockContent += line + "\n";
            return;
        }

        closeCodeBlock();

        if (!trimmed) {
            closeList();
            if (html && !html.endsWith("<br />")) {
                html += "<br />";
            }
            return;
        }

        // Headings
        if (trimmed.startsWith("# ")) {
            closeList();
            html += `<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-6 leading-tight text-left">${escapeHtml(trimmed.slice(2))}</h1>`;
            return;
        }
        if (trimmed.startsWith("## ")) {
            closeList();
            html += `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4 leading-tight text-left">${escapeHtml(trimmed.slice(3))}</h2>`;
            return;
        }
        if (trimmed.startsWith("### ")) {
            closeList();
            html += `<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3 leading-tight text-left">${escapeHtml(trimmed.slice(4))}</h3>`;
            return;
        }
        if (trimmed.startsWith("#### ")) {
            closeList();
            html += `<h4 class="text-lg font-bold text-gray-800 mt-5 mb-2 leading-tight text-left">${escapeHtml(trimmed.slice(5))}</h4>`;
            return;
        }

        // Lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            if (!inList || listType !== "ul") {
                closeList();
                html += '<ul class="list-disc ml-6 mb-5 space-y-1.5 text-left">';
                inList = true;
                listType = "ul";
            }
            let content = trimmed.slice(2);
            content = processInlineMarkdown(content);
            html += `<li class="leading-7 text-left">${content}</li>`;
            return;
        }

        if (trimmed.match(/^\d+\.\s/)) {
            if (!inList || listType !== "ol") {
                closeList();
                html += '<ol class="list-decimal ml-6 mb-5 space-y-1.5 text-left">';
                inList = true;
                listType = "ol";
            }
            let content = trimmed.replace(/^\d+\.\s/, "");
            content = processInlineMarkdown(content);
            html += `<li class="leading-7 text-left">${content}</li>`;
            return;
        }

        // Regular paragraph
        closeList();
        const processed = processInlineMarkdown(trimmed);
        html += `<p class="mb-6 leading-8 text-gray-800 text-left">${processed}</p>`;
    });

    closeList();
    closeCodeBlock();
    closeSpecialBlock();

    return html;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function processInlineMarkdown(text) {
    // Escape HTML first
    let processed = escapeHtml(text);

    // Split by code blocks first to avoid processing inside them
    const codeRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(processed)) !== null) {
        // Add text before code
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: processed.substring(lastIndex, match.index)
            });
        }
        // Add code block
        parts.push({
            type: 'code',
            content: match[1]
        });
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < processed.length) {
        parts.push({
            type: 'text',
            content: processed.substring(lastIndex)
        });
    }

    // Process each part
    processed = parts.map(part => {
        if (part.type === 'code') {
            return `<code class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-sm font-mono">${part.content}</code>`;
        }

        let result = part.content;

        // Bold
        result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        result = result.replace(/\b__(.*?)__\b/g, '<strong class="font-bold text-gray-900">$1</strong>');

        // Italic
        result = result.replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>');
        result = result.replace(/\b_(.*?)_\b/g, '<em class="italic text-gray-600">$1</em>');

        // Links
        result = result.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>'
        );

        return result;
    }).join('');

    return processed;
}

function parseCodeTestCases(raw) {
    if (!raw) return [];
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!Array.isArray(parsed)) return [];
        return parsed.map((tc, index) => ({
            id: index + 1,
            name: tc.name || `Test ${index + 1}`,
            stdin: tc.stdin || "",
            expectedOutput: tc.expectedOutput || "",
            hidden: Boolean(tc.hidden),
        }));
    } catch {
        return [];
    }
}

// --- Component Chính ---
export default function LessonViewer() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const formatMinutes = (minutes) => {
        const total = Number(minutes) || 0;
        if (total <= 0) return "—";
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        if (hours && mins) return `${hours}:${mins.toString().padStart(2, "0")}`;
        if (hours) return `${hours}:00`;
        return `${mins} phút`;
    };

    const getLessonDuration = (l) => {
        if (!l) return "—";
        if (typeof l.durationMinutes === "number") return formatMinutes(l.durationMinutes);
        if (typeof l.duration === "number") return formatMinutes(l.duration);
        if (typeof l.duration === "string" && l.duration.trim().length) return l.duration;
        return "—";
    };

    // --- State & Logic (Giữ nguyên) ---
    const lesson = state?.lesson || null;
    const modules = useMemo(() => state?.modules || [], [state]);
    const rawLessonsByModule = state?.lessonsByModule;
    const lessonsByModule = useMemo(() => rawLessonsByModule || {}, [rawLessonsByModule]);
    const courseId = state?.courseId || null;

    const [expanded, setExpanded] = useState({});
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const userId = localStorage.getItem("id");
    const [accessLoading, setAccessLoading] = useState(true);
    const [canAccess, setCanAccess] = useState(false);

    // Tìm module_id của lesson hiện tại
    const currentModuleId = useMemo(() => {
        if (!lesson || !modules.length) return null;
        for (const module of modules) {
            const lessons = lessonsByModule[module.module_id] || [];
            if (lessons.some(l => l.lesson_id === lesson.lesson_id)) {
                return module.module_id;
            }
        }
        return modules[0]?.module_id || null;
    }, [lesson, modules, lessonsByModule]);

    useEffect(() => {
        let cancelled = false;
        const verifyAccess = async () => {
            if (!courseId) {
                message.warning("Không tìm thấy thông tin khóa học.");
                setAccessLoading(false);
                navigate("/courses");
                return;
            }
            if (!userId) {
                message.info("Vui lòng đăng nhập để tiếp tục.");
                setAccessLoading(false);
                navigate("/login");
                return;
            }
            setAccessLoading(true);
            try {
                const response = await learningService.getEnrollments(userId);
                const allowed = response.success && (response.data || []).some((course) => course.course_id === courseId);
                if (!allowed) {
                    message.warning("Bạn chưa được cấp quyền truy cập khóa học này.");
                    navigate(`/courses/${courseId}`);
                    return;
                }
                if (!cancelled) {
                    setCanAccess(true);
                }
            } finally {
                if (!cancelled) {
                    setAccessLoading(false);
                }
            }
        };
        verifyAccess();
        return () => {
            cancelled = true;
        };
    }, [courseId, userId, navigate]);

    useEffect(() => {
        if (modules && modules.length && !isInitialized) {
            // Chỉ khởi tạo lần đầu: mở chương chứa bài học hiện tại
            const initial = {};
            modules.forEach((m) => {
                initial[m.module_id] = m.module_id === currentModuleId;
            });
            setExpanded(initial);
            setIsInitialized(true);
        } else if (modules && modules.length && isInitialized && currentModuleId) {
            // Khi navigate sang bài học khác, chỉ mở chương chứa bài học đó nếu chưa mở
            // Nhưng không đóng các chương khác
            setExpanded(prev => {
                if (!prev[currentModuleId]) {
                    return { ...prev, [currentModuleId]: true };
                }
                return prev; // Giữ nguyên nếu đã mở
            });
        }
    }, [modules, currentModuleId, isInitialized]);

    const lessonList = useMemo(() => {
        const list = [];
        modules.forEach((module) => {
            const lessons = lessonsByModule[module.module_id] || [];
            lessons.forEach((item, idx) => {
                list.push({
                    ...item,
                    module_id: module.module_id,
                    moduleTitle: module.title,
                    modulePosition: module.position,
                    orderLabel: `${module.position}.${idx + 1}`
                });
            });
        });
        return list;
    }, [modules, lessonsByModule]);

    const totalLessons = lessonList.length;
    const completedLessons = useMemo(() => {
        return lessonList.filter((item) =>
            item.completed || item.isCompleted || item.status === "COMPLETED"
        ).length;
    }, [lessonList]);

    const currentIndex = useMemo(() => {
        return lessonList.findIndex((item) => item.lesson_id === lesson?.lesson_id);
    }, [lessonList, lesson]);

    const previousLesson = currentIndex > 0 ? lessonList[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < lessonList.length - 1
        ? lessonList[currentIndex + 1]
        : null;

    const courseTitle = state?.courseTitle || state?.courseName || lesson?.courseName || "Kiến Thức Nhập Môn IT";

    // Code exercise state
    const [code, setCode] = useState(lesson?.codeSnippet || "");
    const parsedLessonTestCases = useMemo(() => parseCodeTestCases(lesson?.codeTestCases), [lesson]);
    const [testCases, setTestCases] = useState(parsedLessonTestCases);
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [executionResults, setExecutionResults] = useState([]);
    const [runSummary, setRunSummary] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [runError, setRunError] = useState("");
    const embedSrc = useMemo(() => toYouTubeEmbed(lesson?.contentUrl || ""), [lesson]);
    const codeLanguageLabel = useMemo(() => {
        if (!lesson?.codeLanguageId) return null;
        return JUDGE0_LANGUAGE_MAP[lesson.codeLanguageId] || `Judge0 ID ${lesson.codeLanguageId}`;
    }, [lesson]);
    const currentTestCase = testCases[selectedTestCase] || null;
    const currentResult = executionResults[selectedTestCase] || null;
    const passedCount = executionResults.filter((item) => item?.passed).length;

    // Quiz state
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const quizData = useMemo(() => {
        if (lesson?.quizData) {
            try {
                return JSON.parse(lesson.quizData);
            } catch {
                return null;
            }
        }
        return null;
    }, [lesson]);

    useEffect(() => {
        setCode(lesson?.codeSnippet || "");
        setTestCases(parsedLessonTestCases);
        setSelectedTestCase(0);
        setExecutionResults([]);
        setRunSummary(null);
        setRunError("");
    }, [lesson, parsedLessonTestCases]);

    // --- Handlers (Giữ nguyên) ---
    if (!lesson) return null; // Fallback handled in original code, shortened here for brevity
    if (accessLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang kiểm tra quyền truy cập bài học...</p>
            </div>
        );
    }
    if (!canAccess) {
        return null;
    }

    const handleRunCheck = async () => {
        if (!lesson?.lesson_id) return;
        if (!code?.trim()) {
            message.warning("Vui lòng nhập mã trước khi chạy");
            return;
        }
        // Validate lesson configuration
        if (!lesson.codeLanguageId) {
            message.error("Bài học chưa được cấu hình ngôn ngữ Judge0. Vui lòng liên hệ admin.");
            return;
        }
        if (!testCases || testCases.length === 0) {
            message.error("Bài học chưa có test case. Vui lòng liên hệ admin để cấu hình.");
            return;
        }
        setIsRunning(true);
        setRunSummary(null);
        setRunError("");
        try {
            const response = await codeService.runLessonCode(lesson.lesson_id, { sourceCode: code });
            if (response.success) {
                // Check if response has error field (from backend validation)
                if (response.data?.error) {
                    setRunError(response.data.error);
                    message.error(response.data.error);
                    return;
                }
                setExecutionResults(response.data.results || []);
                setRunSummary({ ok: response.data.overallPassed, message: response.data.message });
                if (response.data.overallPassed) {
                    message.success("Chúc mừng! Bạn đã vượt qua tất cả test case.");
                } else {
                    message.warning("Một số test case chưa đạt. Kiểm tra lại kết quả.");
                }
            } else {
                setRunError(response.error);
                message.error(response.error);
            }
        } catch (error) {
            const fallback = error?.message || "Không thể kết nối Judge0.";
            setRunError(fallback);
            message.error(fallback);
        } finally {
            setIsRunning(false);
        }
    };

    const handleQuizSubmit = () => {
        if (selectedAnswer === null) {
            message.warning("Vui lòng chọn một đáp án");
            return;
        }
        const isCorrect = selectedAnswer === quizData.correctAnswer;
        setQuizResult(isCorrect);
        if (isCorrect) {
            message.success("Chúc mừng! Bạn đã trả lời đúng!");
        } else {
            message.error("Đáp án không đúng. Vui lòng thử lại!");
        }
    };

    const handleNavigateLesson = (targetLesson) => {
        if (!targetLesson) return;
        navigate(`/lesson/${targetLesson.lesson_id}`, {
            replace: true,
            state: { lesson: targetLesson, modules, lessonsByModule, courseId }
        });
    };

    const handleAddNote = () => message.info("Tính năng ghi chú đang phát triển");
    const handleGuide = () => message.info("Tài liệu hướng dẫn đang cập nhật");

    // --- UI Render ---
    return (
        <div className="flex flex-col h-screen bg-[#f7f8fb] text-[#232b3b] overflow-hidden font-sans">
            {/* HEADER: Dark Theme giống ảnh */}
            <header className="h-[60px] bg-white flex items-center px-6 justify-between shrink-0 z-50 shadow-[0_4px_20px_rgba(15,23,42,0.08)] border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (courseId) {
                                navigate(`/course/${courseId}`);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                        aria-label="Quay lại"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        <span className="hidden sm:inline">Quay lại</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 shadow ring-1 ring-gray-100 overflow-hidden hover:ring-[#f05123]/60 transition"
                            aria-label="Về trang chủ"
                        >
                            <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                        </button>
                        <div className="text-gray-800">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">LMS</p>
                            <h1 className="text-base font-semibold leading-tight">{courseTitle}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        <div className="relative w-5 h-5">
                            <svg className="transform -rotate-90 w-5 h-5" viewBox="0 0 36 36">
                                <path className="text-gray-300" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path className="text-[#f05123]" strokeDasharray={`${totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                        </div>
                        <span className="tracking-wide">{completedLessons}/{totalLessons || 0} bài học</span>
                    </div>
                    <button onClick={handleAddNote} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                        <span className="text-lg">📝</span> Ghi chú
                    </button>
                    <button onClick={handleGuide} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                        <span className="text-lg">❓</span> Hướng dẫn
                    </button>
                </div>
            </header>

            {/* BODY: Flex layout (Main Content | Sidebar) */}
            <div className="flex flex-1 overflow-hidden">
                {/* MAIN CONTENT (Left) */}
                <main className="flex-1 flex flex-col overflow-y-auto relative scroll-smooth">
                    {/* Video / Content Area */}
                    <div className="w-full bg-white relative">
                        {/* Aspect Ratio Container */}
                        <div className={`w-full ${lesson.type === "QUIZ" ? "min-h-[calc(100vh-50px-60px)]" : "aspect-video max-h-[calc(100vh-50px-60px)]"} mx-auto ${lesson.type === "VIDEO" ? "bg-black" : "bg-white"} flex items-center justify-center`}>
                            {lesson.type === "VIDEO" ? (
                                <iframe
                                    src={embedSrc}
                                    title={lesson.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : lesson.type === "CODE" ? (
                                <div className="flex flex-col w-full h-full bg-white text-gray-800 overflow-hidden">
                                    <div className="flex-1 flex gap-0 h-full">
                                        {/* Left: Instructions */}
                                        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50">
                                            <div className="p-6 flex-1 overflow-y-auto">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hướng dẫn làm bài thực hành</h3>
                                                <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700 space-y-4">
                                                    {lesson.description || "Chưa có hướng dẫn cho bài tập này."}
                                                </div>
                                                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                                    <p className="text-sm text-red-800 font-semibold mb-1">Lưu ý</p>
                                                    <p className="text-xs text-red-700">
                                                        Mỗi bài tập sẽ có các bài kiểm tra ẩn, các bạn sẽ không biết được đầu vào và đầu ra của các bài kiểm tra này, hãy cố gắng làm đúng yêu cầu đề bài để vượt qua nó nhé.
                                                    </p>
                                                </div>
                                                <p className="mt-4 text-xs text-gray-500">(Bấm nút kiểm tra để vượt qua bài học này)</p>
                                            </div>
                                        </div>
                                        {/* Right: Code Editor & Test Cases */}
                                        <div className="w-1/2 flex flex-col bg-white">
                                            <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-2 bg-gray-50">
                                                <span className="text-xs font-mono truncate">
                                                    {lesson.codeLanguageId ? `Judge0 #${lesson.codeLanguageId}` : "Chưa cấu hình ngôn ngữ"}
                                                </span>
                                                {codeLanguageLabel && (
                                                    <span className="text-xs text-gray-500 truncate">{codeLanguageLabel}</span>
                                                )}
                                            </div>
                                            <textarea
                                                className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 text-sm resize-none focus:outline-none"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="#include <iostream>&#10;&#10;int main() {&#10;    // Code here...&#10;    return 0;&#10;}"
                                            />
                                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Bài kiểm tra {passedCount}/{testCases.length || 0}
                                                    </span>
                                                    {runSummary && (
                                                        <span className={`text-xs ${runSummary.ok ? "text-green-600" : "text-orange-600"}`}>
                                                            {runSummary.message}
                                                        </span>
                                                    )}
                                                </div>
                                                {testCases.length ? (
                                                    <>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {testCases.map((tc, idx) => {
                                                                const result = executionResults[idx];
                                                                const isSelected = selectedTestCase === idx;
                                                                let statusClass = "bg-white text-gray-700 border border-gray-300";
                                                                if (result) {
                                                                    statusClass = result.passed
                                                                        ? "border-green-500 text-green-700 bg-green-50"
                                                                        : "border-red-500 text-red-700 bg-red-50";
                                                                }
                                                                const baseClass = isSelected ? "ring-2 ring-blue-500" : "";
                                                                return (
                                                                    <button
                                                                        key={tc.id || idx}
                                                                        onClick={() => setSelectedTestCase(idx)}
                                                                        className={`px-3 py-1.5 text-xs font-medium rounded transition ${statusClass} ${baseClass}`}
                                                                    >
                                                                        {tc.name || `Test ${idx + 1}`}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {currentTestCase && (
                                                            <div className="mb-3 space-y-2">
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">Đầu vào</p>
                                                                    <div className="bg-white border text-gray-700 p-2 rounded text-xs font-mono min-h-[40px]">
                                                                        {currentTestCase.stdin || "Không có"}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">Đầu ra mong muốn</p>
                                                                    <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono min-h-[40px]">
                                                                        {currentTestCase.hidden ? "Ẩn (hidden test)" : (currentTestCase.expectedOutput || "Không có")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {currentResult && (
                                                            <div className="mb-3 space-y-2">
                                                                <div className={`p-2 rounded text-xs font-semibold ${currentResult.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                                    {currentResult.status}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">Kết quả thực tế</p>
                                                                    <div className="bg-white border text-gray-800 p-2 rounded text-xs font-mono min-h-[40px] whitespace-pre-wrap">
                                                                        {currentResult.stdout || currentResult.compileOutput || currentResult.stderr || "Không có output"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-gray-500">Bài học chưa được cấu hình test case.</p>
                                                )}
                                                {runError && (
                                                    <div className="mb-3 p-2 rounded text-xs bg-red-50 text-red-700">
                                                        {runError}
                                                    </div>
                                                )}
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handleRunCheck}
                                                        disabled={isRunning || !lesson.codeLanguageId || !testCases || testCases.length === 0}
                                                        className={`px-6 py-2 rounded text-sm font-semibold text-white ${(isRunning || !lesson.codeLanguageId || !testCases || testCases.length === 0) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition`}
                                                    >
                                                        {isRunning ? "ĐANG CHẠY..." : "KIỂM TRA"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : lesson.type === "QUIZ" ? (
                                <div className="w-full h-full bg-white overflow-y-auto">
                                    <div className="max-w-4xl mx-auto p-8">
                                        <div className="mb-6">
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>

                                        </div>
                                        <div className="mb-6">
                                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                                {lesson.description || "Chưa có hướng dẫn cho câu hỏi này."}
                                            </p>
                                        </div>
                                        {quizData && (
                                            <div className="space-y-4 mb-6">
                                                <h2 className="text-xl font-semibold text-gray-900">{quizData.question}</h2>
                                                <div className="space-y-3">
                                                    {quizData.options.map((option, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => !quizResult && setSelectedAnswer(idx)}
                                                            className={`p-4 rounded-lg border-2 cursor-pointer transition ${selectedAnswer === idx
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-gray-200 bg-white hover:border-gray-300"
                                                                } ${quizResult !== null && idx === quizData.correctAnswer ? "border-green-500 bg-green-50" : ""}
                                                            ${quizResult !== null && selectedAnswer === idx && idx !== quizData.correctAnswer ? "border-red-500 bg-red-50" : ""}`}
                                                        >
                                                            <p className="text-gray-800">{option}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={handleQuizSubmit}
                                                    disabled={selectedAnswer === null || quizResult !== null}
                                                    className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                                >
                                                    TRẢ LỜI
                                                </button>
                                                {quizResult !== null && (
                                                    <div className={`p-4 rounded-lg ${quizResult ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                                                        <p className="font-semibold">
                                                            {quizResult ? "✓ Chúc mừng! Bạn đã trả lời đúng!" : "✗ Đáp án không đúng. Vui lòng thử lại!"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : lesson.type === "MATERIAL" ? (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-y-auto">
                                    <div className="max-w-4xl mx-auto p-8 lg:p-12">
                                        {/* Header Section */}
                                        <div className="mb-8 pb-6 border-b border-gray-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                                                    Tài liệu
                                                </span>
                                                {lesson.duration && (
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                                        </svg>
                                                        {lesson.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                                                    {lesson.title}
                                                </h1>
                                                <button
                                                    onClick={() => setIsDiscussionOpen(true)}
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Hỏi đáp
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Cập nhật tháng 11 năm 2025
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10">
                                            <div className="max-w-none">
                                                <div
                                                    className="text-gray-800 break-words material-content text-left"
                                                    style={{
                                                        fontSize: '16px',
                                                        lineHeight: '1.8',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    {lesson.description ? (
                                                        <div
                                                            className="text-left"
                                                            style={{ textAlign: 'left' }}
                                                            dangerouslySetInnerHTML={{
                                                                __html: parseMarkdownToHTML(lesson.description)
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-center py-12 text-gray-400">
                                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <p className="text-lg">Chưa có nội dung cho tài liệu này.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                <div className="text-white/50 text-lg">Nội dung bài đọc / Tài liệu</div>
                            )}
                        </div>
                    </div>

                    {/* Lesson Info & Description (Below Video) */}
                    {lesson.type !== "QUIZ" && lesson.type !== "MATERIAL" && (
                        <div className="max-w-5xl mx-auto w-full p-8 pb-24">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-bold text-[#292929]">{lesson.title}</h1>
                                <button
                                    onClick={() => setIsDiscussionOpen(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Hỏi đáp
                                </button>
                            </div>

                            <div className="text-[#292929] text-base leading-7 whitespace-pre-line">
                                {lesson.description || "Chưa có mô tả cho bài học này."}

                                {lesson.type === "HOMEWORK" && lesson.contentUrl && (
                                    <div className="mt-6">
                                        <a
                                            href={lesson.contentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-[#f05123] font-semibold hover:underline"
                                        >
                                            📥 Tải xuống tài liệu đính kèm
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 text-sm text-gray-500">
                                Cập nhật tháng 11 năm 2025
                            </div>
                        </div>
                    )}

                    {(lesson.type === "QUIZ" || lesson.type === "MATERIAL") && (
                        <div className="max-w-5xl mx-auto w-full p-8 pb-24">
                            <div className="flex items-center justify-end mb-6">
                                <button
                                    onClick={() => setIsDiscussionOpen(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Hỏi đáp
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* SIDEBAR (Right - Tracklist) */}
                <aside className="w-[23%] min-w-[320px] max-w-[400px] border-l border-gray-200 bg-white flex flex-col overflow-hidden z-10">
                    {/* Sidebar Header */}
                    <div className="p-4">
                        <h3 className="font-bold text-gray-800">Nội dung khóa học</h3>
                    </div>

                    {/* Fire Banner */}
                    <div className="mx-4 mb-2 bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-[#f05123] text-white flex items-center justify-center text-lg">🔥</div>
                        <div>
                            <p className="text-xs font-bold text-[#f05123]">Bắt đầu chuỗi ngày học</p>
                            <p className="text-[10px] text-gray-500">Hoàn thành 1 bài để bắt đầu!</p>
                        </div>
                    </div>

                    {/* Modules List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {modules.map((m) => {
                            const lessons = lessonsByModule[m.module_id] || [];
                            const isOpen = expanded[m.module_id];
                            const totalInModule = lessons.length;
                            // Count completed in this module logic skipped for brevity, can be added
                            const completedInModule = lessons.filter(l => l.completed || l.isCompleted || l.status === "COMPLETED").length;

                            return (
                                <div key={m.module_id} className="border-b border-gray-100">
                                    <button
                                        onClick={() => setExpanded(prev => ({ ...prev, [m.module_id]: !prev[m.module_id] }))}
                                        className="w-full px-4 py-3 bg-[#f7f8fa] hover:bg-gray-100 flex items-center justify-between transition group"
                                    >
                                        <div className="text-left">
                                            <h4 className="font-semibold text-sm text-[#333]">{m.position}. {m.title}</h4>
                                            <span className="text-[11px] text-gray-500">
                                                {completedInModule}/{totalInModule} |{" "}
                                                {formatMinutes(
                                                    lessons.reduce((acc, l) => acc + (Number(l.durationMinutes) || Number(l.duration) || 0), 0)
                                                )}
                                            </span>
                                        </div>
                                        <span className={`text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="bg-white">
                                            {lessons.map((l, idx) => {
                                                const isActive = l.lesson_id === lesson.lesson_id;
                                                return (
                                                    <div
                                                        key={l.lesson_id}
                                                        onClick={() => handleNavigateLesson(l)}
                                                        className={`px-4 py-3 flex gap-3 cursor-pointer transition ${isActive ? "bg-[#f051231a]" : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-1 min-w-[24px] pt-1">
                                                            {isActive ? (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#f05123] mb-1"></div>
                                                            ) : (l.completed || l.isCompleted) ? (
                                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${isActive ? "font-medium text-[#333]" : "text-gray-600"}`}>
                                                                {m.position}.{idx + 1} {l.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                                                {getLessonDuration(l)}
                                                            </div>
                                                        </div>
                                                        {l.type === "CODE" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 h-fit font-mono">Code</span>}
                                                        {l.type === "QUIZ" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 h-fit">Quiz</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>

            {/* FOOTER: Fixed Navigation Bar */}
            <footer className="h-[50px] bg-[#f0f0f0] border-t border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
                <div className="font-semibold text-sm text-gray-600 truncate max-w-[40%] flex items-center gap-2">
                    <span className="hidden md:inline">Bài học:</span>
                    <span className="text-[#f05123]">{lesson.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleNavigateLesson(previousLesson)}
                        disabled={!previousLesson}
                        className={`px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold uppercase transition ${previousLesson
                            ? "text-[#f05123] hover:bg-black/5 disabled:opacity-50"
                            : "text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Bài trước
                    </button>

                    <button
                        onClick={() => handleNavigateLesson(nextLesson)}
                        disabled={!nextLesson}
                        className={`px-3 py-1.5 rounded border border-[#f05123] flex items-center gap-1 text-xs font-bold uppercase transition ${nextLesson
                            ? "bg-white text-[#f05123] hover:bg-[#f05123] hover:text-white"
                            : "border-gray-300 text-gray-400 cursor-not-allowed bg-transparent"
                            }`}
                    >
                        Bài tiếp theo
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                <div className="flex items-center gap-4 md:hidden">
                    {/* Mobile toggle sidebar could go here */}
                </div>
            </footer>

            {/* DISCUSSION MODAL (Overlaid) */}
            {isDiscussionOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDiscussionOpen(false)}></div>
                    <div className="relative w-full max-w-[700px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="h-[50px] flex items-center justify-between px-6 border-b">
                            <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                            <button onClick={() => setIsDiscussionOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
                            <CommentSection lessonId={lesson.lesson_id} enableRating={false} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
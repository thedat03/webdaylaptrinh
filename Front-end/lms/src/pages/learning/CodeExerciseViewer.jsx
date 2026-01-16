import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { message } from "antd";
import Confetti from "react-dom-confetti";
import { codeExerciseService } from "../../api/codeExercise.service";
import { JUDGE0_LANGUAGE_MAP } from "../../constants/judge0Languages";
import { parseMarkdownToHTML } from "../../utils/markdownParser";
import CommentSection from "../../Components/common/CommentSection";
import logo from "../../assets/images/logo.jpg";

/**
 * Component để học sinh xem và làm bài tập code
 * Redesigned với layout giống LessonViewer: main content trái, sidebar phải
 */
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

export default function CodeExerciseViewer() {
    const navigate = useNavigate();
    const { exerciseId } = useParams();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("courseId");
    const userId = localStorage.getItem("id");

    const [exercise, setExercise] = useState(null);
    const [allExercises, setAllExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("");
    const [testCases, setTestCases] = useState([]);
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [executionResults, setExecutionResults] = useState([]);
    const [runSummary, setRunSummary] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [runError, setRunError] = useState("");
    const [completedExercises, setCompletedExercises] = useState(new Set());
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);

    const parsedTestCases = useMemo(() => parseCodeTestCases(exercise?.codeTestCases), [exercise]);
    const codeLanguageLabel = useMemo(() => {
        if (!exercise?.codeLanguageId) return null;
        return JUDGE0_LANGUAGE_MAP[exercise.codeLanguageId] || `Judge0 ID ${exercise.codeLanguageId}`;
    }, [exercise]);

    const currentTestCase = testCases[selectedTestCase] || null;
    const currentResult = executionResults[selectedTestCase] || null;
    const passedCount = executionResults.filter((item) => item?.passed).length;

    // Load all exercises for navigation
    useEffect(() => {
        const loadAllExercises = async () => {
            if (!courseId) return;
            try {
                const result = await codeExerciseService.getCodeExercisesByCourseId(courseId);
                if (result.success) {
                    setAllExercises(result.data || []);
                }
            } catch (error) {
                console.error("Error loading all exercises:", error);
            }
        };
        loadAllExercises();
    }, [courseId]);

    // Load current exercise
    useEffect(() => {
        const loadExercise = async () => {
            if (!exerciseId) {
                message.error("Không tìm thấy bài tập");
                navigate(-1);
                return;
            }
            setLoading(true);
            try {
                const result = await codeExerciseService.getCodeExerciseById(exerciseId);
                if (result.success && result.data) {
                    setExercise(result.data);
                    setCode(result.data.codeSnippet || "");
                    const parsed = parseCodeTestCases(result.data.codeTestCases);
                    setTestCases(parsed);
                } else {
                    message.error(result.error || "Không thể tải bài tập");
                    navigate(-1);
                }
            } catch (error) {
                console.error("Error loading exercise:", error);
                message.error("Lỗi khi tải bài tập");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        loadExercise();
    }, [exerciseId, navigate]);

    useEffect(() => {
        if (exercise) {
            setCode(exercise.codeSnippet || "");
            setTestCases(parsedTestCases);
            setSelectedTestCase(0);
            setExecutionResults([]);
            setRunSummary(null);
            setRunError("");
            // Load completed exercises from localStorage
            if (userId) {
                const completedKey = `completed_exercises_${userId}`;
                const completed = JSON.parse(localStorage.getItem(completedKey) || "[]");
                setCompletedExercises(new Set(completed));
            }
        }
    }, [exercise, parsedTestCases, userId]);

    // Get current exercise index and navigation
    const currentIndex = useMemo(() => {
        if (!exercise || !allExercises.length) return -1;
        return allExercises.findIndex((e) => e.exercise_id === exercise.exercise_id);
    }, [exercise, allExercises]);

    const previousExercise = currentIndex > 0 ? allExercises[currentIndex - 1] : null;
    const nextExercise = currentIndex >= 0 && currentIndex < allExercises.length - 1 ? allExercises[currentIndex + 1] : null;

    const handleNavigateExercise = (targetExercise) => {
        if (!targetExercise) return;
        navigate(`/code-exercise/${targetExercise.exercise_id}${courseId ? `?courseId=${courseId}` : ""}`, { replace: true });
    };

    const handleRunCheck = async () => {
        if (!exercise?.exercise_id) return;
        if (!code?.trim()) {
            message.warning("Vui lòng nhập mã trước khi chạy");
            return;
        }
        if (!exercise.codeLanguageId) {
            message.error("Bài tập chưa được cấu hình ngôn ngữ Judge0. Vui lòng liên hệ admin.");
            return;
        }
        if (!testCases || testCases.length === 0) {
            message.error("Bài tập chưa có test case. Vui lòng liên hệ admin để cấu hình.");
            return;
        }
        setIsRunning(true);
        setRunSummary(null);
        setRunError("");
        try {
            const response = await codeExerciseService.runCodeExercise(exercise.exercise_id, { sourceCode: code });
            if (response.success) {
                if (response.data?.error) {
                    setRunError(response.data.error);
                    message.error(response.data.error);
                    return;
                }
                setExecutionResults(response.data.results || []);
                setRunSummary({ ok: response.data.overallPassed, message: response.data.message });
                if (response.data.overallPassed) {
                    message.success("Chúc mừng! Bạn đã vượt qua tất cả test case.");
                    // Show fireworks animation
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                    
                    // Đánh dấu bài tập đã hoàn thành
                    setCompletedExercises((prev) => new Set([...prev, exercise.exercise_id]));
                    // Lưu vào localStorage
                    const completedKey = `completed_exercises_${userId}`;
                    const completed = JSON.parse(localStorage.getItem(completedKey) || "[]");
                    if (!completed.includes(exercise.exercise_id)) {
                        completed.push(exercise.exercise_id);
                        localStorage.setItem(completedKey, JSON.stringify(completed));
                    }
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang tải bài tập...</p>
            </div>
        );
    }

    if (!exercise) {
        return null;
    }

    const completedCount = allExercises.filter(ex => completedExercises.has(ex.exercise_id)).length;

    return (
        <div className="flex flex-col h-screen bg-[#f7f8fb] text-[#232b3b] overflow-hidden font-sans">
            {/* HEADER */}
            <header className="h-[60px] bg-white flex items-center px-6 justify-between shrink-0 z-50 shadow-[0_4px_20px_rgba(15,23,42,0.08)] border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (courseId) {
                                navigate(`/courses/${courseId}`);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
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
                        >
                            <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                        </button>
                        <div className="text-gray-800">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">BÀI TẬP CODE</p>
                            <h1 className="text-base font-semibold leading-tight">{exercise.title}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        <div className="relative w-5 h-5">
                            <svg className="transform -rotate-90 w-5 h-5" viewBox="0 0 36 36">
                                <path className="text-gray-300" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path className="text-[#f05123]" strokeDasharray={`${allExercises.length ? Math.round((completedCount / allExercises.length) * 100) : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                        </div>
                        <span className="tracking-wide">{completedCount}/{allExercises.length || 0} bài tập</span>
                    </div>
                    <button onClick={() => setIsDiscussionOpen(true)} className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Hỏi đáp
                    </button>
                </div>
            </header>

            {/* BODY: Flex layout (Main Content | Sidebar) */}
            <div className="flex flex-1 overflow-hidden">
                {/* MAIN CONTENT (Left) */}
                <main className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="flex-1 flex gap-0 h-full">
                        {/* Left: Instructions & Documentation */}
                        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50 overflow-hidden">
                            <div className="p-6 flex-1 overflow-y-auto">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu bài tập</h3>
                                <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700 space-y-4 mb-6">
                                    {exercise.description || "Chưa có mô tả cho bài tập này."}
                                </div>

                                {exercise.documentation && (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu hướng dẫn</h3>
                                        <div
                                            className="text-sm prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: parseMarkdownToHTML(exercise.documentation),
                                            }}
                                        />
                                    </>
                                )}

                                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                    <p className="text-sm text-red-800 font-semibold mb-1">Lưu ý</p>
                                    <p className="text-xs text-red-700">
                                        Mỗi bài tập sẽ có các bài kiểm tra ẩn, các bạn sẽ không biết được đầu vào và đầu ra của các bài kiểm tra này, hãy cố gắng làm đúng yêu cầu đề bài để vượt qua nó nhé.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Code Editor & Test Cases */}
                        <div className="w-1/2 flex flex-col bg-white">
                            <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-2 bg-gray-50">
                                <span className="text-xs font-mono truncate">
                                    {exercise.codeLanguageId ? `Judge0 #${exercise.codeLanguageId}` : "Chưa cấu hình ngôn ngữ"}
                                </span>
                                {codeLanguageLabel && <span className="text-xs text-gray-500 truncate">{codeLanguageLabel}</span>}
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
                                                        {currentTestCase.hidden ? "Ẩn (hidden test)" : currentTestCase.expectedOutput || "Không có"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {currentResult && (
                                            <div className="mb-3 space-y-2">
                                                <div
                                                    className={`p-2 rounded text-xs font-semibold ${currentResult.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                                                >
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
                                    <p className="text-xs text-gray-500">Bài tập chưa được cấu hình test case.</p>
                                )}
                                {runError && (
                                    <div className="mb-3 p-2 rounded text-xs bg-red-50 text-red-700">{runError}</div>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleRunCheck}
                                        disabled={isRunning || !exercise.codeLanguageId || !testCases || testCases.length === 0}
                                        className={`px-6 py-2 rounded text-sm font-semibold text-white ${
                                            isRunning || !exercise.codeLanguageId || !testCases || testCases.length === 0
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        } transition`}
                                    >
                                        {isRunning ? "ĐANG CHẠY..." : "KIỂM TRA"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* SIDEBAR (Right) */}
                <aside className="w-[23%] min-w-[320px] max-w-[400px] border-l border-gray-200 bg-white flex flex-col overflow-hidden z-10">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">Nội dung khóa học</h3>
                        <p className="text-xs text-gray-500 mt-1">{completedCount}/{allExercises.length} bài tập</p>
                    </div>

                    {/* Fire Banner */}
                    <div className="mx-4 mb-2 bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-[#f05123] text-white flex items-center justify-center text-lg">🔥</div>
                        <div>
                            <p className="text-xs font-bold text-[#f05123]">Bắt đầu chuỗi ngày học</p>
                            <p className="text-[10px] text-gray-500">Hoàn thành 1 bài để bắt đầu!</p>
                        </div>
                    </div>

                    {/* Sidebar Content - Danh sách bài tập */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {allExercises.map((ex, idx) => {
                            const isActive = ex.exercise_id === exercise?.exercise_id;
                            const isCompleted = completedExercises.has(ex.exercise_id);
                            return (
                                <button
                                    key={ex.exercise_id}
                                    onClick={() => handleNavigateExercise(ex)}
                                    className={`w-full p-3 mb-2 rounded-lg text-left transition ${
                                        isActive
                                            ? "bg-[#f051231a] border-2 border-[#f05123]"
                                            : "bg-white border border-gray-200 hover:border-[#f05123] hover:bg-orange-50"
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {isActive ? (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#f05123] mb-1"></div>
                                            ) : isCompleted ? (
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${isActive ? "font-medium text-[#333]" : "text-gray-600"} truncate`}>
                                                {idx + 1}. {ex.title}
                                            </p>
                                            {ex.estimatedMinutes && (
                                                <p className="text-xs text-gray-400 mt-0.5">⏱ {ex.estimatedMinutes}p</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
            </div>

            {/* FOOTER: Fixed Navigation Bar */}
            <footer className="h-[50px] bg-[#f0f0f0] border-t border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
                <div className="font-semibold text-sm text-gray-600 truncate max-w-[40%] flex items-center gap-2">
                    <span className="hidden md:inline">Bài tập:</span>
                    <span className="text-[#f05123]">{exercise.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleNavigateExercise(previousExercise)}
                        disabled={!previousExercise}
                        className={`px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold uppercase transition ${
                            previousExercise
                                ? "text-[#f05123] hover:bg-black/5"
                                : "text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Bài trước
                    </button>

                    <button
                        onClick={() => handleNavigateExercise(nextExercise)}
                        disabled={!nextExercise}
                        className={`px-3 py-1.5 rounded border flex items-center gap-1 text-xs font-bold uppercase transition ${
                            nextExercise
                                ? "border-[#f05123] bg-white text-[#f05123] hover:bg-[#f05123] hover:text-white"
                                : "border-gray-300 text-gray-400 cursor-not-allowed bg-transparent"
                        }`}
                    >
                        Bài tiếp theo
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="text-xs text-gray-500">
                    {currentIndex + 1}/{allExercises.length}
                </div>
            </footer>

            {/* DISCUSSION MODAL (Overlaid) - Giống LessonViewer */}
            {isDiscussionOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsDiscussionOpen(false)}></div>
                    <div className="relative w-full max-w-[700px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="h-[50px] flex items-center justify-between px-6 border-b">
                            <h3 className="font-bold text-gray-800">{exercise.title}</h3>
                            <button onClick={() => setIsDiscussionOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
                            <CommentSection exerciseId={exercise.exercise_id} enableRating={false} />
                        </div>
                    </div>
                </div>
            )}

            {/* Fireworks Animation */}
            {showConfetti && (
                <Confetti
                    active={showConfetti}
                    config={{
                        angle: 90,
                        spread: 360,
                        startVelocity: 40,
                        elementCount: 70,
                        dragFriction: 0.1,
                        duration: 5000,
                        stagger: 3,
                        width: "10px",
                        height: "10px",
                        colors: ["#f05123", "#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#eb4d4b", "#6c5ce7"],
                    }}
                />
            )}
        </div>
    );
}

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import CommentSection from "../../Components/common/CommentSection";
import logo from "../../assets/images/logo.jpg";
import { learningService } from "../../api/learning.service";
import { codeService } from "../../api/code.service";
import { lessonProgressService } from "../../api/lessonProgress.service";
import { courseService } from "../../api/course.service";
import { JUDGE0_LANGUAGE_MAP } from "../../constants/judge0Languages";
import { parseMarkdownToHTML } from "../../utils/markdownParser";

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

// Markdown parser is now imported from utils/markdownParser.js

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
    const { lessonId: urlLessonId } = useParams();
    const urlParams = new URLSearchParams(window.location.search);
    const urlCourseId = urlParams.get("courseId");

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

    // --- State & Logic ---
    const [loadedLesson, setLoadedLesson] = useState(null);
    const [loadedModules, setLoadedModules] = useState([]);
    const [loadedLessonsByModule, setLoadedLessonsByModule] = useState({});
    const [loadedCourseId, setLoadedCourseId] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

    // Use state if available, otherwise use loaded data
    const lesson = state?.lesson || loadedLesson;
    const modules = useMemo(() => state?.modules || loadedModules, [state, loadedModules]);
    const rawLessonsByModule = state?.lessonsByModule || loadedLessonsByModule;
    const lessonsByModule = useMemo(() => rawLessonsByModule || {}, [rawLessonsByModule]);
    const courseId = state?.courseId || loadedCourseId || urlCourseId;

    const [expanded, setExpanded] = useState({});
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const userId = localStorage.getItem("id");
    const [accessLoading, setAccessLoading] = useState(true);
    const [canAccess, setCanAccess] = useState(false);
    const [lessonCompleted, setLessonCompleted] = useState(false);
    const [completedLessonsSet, setCompletedLessonsSet] = useState(new Set());
    // Video progress tracking
    const [videoWatchedTime, setVideoWatchedTime] = useState(0); // Thời gian đã xem (giây)
    const [videoDuration, setVideoDuration] = useState(0); // Tổng thời gian video (giây)
    const [youtubePlayer, setYoutubePlayer] = useState(null);

    // Load data from API if state is not available
    useEffect(() => {
        const loadDataFromAPI = async () => {
            // Only load if we don't have state but have URL params
            if (state?.lesson || !urlLessonId || !urlCourseId) {
                return;
            }

            setLoadingData(true);
            try {
                // Load course, modules, and lessons
                const [, modulesRes] = await Promise.all([
                    courseService.getCourseById(urlCourseId),
                    courseService.getModules(urlCourseId)
                ]);

                if (!modulesRes.success || !Array.isArray(modulesRes.data)) {
                    message.error("Không thể tải dữ liệu khóa học");
                    return;
                }

                const modulesData = modulesRes.data;
                setLoadedModules(modulesData);
                setLoadedCourseId(urlCourseId);

                // Load lessons for each module
                const lessonPromises = modulesData.map(m => courseService.getLessons(m.module_id));
                const lessonResults = await Promise.all(lessonPromises);
                const lessonsMap = {};

                modulesData.forEach((module, index) => {
                    if (lessonResults[index].success && Array.isArray(lessonResults[index].data)) {
                        lessonsMap[module.module_id] = lessonResults[index].data;
                    } else {
                        lessonsMap[module.module_id] = [];
                    }
                });

                setLoadedLessonsByModule(lessonsMap);

                // Find the lesson by lessonId
                let foundLesson = null;
                for (const module of modulesData) {
                    const lessons = lessonsMap[module.module_id] || [];
                    foundLesson = lessons.find(l =>
                        l.lesson_id === urlLessonId ||
                        l.lessonId === urlLessonId ||
                        l.id === urlLessonId
                    );
                    if (foundLesson) break;
                }

                if (foundLesson) {
                    setLoadedLesson(foundLesson);
                } else {
                    message.error("Không tìm thấy bài học");
                    navigate(`/courses/${urlCourseId}`);
                }
            } catch (error) {
                console.error("Error loading lesson data:", error);
                message.error("Lỗi khi tải dữ liệu bài học");
            } finally {
                setLoadingData(false);
            }
        };

        loadDataFromAPI();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlLessonId, urlCourseId, navigate]);

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

    // Handle commentId parameter for navigation
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const commentId = urlParams.get("commentId");
        if (commentId && lesson && !accessLoading && !loadingData) {
            // Always open discussion modal when commentId is present
            setIsDiscussionOpen(true);

            // Wait for comments to load, then scroll
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    commentElement.classList.add("ring-4", "ring-indigo-500", "ring-opacity-50", "rounded-lg");
                    setTimeout(() => {
                        commentElement.classList.remove("ring-4", "ring-indigo-500", "ring-opacity-50");
                    }, 3000);
                } else {
                    // If comment not found, scroll to comments section
                    setTimeout(() => {
                        const commentsSection = document.getElementById("comments-section");
                        if (commentsSection) {
                            commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    }, 300);
                }
                // Clean up URL but keep courseId if present
                const newUrl = urlCourseId
                    ? `${window.location.pathname}?courseId=${urlCourseId}`
                    : window.location.pathname;
                window.history.replaceState({}, "", newUrl);
            }, 1000);
        }
    }, [lesson, accessLoading, loadingData, urlCourseId]);

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
        return lessonList.filter((item) => {
            // Kiểm tra từ completedLessonsSet trước
            if (completedLessonsSet.has(item.lesson_id)) {
                return true;
            }
            // Fallback về các trường cũ
            return item.completed || item.isCompleted || item.status === "COMPLETED";
        }).length;
    }, [lessonList, completedLessonsSet]);

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
    const videoId = useMemo(() => {
        if (!lesson?.contentUrl) return null;
        try {
            const url = new URL(lesson.contentUrl);
            if (url.hostname === "youtu.be") {
                return url.pathname.replace("/", "");
            }
            if (url.hostname.includes("youtube.com")) {
                return url.searchParams.get("v");
            }
        } catch {
            return null;
        }
        return null;
    }, [lesson?.contentUrl]);
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

    const checkLessonCompletionStatus = async () => {
        if (!lesson?.lesson_id || !userId) return;
        try {
            const result = await lessonProgressService.checkLessonCompleted(userId, lesson.lesson_id);
            if (result.success) {
                setLessonCompleted(result.data);
            }
        } catch (error) {
            console.error("Error checking lesson completion:", error);
        }
    };

    const loadAllLessonsCompletionStatus = async () => {
        if (!courseId || !userId) return;
        try {
            const result = await lessonProgressService.getLessonsProgressByCourse(userId, courseId);
            if (result.success && result.data) {
                const completedSet = new Set();
                result.data.forEach(progress => {
                    if (progress.isCompleted && progress.lesson?.lesson_id) {
                        completedSet.add(progress.lesson.lesson_id);
                    }
                });
                setCompletedLessonsSet(completedSet);
            }
        } catch (error) {
            console.error("Error loading lessons completion status:", error);
        }
    };

    useEffect(() => {
        setCode(lesson?.codeSnippet || "");
        setTestCases(parsedLessonTestCases);
        setSelectedTestCase(0);
        setExecutionResults([]);
        setRunSummary(null);
        setRunError("");

        // Kiểm tra trạng thái hoàn thành của bài học
        if (lesson?.lesson_id && userId) {
            checkLessonCompletionStatus();
        }
        
        // Reset video progress khi chuyển lesson
        if (lesson?.type === "VIDEO") {
            setVideoWatchedTime(0);
            setVideoDuration(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson?.lesson_id, parsedLessonTestCases, userId, lesson?.type]);

    // Load trạng thái hoàn thành của tất cả bài học trong khóa học
    useEffect(() => {
        if (courseId && userId) {
            loadAllLessonsCompletionStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, userId]);

    // Progress tracking interval
    let progressInterval = null;

    const startTrackingProgress = (player) => {
        if (progressInterval) return;
        
        progressInterval = setInterval(() => {
            try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                
                if (currentTime && duration) {
                    setVideoDuration(duration);
                    
                    // Lưu watchedTime lớn nhất (để track progress ngay cả khi user tua lại)
                    setVideoWatchedTime(prev => {
                        const maxTime = Math.max(prev || 0, currentTime);
                        const watchedPercent = Math.round((maxTime / duration) * 100);
                        // Debug log mỗi 10%
                        if (watchedPercent % 10 === 0 && watchedPercent > 0) {
                            console.log(`Video progress: ${watchedPercent}% (${Math.round(maxTime)}s / ${Math.round(duration)}s)`);
                        }
                        return maxTime;
                    });
                }
            } catch (e) {
                console.error("Error tracking video progress:", e);
            }
        }, 1000); // Update mỗi giây
    };

    const stopTrackingProgress = () => {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    };

    // Load YouTube IFrame API và khởi tạo player
    useEffect(() => {
        if (lesson?.type !== "VIDEO" || !videoId) {
            // Cleanup nếu không phải video
            stopTrackingProgress();
            if (youtubePlayer) {
                try {
                    youtubePlayer.destroy();
                } catch (e) {
                    console.error("Error destroying YouTube player:", e);
                }
                setYoutubePlayer(null);
            }
            return;
        }

        let playerInstance = null;

        const initializePlayer = () => {
            if (!videoId || !window.YT || !window.YT.Player) return;

            try {
                playerInstance = new window.YT.Player('youtube-player', {
                    videoId: videoId,
                    playerVars: {
                        'playsinline': 1,
                        'enablejsapi': 1,
                        'origin': window.location.origin
                    },
                    events: {
                        'onReady': (event) => {
                            setYoutubePlayer(event.target);
                            const duration = event.target.getDuration();
                            if (duration) {
                                setVideoDuration(duration);
                            }
                        },
                        'onStateChange': (event) => {
                            // State 1 = playing, 2 = paused
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                startTrackingProgress(event.target);
                            } else if (event.data === window.YT.PlayerState.PAUSED) {
                                stopTrackingProgress();
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Error initializing YouTube player:", e);
            }
        };

        // Kiểm tra xem script đã được load chưa
        if (window.YT && window.YT.Player) {
            initializePlayer();
        } else {
            // Load YouTube IFrame API script
            const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
            if (!existingScript) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            // Đợi API load xong
            const originalCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (originalCallback) originalCallback();
                initializePlayer();
            };
        }

        return () => {
            stopTrackingProgress();
            if (playerInstance) {
                try {
                    playerInstance.destroy();
                } catch (e) {
                    console.error("Error destroying YouTube player:", e);
                }
            }
            if (youtubePlayer) {
                try {
                    youtubePlayer.destroy();
                } catch (e) {
                    console.error("Error destroying YouTube player:", e);
                }
                setYoutubePlayer(null);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId, lesson?.type]);

    const initializePlayer = () => {
        if (!videoId || !window.YT || !window.YT.Player) return;

        const player = new window.YT.Player('youtube-player', {
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'enablejsapi': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': (event) => {
                    setYoutubePlayer(event.target);
                    const duration = event.target.getDuration();
                    if (duration) {
                        setVideoDuration(duration);
                    }
                },
                'onStateChange': (event) => {
                    // State 1 = playing, 2 = paused
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        startTrackingProgress(event.target);
                    } else if (event.data === window.YT.PlayerState.PAUSED) {
                        stopTrackingProgress();
                    }
                }
            }
        });
    };

    // Kiểm tra xem đã xem đủ nửa video chưa
    const canMarkAsCompleted = useMemo(() => {
        if (lessonCompleted) return false;
        if (lesson?.type !== "VIDEO") return true; // Cho phép với QUIZ và CODE
        if (!videoDuration || videoDuration === 0) return false; // Chưa có duration
        // Phải xem >= 50% video
        return videoWatchedTime >= videoDuration / 2;
    }, [lessonCompleted, lesson?.type, videoWatchedTime, videoDuration]);

    const markLessonAsCompleted = async () => {
        if (!lesson?.lesson_id || !userId || lessonCompleted) return;
        
        // Kiểm tra điều kiện xem video
        if (lesson?.type === "VIDEO" && !canMarkAsCompleted) {
            const watchedPercent = videoDuration > 0 ? Math.round((videoWatchedTime / videoDuration) * 100) : 0;
            message.warning(`Bạn cần xem ít nhất 50% video để đánh dấu hoàn thành. Hiện tại: ${watchedPercent}%`);
            return;
        }

        try {
            const result = await lessonProgressService.markLessonCompleted(userId, lesson.lesson_id);
            if (result.success) {
                setLessonCompleted(true);
                // Cập nhật set hoàn thành
                setCompletedLessonsSet(prev => new Set([...prev, lesson.lesson_id]));
                message.success("Bài học đã được đánh dấu hoàn thành!");

                // Lưu timestamp vào localStorage để các component khác biết có cập nhật
                localStorage.setItem('lessonProgressLastUpdate', Date.now().toString());

                // Dispatch custom event để các component khác biết cần refresh
                window.dispatchEvent(new CustomEvent('lessonCompleted', {
                    detail: {
                        lessonId: lesson.lesson_id,
                        courseId: courseId,
                        userId: userId
                    }
                }));
            }
        } catch (error) {
            console.error("Error marking lesson as completed:", error);
            message.error("Không thể đánh dấu bài học đã hoàn thành");
        }
    };

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
                    // Tự động đánh dấu bài học đã hoàn thành
                    await markLessonAsCompleted();
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

    const handleQuizSubmit = async () => {
        if (selectedAnswer === null) {
            message.warning("Vui lòng chọn một đáp án");
            return;
        }
        const isCorrect = selectedAnswer === quizData.correctAnswer;
        setQuizResult(isCorrect);
        if (isCorrect) {
            message.success("Chúc mừng! Bạn đã trả lời đúng!");
            // Tự động đánh dấu bài học đã hoàn thành
            await markLessonAsCompleted();
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
                <main className="flex-1 flex flex-col overflow-y-auto relative scroll-smooth">
                    {/* Video / Content Area */}
                    <div className="w-full bg-white relative">
                        {/* Aspect Ratio Container */}
                        <div className={`w-full ${lesson.type === "QUIZ" ? "min-h-[calc(100vh-50px-60px)]" : "aspect-video max-h-[calc(100vh-50px-60px)]"} mx-auto ${lesson.type === "VIDEO" ? "bg-black" : "bg-white"} flex items-center justify-center`}>
                            {lesson.type === "VIDEO" ? (
                                <div className="relative w-full h-full">
                                    {/* YouTube Player Container */}
                                    <div id="youtube-player" className="w-full h-full"></div>
                                    {/* Fallback iframe nếu YouTube API chưa load */}
                                    {!youtubePlayer && embedSrc && (
                                        <iframe
                                            src={embedSrc}
                                            title={lesson.title}
                                            className="w-full h-full absolute inset-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            onLoad={() => {
                                                // Cập nhật thời gian truy cập khi video load
                                                if (userId && lesson.lesson_id) {
                                                    lessonProgressService.updateLessonAccess(userId, lesson.lesson_id);
                                                }
                                            }}
                                        />
                                    )}
                                    {!lessonCompleted && (lesson.type !== "VIDEO" || canMarkAsCompleted) && (
                                        <div className="absolute bottom-4 right-4">
                                            <button
                                                onClick={markLessonAsCompleted}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                Đánh dấu đã xong
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                                <div className="relative w-full h-full">
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
                                                <div className="mb-4">
                                                    <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                                                        {lesson.title}
                                                    </h1>
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
                                    {!lessonCompleted && (lesson.type !== "VIDEO" || canMarkAsCompleted) && (
                                        <div className="absolute bottom-4 right-4">
                                            <button
                                                onClick={markLessonAsCompleted}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                Đánh dấu đã xong
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-white/50 text-lg">Nội dung bài đọc / Tài liệu</div>
                            )}
                        </div>
                    </div>

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
                                                            ) : (completedLessonsSet.has(l.lesson_id) || l.completed || l.isCompleted) ? (
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
                        <div className="flex-1 bg-gray-50 overflow-y-auto p-6" id="comments-section">
                            <CommentSection lessonId={lesson.lesson_id} enableRating={false} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
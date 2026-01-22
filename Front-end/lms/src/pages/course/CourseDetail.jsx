import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { message } from "antd";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import CommentSection from "../../Components/common/CommentSection";
import { courseService } from "../../api/course.service";
import { commentService } from "../../api/comment.service";
import { learningService } from "../../api/learning.service";
import { paymentService } from "../../api/payment.service";
import { cartService } from "../../api/cart.service";
import { authService } from "../../api/auth.service";
import { examService } from "../../api/exam.service";
import { codeExerciseService } from "../../api/codeExercise.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStar, faStarHalfAlt, faClipboardList, faCode, faQuestionCircle, faFileAlt, faPlayCircle, faTachometerAlt, faFilm, faClock, faDesktop } from "@fortawesome/free-solid-svg-icons";

function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [lessonsByModule, setLessonsByModule] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [ratingStats, setRatingStats] = useState({
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: []
    });
    const userId = localStorage.getItem("id");
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollError, setEnrollError] = useState("");
    const [enrollMessage, setEnrollMessage] = useState("");
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState(false);
    const [hasPublishedExam, setHasPublishedExam] = useState(false);
    const [checkingExam, setCheckingExam] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [codeExercises, setCodeExercises] = useState([]);
    const [loadingCodeExercises, setLoadingCodeExercises] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(0);
    const [submittingComment, setSubmittingComment] = useState(false);

    const totalLessons = modules.reduce((sum, m) => sum + ((lessonsByModule[m.module_id] || []).length), 0);
    const totalDurationMinutes = useMemo(() => {
        if (course?.totalDurationMinutes !== undefined && course?.totalDurationMinutes !== null) {
            return course.totalDurationMinutes;
        }
        return modules.reduce((sum, m) => {
            const lessons = lessonsByModule[m.module_id] || [];
            const moduleSum = lessons.reduce((acc, l) => acc + (Number(l.durationMinutes) || 0), 0);
            return sum + moduleSum;
        }, 0);
    }, [course, modules, lessonsByModule]);

    const formattedDuration = useMemo(() => {
        const minutes = Number(totalDurationMinutes) || 0;
        if (minutes <= 0) return "Đang cập nhật";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        // Format as "09 giờ 00 phút"
        const hoursStr = String(hours).padStart(2, '0');
        const minsStr = String(mins).padStart(2, '0');
        return `${hoursStr} giờ ${minsStr} phút`;
    }, [totalDurationMinutes]);
    const firstLesson = useMemo(() => {
        for (const module of modules) {
            const lessons = lessonsByModule[module.module_id] || [];
            if (lessons.length) {
                return {
                    lesson: lessons[0],
                    module,
                };
            }
        }
        return null;
    }, [modules, lessonsByModule]);
    const primaryActionLabel = useMemo(() => {
        if (isEnrolled) return "HỌC NGAY";
        const price = Number(course?.price || 0);
        return price > 0 ? "THANH TOÁN QUA VNPAY" : "HỌC MIỄN PHÍ";
    }, [isEnrolled, course]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, modulesRes] = await Promise.all([
                    courseService.getCourseById(id),
                    courseService.getModules(id)
                ]);

                if (courseRes.success) setCourse(courseRes.data);
                if (modulesRes.success) {
                    setModules(modulesRes.data);
                    const lessonPromises = modulesRes.data.map(m => courseService.getLessons(m.module_id));
                    const lessonResults = await Promise.all(lessonPromises);
                    const map = {};
                    const exp = {};
                    modulesRes.data.forEach((m, idx) => {
                        map[m.module_id] = lessonResults[idx].success ? lessonResults[idx].data : [];
                        exp[m.module_id] = idx === 0; // mở chương đầu
                    });
                    setLessonsByModule(map);
                    setExpanded(exp);
                }
            } catch {
                setError("Failed to load course details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Handle commentId parameter for navigation
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const commentId = urlParams.get("commentId");
        if (commentId && !loading) {
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
                    const commentsSection = document.getElementById("comments-section");
                    if (commentsSection) {
                        commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
                // Clean up URL
                window.history.replaceState({}, "", `/course/${id}`);
            }, 1000);
        }
    }, [location.search, id, loading]);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const result = await commentService.getCommentsByCourse(id);
                if (result.success) {
                    const comments = (result.data || []).filter((c) => typeof c.rating === "number" && c.rating > 0);
                    const total = comments.length;
                    const sum = comments.reduce((acc, curr) => acc + curr.rating, 0);
                    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    comments.forEach((c) => {
                        const star = Math.round(c.rating);
                        if (distribution[star] !== undefined) {
                            distribution[star] += 1;
                        }
                    });
                    const sortedReviews = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
                    setRatingStats({
                        average: total ? sum / total : 0,
                        total,
                        distribution,
                        reviews: sortedReviews
                    });
                }
            } catch (error) {
                console.error("Error fetching course ratings", error);
            }
        };
        fetchRatings();
    }, [id]);

    useEffect(() => {
        const fetchEnrollment = async () => {
            // Giáo viên có thể xem tất cả nội dung mà không cần mua
            if (authService.isInstructorAuthenticated()) {
                setIsEnrolled(true);
                setCheckingEnrollment(false);
                return;
            }

            // Free courses are accessible to everyone
            if (course && (!course.price || Number(course.price) === 0)) {
                setIsEnrolled(true);
                setCheckingEnrollment(false);
                return;
            }

            if (!userId || !id) {
                setIsEnrolled(false);
                return;
            }
            setCheckingEnrollment(true);
            try {
                const response = await learningService.getEnrollments(userId);
                if (response.success) {
                    const enrolled = (response.data || []).some((item) => item.course_id === id);
                    setIsEnrolled(enrolled);
                }
            } finally {
                setCheckingEnrollment(false);
            }
        };
        fetchEnrollment();
    }, [userId, id, course]);

    useEffect(() => {
        const checkPublishedExam = async () => {
            if (!id) return;
            setCheckingExam(true);
            try {
                const result = await examService.getPublishedExams(id);
                setHasPublishedExam(result.success && result.data && result.data.length > 0);
            } catch (error) {
                setHasPublishedExam(false);
            } finally {
                setCheckingExam(false);
            }
        };
        checkPublishedExam();
    }, [id]);

    useEffect(() => {
        const loadCodeExercises = async () => {
            if (!id) return;
            setLoadingCodeExercises(true);
            try {
                const result = await codeExerciseService.getCodeExercisesByCourseId(id);
                if (result.success) {
                    setCodeExercises(result.data || []);
                }
            } catch (error) {
                console.error("Error loading code exercises:", error);
            } finally {
                setLoadingCodeExercises(false);
            }
        };
        loadCodeExercises();
    }, [id]);

    const renderStars = (value = 0, size = "text-xl") => {
        const full = Math.floor(value);
        const hasHalf = value - full >= 0.5;
        return Array.from({ length: 5 }).map((_, idx) => {
            if (idx < full) {
                return <FontAwesomeIcon key={idx} icon={faStar} className={`${size} text-yellow-400`} />;
            }
            if (idx === full && hasHalf) {
                return <FontAwesomeIcon key={idx} icon={faStarHalfAlt} className={`${size} text-yellow-400`} />;
            }
            return <FontAwesomeIcon key={idx} icon={faStar} className={`${size} text-gray-300`} />;
        });
    };

    const renderInteractiveStars = (rating, onRatingChange) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        className="transition-all duration-200 cursor-pointer hover:scale-110 transform"
                    >
                        <FontAwesomeIcon
                            icon={faStar}
                            className={`text-base ${star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                                } hover:text-yellow-500`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            message.warning("Vui lòng nhập nội dung bình luận");
            return;
        }

        if (!userId) {
            message.info("Vui lòng đăng nhập để bình luận");
            navigate("/login");
            return;
        }

        setSubmittingComment(true);
        try {
            const result = await commentService.createComment(
                null,
                id,
                newComment,
                newRating > 0 ? newRating : null,
                null,
                null
            );
            if (result.success) {
                message.success("Bình luận đã được đăng");
                setNewComment("");
                setNewRating(0);
                // Reload comments and ratings
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                message.error(result.error || "Không thể đăng bình luận");
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            message.error("Lỗi khi đăng bình luận");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Helper function to get icon based on lesson type
    const getLessonIcon = (lesson) => {
        const type = (lesson.type || "").toUpperCase();
        
        // Check for QUIZ type
        if (type === "QUIZ" || type.includes("QUIZ") || type.includes("QUESTION") || type.includes("EXAM")) {
            return <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-500 text-base" />;
        }
        
        // Check for CODE type
        if (type === "CODE" || type.includes("CODE") || type.includes("EXERCISE") || type.includes("PROGRAMMING") || type === "HOMEWORK") {
            return <FontAwesomeIcon icon={faCode} className="text-gray-500 text-base" />;
        }
        
        // Check for MATERIAL/DOCUMENT type
        if (type === "MATERIAL" || type.includes("MATERIAL") || type.includes("DOCUMENT") || type.includes("FILE") || type.includes("PDF")) {
            return <FontAwesomeIcon icon={faFileAlt} className="text-gray-500 text-base" />;
        }
        
        // Default to video icon for VIDEO type or unknown types
        return <FontAwesomeIcon icon={faPlayCircle} className="text-orange-500 text-base" />;
    };

    // Helper function to format lesson duration (MM:SS format)
    const formatLessonDuration = (minutes) => {
        const totalMinutes = Number(minutes) || 0;
        if (totalMinutes <= 0) return "";
        // Convert to total seconds first
        const totalSeconds = Math.round(totalMinutes * 60);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        // Format as MM:SS (e.g., 01:48, 23:57, 00:35)
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const imageSrc = useMemo(() => {
        const p = course?.p_link || "";
        if (!p) return "";
        if (p.startsWith("http") || p.startsWith("/api/")) return p;
        return `/api/files/${p}`; // fallback if backend stored only filename
    }, [course]);

    const handleGoToFirstLesson = () => {
        if (!firstLesson) {
            message.info("Khóa học đang cập nhật bài học đầu tiên.");
            return;
        }
        navigate(`/lesson/${firstLesson.lesson.lesson_id}`, {
            state: {
                lesson: firstLesson.lesson,
                modules,
                lessonsByModule,
                courseId: id,
            },
        });
    };

    const handleLessonClick = (lesson) => {
        // Giáo viên có thể xem tất cả bài học
        const isInstructor = authService.isInstructorAuthenticated();
        const isFreeCourse = !course.price || Number(course.price) === 0;

        // Free courses are accessible to everyone, paid courses require enrollment
        if (!isEnrolled && !isInstructor && !isFreeCourse) {
            message.info("Vui lòng thanh toán để mở bài học.");
            return;
        }
        navigate(`/lesson/${lesson.lesson_id}`, {
            state: { lesson, modules, lessonsByModule, courseId: id },
        });
    };

    const handleAddToCart = async () => {
        if (!course) return;
        if (!userId) {
            message.info("Vui lòng đăng nhập để tiếp tục.");
            navigate("/login");
            return;
        }
        if (isEnrolled) {
            message.info("Bạn đã đăng ký khóa học này rồi.");
            return;
        }

        setAddingToCart(true);
        try {
            const result = await cartService.addToCart(userId, course.course_id);
            if (result.success) {
                message.success("Đã thêm vào giỏ hàng!");
                // Dispatch event to update cart count in Navbar
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                if (result.error?.includes("already enrolled")) {
                    message.warning("Bạn đã đăng ký khóa học này rồi.");
                } else if (result.error?.includes("already in cart") || result.error?.includes("CONFLICT")) {
                    message.info("Khóa học đã có trong giỏ hàng.");
                } else {
                    message.error(result.error || "Không thể thêm vào giỏ hàng.");
                }
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi thêm vào giỏ hàng.");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleEnrollClick = async () => {
        if (!course) return;
        if (isEnrolled) {
            handleGoToFirstLesson();
            return;
        }

        const isFreeCourse = !course.price || Number(course.price) === 0;

        // Free courses: allow access without purchase
        if (isFreeCourse) {
            handleGoToFirstLesson();
            return;
        }

        // Paid courses: require payment (which auto-enrolls after success)
        if (!userId) {
            message.info("Vui lòng đăng nhập để tiếp tục.");
            navigate("/login");
            return;
        }

        setEnrollError("");
        setEnrollMessage("");
        setEnrollLoading(true);
        try {
            localStorage.setItem("pendingCourseId", course.course_id);
            localStorage.setItem("pendingCourseName", course.course_name);
            const result = await paymentService.createPayment({
                userId,
                courseId: course.course_id,
            });
            if (result.success && result.data?.paymentUrl) {
                window.location.href = result.data.paymentUrl;
                return;
            }
            setEnrollError(result.error || "Không thể khởi tạo thanh toán.");
        } catch (err) {
            console.error(err);
            setEnrollError("Không thể khởi tạo thanh toán.");
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !course) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Not found"}</div>;

    return (
        <div className="min-h-screen bg-white">
            <Navbar page="courses" />

            <div className="max-w-6xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: main content */}
                <div className="lg:col-span-2 space-y-10 pl-0">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-black mb-3 text-left pl-0">{course.course_name}</h1>
                    <p className="text-base text-black mb-6 text-left pl-0">{course.description || `Học ${course.course_name} cơ bản phù hợp cho người chưa từng học lập trình.`}</p>

                    {/* Learning Outcomes */}
                    {(() => {
                        let parsedOutcomes = [];
                        if (course.learningOutcomes) {
                            try {
                                parsedOutcomes = typeof course.learningOutcomes === 'string'
                                    ? JSON.parse(course.learningOutcomes)
                                    : course.learningOutcomes;
                                if (!Array.isArray(parsedOutcomes)) parsedOutcomes = [];
                            } catch (e) {
                                console.error("Error parsing learningOutcomes:", e);
                                parsedOutcomes = [];
                            }
                        }

                        if (parsedOutcomes.length > 0) {
                            const midPoint = Math.ceil(parsedOutcomes.length / 2);
                            const leftColumn = parsedOutcomes.slice(0, midPoint);
                            const rightColumn = parsedOutcomes.slice(midPoint);

                            return (
                                <div className="bg-white mb-8 pl-0">
                                    <h2 className="text-2xl font-bold text-black mb-6 text-left pl-0">Bạn sẽ học được gì?</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0">
                                        <ul className="space-y-3 list-none pl-0">
                                            {leftColumn.map((outcome, idx) => (
                                                <li key={idx} className="flex gap-3 items-start">
                                                    <span className="text-red-600 font-bold text-lg flex-shrink-0 mt-0.5">✓</span>
                                                    <span className="text-black text-base font-normal">{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <ul className="space-y-3 list-none pl-0">
                                            {rightColumn.map((outcome, idx) => (
                                                <li key={idx + midPoint} className="flex gap-3 items-start">
                                                    <span className="text-red-600 font-bold text-lg flex-shrink-0 mt-0.5">✓</span>
                                                    <span className="text-black text-base font-normal">{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Curriculum header */}
                    <div className="mb-6 pl-0">
                        <h2 className="text-2xl font-bold text-black mb-4 text-left pl-0">Nội dung khóa học</h2>
                        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                            <div className="text-sm text-black">
                                <span className="font-semibold">{modules.length} chương</span>
                                <span className="mx-2">•</span>
                                <span className="font-semibold">{totalLessons} bài học</span>
                                <span className="mx-2">•</span>
                                <span className="font-semibold">Thời lượng {formattedDuration}</span>
                            </div>
                            <button
                                onClick={() => setExpanded(prev => {
                                    const allOpen = Object.values(prev).every(Boolean);
                                    const next = {};
                                    modules.forEach(m => { next[m.module_id] = !allOpen; });
                                    return next;
                                })}
                                className="text-sm font-semibold text-red-600 hover:text-red-700 transition"
                            >
                                {Object.values(expanded).every(Boolean) ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                            </button>
                        </div>
                    </div>

                    {/* Curriculum list */}
                    <div className="space-y-0">
                        {modules.map((m) => {
                            const isExpanded = expanded[m.module_id];
                            const lessonsCount = (lessonsByModule[m.module_id] || []).length;
                            return (
                                <div
                                    key={m.module_id}
                                    className="border border-gray-300 rounded bg-gray-50 mb-2 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpanded(prev => ({ ...prev, [m.module_id]: !prev[m.module_id] }))}
                                        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-100 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-red-600">{isExpanded ? "—" : "+"}</span>
                                            <div>
                                                <p className="text-base font-bold text-black">{m.position}. {m.title}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-normal text-black">{lessonsCount} bài học</span>
                                    </button>
                                    {isExpanded && (
                                        <ul className="divide-y divide-gray-200 bg-white list-none pl-0">
                                            {(lessonsByModule[m.module_id] || []).map((l) => {
                                                const duration = formatLessonDuration(l.durationMinutes || l.duration);
                                                return (
                                                    <li
                                                        key={l.lesson_id}
                                                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
                                                        onClick={() => handleLessonClick(l)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {getLessonIcon(l)}
                                                            <span className="text-sm font-normal text-black">{l.position}. {l.title}</span>
                                                        </div>
                                                        {duration && (
                                                            <span className="text-sm font-normal text-black">{duration}</span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Code Exercises Button - chỉ hiển thị khi đã đăng ký và có bài tập code */}
                    {isEnrolled && codeExercises.length > 0 && (
                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    // Navigate to first exercise or show modal
                                    if (codeExercises.length > 0) {
                                        navigate(`/code-exercise/${codeExercises[0].exercise_id}?courseId=${id}`);
                                    }
                                }}
                                className="w-full py-4 rounded border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all shadow-sm hover:shadow-md group"
                            >
                                <div className="flex items-center justify-between px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition">Bài tập code</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{codeExercises.length} bài tập thực hành lập trình</p>
                                        </div>
                                    </div>
                                    <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Exam Section - chỉ hiển thị khi đã đăng ký và có đề thi */}
                    {isEnrolled && hasPublishedExam && (
                        <div className="mt-8 rounded border border-gray-200 overflow-hidden bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                            <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faClipboardList} className="text-purple-600 text-xl" />
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Đề thi</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Kiểm tra kiến thức của bạn</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5">
                                <button
                                    onClick={() => navigate(`/assessment/${id}`)}
                                    className="w-full py-3 rounded-xl text-white font-semibold transition bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faClipboardList} />
                                    Làm đề thi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Ratings and Comments Section */}
                    <section className="bg-white rounded shadow p-6 border border-gray-100" id="comments-section">
                        <h2 className="text-2xl font-bold text-black mb-6 pl-0">Đánh giá</h2>
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
                            <div className="flex flex-col md:min-w-[180px]">
                                <div className="text-5xl font-bold text-black mb-2">
                                    {ratingStats.average.toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                    {renderStars(ratingStats.average)}
                                </div>
                                <p className="text-sm text-gray-600">
                                    ({ratingStats.total} đánh giá)
                                </p>
                            </div>
                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const percent = ratingStats.total
                                        ? Math.round((ratingStats.distribution[star] / ratingStats.total) * 100)
                                        : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="w-12 text-sm font-normal text-black">{star} sao</span>
                                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full transition-all"
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-10 text-sm text-gray-600 text-right">{percent}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Simple Comment Form */}
                        {authService.isUserAuthenticated() && (
                            <form onSubmit={handleSubmitComment} className="mb-6 pb-6 border-b border-gray-200">
                                <div className="flex items-start gap-3 mb-3">
                                    {renderInteractiveStars(newRating, setNewRating)}
                                </div>
                                <div className="flex gap-3">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-white text-left"
                                        rows="3"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingComment}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submittingComment ? "Đang đăng..." : "Đăng"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Comments List */}
                        <CommentSection courseId={id} hideForm hideHeader />
                    </section>

                    {/* Certificate Section */}
                    <section className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 rounded p-8 border border-indigo-100 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                            <div>
                                <p className="text-sm uppercase tracking-widest text-indigo-500 font-semibold mb-2">Chứng chỉ</p>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Chứng nhận hoàn thành khóa học</h2>
                                <p className="text-gray-600 leading-relaxed mb-3">
                                    Bạn sẽ nhận được giấy chứng nhận hoàn thành khóa học khi hoàn thành tối thiểu
                                    <span className="text-emerald-500 font-semibold"> 80% </span> nội dung.
                                </p>
                                <p className="text-gray-600">
                                    Chứng chỉ có thể dùng để bổ sung hồ sơ ứng tuyển, minh chứng năng lực học tập và
                                    chia sẻ lên mạng xã hội.
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <div className="bg-white rounded shadow-lg p-6 border border-gray-100 max-w-md w-full">
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-gray-500">CERTIFICATE OF COMPLETION</p>
                                        <h3 className="text-xl font-semibold text-gray-800 mt-1">{course.course_name}</h3>
                                    </div>
                                    <div className="h-40 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center px-4">
                                        <p className="text-sm text-gray-500">Giấy chứng nhận mẫu</p>
                                        <p className="text-2xl font-serif text-gray-700 mt-2">LearnIT Academy</p>
                                        <p className="text-xs text-gray-400 mt-2">Được cấp khi hoàn thành ≥ 80% nội dung khóa học</p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                                        <span>Giám đốc đào tạo</span>
                                        <span>Mã xác thực duy nhất</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-200 p-8">
                            <div className="border border-gray-300 rounded-xl p-6 bg-white">
                                <p className="text-center text-sm text-gray-400 tracking-[0.4em]">CERTIFICATE</p>
                                <h3 className="text-center text-3xl font-serif text-gray-800 mt-2">GIẤY CHỨNG NHẬN</h3>
                                <p className="text-center text-sm text-gray-500 mt-1">CERTIFICATE OF COMPLETION</p>
                                <p className="text-center text-2xl font-serif text-gray-700 mt-6">{course.course_name}</p>
                                <p className="text-center text-gray-500 mt-2">Đã hoàn thành khóa học với thành tích xuất sắc</p>
                                <div className="mt-10 flex justify-between text-xs text-gray-400">
                                    <span>Giám đốc đào tạo</span>
                                    <span>Mã xác thực</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: sidebar */}
                <div>
                    <div className="bg-white rounded shadow p-4 sticky top-6">
                        {/* Video thumbnail with play button */}
                        <div
                            className="relative rounded overflow-hidden mb-4 aspect-video cursor-pointer group"
                            onClick={() => course.y_link && setShowVideoModal(true)}
                        >
                            {/* Background image */}
                            {imageSrc && (
                                <img
                                    src={imageSrc}
                                    alt={course.course_name}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Gradient overlay từ sáng đến tối */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />

                            {/* Text overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-10">
                                <h3 className="text-xl font-bold mb-2 text-center">{course.course_name}</h3>
                                <p className="text-sm text-yellow-200 text-center mb-4">Kiến thức tổng hợp môn học</p>

                                {/* Play button */}
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faPlay} className="text-gray-800 text-xl ml-1" />
                                </div>

                                {/* CTA text */}
                                <p className="text-white text-sm font-medium">Xem giới thiệu khóa học</p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="text-3xl font-bold text-orange-600 mb-3 text-center">
                            {course.price ? `${Number(course.price).toLocaleString()}đ` : "Miễn phí"}
                        </div>

                        {/* Add to Cart and Register buttons */}
                        {!isEnrolled && Number(course.price || 0) > 0 && (
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || checkingEnrollment}
                                className={`w-full py-3 rounded-xl font-semibold transition mb-3 ${(addingToCart || checkingEnrollment)
                                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                    }`}
                            >
                                {addingToCart ? "ĐANG THÊM..." : "THÊM VÀO GIỎ HÀNG"}
                            </button>
                        )}
                        <button
                            onClick={handleEnrollClick}
                            disabled={enrollLoading || checkingEnrollment}
                            className={`w-full py-3 rounded-xl text-white font-semibold transition mb-3 ${(enrollLoading || checkingEnrollment)
                                ? "bg-indigo-300 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {checkingEnrollment ? "ĐANG KIỂM TRA..." : primaryActionLabel}
                        </button>

                        {enrollError && (
                            <p className="text-sm text-red-500 mb-2">{enrollError}</p>
                        )}

                        {enrollMessage && (
                            <p className="text-sm text-green-600 font-semibold mb-2">{enrollMessage}</p>
                        )}

                        {!isEnrolled && Number(course.price || 0) > 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                                Sau khi thanh toán thành công, bạn sẽ được tự động ghi danh và mở toàn bộ bài học.
                            </p>
                        )}
                        {Number(course.price || 0) === 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                                Khóa học miễn phí - Bạn có thể học ngay mà không cần thanh toán.
                            </p>
                        )}

                        {/* Course details */}
                        <div className="space-y-3 text-sm text-black">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faTachometerAlt} className="text-black text-base" />
                                <span className="font-normal">Trình độ trung bình</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faFilm} className="text-black text-base" />
                                <span className="font-normal">Tổng số <span className="font-bold">{totalLessons}</span> bài học</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faClock} className="text-black text-base" />
                                <span className="font-normal">Thời lượng {(() => {
                                    const minutes = Number(totalDurationMinutes) || 0;
                                    if (minutes <= 0) return "Đang cập nhật";
                                    const hours = Math.floor(minutes / 60);
                                    const mins = minutes % 60;
                                    const hoursStr = String(hours).padStart(2, '0');
                                    const minsStr = String(mins).padStart(2, '0');
                                    return <><span className="font-bold">{hoursStr}</span> giờ <span className="font-bold">{minsStr}</span> phút</>;
                                })()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDesktop} className="text-black text-base" />
                                <span className="font-normal">Học mọi lúc, mọi nơi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Modal Overlay */}
                {showVideoModal && course.y_link && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowVideoModal(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="absolute -top-12 right-0 text-white text-3xl font-bold hover:text-gray-300 transition"
                            >
                                ×
                            </button>

                            {/* Video container */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-4">{course.course_name}</h3>
                                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={course.y_link.replace('watch?v=', 'embed/').split('&')[0]}
                                        title="Course Introduction"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default CourseDetail;



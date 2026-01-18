import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { faBookOpen, faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faChalkboardTeacher, faStar, faQuestionCircle, faPlayCircle, faHandsHelping, faComments, faChartLine, faBell, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c2 from "../../assets/images/html.png";
import c3 from "../../assets/images/sql.jpg";
import c4 from "../../assets/images/python.jpg";
import c5 from "../../assets/images/java.png";
import c6 from "../../assets/images/css.png";
import bannerImg from "../../assets/images/home-banner.png";
import userAvatar from "../../assets/images/user.png";
import { newsService } from "../../api/news.service";
import { commentService } from "../../api/comment.service";
import { courseService } from "../../api/course.service";
import { categoryService } from "../../api/category.service";
import { bannerService } from "../../api/banner.service";
import { promotionService } from "../../api/promotion.service";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";

function TeachingAssistantHome() {
    const navigate = useNavigate();
    const [bannerSlides, setBannerSlides] = useState([]);
    const [bannerCurrent, setBannerCurrent] = useState(0);
    const [bannersLoading, setBannersLoading] = useState(false);

    // TA Stats
    const [taStats, setTaStats] = useState({
        unansweredComments: 0,
        pendingQuestions: 0,
        assignedQuestions: 0,
        studentsNeedingReminder: 0
    });

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadTaStats();
    }, []);

    const loadTaStats = async () => {
        try {
            // Load unanswered comments count
            const commentsRes = await taService.getUnansweredComments();
            if (commentsRes.success && Array.isArray(commentsRes.data)) {
                setTaStats(prev => ({ ...prev, unansweredComments: commentsRes.data.length }));
            }

            // Load pending questions count
            const pendingRes = await taService.getPendingQuestions();
            if (pendingRes.success && Array.isArray(pendingRes.data)) {
                setTaStats(prev => ({ ...prev, pendingQuestions: pendingRes.data.length }));
            }

            // Load assigned questions count
            const assignedRes = await taService.getMyAssignedQuestions();
            if (assignedRes.success && Array.isArray(assignedRes.data)) {
                setTaStats(prev => ({ ...prev, assignedQuestions: assignedRes.data.length }));
            }
        } catch (error) {
            console.error("Error loading TA stats:", error);
        }
    };

    const getAvatarUrl = (url) => {
        if (!url) return userAvatar;
        if (url.startsWith("http") || url.startsWith("/api/")) return url;
        return `/api/files/${url}`;
    };

    // Load banners and promotions from API
    useEffect(() => {
        const loadBannersAndPromotions = async () => {
            setBannersLoading(true);
            try {
                // Load promotions first (priority)
                const promoResult = await promotionService.getAllPromotions();
                const promotions = promoResult.success && Array.isArray(promoResult.data)
                    ? promoResult.data
                        .filter(promo => {
                            const now = new Date();
                            const startDate = new Date(promo.start_date);
                            const endDate = new Date(promo.end_date);
                            return promo.is_active && now >= startDate && now <= endDate;
                        })
                        .slice(0, 3)
                        .map((promo) => ({
                            id: `promo-${promo.promotion_id}`,
                            src: promo.image_url?.startsWith("http") || promo.image_url?.startsWith("/api/")
                                ? promo.image_url
                                : promo.image_url
                                    ? `/api/files/${promo.image_url}`
                                    : null,
                            alt: promo.title || "Khuyến mãi",
                            title: promo.title,
                            link: `/promotion/${promo.promotion_id}`,
                            type: "promotion",
                            promotion: promo,
                        }))
                    : [];

                // Load banners
                const bannerResult = await bannerService.getAllBanners();
                const banners = bannerResult.success && bannerResult.data && Array.isArray(bannerResult.data)
                    ? bannerResult.data.map((banner) => ({
                        id: banner.banner_id,
                        src: banner.image_url?.startsWith("http") || banner.image_url?.startsWith("/api/")
                            ? banner.image_url
                            : `/api/files/${banner.image_url}`,
                        alt: banner.title || "Banner",
                        title: banner.title,
                        link: banner.link_url,
                        type: "banner",
                    }))
                    : [];

                // Combine: promotions first, then banners
                const allSlides = [...promotions, ...banners];
                setBannerSlides(allSlides.length > 0 ? allSlides : [{ id: 1, src: bannerImg, alt: "Default Banner", type: "banner" }]);

                if (promotions.length > 0) {
                    setBannerCurrent(0);
                }
            } catch (error) {
                console.error("Error loading banners and promotions:", error);
                setBannerSlides([{ id: 1, src: bannerImg, alt: "Default Banner", type: "banner" }]);
            } finally {
                setBannersLoading(false);
            }
        };
        loadBannersAndPromotions();
    }, []);

    // Auto-rotate banners
    useEffect(() => {
        if (bannerSlides.length <= 1) return;
        const t = setInterval(() => {
            setBannerCurrent((p) => (p + 1) % bannerSlides.length);
        }, 5000);
        return () => clearInterval(t);
    }, [bannerSlides.length]);

    // Categories and courses
    const [categories, setCategories] = useState([]);
    const [coursesByCategory, setCoursesByCategory] = useState({});
    const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const getThumb = (name = "") => {
        const key = name.toLowerCase();
        if (key.includes("html") || key.includes("css")) return c2;
        if (key.includes("sql")) return c3;
        if (key.includes("python")) return c4;
        if (key.includes("java")) return c5;
        return c6;
    };

    const getCourseImage = (course) => {
        const p = course?.p_link || "";
        if (p) {
            if (p.startsWith("http") || p.startsWith("/api/")) return p;
            return `/api/files/${p}`;
        }
        return getThumb(course?.course_name || "");
    };

    const formatMinutes = (minutes) => {
        const total = Number(minutes) || 0;
        if (total <= 0) return "—";
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        if (hours && mins) return `${hours}h ${mins}m`;
        if (hours) return `${hours}h`;
        return `${mins} phút`;
    };

    const getCourseDurationText = (course) => {
        if (!course) return "—";
        if (typeof course.totalDurationMinutes === "number") {
            return formatMinutes(course.totalDurationMinutes);
        }
        if (typeof course.duration === "number") {
            return formatMinutes(course.duration);
        }
        if (typeof course.duration === "string" && course.duration.trim().length) {
            return course.duration;
        }
        return "—";
    };

    useEffect(() => {
        const load = async () => {
            try {
                setCoursesLoading(true);
                const categoriesRes = await categoryService.getAllCategories();
                if (categoriesRes.success && categoriesRes.data) {
                    const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
                    setCategories(cats);
                    const coursePromises = cats.map(cat =>
                        courseService.getAllCourses({ category: cat.category_id })
                    );
                    const courseResults = await Promise.all(coursePromises);
                    const map = {};
                    cats.forEach((cat, idx) => {
                        if (courseResults[idx].success) {
                            map[cat.category_id] = Array.isArray(courseResults[idx].data)
                                ? courseResults[idx].data
                                : (courseResults[idx].data?.data || []);
                        }
                    });
                    setCoursesByCategory(map);
                }
            } catch (e) {
                console.error('Error loading categories and courses', e);
            } finally {
                setCoursesLoading(false);
            }
        };
        load();

        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Testimonials and news
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    useEffect(() => {
        if (!testimonials.length) return;
        const t = setInterval(() => {
            setTestimonialIndex((p) => (p + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(t);
    }, [testimonials.length]);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                const res = await commentService.getFeaturedComments(10);
                if (res.success && Array.isArray(res.data) && res.data.length) {
                    const mapped = res.data.map((c, idx) => ({
                        id: c.commentId || c.id || idx,
                        name: c.user?.username || c.user?.fullName || "Học viên",
                        avatar: getAvatarUrl(c.user?.avatar),
                        courseName: c.course?.course_name || "Khóa học",
                        quote: c.content || "Không có nội dung",
                        rating: c.rating || 0,
                        createdAt: c.createdAt,
                    }));
                    setTestimonials(mapped);
                    setTestimonialIndex(0);
                } else {
                    setTestimonials([]);
                }
            } catch (e) {
                console.error("Error loading featured comments", e);
                setTestimonials([]);
            }
        };
        loadTestimonials();
    }, []);

    const [newsItems, setNewsItems] = useState([]);

    useEffect(() => {
        const loadNews = async () => {
            const res = await newsService.getFeaturedNews();
            if (res.success && Array.isArray(res.data)) {
                setNewsItems(res.data);
            }
        };
        loadNews();
    }, []);

    const renderCourseCard = (course) => (
        <div
            key={course.course_id}
            className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 group"
            onClick={() => navigate(`/course/${course.course_id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/course/${course.course_id}`)}
        >
            <div className="h-40 w-full relative overflow-hidden">
                <img
                    src={getCourseImage(course)}
                    alt={course.course_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {(course.oldPrice && Number(course.oldPrice) > Number(course.price || 0)) && (
                    <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-rose-600 text-white shadow">
                        -{Math.round(((Number(course.oldPrice) - Number(course.price || 0)) / Number(course.oldPrice)) * 100)}%
                    </span>
                )}
            </div>
            <div className="p-5">
                <span className="inline-block text-[11px] px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold mb-2">Khóa học</span>
                <h3 className="font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem]">{course.course_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="text-indigo-500" />
                    <span>{course.instructor || 'Giảng viên'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[13px] text-gray-600 mb-2">
                    <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faClock} className="text-indigo-500" /> <span>{getCourseDurationText(course)}</span></div>
                    <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faPlayCircle} className="text-indigo-500" /> <span>{course.lessonsCount ?? course.numLessons ?? 0} bài giảng</span></div>
                    <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faQuestionCircle} className="text-indigo-500" /> <span>{course.commentsCount ?? course.questionsCount ?? course.numQuestions ?? 0} bình luận</span></div>
                    <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faStar} className="text-yellow-500" /> <span>{((course.rating || course.stars || 0).toFixed ? (course.rating || course.stars || 0).toFixed(1) : (course.rating || course.stars || 0))}</span></div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-sm mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{(course.rating || course.stars || 0) > i ? '★' : '☆'}</span>
                    ))}
                </div>
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        {course.oldPrice && (
                            <div className="text-gray-400 line-through text-sm">{Number(course.oldPrice).toLocaleString()}đ</div>
                        )}
                        <div className="text-orange-600 font-extrabold text-lg">{course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // TA Quick Actions
    const taQuickActions = [
        {
            title: "Bình luận chưa trả lời",
            icon: faComments,
            color: "from-blue-500 to-blue-600",
            count: taStats.unansweredComments,
            link: "/ta-comments"
        },
        {
            title: "Câu hỏi đang chờ",
            icon: faQuestionCircle,
            color: "from-orange-500 to-orange-600",
            count: taStats.pendingQuestions,
            link: "/ta-questions"
        },
        {
            title: "Theo dõi tiến độ",
            icon: faChartLine,
            color: "from-purple-500 to-purple-600",
            link: "/ta-progress"
        },
        {
            title: "Gửi nhắc nhở",
            icon: faBell,
            color: "from-red-500 to-red-600",
            count: taStats.studentsNeedingReminder,
            link: "/ta-reminders"
        }
    ];

    return (
        <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen relative">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl"></div>
            <div className="pointer-events-none absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-sky-200/40 blur-3xl"></div>

            {hoveredCategoryId && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity"
                    onClick={() => setHoveredCategoryId(null)}
                />
            )}
            <Navbar page="ta-home" />

            {/* Hero Section - Teaching Assistant specific */}
            <section className="px-6 pt-8 pb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FontAwesomeIcon icon={faHandsHelping} className="text-4xl" />
                                <h1 className="text-4xl md:text-5xl font-extrabold">Trang Trợ Giảng</h1>
                            </div>
                            <p className="text-xl md:text-2xl text-indigo-100 mb-6">
                                Hỗ trợ học viên, quản lý bình luận và theo dõi tiến độ học tập
                            </p>
                            <button
                                onClick={() => navigate("/ta-comments")}
                                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-200 shadow-lg"
                            >
                                Bắt đầu hỗ trợ
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Banner Section (Carousel + Categories) */}
            <section className="px-6 pt-4">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                    {/* Left: Course categories menu */}
                    <aside
                        className="col-span-12 md:col-span-3 relative z-50"
                        onMouseEnter={() => {
                            if (hoverTimeout) {
                                clearTimeout(hoverTimeout);
                                setHoverTimeout(null);
                            }
                        }}
                        onMouseLeave={() => {
                            if (!hoveredCategoryId) return;
                            const timeout = setTimeout(() => {
                                setHoveredCategoryId(null);
                            }, 200);
                            setHoverTimeout(timeout);
                        }}
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible h-[440px]">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <span className="text-2xl text-indigo-600">≡</span>
                                <span className="text-gray-800 font-bold text-lg">Các khóa học</span>
                            </div>
                            <ul className="h-[392px] overflow-auto divide-y divide-gray-100">
                                {coursesLoading ? (
                                    <li className="px-5 py-4 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                            <span>Đang tải...</span>
                                        </div>
                                    </li>
                                ) : categories.length === 0 ? (
                                    <li className="px-5 py-4 text-center text-gray-500">Chưa có danh mục</li>
                                ) : (
                                    categories.map((category) => (
                                        <li
                                            key={category.category_id}
                                            className={`px-5 py-3.5 cursor-pointer flex items-center gap-3 relative group transition-all duration-200 ${hoveredCategoryId === category.category_id
                                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600'
                                                : 'hover:bg-gray-50 hover:pl-6'
                                                }`}
                                            onMouseEnter={() => {
                                                if (hoverTimeout) {
                                                    clearTimeout(hoverTimeout);
                                                    setHoverTimeout(null);
                                                }
                                                setHoveredCategoryId(category.category_id);
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faBookOpen}
                                                className={`transition-colors ${hoveredCategoryId === category.category_id
                                                    ? 'text-indigo-600 scale-110'
                                                    : 'text-indigo-500'
                                                    }`}
                                            />
                                            <span className={`text-[15px] transition-all duration-200 ${hoveredCategoryId === category.category_id
                                                ? 'text-indigo-700 font-bold'
                                                : 'text-gray-700 font-medium'
                                                }`}>
                                                {category.name}
                                            </span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </aside>

                    {/* Center: Main banner carousel */}
                    <div className="col-span-12 md:col-span-9 relative">
                        {hoveredCategoryId ? (
                            <div
                                className="absolute inset-0 bg-white rounded-2xl shadow-2xl border-2 border-indigo-300 z-50 p-6 overflow-auto max-h-[440px] animate-fadeIn"
                                onMouseEnter={() => {
                                    if (hoverTimeout) {
                                        clearTimeout(hoverTimeout);
                                        setHoverTimeout(null);
                                    }
                                }}
                                onMouseLeave={() => {
                                    const timeout = setTimeout(() => {
                                        setHoveredCategoryId(null);
                                    }, 200);
                                    setHoverTimeout(timeout);
                                }}
                            >
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                                    <h2 className="text-2xl font-extrabold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        {categories.find(c => c.category_id === hoveredCategoryId)?.name || "Khóa học"}
                                    </h2>
                                    <button
                                        onClick={() => setHoveredCategoryId(null)}
                                        className="text-gray-400 hover:text-gray-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                                    >
                                        ×
                                    </button>
                                </div>
                                {coursesByCategory[hoveredCategoryId]?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {coursesByCategory[hoveredCategoryId].map((course) => (
                                            <div
                                                key={course.course_id}
                                                onClick={() => navigate(`/course/${course.course_id}`)}
                                                className="flex gap-3 p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl cursor-pointer border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md group"
                                            >
                                                <img
                                                    src={getCourseImage(course)}
                                                    alt={course.course_name}
                                                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 mb-1.5 truncate group-hover:text-indigo-600 transition-colors">{course.course_name}</h4>
                                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description || "Không có mô tả"}</p>
                                                    <p className="text-sm font-bold text-orange-600 mb-2">
                                                        {course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                        <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faClock} className="text-indigo-500" /> <span>{getCourseDurationText(course)}</span></div>
                                                        <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faPlayCircle} className="text-indigo-500" /> <span>{course.lessonsCount ?? course.numLessons ?? 0} bài giảng</span></div>
                                                        <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faQuestionCircle} className="text-indigo-500" /> <span>{course.commentsCount ?? course.questionsCount ?? course.numQuestions ?? 0} bình luận</span></div>
                                                        {(course.rating || course.stars) && (
                                                            <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faStar} className="text-yellow-500" /> <span>{((course.rating || course.stars || 0).toFixed ? (course.rating || course.stars || 0).toFixed(1) : (course.rating || course.stars || 0))}</span></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-gray-500">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faBookOpen} className="text-4xl text-gray-400" />
                                        </div>
                                        <p className="text-lg font-medium">Chưa có khóa học nào trong danh mục này</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white h-[440px]">
                                {bannersLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                                    </div>
                                ) : bannerSlides.length > 0 ? (
                                    <>
                                        {bannerSlides.map((s, idx) => (
                                            <div
                                                key={s.id}
                                                className={`absolute inset-0 transition-opacity duration-700 ${bannerCurrent === idx ? "opacity-100 z-10" : "opacity-0 z-0"
                                                    }`}
                                                onClick={() => {
                                                    if (s.link) {
                                                        if (s.type === "promotion") {
                                                            navigate(s.link);
                                                        } else {
                                                            window.open(s.link, "_blank");
                                                        }
                                                    }
                                                }}
                                                style={{ cursor: s.link ? "pointer" : "default" }}
                                            >
                                                {s.src ? (
                                                    <img
                                                        src={s.src}
                                                        alt={s.alt}
                                                        className="w-full h-[440px] object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-[440px] bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
                                                        <div className="text-center text-white p-8">
                                                            <div className="text-6xl mb-4">🎉</div>
                                                            <h3 className="text-3xl font-bold mb-2">{s.title}</h3>
                                                            {s.promotion && (
                                                                <div className="text-4xl font-bold mb-2">
                                                                    -{s.promotion.discount_percent}% OFF
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {s.type === "promotion" && (
                                                    <div className="absolute top-4 right-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-2xl transform rotate-[-12deg]">
                                                        <span className="text-2xl font-bold">-{s.promotion?.discount_percent}%</span>
                                                        <span className="text-[10px]">OFF</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {bannerSlides.length > 1 && (
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                                {bannerSlides.map((s, idx) => (
                                                    <button
                                                        key={s.id}
                                                        aria-label={`slide-${idx + 1}`}
                                                        onClick={() => setBannerCurrent(idx)}
                                                        className={`h-3 rounded-full transition-all duration-300 ${bannerCurrent === idx ? "bg-white w-8 shadow-lg" : "bg-white/50 w-3 hover:bg-white/70"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Chưa có banner
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick features strip */}
            <section className="px-6 pt-6 pb-4">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-2xl bg-white/70 backdrop-blur border border-gray-100 shadow-sm px-4 md:px-8 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="flex items-center gap-2 text-gray-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">📘</span><span className="text-sm font-medium">Học tập</span></div>
                        <div className="flex items-center gap-2 text-gray-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">🧩</span><span className="text-sm font-medium">Luyện tập</span></div>
                        <div className="flex items-center gap-2 text-gray-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">🏁</span><span className="text-sm font-medium">Thi đấu</span></div>
                        <div className="flex items-center gap-2 text-gray-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">🎯</span><span className="text-sm font-medium">Thử thách</span></div>
                        <div className="flex items-center gap-2 text-gray-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">⭐</span><span className="text-sm font-medium">Xếp hạng</span></div>
                        <div className="flex items-center gap-2 text-gray-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">📣</span><span className="text-sm font-medium">Chia sẻ</span></div>
                    </div>
                </div>
            </section>

            {/* TA Quick Actions Section */}
            <section className="px-6 py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-extrabold text-gray-900">Chức năng Trợ giảng</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {taQuickActions.map((action, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(action.link)}
                                className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg relative`}
                            >
                                {action.count !== undefined && action.count > 0 && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {action.count}
                                    </div>
                                )}
                                <FontAwesomeIcon icon={action.icon} className="text-4xl mb-4" />
                                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                                    <span>Xem thêm</span>
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured categories */}
            <section className="px-6 py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-extrabold text-gray-900">Danh mục nổi bật</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {(categories || []).slice(0, 6).map((cat) => (
                            <button
                                key={cat.category_id}
                                onClick={() => {
                                    const el = document.getElementById(`cat-${cat.category_id}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="px-4 py-3 rounded-xl border border-indigo-100 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-sm shadow-sm"
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses by Category Sections */}
            {coursesLoading ? (
                <section className="px-6 pb-16">
                    <div className="max-w-7xl mx-auto text-gray-500 text-center py-20">
                        <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="text-lg font-medium">Đang tải khóa học...</span>
                        </div>
                    </div>
                </section>
            ) : (
                categories.map((category) => {
                    const courses = coursesByCategory[category.category_id] || [];
                    if (courses.length === 0) return null;
                    return (
                        <section key={category.category_id} id={`cat-${category.category_id}`} className="px-6 pb-12">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{category.name}</h2>
                                        <p className="text-gray-600 text-sm">{courses.length} khóa học có sẵn</p>
                                    </div>
                                    <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 group">
                                        Xem thêm
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </a>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {courses.slice(0, 8).map(renderCourseCard)}
                                </div>
                            </div>
                        </section>
                    );
                })
            )}

            {/* About LearnIT */}
            <section className="px-6 py-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="relative order-2 md:order-1">
                        <div className="rounded-3xl h-72 md:h-96 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 border border-gray-200 shadow-inner flex items-center justify-center">
                            <div className="text-7xl md:text-8xl">💡</div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Về LearnIT</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            LearnIT là nền tảng học lập trình với mục tiêu mang đến các khóa học chất lượng, thực tế và luôn cập nhật.
                            Chúng tôi tập trung vào trải nghiệm học tập mượt mà, bài tập thực hành rõ ràng và lộ trình phù hợp cho người mới đến nâng cao.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            LearnIT luôn lắng nghe phản hồi, cải tiến nội dung và bổ sung tính năng mới để học viên học hiệu quả hơn mỗi ngày.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</span> Giảng viên giàu kinh nghiệm</li>
                            <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</span> Bài giảng & bài tập chất lượng</li>
                            <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</span> Lộ trình rõ ràng, cập nhật liên tục</li>
                        </ul>
                        <div className="flex gap-3">
                            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Danh sách khóa học</button>
                            <button onClick={() => navigate('/about')} className="px-5 py-3 rounded-xl bg-white text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-50">Tìm hiểu thêm</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials and News */}
            <section className="px-6 py-16 bg-gradient-to-b from-sky-50 to-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-extrabold text-gray-900">Cảm nhận học viên</h3>
                            {testimonials.length > 0 && (
                                <span className="text-sm text-gray-500">{testimonialIndex + 1}/{testimonials.length}</span>
                            )}
                        </div>
                        {testimonials.length > 0 ? (
                            <>
                                <div className="flex gap-5 items-start mb-6 animate-fadeIn">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={getAvatarUrl(testimonials[testimonialIndex]?.avatar)}
                                            alt="avatar"
                                            className="h-20 w-20 rounded-full object-cover border-4 border-indigo-100 shadow-lg ring-2 ring-indigo-50"
                                            onError={(e) => { e.target.onerror = null; e.target.src = userAvatar; }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                                            <FontAwesomeIcon icon={faStar} className="text-yellow-300 text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="font-bold text-lg text-gray-900">{testimonials[testimonialIndex]?.name}</div>
                                            {testimonials[testimonialIndex]?.rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <FontAwesomeIcon
                                                            key={i}
                                                            icon={faStar}
                                                            className={`text-xs ${i < testimonials[testimonialIndex]?.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                    <span className="text-sm text-gray-600 ml-1">{testimonials[testimonialIndex]?.rating}.0</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-indigo-600 text-sm font-medium mb-3 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
                                            <span className="truncate">{testimonials[testimonialIndex]?.courseName}</span>
                                        </div>
                                        <blockquote className="text-gray-700 text-base leading-relaxed border-l-4 border-indigo-500 pl-4 italic">
                                            "{testimonials[testimonialIndex]?.quote}"
                                        </blockquote>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2 justify-center flex-1">
                                        {testimonials.map((t, idx) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTestimonialIndex(idx)}
                                                className={`h-2.5 rounded-full transition-all duration-300 ${testimonialIndex === idx
                                                    ? "bg-indigo-600 w-8 shadow-md"
                                                    : "bg-gray-300 w-2.5 hover:bg-gray-400"
                                                    }`}
                                                aria-label={`testimonial-${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                    {testimonials.length > 1 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                                aria-label="Previous"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                                aria-label="Next"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faStar} className="text-2xl text-gray-400" />
                                </div>
                                <p>Chưa có cảm nhận nào</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-extrabold text-gray-900">Chia sẻ</h3>
                            <a href="#/news" className="text-indigo-600 font-semibold text-sm">Xem tất cả</a>
                        </div>
                        <div className="space-y-6">
                            {newsItems.slice(0, 6).map((n) => (
                                <div key={n.news_id} className="flex items-start gap-5">
                                    <div className="relative w-36 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={(n.image_url?.startsWith('http') || n.image_url?.startsWith('/api/')) ? n.image_url : `/api/files/${n.image_url}`}
                                            alt={n.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {n.badge && (
                                            <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-pink-500 text-white shadow">{n.badge}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <a href={n.link_url || `#/news/${n.news_id}`} className="font-bold text-gray-900 hover:text-indigo-600 block break-words">
                                            {n.title}
                                        </a>
                                        {n.excerpt && (
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{n.excerpt}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {newsItems.length === 0 && (
                                <div className="text-gray-500">Chưa có tin tức</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 flex items-center justify-center"
                    aria-label="Cuộn lên đầu trang"
                >
                    ↑
                </button>
            )}
        </div>
    );
}

export default TeachingAssistantHome;

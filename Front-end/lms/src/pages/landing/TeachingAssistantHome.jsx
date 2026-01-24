import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { faBookOpen, faClock, faArrowRight, faChevronLeft, faChevronRight, faExternalLinkAlt, faStarHalfAlt, faCode, faLaptopCode, faServer, faLayerGroup, faPuzzlePiece, faBullseye, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { faChalkboardTeacher, faStar, faQuestionCircle, faPlayCircle, faHandsHelping, faComments, faChartLine, faBell, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c2 from "../../assets/images/html.png";
import c3 from "../../assets/images/sql.jpg";
import c4 from "../../assets/images/python.jpg";
import c5 from "../../assets/images/java.png";
import c6 from "../../assets/images/css.png";
import bannerImg from "../../assets/images/home-banner.png";
import userAvatar from "../../assets/images/user.png";
import learnitImage from "../../assets/images/learnit.png";
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

    const getInitials = (username) => {
        if (!username) return "?";
        const parts = username.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
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

    const renderCourseCard = (course) => {
        const rating = course.rating || course.stars || 0;
        const ratingValue = typeof rating === 'number' ? rating.toFixed(1) : rating;

        return (
            <div
                key={course.course_id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer border border-gray-200 group transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col"
                onClick={() => navigate(`/course/${course.course_id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/course/${course.course_id}`)}
            >
                {/* Image */}
                <div className="h-36 w-full relative overflow-hidden bg-gray-100">
                    <img
                        src={getCourseImage(course)}
                        alt={course.course_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                    {/* Discount badge */}
                    {(course.oldPrice && Number(course.oldPrice) > Number(course.price || 0)) && (
                        <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-medium shadow-sm">
                            -{Math.round(((Number(course.oldPrice) - Number(course.price || 0)) / Number(course.oldPrice)) * 100)}%
                        </span>
                    )}
                </div>
                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-base text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {course.course_name}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                        <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-500 text-xs" />
                        <span>{course.instructor || 'Giảng viên'}</span>
                    </div>

                    {/* Rating stars - hiển thị như ảnh */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                                const starIndex = i + 1;
                                const fullStars = Math.floor(rating);
                                const hasHalfStar = rating % 1 >= 0.5 && starIndex === fullStars + 1;

                                if (starIndex <= fullStars) {
                                    // Full star
                                    return (
                                        <FontAwesomeIcon
                                            key={i}
                                            icon={faStar}
                                            className="text-amber-400 text-sm"
                                        />
                                    );
                                } else if (hasHalfStar) {
                                    // Half star
                                    return (
                                        <FontAwesomeIcon
                                            key={i}
                                            icon={faStarHalfAlt}
                                            className="text-amber-400 text-sm"
                                        />
                                    );
                                } else {
                                    // Empty star
                                    return (
                                        <FontAwesomeIcon
                                            key={i}
                                            icon={faStar}
                                            className="text-gray-300 text-sm"
                                        />
                                    );
                                }
                            })}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{ratingValue}</span>
                    </div>

                    {/* Stats - gọn gàng */}
                    <div className="space-y-1.5 mb-3">
                        {/* Lessons */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faPlayCircle} className="text-blue-500 text-xs" />
                            <span>{course.lessonsCount ?? course.numLessons ?? 0} bài giảng</span>
                        </div>
                        {/* Comments */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-500 text-xs" />
                            <span>{course.commentsCount ?? course.questionsCount ?? course.numQuestions ?? 0} bình luận</span>
                        </div>
                    </div>

                    {/* Price - màu đỏ */}
                    <div className="pt-2 border-t border-gray-100 mt-auto">
                        {course.oldPrice && (
                            <div className="text-gray-400 line-through text-xs mb-0.5">
                                {Number(course.oldPrice).toLocaleString()}đ
                            </div>
                        )}
                        <div className={course.price ? "text-red-600 font-bold text-lg" : "text-green-600 font-bold text-lg"}>
                            {course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-slate-50 relative">
            {/* Decorative background blobs - lighter and more subtle */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-300/20 blur-3xl"></div>
            <div className="pointer-events-none absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-sky-300/20 blur-3xl"></div>

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
                        <div className="bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-100 overflow-hidden h-[440px] flex flex-col">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 flex-shrink-0">
                                <span className="text-2xl text-indigo-600">≡</span>
                                <span className="text-slate-900 font-bold text-lg">Các khóa học</span>
                            </div>
                            <ul
                                className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-hide"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                            >
                                {coursesLoading ? (
                                    <li className="px-5 py-4 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                            <span>Đang tải...</span>
                                        </div>
                                    </li>
                                ) : categories.length === 0 ? (
                                    <li className="px-5 py-4 text-center text-slate-500">Chưa có danh mục</li>
                                ) : (
                                    categories.map((category) => (
                                        <li
                                            key={category.category_id}
                                            className={`px-5 py-3.5 cursor-pointer flex items-center gap-3 relative group transition-all duration-200 ${hoveredCategoryId === category.category_id
                                                ? 'bg-indigo-50 border-l-4 border-indigo-600'
                                                : 'hover:bg-slate-50 hover:translate-x-0.5'
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
                                                : 'text-slate-700 font-medium'
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
                                className="absolute inset-0 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-indigo-100 z-50 p-6 overflow-auto max-h-[440px] scrollbar-hide"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
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
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
                                    <h2 className="text-2xl font-extrabold text-slate-900 bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                                        {categories.find(c => c.category_id === hoveredCategoryId)?.name || "Khóa học"}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const el = document.getElementById(`cat-${hoveredCategoryId}`);
                                                if (el) {
                                                    setHoveredCategoryId(null);
                                                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                                                }
                                            }}
                                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
                                        >
                                            Xem tất cả
                                        </button>
                                        <button
                                            onClick={() => setHoveredCategoryId(null)}
                                            className="text-slate-400 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all duration-200"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                {coursesByCategory[hoveredCategoryId]?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {coursesByCategory[hoveredCategoryId].map((course) => (
                                            <div
                                                key={course.course_id}
                                                onClick={() => navigate(`/course/${course.course_id}`)}
                                                className="flex gap-3 p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-sky-50 rounded-xl cursor-pointer border border-slate-100 hover:border-indigo-200 hover:shadow-sm group"
                                            >
                                                <div className="w-24 h-24 rounded-lg flex-shrink-0 bg-slate-100 overflow-hidden">
                                                    <img
                                                        src={getCourseImage(course)}
                                                        alt={course.course_name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = getThumb(course?.course_name || "");
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 mb-1.5 truncate group-hover:text-indigo-600 transition-colors">{course.course_name}</h4>
                                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{course.description || "Không có mô tả"}</p>
                                                    <p className={`text-sm font-bold mb-2 ${course.price ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                                        <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faClock} className="text-sky-500" /> <span>{getCourseDurationText(course)}</span></div>
                                                        <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faPlayCircle} className="text-sky-500" /> <span>{course.lessonsCount ?? course.numLessons ?? 0} bài giảng</span></div>
                                                        <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faQuestionCircle} className="text-sky-500" /> <span>{course.commentsCount ?? course.questionsCount ?? course.numQuestions ?? 0} bình luận</span></div>
                                                        {(course.rating || course.stars) && (
                                                            <div className="flex items-center gap-1.5"><FontAwesomeIcon icon={faStar} className="text-amber-500" /> <span>{((course.rating || course.stars || 0).toFixed ? (course.rating || course.stars || 0).toFixed(1) : (course.rating || course.stars || 0))}</span></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-slate-500">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faBookOpen} className="text-4xl text-slate-400" />
                                        </div>
                                        <p className="text-lg font-medium">Chưa có khóa học nào trong danh mục này</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative overflow-hidden rounded-lg shadow-sm border border-slate-100 bg-white/80 backdrop-blur h-[440px]">
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
                                                    <>
                                                        <img
                                                            src={s.src}
                                                            alt={s.alt}
                                                            className="w-full h-[440px] object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                        {/* Subtle gradient overlay for better text/icon visibility */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 via-transparent to-slate-900/5 pointer-events-none" />
                                                    </>
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
                                                {/* Promotion badge overlay */}
                                                {s.type === "promotion" && (
                                                    <div className="absolute top-4 right-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg transform rotate-[-12deg]">
                                                        <span className="text-2xl font-bold">-{s.promotion?.discount_percent}%</span>
                                                        <span className="text-[10px]">OFF</span>
                                                    </div>
                                                )}
                                                {/* External link indicator for banners */}
                                                {s.type === "banner" && s.link && (
                                                    <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm text-slate-700 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Prev/Next buttons */}
                                        {bannerSlides.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBannerCurrent((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
                                                    }}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                                    aria-label="Previous slide"
                                                >
                                                    <FontAwesomeIcon icon={faChevronLeft} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBannerCurrent((prev) => (prev + 1) % bannerSlides.length);
                                                    }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                                    aria-label="Next slide"
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </button>
                                            </>
                                        )}
                                        {/* Dots */}
                                        {bannerSlides.length > 1 && (
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                                {bannerSlides.map((s, idx) => (
                                                    <button
                                                        key={s.id}
                                                        aria-label={`slide-${idx + 1}`}
                                                        onClick={() => setBannerCurrent(idx)}
                                                        className={`h-3 rounded-full transition-all duration-300 ${bannerCurrent === idx ? "bg-white w-8 shadow-sm" : "bg-white/50 w-3 hover:bg-white/70"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        Chưa có banner
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured categories */}
            <section className="px-6 py-14">
                <div className="max-w-7xl mx-auto">
                    <div className="relative">
                        {/* Container bar with white translucent background */}
                        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100 p-4 relative overflow-hidden">
                            <div
                                id="category-scroll-container"
                                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
                                {(categories || []).map((cat) => {
                                    // Get category image URL or fallback to icon
                                    const getCategoryImageUrl = (category) => {
                                        if (category.image_url) {
                                            if (category.image_url.startsWith("http") || category.image_url.startsWith("/api/")) {
                                                return category.image_url;
                                            }
                                            return `/api/files/${category.image_url}`;
                                        }
                                        return null;
                                    };

                                    // Fallback icon mapping if no image
                                    const getCategoryIconAndColor = (name) => {
                                        const nameLower = name.toLowerCase();
                                        if (nameLower.includes('nền tảng') || nameLower.includes('foundation') || nameLower.includes('platform')) {
                                            return { icon: faCode, color: 'text-orange-500', bgColor: 'bg-orange-100' };
                                        }
                                        if (nameLower.includes('frontend') || nameLower.includes('front-end')) {
                                            return { icon: faLaptopCode, color: 'text-blue-500', bgColor: 'bg-blue-100' };
                                        }
                                        if (nameLower.includes('backend') || nameLower.includes('back-end')) {
                                            return { icon: faServer, color: 'text-slate-600', bgColor: 'bg-slate-200' };
                                        }
                                        if (nameLower.includes('fullstack') || nameLower.includes('full-stack')) {
                                            return { icon: faLayerGroup, color: 'text-sky-400', bgColor: 'bg-sky-100' };
                                        }
                                        if (nameLower.includes('luyện tập') || nameLower.includes('practice') || nameLower.includes('thực hành')) {
                                            return { icon: faPuzzlePiece, color: 'text-green-500', bgColor: 'bg-green-100' };
                                        }
                                        if (nameLower.includes('thử thách') || nameLower.includes('challenge')) {
                                            return { icon: faBullseye, color: 'text-red-500', bgColor: 'bg-red-100' };
                                        }
                                        if (nameLower.includes('chia sẻ') || nameLower.includes('share')) {
                                            return { icon: faBullhorn, color: 'text-orange-500', bgColor: 'bg-orange-100' };
                                        }
                                        return { icon: faBookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
                                    };

                                    const imageUrl = getCategoryImageUrl(cat);
                                    const { icon, color, bgColor } = getCategoryIconAndColor(cat.name);

                                    return (
                                        <button
                                            key={cat.category_id}
                                            onClick={() => {
                                                const el = document.getElementById(`cat-${cat.category_id}`);
                                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}
                                            className="flex flex-col items-center gap-3 px-5 py-4 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all min-w-[120px] flex-shrink-0 group"
                                        >
                                            <div className={`w-14 h-14 rounded-full ${!imageUrl ? bgColor : 'bg-white'} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 overflow-hidden`}>
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={cat.name}
                                                        className="w-full h-full object-cover rounded-full"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.className = `w-14 h-14 rounded-full ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 overflow-hidden`;
                                                        }}
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        icon={icon}
                                                        className={`text-xl ${color}`}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-center text-[13px]">{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Navigation arrows inside the container */}
                            {categories.length > 6 && (
                                <>
                                    <button
                                        onClick={() => {
                                            const container = document.getElementById('category-scroll-container');
                                            if (container) {
                                                container.scrollBy({ left: -200, behavior: 'smooth' });
                                            }
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center z-10 border border-slate-200"
                                        aria-label="Previous categories"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const container = document.getElementById('category-scroll-container');
                                            if (container) {
                                                container.scrollBy({ left: 200, behavior: 'smooth' });
                                            }
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center z-10 border border-slate-200"
                                        aria-label="Next categories"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </>
                            )}
                        </div>
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
                        <section key={category.category_id} id={`cat-${category.category_id}`} className="px-6 pb-14">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        {/* Thanh màu xanh dọc đánh dấu */}
                                        <div className="w-1 h-12 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById(`cat-${category.category_id}`);
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            } else {
                                                navigate('/courses');
                                            }
                                        }}
                                        className="px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md transition-all font-semibold text-sm"
                                    >
                                        Xem tất cả
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {courses.slice(0, 10).map(renderCourseCard)}
                                </div>
                            </div>
                        </section>
                    );
                })
            )}

            {/* About LearnIT */}
            <section className="px-6 py-14">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    {/* Illustration */}
                    <div className="relative order-2 md:order-1">
                        <img
                            src={learnitImage}
                            alt="LearnIT - Nền tảng học lập trình"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    {/* Text */}
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Về LearnIT</h2>
                        <p className="text-base text-slate-600 leading-relaxed mb-4">
                            LearnIT là nền tảng học lập trình với mục tiêu mang đến các khóa học chất lượng, thực tế và luôn cập nhật.
                            Chúng tôi tập trung vào trải nghiệm học tập mượt mà, bài tập thực hành rõ ràng và lộ trình phù hợp cho người mới đến nâng cao.
                        </p>
                        <p className="text-base text-slate-600 leading-relaxed mb-6">
                            LearnIT luôn lắng nghe phản hồi, cải tiến nội dung và bổ sung tính năng mới để học viên học hiệu quả hơn mỗi ngày.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-slate-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</span> Giảng viên giàu kinh nghiệm</li>
                            <li className="flex items-center gap-3 text-slate-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</span> Bài giảng & bài tập chất lượng</li>
                            <li className="flex items-center gap-3 text-slate-700"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">✓</span> Lộ trình rõ ràng, cập nhật liên tục</li>
                        </ul>
                        <div className="flex gap-3">
                            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">Danh sách khóa học</button>
                            <button onClick={() => navigate('/about')} className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-50 transition-all">Tìm hiểu thêm</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lắng nghe & Chia sẻ / Tin tức giáo dục */}
            <section className="px-6 py-14 bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
                    {/* Testimonials - Lắng nghe và chia sẻ */}
                    <div
                        className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden relative"
                    >
                        {/* Decorative accent - góc trên bên phải */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-bl-full"></div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-extrabold text-slate-900 px-6 pt-6 mb-5">Lắng nghe và chia sẻ</h3>
                            {testimonials.length > 0 ? (
                                <div className="px-6 pb-6">
                                    {/* Khu vực thông tin người dùng */}
                                    <div className="mb-5 pb-5 border-b border-slate-100">
                                        <div className="flex items-start gap-4">
                                            <div className="relative flex-shrink-0">
                                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-sm border-2 border-blue-100 ring-2 ring-blue-50 overflow-hidden relative">
                                                    {/* Always show initials as fallback */}
                                                    <span className="text-white font-semibold text-sm absolute inset-0 flex items-center justify-center">
                                                        {getInitials(testimonials[testimonialIndex]?.name || "U")}
                                                    </span>
                                                    {/* Show image if available */}
                                                    {testimonials[testimonialIndex]?.avatar ? (
                                                        <img
                                                            src={getAvatarUrl(testimonials[testimonialIndex].avatar)}
                                                            alt={testimonials[testimonialIndex]?.name || "avatar"}
                                                            className="w-full h-full rounded-full object-cover relative z-10"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                            }}
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                    <FontAwesomeIcon icon={faStar} className="text-amber-300 text-[10px]" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-lg text-slate-900 mb-2">{testimonials[testimonialIndex]?.name}</div>
                                                <div className="space-y-1 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">Tài khoản LearnIT:</span>
                                                        <span className="font-medium text-slate-700">{testimonials[testimonialIndex]?.name?.toLowerCase().replace(/\s+/g, '')}***@gmail.com</span>
                                                    </div>
                                                    {testimonials[testimonialIndex]?.courseName && (
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faBookOpen} className="text-blue-600 text-xs" />
                                                            <span>Đã hoàn thành: <span className="font-medium text-blue-600">{testimonials[testimonialIndex]?.courseName}</span></span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Khu vực nội dung chia sẻ */}
                                    <div className="bg-slate-50 rounded-lg px-5 py-5 relative">
                                        {/* Dấu ngoặc kép lớn trang trí */}
                                        <div className="absolute left-4 top-4 text-6xl text-blue-100 font-serif leading-none select-none">"</div>

                                        <blockquote className="text-slate-700 text-base leading-relaxed pl-8 italic relative z-10">
                                            {testimonials[testimonialIndex]?.quote}
                                        </blockquote>
                                    </div>

                                    {/* Điểm điều hướng dạng chấm tròn */}
                                    <div className="flex gap-2 justify-center mt-5">
                                        {testimonials.map((t, idx) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTestimonialIndex(idx)}
                                                className={`rounded-full transition-all duration-300 ${testimonialIndex === idx
                                                    ? "bg-blue-600 w-2.5 h-2.5 shadow-sm"
                                                    : "bg-slate-300 w-2 h-2 hover:bg-slate-400"
                                                    }`}
                                                aria-label={`testimonial-${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-12 px-6">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faStar} className="text-2xl text-slate-400" />
                                    </div>
                                    <p className="text-sm">Chưa có cảm nhận nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Education news - Các tin tức giáo dục */}
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                        <h3 className="text-xl font-extrabold text-slate-900 px-5 pt-5 mb-0">Các tin tức lập trình</h3>
                        <div className="px-5 pb-5">
                            {newsItems.length > 0 ? (
                                <div className="space-y-3 mt-4">
                                    {newsItems.slice(0, 6).map((n) => {
                                        const newsDate = n.created_at || n.createdAt || n.published_at;
                                        const formattedDate = newsDate ? new Date(newsDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }) : null;
                                        return (
                                            <div
                                                key={n.news_id}
                                                className="flex items-start gap-3 group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors"
                                                onClick={() => navigate(n.link_url || `/news/${n.news_id}`)}
                                            >
                                                <div className="relative w-28 h-18 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                                                    <img
                                                        src={(n.image_url?.startsWith('http') || n.image_url?.startsWith('/api/')) ? n.image_url : `/api/files/${n.image_url}`}
                                                        alt={n.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    {(n.badge || n.category) && (
                                                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-pink-500 text-white shadow-sm font-medium">{n.badge || n.category}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {formattedDate && (
                                                            <span className="text-xs text-slate-500">{formattedDate}</span>
                                                        )}
                                                        {n.category && !n.badge && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 font-medium">{n.category}</span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 hover:text-indigo-600 block break-words transition-colors text-sm leading-snug">
                                                        {n.title}
                                                    </h4>
                                                    {n.excerpt && (
                                                        <p className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">{n.excerpt}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="pt-2">
                                        <button
                                            onClick={() => navigate('/news')}
                                            className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                                        >
                                            Xem tất cả
                                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faBookOpen} className="text-2xl text-slate-400" />
                                    </div>
                                    <p className="text-sm">Chưa có tin tức</p>
                                </div>
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

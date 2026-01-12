import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../Components/common/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { courseService } from "../../api/course.service";
import { learningService } from "../../api/learning.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faPlayCircle, faQuestionCircle, faStar, faSearch } from "@fortawesome/free-solid-svg-icons";

function Courses() {
    const [courses, setCourses] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [displayCount, setDisplayCount] = useState(6);

    const userId = localStorage.getItem("id");
    const navigate = useNavigate();
    const location = useLocation();

    // Get search parameter from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get("search");
        if (searchParam) {
            setSearchTerm(searchParam);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get search parameter from URL
                const params = new URLSearchParams(location.search);
                const searchParam = params.get("search");

                // If there's a search parameter, use search API
                if (searchParam && searchParam.trim()) {
                    const coursesRes = await courseService.getAllCourses({ search: searchParam.trim() });
                    if (coursesRes.success) {
                        setCourses(coursesRes.data);
                    }
                } else {
                    // Otherwise, get all courses
                    const coursesRes = await courseService.getAllCourses();
                    if (coursesRes.success) setCourses(coursesRes.data);
                }

                if (userId) {
                    const enrollmentsRes = await learningService.getEnrollments(userId);
                    if (enrollmentsRes.success) {
                        setEnrolled(enrollmentsRes.data.map((item) => item.course_id));
                    }
                }
            } catch (err) {
                console.error("Error loading courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, location.search]);

    const filteredAndSortedCourses = useMemo(() => {
        // If search came from URL (API search), don't filter again
        const params = new URLSearchParams(location.search);
        const searchParam = params.get("search");
        const isApiSearch = searchParam && searchParam.trim();

        let filtered = courses;

        // Only apply frontend filtering if not using API search
        if (!isApiSearch && searchTerm) {
            filtered = courses.filter(course => {
                const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch;
            });
        }

        // No enrollment filter - all courses are shown

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.course_name.localeCompare(b.course_name);
                case "instructor":
                    return a.instructor.localeCompare(b.instructor);
                case "price": {
                    // Use helper function if available, otherwise inline logic
                    const getPrice = (price) => {
                        if (typeof price === 'number') return price;
                        if (typeof price === 'string') {
                            return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
                        }
                        return 0;
                    };
                    return getPrice(a.price) - getPrice(b.price);
                }
                default:
                    return 0;
            }
        });

        return filtered;
    }, [courses, searchTerm, sortBy, location.search]);

    const displayedCourses = filteredAndSortedCourses.slice(0, displayCount);

    // Helper function to get price as number
    const getPriceAsNumber = (price) => {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
        }
        return 0;
    };

    // Helper function to format price for display
    const formatPrice = (price) => {
        const numPrice = getPriceAsNumber(price);
        return numPrice > 0 ? `${numPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí';
    };

    const loadMore = () => {
        setDisplayCount(prev => prev + 6);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar page="courses" />

            {/* Hero Search Section */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {new URLSearchParams(location.search).get("search")
                                ? `Kết quả tìm kiếm`
                                : "Khám phá khóa học"}
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100">
                            {new URLSearchParams(location.search).get("search")
                                ? `Tìm thấy ${filteredAndSortedCourses.length} khóa học cho "${new URLSearchParams(location.search).get("search")}"`
                                : "Tìm kiếm và học tập với hàng ngàn khóa học chất lượng"}
                        </p>
                    </div>

                    {/* Beautiful Search Bar */}
                    <div className="max-w-3xl mx-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchTerm.trim()) {
                                    navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
                                }
                            }}
                            className="relative"
                        >
                            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khóa học, giảng viên, chủ đề..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-6 py-5 pr-20 text-gray-900 text-lg focus:outline-none placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                    Tìm kiếm
                                </button>
                            </div>
                        </form>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-3 mt-6 justify-center">
                            <button
                                onClick={() => {
                                    setSortBy("name");
                                    setSearchTerm("");
                                    navigate("/courses");
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === "name" && !searchTerm
                                    ? "bg-white text-indigo-600 shadow-lg"
                                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setSortBy("price")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === "price"
                                    ? "bg-white text-indigo-600 shadow-lg"
                                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                                    }`}
                            >
                                Giá thấp đến cao
                            </button>
                            <button
                                onClick={() => setSortBy("instructor")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === "instructor"
                                    ? "bg-white text-indigo-600 shadow-lg"
                                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                                    }`}
                            >
                                Theo giảng viên
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Results Header */}
                {searchTerm && (
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-600">
                                Hiển thị <span className="font-bold text-gray-900">{displayedCourses.length}</span> / <span className="font-bold text-gray-900">{filteredAndSortedCourses.length}</span> khóa học
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                navigate("/courses");
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                        >
                            ✕ Xóa tìm kiếm
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredAndSortedCourses.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-20 text-center">
                        <div className="mb-6">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faSearch} className="text-6xl text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h3>
                        <p className="text-gray-500 text-lg mb-6 max-w-md">
                            {searchTerm
                                ? `Không có kết quả nào cho "${searchTerm}". Hãy thử với từ khóa khác.`
                                : "Hiện tại chưa có khóa học nào. Vui lòng quay lại sau."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    navigate("/courses");
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Xem tất cả khóa học
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {displayedCourses.map((course) => (
                                <div
                                    key={course.course_id}
                                    className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group backdrop-blur-sm"
                                >
                                    <div className="relative overflow-hidden cursor-pointer" onClick={() => navigate(`/courses/${course.course_id}`)}>
                                        <img
                                            src={course.p_link}
                                            alt={course.course_name}
                                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                                {formatPrice(course.price)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/courses/${course.course_id}`)}>
                                            {course.course_name}
                                        </h3>

                                        <p className="text-gray-500 text-sm mb-3 flex items-center">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                            bởi {course.instructor}
                                        </p>

                                        {/* Learning Outcomes Preview */}
                                        {(() => {
                                            let parsedOutcomes = [];
                                            if (course.learningOutcomes) {
                                                try {
                                                    parsedOutcomes = typeof course.learningOutcomes === 'string'
                                                        ? JSON.parse(course.learningOutcomes)
                                                        : course.learningOutcomes;
                                                    if (!Array.isArray(parsedOutcomes)) parsedOutcomes = [];
                                                } catch (e) {
                                                    parsedOutcomes = [];
                                                }
                                            }

                                            if (parsedOutcomes.length > 0) {
                                                return (
                                                    <div className="mb-4 pb-4 border-b border-gray-100">
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Bạn sẽ học được:</h4>
                                                        <ul className="space-y-1.5">
                                                            {parsedOutcomes.slice(0, 3).map((outcome, idx) => (
                                                                <li key={idx} className="flex gap-2 items-start text-xs text-gray-600">
                                                                    <span className="text-red-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                                                                    <span className="line-clamp-1">{outcome}</span>
                                                                </li>
                                                            ))}
                                                            {parsedOutcomes.length > 3 && (
                                                                <li className="text-xs text-blue-600 font-medium">+{parsedOutcomes.length - 3} kết quả khác...</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Course Stats */}
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-[11px]" />
                                                <span>{getCourseDurationText(course)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faPlayCircle} className="text-blue-500 text-[11px]" />
                                                <span>{course.lessonsCount ?? course.numLessons ?? 0} bài giảng</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-500 text-[11px]" />
                                                <span>{course.commentsCount ?? course.questionsCount ?? course.numQuestions ?? 0} bình luận</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-[11px]" />
                                                <span>{((course.rating || course.stars || 0).toFixed ? (course.rating || course.stars || 0).toFixed(1) : (course.rating || course.stars || 0))}</span>
                                            </div>
                                        </div>

                                        {/* Rating stars */}
                                        <div className="flex items-center gap-1 text-amber-500 text-xs mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{(course.rating || course.stars || 0) > i ? '★' : '☆'}</span>
                                            ))}
                                        </div>

                                        {enrolled.includes(course.course_id) ? (
                                            <button
                                                onClick={() => navigate(`/courses/${course.course_id}`)}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-200 shadow-md hover:shadow-lg"
                                            >
                                                ✓ Đã mua - Học ngay
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/courses/${course.course_id}`)}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                {getPriceAsNumber(course.price) > 0 ? "Xem chi tiết" : "Học miễn phí"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {displayedCourses.length < filteredAndSortedCourses.length && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={loadMore}
                                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                                >
                                    Tải thêm khóa học
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Courses;
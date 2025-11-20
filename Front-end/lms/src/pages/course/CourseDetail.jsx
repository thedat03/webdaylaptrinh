import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import CommentSection from "../../Components/common/CommentSection";
import { courseService } from "../../api/course.service";
import { commentService } from "../../api/comment.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";

function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const totalLessons = modules.reduce((sum, m) => sum + ((lessonsByModule[m.module_id] || []).length), 0);

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

    const imageSrc = useMemo(() => {
        const p = course?.p_link || "";
        if (!p) return "";
        if (p.startsWith("http") || p.startsWith("/api/")) return p;
        return `/api/files/${p}`; // fallback if backend stored only filename
    }, [course]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !course) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Not found"}</div>;

    return (
        <div className="min-h-screen bg-white">
            <Navbar page="courses" />

            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: main content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{course.course_name}</h1>
                    <p className="text-gray-600 mb-6">Học {course.course_name} cơ bản phù hợp cho người chưa từng học lập trình.</p>

                    {/* Benefits two columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6 mb-8">
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Hiểu chi tiết các khái niệm cơ bản</li>
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Tự tin phỏng vấn với kiến thức vững chắc</li>
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Nắm vững tính năng hiện đại</li>
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Ghi nhớ qua bài tập trắc nghiệm</li>
                        </ul>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Xây dựng website đầu tiên</li>
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Thành thạo DOM APIs tương tác web</li>
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Nâng cao tư duy qua kiểm tra</li>
                            <li className="flex gap-3"><span className="text-green-600">✓</span> Nhận chứng chỉ hoàn thành</li>
                        </ul>
                    </div>

                    {/* Curriculum header */}
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-orange-500 font-semibold">Lộ trình học tập</p>
                            <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
                        </div>
                        <button
                            onClick={() => setExpanded(prev => {
                                const allOpen = Object.values(prev).every(Boolean);
                                const next = {};
                                modules.forEach(m => { next[m.module_id] = !allOpen; });
                                return next;
                            })}
                            className="text-sm font-semibold text-orange-600 hover:text-orange-500 transition"
                        >
                            {Object.values(expanded).every(Boolean) ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6 text-sm">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">{modules.length} chương</span>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">{totalLessons} bài học</span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">Thời lượng đang cập nhật</span>
                    </div>

                    {/* Curriculum list */}
                    <div className="space-y-3">
                        {modules.map((m) => {
                            const isExpanded = expanded[m.module_id];
                            const lessonsCount = (lessonsByModule[m.module_id] || []).length;
                            return (
                                <div
                                    key={m.module_id}
                                    className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                                >
                                    <button
                                        onClick={() => setExpanded(prev => ({ ...prev, [m.module_id]: !prev[m.module_id] }))}
                                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-semibold text-gray-600">
                                                {isExpanded ? "−" : "+"}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-gray-900">{m.position}. {m.title}</p>
                                                <p className="text-sm text-gray-500 mt-0.5">Nội dung chi tiết từng bài học</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{lessonsCount} bài học</span>
                                    </button>
                                    {isExpanded && (
                                        <ul className="divide-y border-t border-gray-100 bg-gray-50">
                                            {(lessonsByModule[m.module_id] || []).map((l) => (
                                                <li
                                                    key={l.lesson_id}
                                                    className="px-5 py-3 text-sm flex items-center justify-between hover:bg-white cursor-pointer transition"
                                                    onClick={() => navigate(`/lesson/${l.lesson_id}`, { state: { lesson: l, modules, lessonsByModule, courseId: id } })}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-gray-400">#{l.position}</span>
                                                        <span className="text-gray-800">{l.title}</span>
                                                        {l.type && (
                                                            <span className="ml-2 text-gray-500 uppercase text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200">
                                                                {l.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">Bài học</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Ratings Section */}
                    <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6">Đánh giá khóa học</h2>
                        <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
                            <div className="flex flex-col items-center justify-center text-center border-r border-gray-100 pr-4">
                                <div className="text-5xl font-bold text-gray-900">
                                    {ratingStats.average.toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    {renderStars(ratingStats.average)}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    ({ratingStats.total} đánh giá)
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const percent = ratingStats.total
                                        ? Math.round((ratingStats.distribution[star] / ratingStats.total) * 100)
                                        : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-4">
                                            <span className="w-10 text-sm font-semibold text-gray-600">{star} sao</span>
                                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full transition-all"
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-12 text-sm text-gray-500 text-right">{percent}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Comment Section */}
                    <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                        <CommentSection courseId={id} />
                    </section>

                    {/* Certificate Section */}
                    <section className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 rounded-3xl p-8 border border-indigo-100 shadow-sm">
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
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 max-w-md w-full">
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
                        <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8">
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
                    <div className="bg-white rounded-2xl shadow p-4 sticky top-6">
                        {/* Video thumbnail with play button */}
                        <div
                            className="relative rounded-xl overflow-hidden mb-4 h-64 cursor-pointer group"
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
                            {course.price ? `${Number(course.price).toLocaleString()}đ` : 'Miễn phí'}
                        </div>

                        {/* Register button */}
                        <button
                            onClick={() => navigate(`/course/${course.course_id}`)}
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition mb-5"
                        >
                            ĐĂNG KÝ HỌC
                        </button>

                        {/* Course details */}
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                                <span>Trình độ cơ bản</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                                <span>Tổng số {totalLessons} bài học</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                                <span>Học mọi lúc, mọi nơi</span>
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



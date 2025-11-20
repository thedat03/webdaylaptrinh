import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faUsers,
    faGraduationCap,
    faChartLine,
    faEdit,
    faPlusCircle,
    faClipboardCheck,
    faComments,
    faFileAlt,
    faClock,
    faStar,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { courseService } from "../../api/course.service";
import { authService } from "../../api/auth.service";

function TeacherHome() {
    const navigate = useNavigate();
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalLessons: 0,
        averageRating: 0
    });

    useEffect(() => {
        if (!authService.isInstructorAuthenticated()) {
            navigate("/home");
            return;
        }
        loadTeacherData();
    }, []);

    const loadTeacherData = async () => {
        setLoading(true);
        try {
            // Load courses created by this instructor
            const coursesRes = await courseService.getAllCourses();
            if (coursesRes.success && coursesRes.data) {
                const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
                setMyCourses(courses.slice(0, 6));
                setStats({
                    totalCourses: courses.length,
                    totalStudents: courses.reduce((sum, c) => sum + (c.students || 0), 0),
                    totalLessons: courses.reduce((sum, c) => sum + (c.lessonsCount || 0), 0),
                    averageRating: courses.length > 0
                        ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
                        : 0
                });
            }
        } catch (error) {
            console.error("Error loading teacher data:", error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: "Tạo khóa học mới",
            icon: faPlusCircle,
            color: "from-blue-500 to-blue-600",
            hoverColor: "hover:from-blue-600 hover:to-blue-700",
            onClick: () => navigate("/admin?tab=courses"),
            description: "Tạo và xuất bản khóa học mới"
        },
        {
            title: "Quản lý khóa học",
            icon: faBookOpen,
            color: "from-purple-500 to-purple-600",
            hoverColor: "hover:from-purple-600 hover:to-purple-700",
            onClick: () => navigate("/admin?tab=courses"),
            description: "Xem và chỉnh sửa các khóa học của bạn"
        },
        {
            title: "Quản lý học viên",
            icon: faUsers,
            color: "from-green-500 to-green-600",
            hoverColor: "hover:from-green-600 hover:to-green-700",
            onClick: () => navigate("/admin?tab=users"),
            description: "Xem danh sách và tiến độ học viên"
        },
        {
            title: "Chấm điểm & Phản hồi",
            icon: faClipboardCheck,
            color: "from-orange-500 to-orange-600",
            hoverColor: "hover:from-orange-600 hover:to-orange-700",
            onClick: () => navigate("/admin"),
            description: "Chấm bài tập và đưa ra phản hồi"
        }
    ];

    const features = [
        {
            icon: faEdit,
            title: "Cập nhật nội dung",
            description: "Chỉnh sửa bài giảng, thêm bài tập và cập nhật tài liệu khóa học"
        },
        {
            icon: faUsers,
            title: "Quản lý danh sách học viên",
            description: "Xem danh sách học viên đăng ký, theo dõi tiến độ và tương tác"
        },
        {
            icon: faClipboardCheck,
            title: "Chấm điểm và phản hồi",
            description: "Chấm bài tập, đánh giá và đưa ra phản hồi chi tiết cho học viên"
        },
        {
            icon: faChartLine,
            title: "Thống kê và báo cáo",
            description: "Xem thống kê về hiệu suất khóa học và phản hồi từ học viên"
        }
    ];

    return (
        <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="px-6 pt-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-4xl" />
                                <h1 className="text-4xl md:text-5xl font-extrabold">Trang Giáo Viên</h1>
                            </div>
                            <p className="text-xl md:text-2xl text-indigo-100 mb-6">
                                Quản lý khóa học, học viên và nội dung giảng dạy của bạn
                            </p>
                            <button
                                onClick={() => navigate("/admin?tab=courses")}
                                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-200 shadow-lg"
                            >
                                Bắt đầu quản lý
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-6 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBookOpen} className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.totalCourses}</div>
                                    <div className="text-sm text-gray-600">Khóa học</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUsers} className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.totalStudents}</div>
                                    <div className="text-sm text-gray-600">Học viên</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faFileAlt} className="text-purple-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.totalLessons}</div>
                                    <div className="text-sm text-gray-600">Bài giảng</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.averageRating}</div>
                                    <div className="text-sm text-gray-600">Đánh giá TB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Thao tác nhanh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, idx) => (
                            <div
                                key={idx}
                                onClick={action.onClick}
                                className={`bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg`}
                            >
                                <FontAwesomeIcon icon={action.icon} className="text-4xl mb-4" />
                                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                                <p className="text-sm text-white/90">{action.description}</p>
                                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                                    <span>Xem thêm</span>
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* My Courses */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-extrabold text-gray-900">Khóa học của tôi</h2>
                        <button
                            onClick={() => navigate("/admin?tab=courses")}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                        >
                            Xem tất cả
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        </div>
                    ) : myCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.map((course) => (
                                <div
                                    key={course.course_id}
                                    onClick={() => navigate(`/course/${course.course_id}`)}
                                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl cursor-pointer transition-all duration-200"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.course_name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description || "Không có mô tả"}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                                            <span>{course.students || 0} học viên</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                                            <span>{(course.rating || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <FontAwesomeIcon icon={faBookOpen} className="text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-600 text-lg mb-4">Bạn chưa có khóa học nào</p>
                            <button
                                onClick={() => navigate("/admin?tab=courses")}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200"
                            >
                                Tạo khóa học đầu tiên
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 pb-16 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Chức năng dành cho giáo viên</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 hover:shadow-lg transition-all duration-200"
                            >
                                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-6">
                                    <FontAwesomeIcon icon={feature.icon} className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default TeacherHome;


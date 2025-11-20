import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faQuestionCircle,
    faClipboardCheck,
    faChartLine,
    faUsers,
    faComments,
    faFileAlt,
    faCheckCircle,
    faClock,
    faArrowRight,
    faGraduationCap,
    faHandsHelping
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";

function TeachingAssistantHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingQuestions: 0,
        pendingGrading: 0,
        activeStudents: 0,
        completedTasks: 0
    });

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadAssistantData();
    }, []);

    const loadAssistantData = async () => {
        try {
            // Load data for teaching assistant
            // TODO: Replace with actual API calls
            setStats({
                pendingQuestions: 12,
                pendingGrading: 8,
                activeStudents: 45,
                completedTasks: 156
            });
        } catch (error) {
            console.error("Error loading assistant data:", error);
        }
    };

    const quickActions = [
        {
            title: "Trả lời câu hỏi",
            icon: faQuestionCircle,
            color: "from-blue-500 to-blue-600",
            hoverColor: "hover:from-blue-600 hover:to-blue-700",
            onClick: () => navigate("/questions"),
            description: "Xem và trả lời câu hỏi từ học viên",
            badge: stats.pendingQuestions > 0 ? stats.pendingQuestions : null
        },
        {
            title: "Hỗ trợ chấm bài",
            icon: faClipboardCheck,
            color: "from-green-500 to-green-600",
            hoverColor: "hover:from-green-600 hover:to-green-700",
            onClick: () => navigate("/grading"),
            description: "Chấm bài tập và đánh giá bài làm",
            badge: stats.pendingGrading > 0 ? stats.pendingGrading : null
        },
        {
            title: "Theo dõi tiến độ",
            icon: faChartLine,
            color: "from-purple-500 to-purple-600",
            hoverColor: "hover:from-purple-600 hover:to-purple-700",
            onClick: () => navigate("/progress"),
            description: "Xem tiến độ học tập của học viên"
        },
        {
            title: "Quản lý học viên",
            icon: faUsers,
            color: "from-orange-500 to-orange-600",
            hoverColor: "hover:from-orange-600 hover:to-orange-700",
            onClick: () => navigate("/students"),
            description: "Xem danh sách và thông tin học viên"
        }
    ];

    const features = [
        {
            icon: faQuestionCircle,
            title: "Trả lời câu hỏi",
            description: "Hỗ trợ học viên bằng cách trả lời các câu hỏi về bài học, bài tập và giải đáp thắc mắc",
            color: "from-blue-100 to-blue-50"
        },
        {
            icon: faClipboardCheck,
            title: "Hỗ trợ chấm bài",
            description: "Chấm điểm bài tập, đánh giá chất lượng bài làm và đưa ra nhận xét chi tiết",
            color: "from-green-100 to-green-50"
        },
        {
            icon: faChartLine,
            title: "Theo dõi tiến độ học viên",
            description: "Giám sát tiến độ học tập, điểm số và sự tham gia của học viên trong các khóa học",
            color: "from-purple-100 to-purple-50"
        },
        {
            icon: faComments,
            title: "Tương tác với học viên",
            description: "Giao tiếp và hỗ trợ học viên qua diễn đàn, tin nhắn và phản hồi trực tiếp",
            color: "from-orange-100 to-orange-50"
        }
    ];

    const recentTasks = [
        {
            id: 1,
            type: "Câu hỏi",
            title: "Câu hỏi về bài tập JavaScript",
            student: "Nguyễn Văn A",
            time: "2 giờ trước",
            status: "pending"
        },
        {
            id: 2,
            type: "Chấm bài",
            title: "Bài tập React - Assignment 3",
            student: "Trần Thị B",
            time: "5 giờ trước",
            status: "pending"
        },
        {
            id: 3,
            type: "Câu hỏi",
            title: "Thắc mắc về API",
            student: "Lê Văn C",
            time: "1 ngày trước",
            status: "completed"
        }
    ];

    return (
        <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="px-6 pt-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <FontAwesomeIcon icon={faHandsHelping} className="text-4xl" />
                                <h1 className="text-4xl md:text-5xl font-extrabold">Trang Trợ Giảng</h1>
                            </div>
                            <p className="text-xl md:text-2xl text-green-100 mb-6">
                                Hỗ trợ học viên, chấm bài và theo dõi tiến độ học tập
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate("/questions")}
                                    className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all duration-200 shadow-lg"
                                >
                                    Xem câu hỏi
                                </button>
                                <button
                                    onClick={() => navigate("/grading")}
                                    className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-all duration-200 shadow-lg border-2 border-white/20"
                                >
                                    Chấm bài tập
                                </button>
                            </div>
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
                                    <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.pendingQuestions}</div>
                                    <div className="text-sm text-gray-600">Câu hỏi chờ</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faClipboardCheck} className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.pendingGrading}</div>
                                    <div className="text-sm text-gray-600">Bài chấm chờ</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.activeStudents}</div>
                                    <div className="text-sm text-gray-600">Học viên</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.completedTasks}</div>
                                    <div className="text-sm text-gray-600">Đã hoàn thành</div>
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
                                className={`bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg relative`}
                            >
                                {action.badge && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {action.badge}
                                    </div>
                                )}
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

            {/* Recent Tasks */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-extrabold text-gray-900">Nhiệm vụ gần đây</h2>
                        <button
                            onClick={() => navigate("/tasks")}
                            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2"
                        >
                            Xem tất cả
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {recentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.type === "Câu hỏi"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-green-100 text-green-700"
                                                    }`}>
                                                    {task.type}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === "pending"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {task.status === "pending" ? "Chờ xử lý" : "Đã hoàn thành"}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faUsers} className="text-green-500" />
                                                    {task.student}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                                    {task.time}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="ml-4 text-green-600 hover:text-green-700">
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 pb-16 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Chức năng dành cho trợ giảng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-200`}
                            >
                                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mb-6">
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

export default TeachingAssistantHome;


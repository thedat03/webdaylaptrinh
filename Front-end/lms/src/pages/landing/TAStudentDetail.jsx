import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faArrowLeft, 
    faUser, 
    faGraduationCap, 
    faClock, 
    faChartLine,
    faCheckCircle,
    faExclamationCircle,
    faBookOpen,
    faCalendar,
    faBell
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { message, Card, Tag, Progress, Spin, Empty, Button, Timeline, Statistic, Row, Col } from "antd";

function TAStudentDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        if (studentId && courseId) {
            loadStudentProgress();
        }
    }, [studentId, courseId]);

    const loadStudentProgress = async () => {
        setLoading(true);
        try {
            const res = await taService.getStudentProgress(courseId, studentId);
            if (res.success) {
                setProgress(res.data);
            } else {
                message.error(res.error || "Lỗi khi tải tiến độ");
            }
        } catch (error) {
            console.error("Error loading progress:", error);
            message.error("Lỗi khi tải tiến độ");
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "Chưa có";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return `${diffDays} ngày trước`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusTag = (status) => {
        switch (status) {
            case "CHUA_BAT_DAU":
                return <Tag color="red" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>Chưa bắt đầu</Tag>;
            case "TOT":
                return <Tag color="green" icon={<FontAwesomeIcon icon={faCheckCircle} />}>Tiến độ tốt</Tag>;
            case "ON":
                return <Tag color="cyan">Tiến độ ổn</Tag>;
            case "THAP":
                return <Tag color="orange" icon={<FontAwesomeIcon icon={faChartLine} />}>Tiến độ thấp</Tag>;
            case "NGUY_CO_BO_HOC":
                return <Tag color="red" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>Nguy cơ bỏ học</Tag>;
            case "DANG_HOC":
                return <Tag color="blue">Đang học</Tag>;
            default:
                return <Tag>Đang học</Tag>;
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "#52c41a";
        if (percentage >= 70) return "#1890ff";
        if (percentage >= 50) return "#faad14";
        if (percentage > 0) return "#ff4d4f";
        return "#d9d9d9";
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Card className="shadow-lg">
                        <div className="p-12 text-center">
                            <Spin size="large" />
                        </div>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Card className="shadow-lg">
                        <Empty description="Không tìm thấy thông tin tiến độ" />
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    const progressPercent = Math.round(progress.progressPercentage || 0);
    const expectedPercent = progress.expectedProgress ? Math.round(progress.expectedProgress) : null;
    const gap = progress.gap ? Math.round(progress.gap * 10) / 10 : null;

    return (
        <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/ta-progress")}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Quay lại danh sách
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Chi tiết tiến độ học viên
                            </h1>
                            <p className="text-gray-600">
                                {progress.studentName} - {progress.courseName}
                            </p>
                        </div>
                        <Button
                            type="primary"
                            icon={<FontAwesomeIcon icon={faBell} />}
                            onClick={() => navigate(`/ta-reminders?studentId=${studentId}&courseId=${courseId}`)}
                            size="large"
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            Gửi nhắc nhở
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="Tiến độ thực tế"
                                value={progressPercent}
                                suffix="%"
                                valueStyle={{ color: getProgressColor(progressPercent) }}
                                prefix={<FontAwesomeIcon icon={faChartLine} className="text-indigo-500" />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="Tiến độ kỳ vọng"
                                value={expectedPercent || 0}
                                suffix="%"
                                valueStyle={{ color: "#1890ff" }}
                                prefix={<FontAwesomeIcon icon={faGraduationCap} className="text-blue-500" />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="Chênh lệch"
                                value={gap || 0}
                                suffix="%"
                                valueStyle={{ color: gap >= 0 ? "#52c41a" : "#ff4d4f" }}
                                prefix={<FontAwesomeIcon icon={faChartLine} className="text-gray-500" />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="Bài học đã hoàn thành"
                                value={progress.completedLessons || 0}
                                suffix={`/ ${progress.totalLessons || 0}`}
                                valueStyle={{ color: "#1890ff" }}
                                prefix={<FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Progress Overview */}
                <Card className="mb-6 shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tổng quan tiến độ</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">Tiến độ thực tế</span>
                                <span className="text-gray-600">{progressPercent}%</span>
                            </div>
                            <Progress
                                percent={progressPercent}
                                status={progressPercent >= 100 ? "success" : "active"}
                                strokeColor={getProgressColor(progressPercent)}
                            />
                        </div>
                        {expectedPercent !== null && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-700">Tiến độ kỳ vọng</span>
                                    <span className="text-gray-600">{expectedPercent}%</span>
                                </div>
                                <Progress
                                    percent={expectedPercent}
                                    strokeColor="#1890ff"
                                    showInfo={false}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="shadow-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                            Thông tin học viên
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600">Tên:</span>
                                <span className="ml-2 font-semibold">{progress.studentName}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Email:</span>
                                <span className="ml-2 font-semibold">{progress.studentEmail}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Trạng thái:</span>
                                <span className="ml-2">{getStatusTag(progress.progressStatus)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-indigo-500" />
                            Thông tin thời gian
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600">Ngày đăng ký:</span>
                                <span className="ml-2 font-semibold">
                                    {formatDate(progress.enrolledAt)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Số ngày đã học:</span>
                                <span className="ml-2 font-semibold">{progress.elapsedDays || 0} ngày</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Thời gian kỳ vọng:</span>
                                <span className="ml-2 font-semibold">{progress.plannedDays || 0} ngày</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Lần hoạt động cuối:</span>
                                <span className="ml-2 font-semibold">
                                    {formatTimeAgo(progress.lastActivity)}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Course Info */}
                <Card className="mb-6 shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBookOpen} className="text-indigo-500" />
                        Thông tin khóa học
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-600">Tên khóa học:</span>
                            <span className="ml-2 font-semibold">{progress.courseName}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Tổng số bài học:</span>
                            <span className="ml-2 font-semibold">{progress.totalLessons || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Đã hoàn thành:</span>
                            <span className="ml-2 font-semibold">{progress.completedLessons || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Đã học:</span>
                            <span className="ml-2 font-semibold">{progress.lessonsStudied || 0}</span>
                        </div>
                    </div>
                </Card>

                {/* Progress Analysis */}
                {gap !== null && (
                    <Card className="shadow-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Phân tích tiến độ</h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">Chênh lệch so với kỳ vọng:</span>
                                    <span className={`font-bold text-lg ${gap >= 0 ? "text-green-600" : "text-orange-600"}`}>
                                        {gap >= 0 ? "+" : ""}{gap}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {gap >= 10 
                                        ? "Học viên đang học nhanh hơn kỳ vọng. Tiến độ tốt!" 
                                        : gap >= -10 
                                        ? "Học viên đang học đúng nhịp kỳ vọng. Tiến độ ổn định."
                                        : gap >= -25
                                        ? "Học viên đang học chậm hơn kỳ vọng. Cần theo dõi và hỗ trợ."
                                        : "Học viên có nguy cơ bỏ học. Cần can thiệp ngay."}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default TAStudentDetail;

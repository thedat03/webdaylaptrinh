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
    faBell,
    faPlayCircle,
    faVideo,
    faFileAlt,
    faCode,
    faListCheck
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { message, Card, Tag, Progress, Spin, Empty, Button, Timeline, Statistic, Row, Col, Table, Tabs, Tooltip } from "antd";

function TAStudentDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const [activityDetails, setActivityDetails] = useState(null);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        if (studentId && courseId) {
            loadStudentProgress();
            loadActivityDetails();
        }
    }, [studentId, courseId]);

    const loadStudentProgress = async () => {
        setLoading(true);
        try {
            const res = await taService.getStudentProgress(courseId, studentId);
            if (res.success && res.data) {
                // Đảm bảo các giá trị mặc định
                const progressData = {
                    ...res.data,
                    progressPercentage: res.data.progressPercentage ?? 0,
                    completedLessons: res.data.completedLessons ?? 0,
                    totalLessons: res.data.totalLessons ?? 0,
                    lessonsStudied: res.data.lessonsStudied ?? 0,
                    weeklyStudyStats: res.data.weeklyStudyStats || null
                };
                setProgress(progressData);
            } else {
                message.error(res.error || "Lỗi khi tải tiến độ");
                setProgress(null);
            }
        } catch (error) {
            console.error("Error loading progress:", error);
            message.error("Lỗi khi tải tiến độ: " + (error.message || "Unknown error"));
            setProgress(null);
        } finally {
            setLoading(false);
        }
    };

    const loadActivityDetails = async () => {
        setLoadingActivities(true);
        try {
            const res = await taService.getStudentActivityDetails(courseId, studentId);
            if (res.success && res.data) {
                // Đảm bảo các giá trị mặc định
                const activityData = {
                    ...res.data,
                    lessonActivities: res.data.lessonActivities || [],
                    examActivities: res.data.examActivities || [],
                    totalLessons: res.data.totalLessons || 0,
                    completedLessons: res.data.completedLessons || 0,
                    totalExams: res.data.totalExams || 0,
                    completedExams: res.data.completedExams || 0
                };
                setActivityDetails(activityData);
            } else {
                console.error("Error loading activity details:", res.error);
                setActivityDetails(null);
            }
        } catch (error) {
            console.error("Error loading activity details:", error);
            setActivityDetails(null);
        } finally {
            setLoadingActivities(false);
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

    const getStatusTag = (status, daysInactive) => {
        switch (status) {
            case "CHUA_BAT_DAU":
                return <Tag color="gray" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>Chưa bắt đầu</Tag>;
            case "DANG_HOC":
                return <Tag color="blue" icon={<FontAwesomeIcon icon={faCheckCircle} />}>Đang học</Tag>;
            case "DA_NGHI":
                return (
                    <Tag color="orange" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>
                        Đã nghỉ {daysInactive ? `${daysInactive} ngày` : ''}
                    </Tag>
                );
            default:
                return <Tag color="blue">Đang học</Tag>;
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
                    <Col xs={24} sm={12} md={8}>
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
                    <Col xs={24} sm={12} md={8}>
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
                    <Col xs={24} sm={12} md={8}>
                        <Card className="shadow-md">
                            <Statistic
                                title={
                                    <span>
                                        Bài học đã xem
                                        <Tooltip title="Số bài học đã được học viên mở/xem (có record trong hệ thống), khác với 'Đã hoàn thành' là các bài đã học xong 100%">
                                            <FontAwesomeIcon icon={faExclamationCircle} className="ml-1 text-gray-400 text-xs cursor-help" />
                                        </Tooltip>
                                    </span>
                                }
                                value={progress.lessonsStudied || 0}
                                suffix={`/ ${progress.totalLessons || 0}`}
                                valueStyle={{ color: "#52c41a" }}
                                prefix={<FontAwesomeIcon icon={faBookOpen} className="text-blue-500" />}
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
                                <span className="ml-2 font-semibold">{progress.studentName || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Email:</span>
                                <span className="ml-2 font-semibold">{progress.studentEmail || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Trạng thái:</span>
                                <span className="ml-2">{getStatusTag(progress.progressStatus || "DANG_HOC", progress.daysInactive)}</span>
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
                                    {progress.enrolledAt ? formatDate(progress.enrolledAt) : "Chưa có"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Lần hoạt động cuối:</span>
                                <span className="ml-2 font-semibold">
                                    {progress.lastActivity ? formatTimeAgo(progress.lastActivity) : "Chưa có"}
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
                            <span className="ml-2 font-semibold">{progress.courseName || "N/A"}</span>
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
                            <span className="text-gray-600">
                                Đã xem:
                                <Tooltip title="Số bài học đã được học viên mở/xem (có record trong hệ thống), khác với 'Đã hoàn thành' là các bài đã học xong 100%">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="ml-1 text-gray-400 text-xs cursor-help" />
                                </Tooltip>
                            </span>
                            <span className="ml-2 font-semibold">{progress.lessonsStudied || 0}</span>
                        </div>
                    </div>
                </Card>

                {/* Weekly Study Statistics */}
                {progress.weeklyStudyStats && progress.weeklyStudyStats.dailyStats && (
                    <Card className="shadow-md mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Tiến độ học tập trong 7 ngày qua</h3>
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Thống kê này chỉ để tham khảo, giúp dễ nắm bắt tình hình học tập của học viên.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card className="bg-green-50">
                                <Statistic
                                    title="Tổng thời gian"
                                    value={progress.weeklyStudyStats.totalMinutes || 0}
                                    suffix="phút"
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Card>
                            <Card className="bg-blue-50">
                                <Statistic
                                    title="Trung bình/ngày"
                                    value={progress.weeklyStudyStats.averageMinutesPerDay 
                                        ? Math.round(progress.weeklyStudyStats.averageMinutesPerDay * 10) / 10 
                                        : 0}
                                    suffix="phút"
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Card>
                            <Card className="bg-green-50">
                                <Statistic
                                    title="Ngày tốt (≥30 phút)"
                                    value={progress.weeklyStudyStats.goodDays || 0}
                                    suffix="ngày"
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Card>
                            <Card className="bg-orange-50">
                                <Statistic
                                    title="Ngày kém (&lt;15 phút)"
                                    value={progress.weeklyStudyStats.poorDays || 0}
                                    suffix="ngày"
                                    valueStyle={{ color: "#ff9800" }}
                                />
                            </Card>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Đánh giá tổng thể:</h4>
                            {progress.weeklyStudyStats.overallRating === "TOT" ? (
                                <Tag color="green" className="text-base px-4 py-2">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                    Tốt (≥30 phút/ngày)
                                </Tag>
                            ) : progress.weeklyStudyStats.overallRating === "TRUNG_BINH" ? (
                                <Tag color="blue" className="text-base px-4 py-2">
                                    Trung bình (15-30 phút/ngày)
                                </Tag>
                            ) : (
                                <Tag color="orange" className="text-base px-4 py-2">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                                    Kém (&lt;15 phút/ngày)
                                </Tag>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Chi tiết từng ngày:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                                {progress.weeklyStudyStats.dailyStats && Array.isArray(progress.weeklyStudyStats.dailyStats) && progress.weeklyStudyStats.dailyStats.map((day, index) => {
                                    if (!day) return null;
                                    
                                    // Xử lý date có thể là string hoặc object
                                    let dateObj;
                                    try {
                                        if (typeof day.date === 'string') {
                                            dateObj = new Date(day.date);
                                        } else if (day.date && typeof day.date === 'object') {
                                            // Nếu là object từ Java LocalDate, tạo Date từ year, month, day
                                            if (day.date.year && day.date.monthValue && day.date.dayOfMonth) {
                                                dateObj = new Date(day.date.year, day.date.monthValue - 1, day.date.dayOfMonth);
                                            } else {
                                                dateObj = new Date();
                                            }
                                        } else {
                                            dateObj = new Date();
                                        }
                                        
                                        if (isNaN(dateObj.getTime())) {
                                            dateObj = new Date();
                                        }
                                    } catch (e) {
                                        console.error("Error parsing date:", e);
                                        dateObj = new Date();
                                    }
                                    
                                    const dayName = dateObj.toLocaleDateString("vi-VN", { weekday: "short" });
                                    const dayNumber = dateObj.getDate();
                                    const ratingColor = day.rating === "TOT" ? "green" : day.rating === "TRUNG_BINH" ? "blue" : "orange";
                                    const minutes = day.minutes || 0;
                                    
                                    return (
                                        <Card key={index} style={{ border: `2px solid ${ratingColor === "green" ? "#b7eb8f" : ratingColor === "blue" ? "#91d5ff" : "#ffd591"}` }}>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">{dayName}</div>
                                                <div className="text-lg font-bold mb-2">{dayNumber}</div>
                                                <div className="text-sm font-semibold mb-1">{minutes} phút</div>
                                                <Tag color={ratingColor} size="small">
                                                    {day.rating === "TOT" ? "Tốt" : day.rating === "TRUNG_BINH" ? "TB" : "Kém"}
                                                </Tag>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Detailed Activities */}
                <Card className="shadow-md">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faListCheck} className="text-indigo-500" />
                        Chi tiết hoạt động học viên
                    </h3>
                    {loadingActivities ? (
                        <div className="p-12 text-center">
                            <Spin size="large" />
                        </div>
                    ) : activityDetails ? (
                        <Tabs
                            defaultActiveKey="lessons"
                            items={[
                                {
                                    key: "lessons",
                                    label: (
                                        <span>
                                            <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
                                            Bài học ({activityDetails.completedLessons}/{activityDetails.totalLessons})
                                        </span>
                                    ),
                                    children: (
                                        <div>
                                            <Table
                                                dataSource={activityDetails.lessonActivities || []}
                                                rowKey="lessonId"
                                                pagination={{ pageSize: 10 }}
                                                columns={[
                                                    {
                                                        title: "Bài học",
                                                        dataIndex: "lessonTitle",
                                                        key: "lessonTitle",
                                                        render: (text, record) => (
                                                            <div>
                                                                <div className="font-semibold">{text}</div>
                                                                <div className="text-xs text-gray-500">{record.moduleName}</div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        title: "Loại",
                                                        dataIndex: "lessonType",
                                                        key: "lessonType",
                                                        width: 120,
                                                        render: (type) => {
                                                            const icons = {
                                                                VIDEO: faVideo,
                                                                TEXT: faFileAlt,
                                                                CODE: faCode,
                                                            };
                                                            const colors = {
                                                                VIDEO: "blue",
                                                                TEXT: "green",
                                                                CODE: "purple",
                                                            };
                                                            return (
                                                                <Tag color={colors[type] || "default"}>
                                                                    <FontAwesomeIcon icon={icons[type] || faFileAlt} className="mr-1" />
                                                                    {type || "N/A"}
                                                                </Tag>
                                                            );
                                                        },
                                                    },
                                                    {
                                                        title: "Thời lượng",
                                                        dataIndex: "durationMinutes",
                                                        key: "durationMinutes",
                                                        width: 120,
                                                        render: (minutes) => minutes ? `${minutes} phút` : "N/A",
                                                    },
                                                    {
                                                        title: "Thời gian xem",
                                                        key: "watchedTime",
                                                        width: 150,
                                                        render: (_, record) => (
                                                            <div>
                                                                <div className="font-semibold">
                                                                    <FontAwesomeIcon icon={faPlayCircle} className="mr-1 text-indigo-500" />
                                                                    {record.watchedTimeFormatted || "0:00"}
                                                                </div>
                                                                {record.durationMinutes && record.watchedSeconds && record.watchedSeconds > 0 && (
                                                                    <div className="text-xs text-gray-500">
                                                                        {Math.round((record.watchedSeconds / (record.durationMinutes * 60)) * 100)}% video
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        title: "Phần trăm xem",
                                                        dataIndex: "watchedPercentage",
                                                        key: "watchedPercentage",
                                                        width: 150,
                                                        sorter: (a, b) => (a.watchedPercentage || 0) - (b.watchedPercentage || 0),
                                                        render: (percentage) => (
                                                            <Progress
                                                                percent={Math.round(percentage || 0)}
                                                                size="small"
                                                                format={(percent) => `${percent}%`}
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        title: "Trạng thái",
                                                        key: "status",
                                                        width: 120,
                                                        render: (_, record) => (
                                                            (record.isCompleted === true) ? (
                                                                <Tag color="green" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                                                                    Hoàn thành
                                                                </Tag>
                                                            ) : (record.watchedPercentage && record.watchedPercentage > 0) ? (
                                                                <Tag color="blue">Đang học</Tag>
                                                            ) : (
                                                                <Tag color="default">Chưa bắt đầu</Tag>
                                                            )
                                                        ),
                                                    },
                                                    {
                                                        title: "Lần truy cập cuối",
                                                        dataIndex: "lastAccessedAt",
                                                        key: "lastAccessedAt",
                                                        width: 150,
                                                        sorter: (a, b) => {
                                                            if (!a.lastAccessedAt && !b.lastAccessedAt) return 0;
                                                            if (!a.lastAccessedAt) return 1;
                                                            if (!b.lastAccessedAt) return -1;
                                                            return new Date(a.lastAccessedAt) - new Date(b.lastAccessedAt);
                                                        },
                                                        render: (date) => date ? formatTimeAgo(date) : "Chưa có",
                                                    },
                                                ]}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: "exams",
                                    label: (
                                        <span>
                                            <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                                            Bài thi ({activityDetails.completedExams}/{activityDetails.totalExams})
                                        </span>
                                    ),
                                    children: (
                                        <div>
                                            {activityDetails.examActivities && activityDetails.examActivities.length > 0 ? (
                                                <Table
                                                    dataSource={activityDetails.examActivities}
                                                    rowKey="examId"
                                                    pagination={{ pageSize: 10 }}
                                                    columns={[
                                                        {
                                                            title: "Bài thi",
                                                            dataIndex: "examTitle",
                                                            key: "examTitle",
                                                        },
                                                        {
                                                            title: "Điểm số",
                                                            key: "score",
                                                            width: 150,
                                                            render: (_, record) => {
                                                                const totalScore = record.totalScore || 0;
                                                                const maxScore = record.maxScore || 0;
                                                                return (
                                                                    <div>
                                                                        <span className="font-semibold">
                                                                            {totalScore}/{maxScore}
                                                                        </span>
                                                                        {maxScore > 0 && totalScore != null && (
                                                                            <div className="text-xs text-gray-500">
                                                                                {Math.round((totalScore / maxScore) * 100)}%
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            },
                                                        },
                                                        {
                                                            title: "Kết quả",
                                                            key: "passed",
                                                            width: 120,
                                                            render: (_, record) => (
                                                                (record.passed === true) ? (
                                                                    <Tag color="green" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                                                                        Đạt
                                                                    </Tag>
                                                                ) : (
                                                                    <Tag color="red">Không đạt</Tag>
                                                                )
                                                            ),
                                                        },
                                                        {
                                                            title: "Số lần nộp",
                                                            dataIndex: "submissionCount",
                                                            key: "submissionCount",
                                                            width: 120,
                                                        },
                                                    {
                                                        title: "Ngày nộp",
                                                        dataIndex: "submittedAt",
                                                        key: "submittedAt",
                                                        width: 150,
                                                        sorter: (a, b) => {
                                                            if (!a.submittedAt && !b.submittedAt) return 0;
                                                            if (!a.submittedAt) return 1;
                                                            if (!b.submittedAt) return -1;
                                                            return new Date(a.submittedAt) - new Date(b.submittedAt);
                                                        },
                                                        render: (date) => date ? formatDate(date) : "Chưa nộp",
                                                    },
                                                    ]}
                                                />
                                            ) : (
                                                <Empty description="Chưa có bài thi nào được nộp" />
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    ) : (
                        <Empty description="Không thể tải chi tiết hoạt động" />
                    )}
                </Card>
            </div>
            <Footer />
        </div>
    );
}

export default TAStudentDetail;

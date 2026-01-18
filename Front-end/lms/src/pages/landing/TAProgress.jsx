import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChartLine, 
    faArrowLeft, 
    faUsers, 
    faBookOpen, 
    faCheckCircle, 
    faClock, 
    faExclamationCircle,
    faSearch,
    faFilter,
    faUser,
    faGraduationCap,
    faBell
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { courseService } from "../../api/course.service";
import { message, Select, Table, Progress, Tag, Card, Input, Space, Empty, Spin, Badge, Tooltip, Button } from "antd";
const { Search } = Input;

function TAProgress() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [studentsProgress, setStudentsProgress] = useState([]);
    const [filteredProgress, setFilteredProgress] = useState([]);
    const [daysInactive, setDaysInactive] = useState(7);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("all"); // all, inactive, low-progress, completed

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            loadStudentsProgress();
        }
    }, [selectedCourseId, daysInactive]);

    useEffect(() => {
        applyFilters();
    }, [studentsProgress, searchTerm, filterBy]);

    const loadCourses = async () => {
        try {
            // Load only courses assigned to this TA
            const res = await taService.getAssignedCourses();
            if (res.success && Array.isArray(res.data)) {
                setCourses(res.data);
                if (res.data.length > 0) {
                    setSelectedCourseId(res.data[0].course_id);
                }
            } else {
                message.warning(res.error || "Không thể tải danh sách khóa học");
            }
        } catch (error) {
            console.error("Error loading courses:", error);
            message.error("Lỗi khi tải khóa học");
        }
    };

    const loadStudentsProgress = async () => {
        if (!selectedCourseId) return;
        setLoading(true);
        try {
            const res = await taService.getStudentsProgress(selectedCourseId);
            if (res.success) {
                if (Array.isArray(res.data)) {
                    setStudentsProgress(res.data);
                } else {
                    console.error("Invalid data format:", res.data);
                    setStudentsProgress([]);
                    message.warning("Dữ liệu không hợp lệ");
                }
            } else {
                console.error("Error response:", res);
                setStudentsProgress([]);
                message.error(res.error || "Lỗi khi tải tiến độ");
            }
        } catch (error) {
            console.error("Error loading progress:", error);
            setStudentsProgress([]);
            message.error("Lỗi khi tải tiến độ: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...studentsProgress];

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(student => 
                student.studentName?.toLowerCase().includes(term) ||
                student.studentEmail?.toLowerCase().includes(term)
            );
        }

        // Filter by status - sử dụng progressStatus từ backend
        const now = new Date();
        filtered = filtered.filter(student => {
            switch (filterBy) {
                case "inactive":
                    if (!student.lastActivity) return true;
                    const lastActivity = new Date(student.lastActivity);
                    const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
                    return daysDiff >= daysInactive;
                case "low-progress":
                    // Sử dụng progressStatus nếu có, nếu không dùng logic cũ
                    if (student.progressStatus) {
                        return student.progressStatus === "THAP" || student.progressStatus === "NGUY_CO_BO_HOC";
                    }
                    // Fallback: đánh giá dựa trên gap
                    const gap = student.gap || 0;
                    return gap < -10;
                case "completed":
                    return (student.progressPercentage || 0) >= 100;
                default:
                    return true;
            }
        });

        setFilteredProgress(filtered);
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

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "#52c41a";
        if (percentage >= 70) return "#1890ff";
        if (percentage >= 50) return "#faad14";
        if (percentage > 0) return "#ff4d4f";
        return "#d9d9d9";
    };

    const getStatusTag = (student) => {
        const progress = student.progressPercentage || 0;
        const lastActivity = student.lastActivity;
        const progressStatus = student.progressStatus;
        const gap = student.gap || 0;
        
        // Nếu có progressStatus từ backend, dùng nó
        if (progressStatus) {
            switch (progressStatus) {
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
                    break;
            }
        }
        
        // Fallback logic cũ nếu không có progressStatus
        if (progress >= 100) {
            return <Tag color="green" icon={<FontAwesomeIcon icon={faCheckCircle} />}>Hoàn thành</Tag>;
        }
        
        if (!lastActivity) {
            return <Tag color="red" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>Chưa bắt đầu</Tag>;
        }
        
        const now = new Date();
        const lastAct = new Date(lastActivity);
        const daysDiff = Math.floor((now - lastAct) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= daysInactive) {
            return <Tag color="orange" icon={<FontAwesomeIcon icon={faClock} />}>Không hoạt động</Tag>;
        }
        
        // Đánh giá dựa trên gap nếu có
        if (gap !== undefined && gap !== null) {
            if (gap >= 10) {
                return <Tag color="green" icon={<FontAwesomeIcon icon={faCheckCircle} />}>Tiến độ tốt</Tag>;
            } else if (gap >= -10) {
                return <Tag color="cyan">Tiến độ ổn</Tag>;
            } else {
                return <Tag color="orange" icon={<FontAwesomeIcon icon={faChartLine} />}>Tiến độ thấp</Tag>;
            }
        }
        
        return <Tag color="cyan">Đang học</Tag>;
    };

    const columns = [
        {
            title: "Học viên",
            dataIndex: "studentName",
            key: "studentName",
            width: 200,
            fixed: "left",
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                            {text?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{text}</div>
                        <div className="text-xs text-gray-500">{record.studentEmail}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Tiến độ",
            key: "progress",
            width: 250,
            render: (_, record) => {
                const progress = Math.round(record.progressPercentage || 0);
                const expected = record.expectedProgress ? Math.round(record.expectedProgress) : null;
                const gap = record.gap ? Math.round(record.gap * 10) / 10 : null;
                
                return (
                    <div>
                        <Progress
                            percent={progress}
                            status={progress >= 100 ? "success" : "active"}
                            strokeColor={getProgressColor(progress)}
                            format={(percent) => `${percent}%`}
                        />
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-500" />
                            <span>{record.completedLessons || 0}/{record.totalLessons || 0} bài học</span>
                        </div>
                        {expected !== null && (
                            <div className="text-xs text-gray-500 mt-1">
                                Kỳ vọng: {expected}% {gap !== null && (
                                    <span className={gap >= 0 ? "text-green-600" : "text-orange-600"}>
                                        ({gap >= 0 ? "+" : ""}{gap}%)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Lần hoạt động cuối",
            dataIndex: "lastActivity",
            key: "lastActivity",
            width: 150,
            render: (date) => (
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                    <span className="text-sm">{formatTimeAgo(date)}</span>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 150,
            render: (_, record) => getStatusTag(record),
        },
        {
            title: "Hành động",
            key: "action",
            width: 200,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            icon={<FontAwesomeIcon icon={faUser} />}
                            onClick={() => navigate(`/ta-student-detail?studentId=${record.studentId}&courseId=${record.courseId}`)}
                        >
                            Chi tiết
                        </Button>
                    </Tooltip>
                    <Tooltip title="Gửi nhắc nhở">
                        <Button
                            type="default"
                            size="small"
                            icon={<FontAwesomeIcon icon={faBell} />}
                            onClick={() => navigate(`/ta-reminders?studentId=${record.studentId}&courseId=${record.courseId}`)}
                            className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                        >
                            Nhắc nhở
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const stats = {
        total: filteredProgress.length,
        completed: filteredProgress.filter(s => (s.progressPercentage || 0) >= 100).length,
        inactive: filteredProgress.filter(s => {
            if (!s.lastActivity) return true;
            const lastAct = new Date(s.lastActivity);
            const now = new Date();
            const daysDiff = Math.floor((now - lastAct) / (1000 * 60 * 60 * 24));
            return daysDiff >= daysInactive;
        }).length,
        lowProgress: filteredProgress.filter(s => (s.progressPercentage || 0) < 50 && (s.progressPercentage || 0) > 0).length,
    };

    return (
        <div className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/teaching-assistant-home")}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Quay lại trang chủ
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Theo dõi tiến độ học viên</h1>
                            <p className="text-gray-600">Xem tiến độ học tập của học viên trong các khóa học</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Tổng học viên</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Đã hoàn thành</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Không hoạt động</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Tiến độ thấp</p>
                                <p className="text-2xl font-bold text-red-600">{stats.lowProgress}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faChartLine} className="text-red-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
                                Chọn khóa học
                            </label>
                            <Select
                                value={selectedCourseId}
                                onChange={setSelectedCourseId}
                                className="w-full"
                                placeholder="Chọn khóa học"
                                size="large"
                            >
                                {courses.map((course) => (
                                    <Select.Option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                Lọc theo trạng thái
                            </label>
                            <Select
                                value={filterBy}
                                onChange={setFilterBy}
                                className="w-full"
                                size="large"
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="inactive">Không hoạt động</Select.Option>
                                <Select.Option value="low-progress">Tiến độ thấp</Select.Option>
                                <Select.Option value="completed">Đã hoàn thành</Select.Option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faClock} className="mr-2" />
                                Không hoạt động (ngày)
                            </label>
                            <Select
                                value={daysInactive}
                                onChange={setDaysInactive}
                                className="w-full"
                                size="large"
                            >
                                <Select.Option value={3}>3 ngày</Select.Option>
                                <Select.Option value={7}>7 ngày</Select.Option>
                                <Select.Option value={14}>14 ngày</Select.Option>
                                <Select.Option value={30}>30 ngày</Select.Option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                Tìm kiếm
                            </label>
                            <Search
                                placeholder="Tìm theo tên, email..."
                                allowClear
                                size="large"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Table */}
                {loading ? (
                    <Card className="shadow-lg">
                        <div className="p-12 text-center">
                            <Spin size="large" />
                        </div>
                    </Card>
                ) : filteredProgress.length === 0 ? (
                    <Card className="shadow-lg">
                        <Empty
                            image={<FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-400" />}
                            description={
                                <span className="text-gray-600 text-lg">
                                    {studentsProgress.length === 0 
                                        ? "Chưa có học viên nào trong khóa học này" 
                                        : "Không tìm thấy học viên phù hợp"}
                                </span>
                            }
                        />
                    </Card>
                ) : (
                    <Card className="shadow-lg">
                        <Table
                            columns={columns}
                            dataSource={filteredProgress}
                            rowKey="studentId"
                            scroll={{ x: 1000 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} học viên`,
                                pageSizeOptions: ['10', '20', '50', '100'],
                            }}
                        />
                    </Card>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default TAProgress;

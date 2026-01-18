import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faBell, 
    faArrowLeft, 
    faCheckCircle, 
    faBookOpen, 
    faUser, 
    faPaperPlane,
    faSearch,
    faFilter,
    faClock,
    faGraduationCap,
    faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { courseService } from "../../api/course.service";
import { message, Input, Button, Select, Form, Modal, Card, Tag, Space, Empty, Spin, AutoComplete, Badge, Pagination } from "antd";
const { TextArea } = Input;
const { Search } = Input;

function TAReminders() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const [filteredReminders, setFilteredReminders] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [showSendModal, setShowSendModal] = useState(false);
    const [form] = Form.useForm();
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadReminders();
        loadCourses();
        if (studentId && courseId) {
            setShowSendModal(true);
            form.setFieldsValue({ studentId, courseId });
        }
    }, []);

    useEffect(() => {
        applyFilters();
        // Reset về trang đầu khi filter thay đổi
        setCurrentPage(1);
    }, [reminders, searchTerm, selectedCourse, selectedType, selectedStatus, sortBy]);

    const loadReminders = async () => {
        setLoading(true);
        try {
            const res = await taService.getMyReminders();
            if (res.success && Array.isArray(res.data)) {
                // Debug: Log để kiểm tra cấu trúc data
                console.log("Loaded reminders:", res.data);
                if (res.data.length > 0) {
                    console.log("Sample reminder:", res.data[0]);
                    console.log("Sample reminder course:", res.data[0].course);
                    console.log("Sample reminder type:", res.data[0].type);
                }
                setReminders(res.data);
            } else {
                message.error(res.error || "Lỗi khi tải nhắc nhở");
            }
        } catch (error) {
            console.error("Error loading reminders:", error);
            message.error("Lỗi khi tải nhắc nhở");
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            // Chỉ load các khóa học được phân công cho TA
            const res = await taService.getAssignedCourses();
            if (res.success && Array.isArray(res.data)) {
                setCourses(res.data);
            } else {
                message.warning(res.error || "Không thể tải danh sách khóa học");
                setCourses([]);
            }
        } catch (error) {
            console.error("Error loading courses:", error);
            message.error("Lỗi khi tải danh sách khóa học");
            setCourses([]);
        }
    };

    const [studentOptions, setStudentOptions] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const loadStudents = async (courseId, search = "") => {
        if (!courseId) {
            // Extract unique students from reminders
            const uniqueStudents = new Map();
            reminders.forEach(reminder => {
                if (reminder.student) {
                    const key = reminder.student.id || reminder.student.username;
                    if (!uniqueStudents.has(key)) {
                        uniqueStudents.set(key, reminder.student);
                    }
                }
            });
            return Array.from(uniqueStudents.values())
                .filter(s => !search || s.username?.toLowerCase().includes(search.toLowerCase()))
                .map(s => ({ value: s.id, label: `${s.username} (${s.email || ''})`, student: s }));
        }
        
        setLoadingStudents(true);
        try {
            const res = await taService.getStudentsInCourse(courseId);
            if (res.success && Array.isArray(res.data)) {
                const options = res.data
                    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
                    .map(s => ({ 
                        value: s.id, 
                        label: `${s.name} (${s.email || ''})`, 
                        student: s 
                    }));
                return options;
            }
        } catch (error) {
            console.error("Error loading students:", error);
        } finally {
            setLoadingStudents(false);
        }
        return [];
    };

    const applyFilters = () => {
        let filtered = [...reminders];

        // Debug logs
        console.log("Applying filters:", {
            totalReminders: reminders.length,
            searchTerm,
            selectedCourse,
            selectedType,
            selectedStatus,
            sortBy
        });

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(reminder => 
                reminder.message?.toLowerCase().includes(term) ||
                reminder.student?.username?.toLowerCase().includes(term) ||
                reminder.course?.course_name?.toLowerCase().includes(term)
            );
        }

        // Course filter - so sánh chính xác với course_id
        if (selectedCourse) {
            filtered = filtered.filter(reminder => {
                if (!reminder.course) {
                    return false; // Không có course thì không match
                }
                const reminderCourseId = reminder.course.course_id;
                if (!reminderCourseId) {
                    return false;
                }
                // Chuyển đổi cả hai sang string để so sánh
                const selectedIdStr = String(selectedCourse);
                const reminderIdStr = String(reminderCourseId);
                const matches = selectedIdStr === reminderIdStr;
                if (!matches) {
                    console.log("Course filter mismatch:", {
                        selected: selectedIdStr,
                        reminder: reminderIdStr,
                        reminderId: reminder.id
                    });
                }
                return matches;
            });
            console.log("After course filter:", filtered.length);
        }

        // Type filter - so sánh chính xác với type (có thể là enum hoặc string)
        if (selectedType) {
            filtered = filtered.filter(reminder => {
                const reminderType = reminder.type;
                if (!reminderType) {
                    return false;
                }
                // So sánh enum value hoặc string
                const matches = String(reminderType).toUpperCase() === String(selectedType).toUpperCase();
                if (!matches) {
                    console.log("Type filter mismatch:", {
                        selected: selectedType,
                        reminder: reminderType,
                        reminderId: reminder.id
                    });
                }
                return matches;
            });
            console.log("After type filter:", filtered.length);
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(reminder => {
                const reminderStatus = reminder.status;
                if (!reminderStatus) {
                    return false;
                }
                return String(reminderStatus).toUpperCase() === String(selectedStatus).toUpperCase();
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "student":
                    return (a.student?.username || "").localeCompare(b.student?.username || "");
                default:
                    return 0;
            }
        });

        setFilteredReminders(filtered);
    };

    const handleSendReminder = async (values) => {
        try {
            const res = await taService.sendReminder(
                values.studentId,
                values.message,
                values.type || "GENERAL",
                values.courseId || null,
                values.lessonId || null
            );
            if (res.success) {
                message.success("Đã gửi nhắc nhở thành công");
                setShowSendModal(false);
                form.resetFields();
                loadReminders();
            } else {
                message.error(res.error || "Lỗi khi gửi nhắc nhở");
            }
        } catch (error) {
            message.error("Lỗi khi gửi nhắc nhở");
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "Vừa xong";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    const getReminderTypeLabel = (type) => {
        const labels = {
            GENERAL: "Chung",
            INACTIVE: "Không hoạt động",
            LESSON_NOT_COMPLETED: "Chưa hoàn thành bài học",
            QUIZ_NOT_DONE: "Chưa làm quiz",
            EXAM_NOT_DONE: "Chưa làm đề thi"
        };
        return labels[type] || type;
    };

    const getReminderTypeColor = (type) => {
        const colors = {
            GENERAL: "blue",
            INACTIVE: "orange",
            LESSON_NOT_COMPLETED: "purple",
            QUIZ_NOT_DONE: "red",
            EXAM_NOT_DONE: "volcano"
        };
        return colors[type] || "default";
    };

    const getStatusColor = (status) => {
        const colors = {
            SENT: "yellow",
            READ: "blue",
            ACTED: "green"
        };
        return colors[status] || "default";
    };

    const getStatusLabel = (status) => {
        const labels = {
            SENT: "Đã gửi",
            READ: "Đã đọc",
            ACTED: "Đã thực hiện"
        };
        return labels[status] || status;
    };

    const stats = {
        total: filteredReminders.length,
        sent: filteredReminders.filter(r => r.status === "SENT").length,
        read: filteredReminders.filter(r => r.status === "READ").length,
        acted: filteredReminders.filter(r => r.status === "ACTED").length,
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
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Quản lý nhắc nhở</h1>
                            <p className="text-gray-600">Gửi và xem lịch sử nhắc nhở cho học viên</p>
                        </div>
                        <Button
                            type="primary"
                            icon={<FontAwesomeIcon icon={faPaperPlane} />}
                            onClick={() => setShowSendModal(true)}
                            size="large"
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            Gửi nhắc nhở mới
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Tổng nhắc nhở</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faBell} className="text-indigo-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Đã gửi</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.sent}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faPaperPlane} className="text-yellow-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Đã đọc</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Đã thực hiện</p>
                                <p className="text-2xl font-bold text-green-600">{stats.acted}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <Search
                                placeholder="Tìm kiếm theo nội dung, học viên, khóa học..."
                                allowClear
                                enterButton={<FontAwesomeIcon icon={faSearch} />}
                                size="large"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            placeholder="Lọc theo khóa học"
                            allowClear
                            value={selectedCourse}
                            onChange={(value) => {
                                setSelectedCourse(value);
                                setCurrentPage(1); // Reset về trang đầu khi thay đổi filter
                            }}
                            size="large"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {courses.length === 0 ? (
                                <Select.Option disabled value="">Chưa có khóa học được phân công</Select.Option>
                            ) : (
                                courses.map((course) => (
                                    <Select.Option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </Select.Option>
                                ))
                            )}
                        </Select>
                        <Select
                            placeholder="Lọc theo loại"
                            allowClear
                            value={selectedType}
                            onChange={(value) => {
                                setSelectedType(value);
                                setCurrentPage(1); // Reset về trang đầu khi thay đổi filter
                            }}
                            size="large"
                        >
                            <Select.Option value="GENERAL">Chung</Select.Option>
                            <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
                            <Select.Option value="LESSON_NOT_COMPLETED">Chưa hoàn thành bài học</Select.Option>
                            <Select.Option value="QUIZ_NOT_DONE">Chưa làm quiz</Select.Option>
                            <Select.Option value="EXAM_NOT_DONE">Chưa làm đề thi</Select.Option>
                        </Select>
                        <Select
                            placeholder="Sắp xếp"
                            value={sortBy}
                            onChange={(value) => {
                                setSortBy(value);
                                setCurrentPage(1); // Reset về trang đầu khi thay đổi sort
                            }}
                            size="large"
                        >
                            <Select.Option value="newest">Mới nhất</Select.Option>
                            <Select.Option value="oldest">Cũ nhất</Select.Option>
                            <Select.Option value="student">Theo học viên</Select.Option>
                        </Select>
                    </div>
                </Card>

                {/* Reminders List */}
                {loading ? (
                    <Card className="shadow-lg">
                        <div className="p-12 text-center">
                            <Spin size="large" />
                        </div>
                    </Card>
                ) : filteredReminders.length === 0 ? (
                    <Card className="shadow-lg">
                        <Empty
                            image={<FontAwesomeIcon icon={faBell} className="text-6xl text-gray-400" />}
                            description={
                                <span className="text-gray-600 text-lg">
                                    {reminders.length === 0 
                                        ? "Chưa có nhắc nhở nào" 
                                        : "Không tìm thấy nhắc nhở phù hợp"}
                                </span>
                            }
                        />
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {filteredReminders
                                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                .map((reminder) => (
                            <Card
                                key={reminder.id}
                                className="shadow-md hover:shadow-lg transition-shadow"
                                bodyStyle={{ padding: "20px" }}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <FontAwesomeIcon icon={faBell} className="text-white text-xl" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                                <span className="font-bold text-gray-900">
                                                    {reminder.student?.username || "Học viên"}
                                                </span>
                                            </div>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faClock} />
                                                {formatTimeAgo(reminder.createdAt)}
                                            </span>
                                            <Tag 
                                                color={getReminderTypeColor(reminder.type)}
                                                className="px-3 py-1"
                                            >
                                                {getReminderTypeLabel(reminder.type)}
                                            </Tag>
                                            <Tag 
                                                color={getStatusColor(reminder.status)}
                                                className="px-3 py-1"
                                            >
                                                {getStatusLabel(reminder.status)}
                                            </Tag>
                                        </div>

                                        {/* Message */}
                                        <p className="text-gray-700 mb-4 text-base leading-relaxed whitespace-pre-wrap">
                                            {reminder.message}
                                        </p>

                                        {/* Course Info */}
                                        {reminder.course && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag 
                                                    icon={<FontAwesomeIcon icon={faBookOpen} />} 
                                                    color="blue"
                                                    className="px-3 py-1"
                                                >
                                                    {reminder.course.course_name}
                                                </Tag>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            ))}
                        </div>
                        {filteredReminders.length > pageSize && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={filteredReminders.length}
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }}
                                    showSizeChanger
                                    showTotal={(total) => `Tổng ${total} nhắc nhở`}
                                    pageSizeOptions={['10', '20', '50']}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Send Reminder Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faPaperPlane} className="text-indigo-600" />
                        <span>Gửi nhắc nhở</span>
                    </div>
                }
                open={showSendModal}
                onCancel={() => {
                    setShowSendModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSendReminder}
                >
                    <Form.Item
                        name="courseId"
                        label="Khóa học (tùy chọn)"
                    >
                        <Select 
                            placeholder="Chọn khóa học" 
                            allowClear
                            size="large"
                            onChange={async (value) => {
                                form.setFieldValue("studentId", undefined);
                                if (value) {
                                    const options = await loadStudents(value, "");
                                    setStudentOptions(options);
                                } else {
                                    setStudentOptions([]);
                                }
                            }}
                        >
                            {courses.map((course) => (
                                <Select.Option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="studentId"
                        label="Học viên"
                        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập ID học viên" }]}
                    >
                        <AutoComplete
                            options={studentOptions}
                            placeholder={form.getFieldValue("courseId") ? "Tìm kiếm học viên..." : "Chọn khóa học trước hoặc nhập ID học viên"}
                            size="large"
                            allowClear
                            notFoundContent={
                                loadingStudents ? "Đang tải..." : 
                                (form.getFieldValue("courseId") ? "Không tìm thấy học viên" : "Chọn khóa học trước để tìm học viên")
                            }
                            onSearch={async (value) => {
                                const courseId = form.getFieldValue("courseId");
                                if (courseId) {
                                    const options = await loadStudents(courseId, value);
                                    setStudentOptions(options);
                                } else if (value) {
                                    // Allow manual input if no course selected
                                    setStudentOptions([{ value: value, label: `ID: ${value}` }]);
                                }
                            }}
                            onFocus={async () => {
                                const courseId = form.getFieldValue("courseId");
                                if (courseId && studentOptions.length === 0) {
                                    const options = await loadStudents(courseId, "");
                                    setStudentOptions(options);
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Loại nhắc nhở"
                        initialValue="GENERAL"
                    >
                        <Select size="large">
                            <Select.Option value="GENERAL">Chung</Select.Option>
                            <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
                            <Select.Option value="LESSON_NOT_COMPLETED">Chưa hoàn thành bài học</Select.Option>
                            <Select.Option value="QUIZ_NOT_DONE">Chưa làm quiz</Select.Option>
                            <Select.Option value="EXAM_NOT_DONE">Chưa làm đề thi</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="message"
                        label="Nội dung nhắc nhở"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Nhập nội dung nhắc nhở..." 
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <div className="flex gap-2 justify-end">
                            <Button 
                                onClick={() => {
                                    setShowSendModal(false);
                                    form.resetFields();
                                }}
                                size="large"
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                size="large"
                                icon={<FontAwesomeIcon icon={faPaperPlane} />}
                            >
                                Gửi nhắc nhở
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            <Footer />
        </div>
    );
}

export default TAReminders;

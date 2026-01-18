import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faQuestionCircle, 
    faArrowLeft, 
    faCheckCircle, 
    faBookOpen, 
    faClock, 
    faUser,
    faSearch,
    faSort,
    faHandPaper,
    faReply,
    faGraduationCap,
    faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";
import { taService } from "../../api/ta.service";
import { courseService } from "../../api/course.service";
import { message, Input, Button, Tabs, Card, Tag, Space, Empty, Spin, Badge, Pagination } from "antd";
const { TextArea } = Input;
const { Search } = Input;

function TAQuestions() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [assignedQuestions, setAssignedQuestions] = useState([]);
    const [filteredPending, setFilteredPending] = useState([]);
    const [filteredAssigned, setFilteredAssigned] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [sortBy, setSortBy] = useState("newest");
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (!authService.isTeachingAssistantAuthenticated()) {
            navigate("/home");
            return;
        }
        loadQuestions();
        loadCourses();
    }, [activeTab]);

    useEffect(() => {
        applyFilters();
    }, [pendingQuestions, assignedQuestions, searchTerm, selectedCourse, sortBy, activeTab]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            if (activeTab === "pending") {
                const res = await taService.getPendingQuestions();
                if (res.success) {
                    if (Array.isArray(res.data)) {
                        setPendingQuestions(res.data);
                    } else {
                        console.error("Invalid data format:", res.data);
                        setPendingQuestions([]);
                        message.warning("Dữ liệu không hợp lệ");
                    }
                } else {
                    console.error("Error response:", res);
                    setPendingQuestions([]);
                    message.error(res.error || "Lỗi khi tải câu hỏi");
                }
            } else {
                const res = await taService.getMyAssignedQuestions();
                if (res.success) {
                    if (Array.isArray(res.data)) {
                        setAssignedQuestions(res.data);
                    } else {
                        console.error("Invalid data format:", res.data);
                        setAssignedQuestions([]);
                        message.warning("Dữ liệu không hợp lệ");
                    }
                } else {
                    console.error("Error response:", res);
                    setAssignedQuestions([]);
                    message.error(res.error || "Lỗi khi tải câu hỏi");
                }
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            if (activeTab === "pending") {
                setPendingQuestions([]);
            } else {
                setAssignedQuestions([]);
            }
            message.error("Lỗi khi tải câu hỏi: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            const res = await courseService.getAllCourses();
            if (res.success && Array.isArray(res.data)) {
                setCourses(res.data);
            }
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    };

    const applyFilters = () => {
        const questions = activeTab === "pending" ? pendingQuestions : assignedQuestions;
        let filtered = [...questions];

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(q => 
                q.content?.toLowerCase().includes(term) ||
                q.student?.username?.toLowerCase().includes(term) ||
                q.course?.course_name?.toLowerCase().includes(term) ||
                q.lesson?.title?.toLowerCase().includes(term)
            );
        }

        // Course filter
        if (selectedCourse) {
            filtered = filtered.filter(q => 
                q.course?.course_id === selectedCourse
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "course":
                    return (a.course?.course_name || "").localeCompare(b.course?.course_name || "");
                default:
                    return 0;
            }
        });

        if (activeTab === "pending") {
            setFilteredPending(filtered);
        } else {
            setFilteredAssigned(filtered);
        }
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleClaim = async (questionId) => {
        try {
            const res = await taService.claimQuestion(questionId);
            if (res.success) {
                message.success("Đã nhận câu hỏi thành công");
                loadQuestions();
            } else {
                message.error(res.error || "Lỗi khi nhận câu hỏi");
            }
        } catch (error) {
            message.error("Lỗi khi nhận câu hỏi");
        }
    };

    const handleAnswer = async (questionId) => {
        if (!replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung trả lời");
            return;
        }
        try {
            const res = await taService.answerQuestion(questionId, replyContent);
            if (res.success) {
                message.success("Đã trả lời câu hỏi thành công");
                setReplyingTo(null);
                setReplyContent("");
                loadQuestions();
            } else {
                message.error(res.error || "Lỗi khi trả lời");
            }
        } catch (error) {
            message.error("Lỗi khi trả lời câu hỏi");
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

    const getInitials = (name) => {
        if (!name) return "H";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const renderQuestion = (question) => (
        <Card
            key={question.id}
            className="mb-4 shadow-md hover:shadow-lg transition-shadow"
            bodyStyle={{ padding: "20px" }}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                    question.status === "ANSWERED" 
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-orange-500 to-red-600"
                }`}>
                    <FontAwesomeIcon 
                        icon={faQuestionCircle} 
                        className="text-white text-xl" 
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                            <span className="font-bold text-gray-900">
                                {question.student?.username || "Học viên"}
                            </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} />
                            {formatTimeAgo(question.createdAt)}
                        </span>
                        {!question.ta && activeTab === "pending" && (
                            <Tag color="orange" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>
                                Chưa có TA
                            </Tag>
                        )}
                        {question.status === "ANSWERED" && (
                            <Tag color="green" icon={<FontAwesomeIcon icon={faCheckCircle} />}>
                                Đã trả lời
                            </Tag>
                        )}
                        {question.status === "ASSIGNED" && (
                            <Tag color="blue">
                                Đã nhận
                            </Tag>
                        )}
                    </div>

                    {/* Question Content */}
                    <p className="text-gray-700 mb-4 text-base leading-relaxed whitespace-pre-wrap">
                        {question.content}
                    </p>

                    {/* Course and Lesson Info */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {question.course && (
                            <Tag 
                                icon={<FontAwesomeIcon icon={faBookOpen} />} 
                                color="blue"
                                className="px-3 py-1"
                            >
                                {question.course.course_name}
                            </Tag>
                        )}
                        {question.lesson && (
                            <Tag 
                                icon={<FontAwesomeIcon icon={faGraduationCap} />} 
                                color="purple"
                                className="px-3 py-1"
                            >
                                {question.lesson.title}
                            </Tag>
                        )}
                    </div>

                    {/* Actions */}
                    {replyingTo === question.id ? (
                        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <TextArea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Nhập câu trả lời của bạn..."
                                rows={4}
                                className="mb-3"
                                autoFocus
                            />
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faReply} />}
                                    onClick={() => handleAnswer(question.id)}
                                >
                                    Gửi trả lời
                                </Button>
                                <Button 
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent("");
                                    }}
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            {!question.ta && activeTab === "pending" ? (
                                <Button
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faHandPaper} />}
                                    onClick={() => handleClaim(question.id)}
                                    className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                                >
                                    Nhận câu hỏi
                                </Button>
                            ) : question.status !== "ANSWERED" && (
                                <Button
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faReply} />}
                                    onClick={() => setReplyingTo(question.id)}
                                >
                                    Trả lời câu hỏi
                                </Button>
                            )}
                        </div>
                    )}

                    {/* TA Response */}
                    {question.taResponse && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Đã trả lời:
                            </div>
                            <p className="text-green-700 whitespace-pre-wrap">{question.taResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );

    const currentQuestions = activeTab === "pending" ? filteredPending : filteredAssigned;

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
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Quản lý câu hỏi</h1>
                            <p className="text-gray-600">Xem và trả lời các câu hỏi "Hỏi trực tiếp" từ học viên</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge count={pendingQuestions.length} showZero>
                                <Tag color="orange" className="text-lg px-4 py-1">
                                    Đang chờ
                                </Tag>
                            </Badge>
                            <Badge count={assignedQuestions.length} showZero>
                                <Tag color="blue" className="text-lg px-4 py-1">
                                    Đã nhận
                                </Tag>
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key);
                        setSearchTerm("");
                        setSelectedCourse(null);
                    }}
                    items={[
                        {
                            key: "pending",
                            label: (
                                <span>
                                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                                    Đang chờ <Badge count={pendingQuestions.length} style={{ marginLeft: 8 }} />
                                </span>
                            ),
                        },
                        {
                            key: "assigned",
                            label: (
                                <span>
                                    <FontAwesomeIcon icon={faHandPaper} className="mr-2" />
                                    Đã nhận <Badge count={assignedQuestions.length} style={{ marginLeft: 8 }} />
                                </span>
                            ),
                        },
                    ]}
                    className="mb-6"
                    size="large"
                />

                {/* Filters */}
                <Card className="mb-6 shadow-md">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Search
                                placeholder="Tìm kiếm theo nội dung, học viên, khóa học..."
                                allowClear
                                enterButton={<FontAwesomeIcon icon={faSearch} />}
                                size="large"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select
                                placeholder="Lọc theo khóa học"
                                allowClear
                                style={{ width: 200 }}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                            >
                                {courses.map((course) => (
                                    <Select.Option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Select
                                placeholder="Sắp xếp"
                                style={{ width: 150 }}
                                value={sortBy}
                                onChange={setSortBy}
                                suffixIcon={<FontAwesomeIcon icon={faSort} />}
                            >
                                <Select.Option value="newest">Mới nhất</Select.Option>
                                <Select.Option value="oldest">Cũ nhất</Select.Option>
                                <Select.Option value="course">Theo khóa học</Select.Option>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Questions List */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Spin size="large" />
                    </div>
                ) : currentQuestions.length === 0 ? (
                    <Card className="shadow-lg">
                        <Empty
                            image={<FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500" />}
                            description={
                                <span className="text-gray-600 text-lg">
                                    {activeTab === "pending" 
                                        ? (pendingQuestions.length === 0 
                                            ? "Không có câu hỏi nào đang chờ" 
                                            : "Không tìm thấy câu hỏi phù hợp")
                                        : (assignedQuestions.length === 0 
                                            ? "Chưa có câu hỏi nào được phân công" 
                                            : "Không tìm thấy câu hỏi phù hợp")}
                                </span>
                            }
                        />
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {currentQuestions
                                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                .map(renderQuestion)}
                        </div>
                        {currentQuestions.length > pageSize && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={currentQuestions.length}
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }}
                                    showSizeChanger
                                    showTotal={(total) => `Tổng ${total} câu hỏi`}
                                    pageSizeOptions={['10', '20', '50']}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default TAQuestions;

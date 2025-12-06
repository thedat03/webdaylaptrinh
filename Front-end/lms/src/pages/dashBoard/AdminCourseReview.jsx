import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faEye, faUsers, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { message, Table, Card, Modal, Descriptions, Tag, Select } from "antd";
import { adminService } from "../../api/admin.service";
import { learningService } from "../../api/learning.service";

const { Option } = Select;

function AdminCourseReview() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [studentsModalVisible, setStudentsModalVisible] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Lấy tất cả khóa học bao gồm PENDING cho admin
            const result = await adminService.getAllCourses(true);
            if (result.success && result.data) {
                let coursesData = result.data;
                if (typeof coursesData === 'string' && coursesData.trim().startsWith('[')) {
                    try {
                        coursesData = JSON.parse(coursesData);
                    } catch (e) {
                        message.error("Tải khóa học thất bại: Dữ liệu không hợp lệ");
                        setCourses([]);
                        return;
                    }
                }
                if (Array.isArray(coursesData)) {
                    setCourses(coursesData);
                } else if (coursesData && Array.isArray(coursesData.data)) {
                    setCourses(coursesData.data);
                } else if (coursesData && Array.isArray(coursesData.courses)) {
                    setCourses(coursesData.courses);
                } else {
                    setCourses([]);
                }
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            message.error("Tải khóa học thất bại");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourse = (course) => {
        setSelectedCourse(course);
        setViewModalVisible(true);
    };

    const handleViewStudents = async (course) => {
        setSelectedCourse(course);
        setStudentsModalVisible(true);
        setLoadingStudents(true);
        try {
            const result = await learningService.getStudentsByCourse(course.course_id);
            if (result.success && result.data) {
                const studentsData = result.data.map(learning => ({
                    id: learning.id,
                    userId: learning.user?.id,
                    username: learning.user?.username || "N/A",
                    email: learning.user?.email || "N/A",
                    profileImage: learning.user?.profileImage,
                    enrolledDate: learning.id ? new Date().toLocaleDateString() : "N/A"
                }));
                setStudents(studentsData);
            } else {
                message.error(result.error || "Tải danh sách học viên thất bại");
            }
        } catch (error) {
            console.error("Error loading students:", error);
            message.error("Tải danh sách học viên thất bại");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleApprove = async (course) => {
        try {
            const result = await adminService.approveCourse(course.course_id);
            if (result.success) {
                message.success(`Đã duyệt khóa học: ${course.course_name}`);
                fetchCourses();
            } else {
                message.error(result.error || "Duyệt khóa học thất bại");
            }
        } catch (error) {
            console.error("Error approving course:", error);
            message.error("Duyệt khóa học thất bại");
        }
    };

    const handleReject = async (course) => {
        try {
            const result = await adminService.rejectCourse(course.course_id);
            if (result.success) {
                message.warning(`Đã từ chối khóa học: ${course.course_name}`);
                fetchCourses();
            } else {
                message.error(result.error || "Từ chối khóa học thất bại");
            }
        } catch (error) {
            console.error("Error rejecting course:", error);
            message.error("Từ chối khóa học thất bại");
        }
    };

    const columns = [
        {
            title: "Tên khóa học",
            dataIndex: "course_name",
            key: "course_name",
            sorter: (a, b) => a.course_name.localeCompare(b.course_name),
        },
        {
            title: "Giảng viên",
            dataIndex: "instructor",
            key: "instructor",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price) => price ? `$${price}` : "Miễn phí",
        },
        {
            title: "Học viên",
            dataIndex: "students",
            key: "students",
            render: (students) => students || 0,
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => {
                const status = record.status || "PENDING";
                if (status === "APPROVED") {
                    return <Tag color="green">Đã duyệt</Tag>;
                } else if (status === "PENDING") {
                    return <Tag color="orange">Chờ duyệt</Tag>;
                } else if (status === "REJECTED") {
                    return <Tag color="red">Đã từ chối</Tag>;
                }
                return <Tag color="default">{status}</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: 280,
            render: (_, record) => {
                const status = record.status || "PENDING";
                const isApproved = status === "APPROVED";
                const isRejected = status === "REJECTED";
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleViewCourse(record)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                        >
                            <FontAwesomeIcon icon={faEye} /> Xem
                        </button>
                        <button
                            onClick={() => handleViewStudents(record)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
                        >
                            <FontAwesomeIcon icon={faUsers} /> Học viên
                        </button>
                        <button
                            onClick={() => handleApprove(record)}
                            disabled={isApproved}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${isApproved
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />{" "}
                            {isApproved ? "Đã duyệt" : "Duyệt"}
                        </button>
                        <button
                            onClick={() => handleReject(record)}
                            disabled={isRejected}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${isRejected
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            <FontAwesomeIcon icon={faTimesCircle} />{" "}
                            {isRejected ? "Đã từ chối" : "Từ chối"}
                        </button>
                    </div>
                );
            },
        },
    ];

    const studentColumns = [
        {
            title: "Tên học viên",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Ngày đăng ký",
            dataIndex: "enrolledDate",
            key: "enrolledDate",
        },
    ];

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Duyệt khóa học</h1>
                <p className="text-gray-600">Xem và duyệt các khóa học được tạo bởi giáo viên</p>
            </div>

            <Card className="shadow-lg overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={courses}
                    loading={loading}
                    rowKey="course_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} khóa học`,
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            {/* Course Detail Modal */}
            <Modal
                title="Chi tiết khóa học"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: 800 }}
            >
                {selectedCourse && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tên khóa học" span={2}>
                            {selectedCourse.course_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giảng viên">
                            {selectedCourse.instructor || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá">
                            {selectedCourse.price ? `$${selectedCourse.price}` : "Miễn phí"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả" span={2}>
                            {selectedCourse.description || "Không có mô tả"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số học viên">
                            {selectedCourse.students || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                            {selectedCourse.rating ? `${selectedCourse.rating}/5` : "Chưa có đánh giá"}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Students Modal */}
            <Modal
                title={`Danh sách học viên - ${selectedCourse?.course_name || ""}`}
                open={studentsModalVisible}
                onCancel={() => setStudentsModalVisible(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: 800 }}
            >
                <Table
                    columns={studentColumns}
                    dataSource={students}
                    loading={loadingStudents}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} học viên`,
                    }}
                />
            </Modal>
        </div>
    );
}

export default AdminCourseReview;


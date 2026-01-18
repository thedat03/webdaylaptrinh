import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUsers, 
    faBookOpen, 
    faPlus,
    faTrash,
    faSearch,
    faUser,
    faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { adminService } from "../../api/admin.service";
import { message, Select, Table, Card, Button, Modal, Form, Input, Space, Empty, Spin, Tag, Popconfirm } from "antd";
const { Search } = Input;

function TAAssignments() {
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [tas, setTAs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTA, setSelectedTA] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [assignments, searchTerm, selectedTA, selectedCourse]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [assignmentsRes, tasRes, coursesRes] = await Promise.all([
                adminService.getAllAssignments(),
                adminService.getAllTAs(),
                adminService.getAllCourses()
            ]);

            if (assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
                setAssignments(assignmentsRes.data);
            } else {
                message.error(assignmentsRes.error || "Lỗi khi tải phân công");
            }

            if (tasRes.success && Array.isArray(tasRes.data)) {
                setTAs(tasRes.data);
            } else {
                message.error(tasRes.error || "Lỗi khi tải danh sách trợ giảng");
            }

            if (coursesRes.success && Array.isArray(coursesRes.data)) {
                setCourses(coursesRes.data);
            } else {
                message.error(coursesRes.error || "Lỗi khi tải danh sách khóa học");
            }
        } catch (error) {
            console.error("Error loading data:", error);
            message.error("Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...assignments];

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(assignment => {
                const taName = assignment.ta?.username || "";
                const courseName = assignment.course?.course_name || "";
                return taName.toLowerCase().includes(term) || 
                       courseName.toLowerCase().includes(term);
            });
        }

        // TA filter
        if (selectedTA) {
            filtered = filtered.filter(assignment => 
                assignment.ta?.id === selectedTA || 
                String(assignment.ta?.id) === String(selectedTA)
            );
        }

        // Course filter
        if (selectedCourse) {
            filtered = filtered.filter(assignment => 
                assignment.course?.course_id === selectedCourse ||
                String(assignment.course?.course_id) === String(selectedCourse)
            );
        }

        setFilteredAssignments(filtered);
    };

    const handleAssign = async (values) => {
        try {
            const res = await adminService.assignTAToCourse(values.taId, values.courseId);
            if (res.success) {
                message.success("Phân công thành công");
                setIsModalVisible(false);
                form.resetFields();
                loadData();
            } else {
                message.error(res.error || "Lỗi khi phân công");
            }
        } catch (error) {
            message.error("Lỗi khi phân công");
        }
    };

    const handleDelete = async (assignmentId) => {
        try {
            const res = await adminService.deleteAssignment(assignmentId);
            if (res.success) {
                message.success("Đã xóa phân công");
                loadData();
            } else {
                message.error(res.error || "Lỗi khi xóa phân công");
            }
        } catch (error) {
            message.error("Lỗi khi xóa phân công");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const columns = [
        {
            title: "Trợ giảng",
            key: "ta",
            render: (_, record) => {
                const ta = record.ta;
                if (!ta) {
                    return <span className="text-red-500">N/A - Không tìm thấy trợ giảng</span>;
                }
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {getInitials(ta.username || ta.email || "U")}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{ta.username || ta.email || "N/A"}</div>
                            <div className="text-sm text-gray-500">{ta.email || ""}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Khóa học",
            key: "course",
            render: (_, record) => {
                const course = record.course;
                if (!course) {
                    return <span className="text-red-500">N/A - Không tìm thấy khóa học</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBookOpen} className="text-indigo-600" />
                        <span className="font-medium">{course.course_name || course.title || "N/A"}</span>
                    </div>
                );
            },
        },
        {
            title: "Ngày phân công",
            key: "assignedAt",
            render: (_, record) => (
                <div className="text-gray-600">
                    {formatDate(record.assignedAt)}
                </div>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Popconfirm
                    title="Xóa phân công này?"
                    description="Trợ giảng sẽ không thể quản lý khóa học này nữa"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        danger
                        icon={<FontAwesomeIcon icon={faTrash} />}
                        size="small"
                    >
                        Xóa
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const stats = {
        total: assignments.length,
        totalTAs: tas.length,
        totalCourses: courses.length,
        assignedCourses: new Set(assignments.map(a => a.course?.course_id)).size
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="max-w-full">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Phân công Trợ giảng</h1>
                            <p className="text-gray-600">Quản lý phân công trợ giảng cho các khóa học</p>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => setIsModalVisible(true)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            Phân công mới
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Tổng phân công</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUsers} className="text-indigo-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Tổng trợ giảng</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalTAs}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Tổng khóa học</p>
                                <p className="text-2xl font-bold text-green-600">{stats.totalCourses}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faBookOpen} className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Khóa học đã phân công</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.assignedCourses}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <Search
                                placeholder="Tìm kiếm theo tên trợ giảng, khóa học..."
                                allowClear
                                enterButton={<FontAwesomeIcon icon={faSearch} />}
                                size="large"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Select
                            placeholder="Lọc theo trợ giảng"
                            allowClear
                            style={{ width: "100%" }}
                            value={selectedTA}
                            onChange={setSelectedTA}
                            size="large"
                        >
                            {tas.map((ta) => (
                                <Select.Option key={ta.id} value={ta.id}>
                                    {ta.username} ({ta.email})
                                </Select.Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Lọc theo khóa học"
                            allowClear
                            style={{ width: "100%" }}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            size="large"
                        >
                            {courses.map((course) => (
                                <Select.Option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </Card>

                {/* Assignments Table */}
                {loading ? (
                    <Card className="shadow-lg">
                        <div className="p-12 text-center">
                            <Spin size="large" />
                        </div>
                    </Card>
                ) : filteredAssignments.length === 0 ? (
                    <Card className="shadow-lg">
                        <Empty
                            image={<FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-400" />}
                            description={
                                <span className="text-gray-600 text-lg">
                                    {assignments.length === 0 
                                        ? "Chưa có phân công nào. Hãy tạo phân công mới!" 
                                        : "Không tìm thấy phân công phù hợp"}
                                </span>
                            }
                        />
                    </Card>
                ) : (
                    <Card className="shadow-lg">
                        <Table
                            columns={columns}
                            dataSource={filteredAssignments}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} phân công`,
                            }}
                        />
                    </Card>
                )}

                {/* Assign Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faPlus} className="text-indigo-600" />
                            <span>Phân công Trợ giảng</span>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAssign}
                        className="mt-4"
                    >
                        <Form.Item
                            label="Chọn Trợ giảng"
                            name="taId"
                            rules={[{ required: true, message: "Vui lòng chọn trợ giảng" }]}
                        >
                            <Select
                                placeholder="Chọn trợ giảng"
                                size="large"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {tas.map((ta) => (
                                    <Select.Option key={ta.id} value={ta.id} label={`${ta.username} (${ta.email})`}>
                                        <div>
                                            <div className="font-semibold">{ta.username}</div>
                                            <div className="text-sm text-gray-500">{ta.email}</div>
                                        </div>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Chọn Khóa học"
                            name="courseId"
                            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                        >
                            <Select
                                placeholder="Chọn khóa học"
                                size="large"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {courses.map((course) => (
                                    <Select.Option key={course.course_id} value={course.course_id} label={course.course_name}>
                                        {course.course_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Space className="w-full justify-end">
                                <Button onClick={() => {
                                    setIsModalVisible(false);
                                    form.resetFields();
                                }}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                    Phân công
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}

export default TAAssignments;

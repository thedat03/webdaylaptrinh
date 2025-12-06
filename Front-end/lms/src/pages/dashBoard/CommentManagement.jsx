import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    Tag,
    message,
    Modal,
    Descriptions,
    Select,
    Input,
    Card
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    SearchOutlined
} from "@ant-design/icons";
import { commentService } from "../../api/comment.service";
import { courseService } from "../../api/course.service";

const { Option } = Select;
const { Search } = Input;

function CommentManagement() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all"); // all, recent
    const [filterLesson, setFilterLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    useEffect(() => {
        loadAllComments();
        loadLessons();
    }, []);

    useEffect(() => {
        loadAllComments();
    }, [filterStatus, filterLesson, searchText]);

    const loadAllComments = async () => {
        setLoading(true);
        try {
            // Lấy tất cả comment
            const result = await commentService.getAllComments();
            if (result.success) {
                let filtered = result.data || [];

                // Nếu filterStatus là "recent", chỉ lấy comment trong 7 ngày qua
                if (filterStatus === "recent") {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    filtered = filtered.filter(c => {
                        const commentDate = new Date(c.createdAt);
                        return commentDate >= sevenDaysAgo;
                    });
                }

                if (filterLesson) {
                    filtered = filtered.filter(c => c.lesson?.lesson_id === filterLesson);
                }
                if (searchText) {
                    filtered = filtered.filter(c =>
                        c.content.toLowerCase().includes(searchText.toLowerCase()) ||
                        c.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                        c.lesson?.title?.toLowerCase().includes(searchText.toLowerCase())
                    );
                }

                // Sắp xếp theo thời gian mới nhất
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setComments(filtered);
            } else {
                message.error("Tải danh sách bình luận thất bại");
            }
        } catch (error) {
            console.error("Error loading comments:", error);
            message.error("Lỗi khi tải bình luận");
        } finally {
            setLoading(false);
        }
    };

    const loadLessons = async () => {
        try {
            const result = await courseService.getAllCourses();
            if (result.success) {
                // Extract all lessons from courses
                const allLessons = [];
                result.data.forEach(course => {
                    // Assuming course has modules and lessons
                    // This might need adjustment based on your data structure
                });
                setLessons(allLessons);
            }
        } catch (error) {
            console.error("Error loading lessons:", error);
        }
    };

    const handleDelete = (commentId) => {
        console.log("handleDelete called with commentId:", commentId);
        setCommentToDelete(commentId);
        setDeleteConfirmVisible(true);
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;

        const commentId = commentToDelete;
        console.log("User confirmed deletion for:", commentId);

        try {
            // Xóa comment khỏi state ngay lập tức (optimistic update)
            setComments(prev => {
                const filtered = prev.filter(c => c.commentId !== commentId);
                console.log("Comments after filter:", filtered.length);
                return filtered;
            });

            const result = await commentService.deleteComment(commentId);
            console.log("Delete result:", result);

            if (result.success) {
                message.success("Đã xóa bình luận");
                // Load lại để đảm bảo đồng bộ
                await loadAllComments();
            } else {
                // Nếu xóa thất bại, load lại để khôi phục
                message.error(result.error || "Không thể xóa bình luận");
                await loadAllComments();
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            message.error("Lỗi khi xóa bình luận");
            // Load lại để khôi phục
            await loadAllComments();
        } finally {
            setDeleteConfirmVisible(false);
            setCommentToDelete(null);
        }
    };

    const cancelDelete = () => {
        console.log("User cancelled deletion");
        setDeleteConfirmVisible(false);
        setCommentToDelete(null);
    };

    const handleView = (comment) => {
        setSelectedComment(comment);
        setViewModalVisible(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("vi-VN");
    };

    const getUserRoleBadge = (role) => {
        const roleName = role?.replace("ROLE_", "") || "";
        const colors = {
            ADMIN: "red",
            INSTRUCTOR: "purple",
            TEACHING_ASSISTANT: "orange",
            STUDENT: "green",
            USER: "blue"
        };
        return <Tag color={colors[roleName] || "default"}>{roleName}</Tag>;
    };

    const columns = [
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            render: (text) => (
                <div className="max-w-md">
                    {text?.substring(0, 100)}
                    {text?.length > 100 && "..."}
                </div>
            )
        },
        {
            title: "Người dùng",
            key: "user",
            render: (_, record) => (
                <div>
                    <div className="font-semibold">{record.user?.username || "N/A"}</div>
                    {getUserRoleBadge(record.user?.role)}
                </div>
            )
        },
        {
            title: "Bài học",
            key: "lesson",
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.lesson?.title || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                        Module: {record.lesson?.module?.title || "N/A"}
                    </div>
                </div>
            )
        },
        {
            title: "Đánh giá",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => rating ? `⭐ ${rating}/5` : "—"
        },
        {
            title: "Trạng thái",
            dataIndex: "isApproved",
            key: "isApproved",
            render: (isApproved) => (
                <Tag color={isApproved ? "green" : "red"}>
                    {isApproved ? "Đang hiển thị" : "Đã ẩn"}
                </Tag>
            )
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => formatDate(date)
        },
        {
            title: "Hành động",
            key: "actions",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        size="small"
                    >
                        Xem
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleDelete(record.commentId)}
                        size="small"
                    >
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="mb-8">
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                    Quản lý Bình luận
                </h3>
                <p className="text-slate-600 mt-2">
                    Duyệt, từ chối và quản lý các bình luận của học viên
                </p>
            </div>

            <Card className="shadow-xl">
                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="recent">7 ngày qua</Option>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Bài học:</span>
                        <Select
                            value={filterLesson}
                            onChange={setFilterLesson}
                            allowClear
                            style={{ width: 200 }}
                            placeholder="Chọn bài học"
                        >
                            {/* Options sẽ được load từ API */}
                        </Select>
                    </div>
                    <Search
                        placeholder="Tìm kiếm nội dung, người dùng..."
                        allowClear
                        style={{ width: 300 }}
                        onSearch={setSearchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            // Search sẽ tự động trigger loadAllComments qua useEffect
                        }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={comments}
                    loading={loading}
                    rowKey="commentId"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} bình luận`
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            {/* Delete Confirm Modal */}
            <Modal
                title="Xác nhận xóa"
                open={deleteConfirmVisible}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okText="Xóa"
                okType="danger"
                cancelText="Hủy"
                width="90%"
                style={{ maxWidth: 500 }}
                centered
            >
                <p>Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.</p>
            </Modal>

            {/* View Comment Modal */}
            <Modal
                title="Chi tiết bình luận"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedComment && (
                        <Button
                            key="delete"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => {
                                setViewModalVisible(false);
                                // Đợi một chút để modal đóng trước khi hiển thị confirm
                                setTimeout(() => {
                                    handleDelete(selectedComment.commentId);
                                }, 100);
                            }}
                        >
                            Xóa bình luận
                        </Button>
                    )
                ]}
                width="90%"
                style={{ maxWidth: 800 }}
            >
                {selectedComment && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Người dùng">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{selectedComment.user?.username}</span>
                                {getUserRoleBadge(selectedComment.user?.role)}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Bài học">
                            {selectedComment.lesson?.title || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                            {selectedComment.rating ? `⭐ ${selectedComment.rating}/5` : "Không có"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung">
                            <div className="whitespace-pre-wrap">{selectedComment.content}</div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={selectedComment.isApproved ? "green" : "red"}>
                                {selectedComment.isApproved ? "Đang hiển thị" : "Đã ẩn"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {formatDate(selectedComment.createdAt)}
                        </Descriptions.Item>
                        {selectedComment.parentComment && (
                            <Descriptions.Item label="Phản hồi cho">
                                {selectedComment.parentComment.content?.substring(0, 100)}...
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}

export default CommentManagement;


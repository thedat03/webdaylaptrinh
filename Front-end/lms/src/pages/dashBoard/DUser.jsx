import React, { useEffect, useState } from "react";
import {
    Table,
    Modal,
    Form,
    Input,
    Select,
    Button,
    Space,
    Avatar,
    Tag,
    message,
    Descriptions,
    Row,
    Col,
    Card
} from "antd";
import { EyeOutlined, EditOutlined, UserOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { adminService } from "../../api/admin.service";

const { Option } = Select;
const { confirm } = Modal;

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm] = Form.useForm();
    const [createForm] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllUsers();
            if (res.success) {
                setUsers(res.data);
            } else {
                message.error("Tải danh sách người dùng thất bại");
            }
        } catch {
            message.error("Lỗi khi tải người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setViewModalVisible(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        editForm.setFieldsValue({
            username: user.username,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            isActive: user.isActive,
            dob: user.dob,
            gender: user.gender,
            location: user.location,
            profession: user.profession,
            linkedin_url: user.linkedin_url,
            github_url: user.github_url,
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            const res = await adminService.updateUser(selectedUser.id, values);
            if (res.success) {
                message.success("Cập nhật người dùng thành công");
                setEditModalVisible(false);
                editForm.resetFields();
                fetchUsers(); // Refresh the users list
            } else {
                message.error("Cập nhật người dùng thất bại");
            }
        } catch {
            message.error("Lỗi khi cập nhật người dùng");
        }
    };

    const handleDeleteUser = async (user) => {
        confirm({
            title: "Xóa người dùng",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn xóa tài khoản "${user.username}"? Hành động này không thể hoàn tác.`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            centered: true,
            async onOk() {
                try {
                    const res = await adminService.deleteUser(user.id);
                    if (res.success) {
                        message.success("Xóa người dùng thành công");
                        // Nếu đang xem chi tiết của user vừa bị xóa thì đóng modal
                        if (selectedUser && selectedUser.id === user.id) {
                            setViewModalVisible(false);
                            setSelectedUser(null);
                        }
                        fetchUsers();
                    } else {
                        message.error(res.error || "Xóa người dùng thất bại");
                    }
                } catch {
                    message.error("Lỗi khi xóa người dùng");
                }
            },
        });
    };

    const handleCreate = () => {
        createForm.resetFields();
        setCreateModalVisible(true);
    };

    const handleCreateSubmit = async (values) => {
        try {
            const res = await adminService.createUser(values);
            if (res.success) {
                message.success("Tạo người dùng thành công");
                setCreateModalVisible(false);
                createForm.resetFields();
                fetchUsers(); // Refresh the users list
            } else {
                message.error(res.error || "Tạo người dùng thất bại");
            }
        } catch {
            message.error("Lỗi khi tạo người dùng");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const columns = [
        {
            title: "Ảnh đại diện",
            dataIndex: "profileImage",
            key: "avatar",
            width: 80,
            render: (profileImage) => (
                <Avatar
                    size={40}
                    src={profileImage ? `data:image/jpeg;base64,${profileImage}` : null}
                    icon={<UserOutlined />}
                />
            ),
        },
        {
            title: "Tên người dùng",
            dataIndex: "username",
            key: "username",
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: "Số điện thoại",
            dataIndex: "mobileNumber",
            key: "mobileNumber",
            render: (phone) => phone || "N/A",
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const roleName = role?.replace("ROLE_", "") || role;
                let color = "blue";
                if (roleName === "ADMIN") color = "red";
                else if (roleName === "INSTRUCTOR") color = "purple";
                else if (roleName === "TEACHING_ASSISTANT") color = "orange";
                else if (roleName === "STUDENT") color = "green";
                return <Tag color={color}>{roleName}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Hoạt động" : "Ngừng"}
                </Tag>
            ),
        },
        {
            title: "Nghề nghiệp",
            dataIndex: "profession",
            key: "profession",
            render: (profession) => profession || "N/A",
        },
        {
            title: "Hành động",
            key: "actions",
            width: 180,
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
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteUser(record)}
                        size="small"
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Quản lý người dùng
                    </h3>
                    <p className="text-slate-600 mt-2">
                        Quản lý và xem tất cả người dùng đã đăng ký
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    size="large"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                >
                    Tạo người dùng mới
                </Button>
            </div>

            <Card className="shadow-xl overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            {/* View User Modal */}
            <Modal
                title="Chi tiết người dùng"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width="90%"
                style={{ maxWidth: 800 }}
            >
                {selectedUser && (
                    <div>
                        <Row gutter={24} className="mb-4">
                            <Col span={6}>
                                <div className="text-center">
                                    <Avatar
                                        size={80}
                                        src={
                                            selectedUser.profileImage
                                                ? `data:image/jpeg;base64,${selectedUser.profileImage}`
                                                : null
                                        }
                                        icon={<UserOutlined />}
                                    />
                                    <div className="mt-2">
                                        <Tag
                                            color={selectedUser.isActive ? "green" : "red"}
                                            className="mb-2"
                                        >
                                            {selectedUser.isActive ? "Active" : "Inactive"}
                                        </Tag>
                                        <br />
                                        <Tag color={
                                            selectedUser.role?.includes("ADMIN") ? "red" :
                                                selectedUser.role?.includes("INSTRUCTOR") ? "purple" :
                                                    selectedUser.role?.includes("TEACHING_ASSISTANT") ? "orange" :
                                                        selectedUser.role?.includes("STUDENT") ? "green" : "blue"
                                        }>
                                            {selectedUser.role?.replace("ROLE_", "") || selectedUser.role}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                            <Col span={18}>
                                <Descriptions column={2} bordered size="small">
                                    <Descriptions.Item label="Tên người dùng" span={1}>
                                        {selectedUser.username}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email" span={1}>
                                        {selectedUser.email}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại" span={1}>
                                        {selectedUser.mobileNumber || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh" span={1}>
                                        {selectedUser.dob || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giới tính" span={1}>
                                        {selectedUser.gender || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ" span={1}>
                                        {selectedUser.location || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Nghề nghiệp" span={2}>
                                        {selectedUser.profession || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="LinkedIn" span={1}>
                                        {selectedUser.linkedin_url ? (
                                            <a
                                                href={selectedUser.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Xem hồ sơ
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="GitHub" span={1}>
                                        {selectedUser.github_url ? (
                                            <a
                                                href={selectedUser.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Xem hồ sơ
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tạo lúc" span={1}>
                                        {formatDate(selectedUser.createdAt)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật" span={1}>
                                        {formatDate(selectedUser.updatedAt)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title="Sửa người dùng"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: 700 }}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    className="mt-4"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên người dùng"
                                name="username"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên người dùng!" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email!" },
                                    { type: "email", message: "Vui lòng nhập email hợp lệ!" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="mobileNumber">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày sinh" name="dob">
                                <Input placeholder="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Vai trò" name="role">
                                <Select>
                                    <Option value="USER">USER</Option>
                                    <Option value="STUDENT">STUDENT (Học viên)</Option>
                                    <Option value="ADMIN">ADMIN</Option>
                                    <Option value="INSTRUCTOR">INSTRUCTOR (Giáo viên)</Option>
                                    <Option value="TEACHING_ASSISTANT">TEACHING_ASSISTANT (Trợ giảng)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Trạng thái" name="isActive">
                                <Select>
                                    <Option value={true}>Hoạt động</Option>
                                    <Option value={false}>Ngừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Giới tính" name="gender">
                                <Select placeholder="Chọn giới tính">
                                    <Option value="Male">Nam</Option>
                                    <Option value="Female">Nữ</Option>
                                    <Option value="Other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Địa chỉ" name="location">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Nghề nghiệp" name="profession">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Đường dẫn LinkedIn"
                                name="linkedin_url"
                                rules={[{ type: "url", message: "Vui lòng nhập URL hợp lệ!" }]}
                            >
                                <Input placeholder="https://linkedin.com/in/ten-cua-ban" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Đường dẫn GitHub"
                                name="github_url"
                                rules={[{ type: "url", message: "Vui lòng nhập URL hợp lệ!" }]}
                            >
                                <Input placeholder="https://github.com/tai-khoan-cua-ban" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="text-right">
                        <Space>
                            <Button onClick={() => setEditModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create User Modal */}
            <Modal
                title="Tạo người dùng mới"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: 700 }}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateSubmit}
                    className="mt-4"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên người dùng"
                                name="username"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên người dùng!" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email!" },
                                    { type: "email", message: "Vui lòng nhập email hợp lệ!" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="mobileNumber">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Vai trò"
                                name="role"
                                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value="USER">USER</Option>
                                    <Option value="STUDENT">STUDENT (Học viên)</Option>
                                    <Option value="INSTRUCTOR">INSTRUCTOR (Giáo viên)</Option>
                                    <Option value="TEACHING_ASSISTANT">TEACHING_ASSISTANT (Trợ giảng)</Option>
                                    <Option value="ADMIN">ADMIN</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Trạng thái"
                                name="isActive"
                                initialValue={true}
                            >
                                <Select>
                                    <Option value={true}>Hoạt động</Option>
                                    <Option value={false}>Ngừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Ngày sinh" name="dob">
                                <Input placeholder="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Giới tính" name="gender">
                                <Select placeholder="Chọn giới tính">
                                    <Option value="Male">Nam</Option>
                                    <Option value="Female">Nữ</Option>
                                    <Option value="Other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Địa chỉ" name="location">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Nghề nghiệp" name="profession">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Đường dẫn LinkedIn"
                                name="linkedin_url"
                                rules={[{ type: "url", message: "Vui lòng nhập URL hợp lệ!" }]}
                            >
                                <Input placeholder="https://linkedin.com/in/ten-cua-ban" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Đường dẫn GitHub"
                                name="github_url"
                                rules={[{ type: "url", message: "Vui lòng nhập URL hợp lệ!" }]}
                            >
                                <Input placeholder="https://github.com/tai-khoan-cua-ban" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="text-right">
                        <Space>
                            <Button onClick={() => setCreateModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Tạo người dùng
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Users;
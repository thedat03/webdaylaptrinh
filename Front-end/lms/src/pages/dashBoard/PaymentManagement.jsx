import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Row, Select, Table, Tag, message } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { paymentService } from "../../api/payment.service";

const STATUS_COLORS = {
    PAID: "green",
    PENDING: "gold",
    FAILED: "red",
};

function PaymentManagement() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentService.getAllPayments();
            if (res.success) {
                setPayments(res.data);
            } else {
                message.error(res.error || "Không thể tải danh sách thanh toán");
            }
        } catch (error) {
            console.error(error);
            message.error("Đã xảy ra lỗi khi tải thanh toán");
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const keyword = search.trim().toLowerCase();
            const matchesSearch =
                !keyword ||
                payment.username?.toLowerCase().includes(keyword) ||
                payment.email?.toLowerCase().includes(keyword) ||
                payment.courseName?.toLowerCase().includes(keyword) ||
                payment.txnRef?.toLowerCase().includes(keyword);
            const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, search, statusFilter]);

    const summary = useMemo(() => {
        const paidRevenue = payments
            .filter((payment) => payment.status === "PAID")
            .reduce((sum, current) => sum + (current.amount || 0), 0);

        return {
            totalPayments: payments.length,
            paidPayments: payments.filter((p) => p.status === "PAID").length,
            pendingPayments: payments.filter((p) => p.status === "PENDING").length,
            failedPayments: payments.filter((p) => p.status === "FAILED").length,
            totalRevenue: paidRevenue,
        };
    }, [payments]);

    const formatCurrency = (value) =>
        typeof value === "number"
            ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            : "0 ₫";

    const formatDateTime = (value) => {
        if (!value) return "Chưa ghi nhận";
        return new Date(value).toLocaleString("vi-VN", {
            hour12: false,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const columns = [
        {
            title: "Học viên",
            dataIndex: "username",
            key: "username",
            render: (_, record) => (
                <div>
                    <p className="font-semibold text-slate-800">{record.username}</p>
                    <p className="text-xs text-slate-500">{record.email}</p>
                </div>
            ),
        },
        {
            title: "Khóa học",
            dataIndex: "courseName",
            key: "courseName",
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => <span className="font-semibold">{formatCurrency(amount)}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={STATUS_COLORS[status] || "default"} className="px-3 py-1 text-sm">
                    {status === "PAID" && "Thành công"}
                    {status === "PENDING" && "Đang xử lý"}
                    {status === "FAILED" && "Thất bại"}
                    {!["PAID", "PENDING", "FAILED"].includes(status) && status}
                </Tag>
            ),
            filters: [
                { text: "Thành công", value: "PAID" },
                { text: "Đang xử lý", value: "PENDING" },
                { text: "Thất bại", value: "FAILED" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Thời gian thanh toán",
            dataIndex: "payDate",
            key: "payDate",
            render: (_, record) => formatDateTime(record.payDate || record.createdAt),
        },
        {
            title: "Mã giao dịch",
            dataIndex: "txnRef",
            key: "txnRef",
        },
        {
            title: "Ngân hàng",
            dataIndex: "bankCode",
            key: "bankCode",
            render: (value) => value || "Không chọn",
        },
    ];

    return (
        <div className="w-full max-w-full overflow-x-hidden space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Quản lý thanh toán</h2>
                <p className="text-slate-500 mt-1">
                    Theo dõi những học viên đã thanh toán khoá học và trạng thái giao dịch
                </p>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                    <Card className="shadow-md">
                        <p className="text-sm text-slate-500">Tổng giao dịch</p>
                        <p className="text-2xl font-semibold">{summary.totalPayments}</p>
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="shadow-md">
                        <p className="text-sm text-slate-500">Giao dịch thành công</p>
                        <p className="text-2xl font-semibold text-emerald-600">{summary.paidPayments}</p>
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="shadow-md">
                        <p className="text-sm text-slate-500">Đang xử lý</p>
                        <p className="text-2xl font-semibold text-amber-500">{summary.pendingPayments}</p>
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="shadow-md">
                        <p className="text-sm text-slate-500">Doanh thu xác nhận</p>
                        <p className="text-2xl font-semibold text-blue-600">{formatCurrency(summary.totalRevenue)}</p>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div className="flex gap-3 flex-1">
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo tên, email, khoá học hoặc mã giao dịch"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "ALL", label: "Tất cả trạng thái" },
                                { value: "PAID", label: "Thành công" },
                                { value: "PENDING", label: "Đang xử lý" },
                                { value: "FAILED", label: "Thất bại" },
                            ]}
                            style={{ width: 180 }}
                        />
                    </div>
                    <Button icon={<ReloadOutlined />} onClick={fetchPayments}>
                        Làm mới
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredPayments}
                    loading={loading}
                    rowKey={(record) => record.paymentId || record.txnRef}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} giao dịch`,
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
}

export default PaymentManagement;



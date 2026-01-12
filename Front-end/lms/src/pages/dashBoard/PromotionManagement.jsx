import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faImage, faTag, faCalendarAlt, faPercent } from "@fortawesome/free-solid-svg-icons";
import { message, Modal, Form, Input, InputNumber, Switch, Upload, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { promotionService } from "../../api/promotion.service";
import { adminService } from "../../api/admin.service";
import DeleteModal from "./DeleteModal";
import dayjs from "dayjs";

const { TextArea } = Input;

function PromotionManagement() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promotionModal, setPromotionModal] = useState({ isOpen: false, mode: "add", promotionId: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, promotion: null });
    const [imageUploading, setImageUploading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const result = await promotionService.getAllPromotionsAdmin();
            if (result.success && result.data) {
                setPromotions(Array.isArray(result.data) ? result.data : []);
            } else {
                message.error(result.error || "Tải khuyến mãi thất bại");
                setPromotions([]);
            }
        } catch (error) {
            console.error("Error fetching promotions:", error);
            message.error("Tải khuyến mãi thất bại");
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const openAddPromotionModal = () => {
        form.resetFields();
        form.setFieldsValue({
            is_active: true,
            discount_percent: 0
        });
        setPromotionModal({ isOpen: true, mode: "add", promotionId: null });
        setImageUploading(false);
    };

    const openEditPromotionModal = (promotion) => {
        form.setFieldsValue({
            title: promotion.title,
            description: promotion.description || "",
            discount_percent: promotion.discount_percent || 0,
            start_date: promotion.start_date ? dayjs(promotion.start_date) : null,
            end_date: promotion.end_date ? dayjs(promotion.end_date) : null,
            image_url: promotion.image_url,
            code: promotion.code || "",
            is_active: promotion.is_active !== false,
        });
        setPromotionModal({ isOpen: true, mode: "edit", promotionId: promotion.promotion_id });
        setImageUploading(false);
    };

    const closePromotionModal = () => {
        form.resetFields();
        setPromotionModal({ isOpen: false, mode: "add", promotionId: null });
        setImageUploading(false);
    };

    const handlePromotionSubmit = async (values) => {
        try {
            // Validate dates
            if (!values.start_date || !values.end_date) {
                message.error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
                return;
            }

            // Convert dayjs to format: yyyy-MM-ddTHH:mm:ss
            const startDate = values.start_date ? dayjs(values.start_date).format("YYYY-MM-DDTHH:mm:ss") : null;
            const endDate = values.end_date ? dayjs(values.end_date).format("YYYY-MM-DDTHH:mm:ss") : null;

            // Validate end date is after start date
            if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
                message.error("Ngày kết thúc phải sau ngày bắt đầu");
                return;
            }

            const promotionData = {
                title: values.title,
                description: values.description || "",
                discount_percent: values.discount_percent || 0,
                start_date: startDate,
                end_date: endDate,
                image_url: values.image_url || "",
                code: values.code || "",
                is_active: values.is_active !== false,
            };

            console.log("Submitting promotion data:", promotionData);

            let result;
            if (promotionModal.mode === "add") {
                result = await promotionService.createPromotion(promotionData);
                if (result.success) {
                    message.success("Thêm khuyến mãi thành công!");
                    closePromotionModal();
                    fetchPromotions();
                } else {
                    message.error(result.error || "Thêm khuyến mãi thất bại");
                    console.error("Create promotion error:", result.error);
                }
            } else {
                result = await promotionService.updatePromotion(promotionModal.promotionId, promotionData);
                if (result.success) {
                    message.success("Cập nhật khuyến mãi thành công!");
                    closePromotionModal();
                    fetchPromotions();
                } else {
                    message.error(result.error || "Cập nhật khuyến mãi thất bại");
                    console.error("Update promotion error:", result.error);
                }
            }
        } catch (error) {
            console.error("Error in handlePromotionSubmit:", error);
            message.error(error.response?.data?.message || error.message || "Đã xảy ra lỗi bất ngờ");
        }
    };

    const openDeleteModal = (promotion) => {
        setDeleteModal({ isOpen: true, promotion });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, promotion: null });
    };

    const handleDeletePromotion = async (promotion) => {
        return await promotionService.deletePromotion(promotion.promotion_id);
    };

    const handleDeleteSuccess = () => {
        fetchPromotions();
    };

    const handleImageUpload = async (file) => {
        setImageUploading(true);
        try {
            const res = await adminService.uploadImage(file);
            if (res.success) {
                form.setFieldsValue({ image_url: res.data.url });
                message.success("Tải ảnh thành công");
            } else {
                message.error(res.error || "Tải ảnh thất bại");
            }
        } catch (error) {
            message.error("Tải ảnh thất bại");
        } finally {
            setImageUploading(false);
        }
    };

    const isPromotionActive = (promotion) => {
        if (!promotion.is_active) return false;
        const now = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        return now >= startDate && now <= endDate;
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-orange-100 via-red-100 to-pink-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý khuyến mãi</h1>
                            <p className="text-gray-600">Quản lý các chương trình khuyến mãi và giảm giá</p>
                        </div>
                        <button
                            onClick={openAddPromotionModal}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-3 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-sm" />
                            Thêm khuyến mãi
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải khuyến mãi...</p>
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faTag} className="text-3xl text-orange-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có khuyến mãi</h3>
                            <p className="text-gray-500 mb-8 max-w-md">
                                Hãy tạo chương trình khuyến mãi đầu tiên để thu hút khách hàng.
                            </p>
                            <button
                                onClick={openAddPromotionModal}
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl px-8 py-4 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Tạo khuyến mãi đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {promotions.map((promotion) => {
                                const active = isPromotionActive(promotion);
                                return (
                                    <div key={promotion.promotion_id} className="group bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden">
                                        <div className="relative">
                                            {promotion.image_url && (
                                                <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                                                    <img
                                                        src={promotion.image_url?.startsWith("http") || promotion.image_url?.startsWith("/api/")
                                                            ? promotion.image_url
                                                            : `/api/files/${promotion.image_url}`}
                                                        alt={promotion.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${active ? "bg-green-500 text-white shadow-lg" : "bg-gray-500 text-white"}`}>
                                                    {active ? "Đang diễn ra" : promotion.is_active ? "Sắp diễn ra" : "Đã tắt"}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-lg">
                                                    <FontAwesomeIcon icon={faPercent} className="mr-1" />
                                                    -{promotion.discount_percent}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{promotion.title}</h3>
                                            {promotion.description && (
                                                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{promotion.description}</p>
                                            )}
                                            {promotion.code && (
                                                <div className="mb-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800">
                                                        <FontAwesomeIcon icon={faTag} className="mr-2" />
                                                        Mã: {promotion.code}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500" />
                                                    <span className="font-medium">Bắt đầu:</span>
                                                    <span>{new Date(promotion.start_date).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-red-500" />
                                                    <span className="font-medium">Kết thúc:</span>
                                                    <span>{new Date(promotion.end_date).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => openEditPromotionModal(promotion)}
                                                    className="flex-1 p-2.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(promotion)}
                                                    className="flex-1 p-2.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Promotion Modal */}
            <Modal
                title={promotionModal.mode === "add" ? "Thêm khuyến mãi" : "Sửa khuyến mãi"}
                open={promotionModal.isOpen}
                onCancel={closePromotionModal}
                footer={null}
                centered
                width="90%"
                style={{ maxWidth: 700 }}
            >
                <Form form={form} layout="vertical" onFinish={handlePromotionSubmit}>
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề khuyến mãi" }]}
                    >
                        <Input placeholder="Nhập tiêu đề khuyến mãi" />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <TextArea rows={3} placeholder="Nhập mô tả khuyến mãi (không bắt buộc)" />
                    </Form.Item>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item
                            label="Phần trăm giảm giá (%)"
                            name="discount_percent"
                            rules={[
                                { required: true, message: "Vui lòng nhập phần trăm giảm giá" },
                                { type: "number", min: 0, max: 100, message: "Phần trăm giảm giá phải từ 0 đến 100" }
                            ]}
                        >
                            <InputNumber className="w-full" placeholder="20" min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="Mã khuyến mãi (không bắt buộc)" name="code">
                            <Input placeholder="SUMMER2024" />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item
                            label="Ngày bắt đầu"
                            name="start_date"
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const endDate = getFieldValue('end_date');
                                        if (!value || !endDate || dayjs(value).isBefore(dayjs(endDate))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày bắt đầu phải trước ngày kết thúc'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                className="w-full"
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn ngày bắt đầu"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Ngày kết thúc"
                            name="end_date"
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày kết thúc" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startDate = getFieldValue('start_date');
                                        if (!value || !startDate || dayjs(value).isAfter(dayjs(startDate))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                className="w-full"
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn ngày kết thúc"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Đường dẫn ảnh"
                        name="image_url"
                    >
                        <Input placeholder="Đường dẫn ảnh (không bắt buộc)" />
                    </Form.Item>
                    <Form.Item label="Tải ảnh khuyến mãi">
                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            customRequest={async ({ file, onSuccess, onError }) => {
                                const res = await adminService.uploadImage(file);
                                if (res.success) {
                                    form.setFieldsValue({ image_url: res.data.url });
                                    message.success("Tải ảnh thành công");
                                    onSuccess?.(res.data, file);
                                } else {
                                    message.error(res.error || "Tải ảnh thất bại");
                                    onError?.(res.error);
                                }
                            }}
                        >
                            <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2" disabled={imageUploading}>
                                <UploadOutlined /> {imageUploading ? "Đang tải..." : "Upload ảnh"}
                            </button>
                        </Upload>
                    </Form.Item>
                    <Form.Item label="Bật" name="is_active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={closePromotionModal}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors font-medium"
                        >
                            {promotionModal.mode === "add" ? "Thêm" : "Cập nhật"}
                        </button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onSuccess={handleDeleteSuccess}
                onDelete={handleDeletePromotion}
                item={deleteModal.promotion}
                itemType="Khuyến mãi"
                title="Xóa khuyến mãi"
                description="Bạn có chắc muốn xóa khuyến mãi này?"
                itemDisplayName={deleteModal.promotion?.title}
            />
        </div>
    );
}

export default PromotionManagement;


import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faImage, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { message, Modal, Form, Input, InputNumber, Switch, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { bannerService } from "../../api/banner.service";
import { adminService } from "../../api/admin.service";
import DeleteModal from "./DeleteModal";

const { TextArea } = Input;

function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bannerModal, setBannerModal] = useState({ isOpen: false, mode: "add", bannerId: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, banner: null });
    const [imageUploading, setImageUploading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const result = await bannerService.getAllBannersAdmin();
            if (result.success && result.data) {
                setBanners(Array.isArray(result.data) ? result.data : []);
            } else {
                message.error(result.error || "Tải banner thất bại");
                setBanners([]);
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            message.error("Tải banner thất bại");
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const openAddBannerModal = () => {
        form.resetFields();
        form.setFieldsValue({ is_active: true, display_order: banners.length + 1 });
        setBannerModal({ isOpen: true, mode: "add", bannerId: null });
        setImageUploading(false);
    };

    const openEditBannerModal = (banner) => {
        form.setFieldsValue({
            title: banner.title,
            description: banner.description || "",
            image_url: banner.image_url,
            link_url: banner.link_url || "",
            display_order: banner.display_order || 1,
            is_active: banner.is_active !== false,
        });
        setBannerModal({ isOpen: true, mode: "edit", bannerId: banner.banner_id });
        setImageUploading(false);
    };

    const closeBannerModal = () => {
        form.resetFields();
        setBannerModal({ isOpen: false, mode: "add", bannerId: null });
        setImageUploading(false);
    };

    const handleBannerSubmit = async (values) => {
        try {
            let result;
            if (bannerModal.mode === "add") {
                result = await bannerService.createBanner({
                    title: values.title,
                    description: values.description || "",
                    image_url: values.image_url,
                    link_url: values.link_url || "",
                    display_order: values.display_order || 1,
                    is_active: values.is_active !== false,
                });
                if (result.success) {
                    message.success("Thêm banner thành công!");
                    closeBannerModal();
                    fetchBanners();
                } else {
                    message.error(result.error || "Thêm banner thất bại");
                }
            } else {
                result = await bannerService.updateBanner(bannerModal.bannerId, {
                    title: values.title,
                    description: values.description || "",
                    image_url: values.image_url,
                    link_url: values.link_url || "",
                    display_order: values.display_order || 1,
                    is_active: values.is_active !== false,
                });
                if (result.success) {
                    message.success("Cập nhật banner thành công!");
                    closeBannerModal();
                    fetchBanners();
                } else {
                    message.error(result.error || "Cập nhật banner thất bại");
                }
            }
        } catch (error) {
            message.error("Đã xảy ra lỗi bất ngờ");
        }
    };

    const openDeleteModal = (banner) => {
        setDeleteModal({ isOpen: true, banner });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, banner: null });
    };

    const handleDeleteBanner = async (banner) => {
        return await bannerService.deleteBanner(banner.banner_id);
    };

    const handleDeleteSuccess = () => {
        fetchBanners();
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

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý banner</h1>
                            <p className="text-gray-600">Quản lý banner trang chủ (tối đa 6 banner đang bật)</p>
                        </div>
                        <button
                            onClick={openAddBannerModal}
                            disabled={banners.filter(b => b.is_active).length >= 6}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-3 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-sm" />
                            Thêm banner
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải banner...</p>
                        </div>
                    ) : banners.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faImage} className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có banner</h3>
                            <p className="text-gray-500 mb-8 max-w-md">
                                Hãy tạo banner đầu tiên. Banner sẽ hiển thị ở carousel trang chủ.
                            </p>
                            <button
                                onClick={openAddBannerModal}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 py-4 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Tạo banner đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {banners.map((banner) => (
                                <div key={banner.banner_id} className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
                                    <div className="p-6 flex items-start justify-between">
                                        <div className="flex gap-6 flex-1">
                                            <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img
                                                    src={banner.image_url?.startsWith("http") || banner.image_url?.startsWith("/api/")
                                                        ? banner.image_url
                                                        : `/api/files/${banner.image_url}`}
                                                    alt={banner.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">{banner.title}</h3>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {banner.is_active ? "Đang bật" : "Đang tắt"}
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <FontAwesomeIcon icon={faUpDown} className="mr-1" />
                                                        Thứ tự: {banner.display_order || 0}
                                                    </span>
                                                </div>
                                                {banner.description && (
                                                    <p className="text-gray-600 mb-2 line-clamp-2">{banner.description}</p>
                                                )}
                                                {banner.link_url && (
                                                    <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                                        Link: {banner.link_url}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-6">
                                            <button
                                                onClick={() => openEditBannerModal(banner)}
                                                className="p-2.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(banner)}
                                                className="p-2.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Banner Modal */}
            <Modal
                title={bannerModal.mode === "add" ? "Thêm banner" : "Sửa banner"}
                open={bannerModal.isOpen}
                onCancel={closeBannerModal}
                footer={null}
                centered
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleBannerSubmit}>
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề banner" }]}
                    >
                        <Input placeholder="Enter banner title" />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <TextArea rows={3} placeholder="Nhập mô tả banner (không bắt buộc)" />
                    </Form.Item>
                    <Form.Item
                        label="Đường dẫn ảnh"
                        name="image_url"
                        rules={[{ required: true, message: "Vui lòng nhập đường dẫn ảnh" }]}
                    >
                        <Input placeholder="Đường dẫn ảnh" />
                    </Form.Item>
                    <Form.Item label="Tải ảnh banner">
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
                    <Form.Item label="Đường dẫn (không bắt buộc)" name="link_url">
                        <Input placeholder="https://example.com" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Thứ tự hiển thị" name="display_order" rules={[{ type: "number", min: 1 }]}>
                            <InputNumber className="w-full" placeholder="1" min={1} />
                        </Form.Item>
                        <Form.Item label="Bật" name="is_active" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={closeBannerModal}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                        >
                            {bannerModal.mode === "add" ? "Thêm" : "Cập nhật"}
                        </button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onSuccess={handleDeleteSuccess}
                onDelete={handleDeleteBanner}
                item={deleteModal.banner}
                itemType="Banner"
                title="Xóa banner"
                description="Bạn có chắc muốn xóa banner này?"
                itemDisplayName={deleteModal.banner?.title}
            />
        </div>
    );
}

export default BannerManagement;


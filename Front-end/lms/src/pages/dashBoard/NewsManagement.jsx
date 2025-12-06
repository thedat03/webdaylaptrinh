import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { newsService } from "../../api/news.service";
import { adminService } from "../../api/admin.service";

const { TextArea } = Input;

function NewsManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: "add", id: null });
    const [form] = Form.useForm();

    const load = async () => {
        setLoading(true);
        const res = await newsService.getAllNewsAdmin();
        if (res.success) setItems(res.data); else message.error(res.error);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => { form.resetFields(); setModal({ open: true, mode: "add", id: null }); };
    const openEdit = (n) => { form.setFieldsValue(n); setModal({ open: true, mode: "edit", id: n.news_id }); };
    const close = () => setModal({ open: false, mode: "add", id: null });

    const submit = async (values) => {
        const payload = { ...values };
        let res;
        if (modal.mode === "add") res = await newsService.createNews(payload);
        else res = await newsService.updateNews(modal.id, payload);
        if (res.success) { message.success("Đã lưu"); close(); load(); } else message.error(res.error);
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý tin tức</h1>
                        <p className="text-gray-600">Tạo, cập nhật, đánh dấu tin nổi bật cho trang chủ</p>
                    </div>
                    <button onClick={openAdd} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Thêm tin</button>
                </div>
                <div className="p-8">
                    {loading ? (
                        <div className="text-center text-gray-600">Đang tải...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center text-gray-600">Chưa có tin tức</div>
                    ) : (
                        <div className="space-y-4">
                            {items.map(n => (
                                <div key={n.news_id} className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-4">
                                    <img src={n.image_url?.startsWith("http") || n.image_url?.startsWith("/api/") ? n.image_url : `/api/files/${n.image_url}`} alt={n.title} className="w-32 h-24 object-cover rounded" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {n.badge && <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">{n.badge}</span>}
                                            {n.is_featured && <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">Nổi bật</span>}
                                        </div>
                                        <div className="font-bold text-lg text-gray-900">{n.title}</div>
                                        {n.excerpt && <div className="text-gray-600 text-sm line-clamp-2">{n.excerpt}</div>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(n)} className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Sửa</button>
                                        <button onClick={async () => { const r = await newsService.deleteNews(n.news_id); if (r.success) { message.success("Đã xóa"); load(); } else message.error(r.error); }} className="px-3 py-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100">Xóa</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal title={modal.mode === 'add' ? 'Thêm tin' : 'Sửa tin'} open={modal.open} onCancel={close} footer={null} width="90%" style={{ maxWidth: 700 }}>
                <Form form={form} layout="vertical" onFinish={submit}>
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề tin tức" />
                    </Form.Item>

                    <Form.Item label="Nội dung" name="content">
                        <TextArea rows={6} placeholder="Nhập nội dung tin tức" />
                    </Form.Item>

                    <Form.Item
                        label="Tải ảnh tiêu đề"
                        name="image_url"
                        rules={[{ required: true, message: 'Vui lòng tải ảnh tiêu đề' }]}
                    >
                        <Upload
                            accept="image/*"
                            showUploadList={true}
                            maxCount={1}
                            customRequest={async ({ file, onSuccess, onError }) => {
                                const res = await adminService.uploadImage(file);
                                if (res.success) {
                                    form.setFieldsValue({ image_url: res.data.url });
                                    onSuccess?.(res.data, file);
                                    message.success("Tải ảnh thành công");
                                } else {
                                    onError?.(res.error);
                                    message.error(res.error || "Tải ảnh thất bại");
                                }
                            }}
                        >
                            <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                                <UploadOutlined /> Tải ảnh
                            </button>
                        </Upload>
                        <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file ảnh (JPG, PNG, GIF)</p>
                    </Form.Item>

                    <Form.Item
                        label="Đường dẫn"
                        name="link_url"
                        rules={[
                            { required: true, message: 'Vui lòng nhập đường dẫn' },
                            { type: 'url', message: 'Đường dẫn không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="https://example.com" />
                    </Form.Item>

                    <Form.Item label="Thứ tự hiển thị" name="display_order">
                        <InputNumber className="w-full" min={0} placeholder="0" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={close} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Lưu</button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default NewsManagement;



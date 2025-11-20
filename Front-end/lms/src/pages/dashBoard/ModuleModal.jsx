import { Modal, message } from "antd";
import { useEffect, useState } from "react";

function ModuleModal({ isOpen, mode = "add", initialData = null, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [position, setPosition] = useState(1);
    const isEdit = mode === "edit";

    useEffect(() => {
        setTitle(initialData?.title || "");
        setPosition(initialData?.position || 1);
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            message.error("Vui lòng nhập tên chương");
            return;
        }
        await onSubmit?.({ title: title.trim(), position: Number(position) || 1 });
    };

    return (
        <Modal open={isOpen} onCancel={onClose} footer={null} centered title={isEdit ? "Sửa chương" : "Thêm chương"}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tên chương</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="VD: Chương 1 - Giới thiệu" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Vị trí</label>
                    <input type="number" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isEdit ? "Lưu" : "Thêm"}</button>
                </div>
            </div>
        </Modal>
    );
}

export default ModuleModal;



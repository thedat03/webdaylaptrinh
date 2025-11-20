import { Modal, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function DeleteModal({
    isOpen,
    onClose,
    onSuccess,
    onDelete,
    item = null,
    itemType = "item",
    title = "Xác nhận xóa",
    description = "Bạn có chắc muốn xóa mục này?",
    itemDisplayName = "",
    customContent = null,
}) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!onDelete) {
            message.error("Chưa truyền hàm xóa");
            return;
        }

        setLoading(true);
        try {
            const result = await onDelete(item);

            if (result && result.success === false) {
                message.error(result.error || `Xóa ${itemType} thất bại`);
            } else {
                message.success(`Đã xóa ${itemType} thành công!`);
                onClose();
                onSuccess?.(); // Callback to refresh data
            }
        } catch (error) {
            message.error(`Xóa ${itemType} thất bại`);
            console.error("Delete error:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (customContent) {
            return customContent;
        }

        return (
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-red-600 text-xl"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <div className="text-gray-600 space-y-2">
                        <p>
                            {description}
                            {itemDisplayName && (
                                <span className="font-semibold text-gray-900">
                                    {" "}<span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm">
                                        {itemDisplayName}
                                    </span>
                                </span>
                            )}
                        </p>
                        <p className="text-sm text-red-600 font-medium">
                            ⚠️ Hành động này không thể hoàn tác.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            title={null}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={500}
            className="delete-modal"
            centered
        >
            <div className="p-2">
                {renderContent()}

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[100px]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang xóa...
                            </span>
                        ) : (
                            "Xóa"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default DeleteModal;
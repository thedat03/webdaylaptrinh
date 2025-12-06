import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { message, Modal, Form, Input, InputNumber } from "antd";
import { categoryService } from "../../api/category.service";
import DeleteModal from "./DeleteModal";

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categoryModal, setCategoryModal] = useState({ isOpen: false, mode: "add", categoryId: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const result = await categoryService.getAllCategories();
            if (result.success && result.data) {
                setCategories(Array.isArray(result.data) ? result.data : []);
            } else {
                message.error(result.error || "Tải danh mục thất bại");
                setCategories([]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            message.error("Tải danh mục thất bại");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const openAddCategoryModal = () => {
        form.resetFields();
        setCategoryModal({ isOpen: true, mode: "add", categoryId: null });
    };

    const openEditCategoryModal = (category) => {
        form.setFieldsValue({
            name: category.name,
            description: category.description || "",
            displayOrder: category.displayOrder || 0,
        });
        setCategoryModal({ isOpen: true, mode: "edit", categoryId: category.category_id });
    };

    const closeCategoryModal = () => {
        form.resetFields();
        setCategoryModal({ isOpen: false, mode: "add", categoryId: null });
    };

    const handleCategorySubmit = async (values) => {
        try {
            let result;
            if (categoryModal.mode === "add") {
                result = await categoryService.createCategory(values);
                if (result.success) {
                    message.success("Thêm danh mục thành công!");
                    closeCategoryModal();
                    fetchCategories();
                } else {
                    message.error(result.error || "Thêm danh mục thất bại");
                }
            } else {
                result = await categoryService.updateCategory(categoryModal.categoryId, values);
                if (result.success) {
                    message.success("Cập nhật danh mục thành công!");
                    closeCategoryModal();
                    fetchCategories();
                } else {
                    message.error(result.error || "Cập nhật danh mục thất bại");
                }
            }
        } catch (error) {
            message.error("Đã xảy ra lỗi bất ngờ");
        }
    };

    const openDeleteModal = (category) => {
        setDeleteModal({ isOpen: true, category });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, category: null });
    };

    const handleDeleteCategory = async (category) => {
        return await categoryService.deleteCategory(category.category_id);
    };

    const handleDeleteSuccess = () => {
        fetchCategories();
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý danh mục</h1>
                            <p className="text-gray-600">Quản lý danh mục để sắp xếp khóa học</p>
                        </div>
                        <button
                            onClick={openAddCategoryModal}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-3 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-sm" />
                            Thêm danh mục
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải danh mục...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faBookOpen} className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có danh mục</h3>
                            <p className="text-gray-500 mb-8 max-w-md">
                                Hãy tạo danh mục đầu tiên của bạn. Danh mục giúp sắp xếp khóa học ở thanh bên.
                            </p>
                            <button
                                onClick={openAddCategoryModal}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 py-4 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Tạo danh mục đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {categories.map((category) => (
                                <div key={category.category_id} className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
                                    <div className="p-4 md:p-6 flex items-start justify-between gap-4 overflow-x-auto">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Thứ tự: {category.displayOrder || 0}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-gray-600 mb-2">{category.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-6">
                                            <button
                                                onClick={() => openEditCategoryModal(category)}
                                                className="p-2.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(category)}
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

            {/* Category Modal */}
            <Modal
                title={categoryModal.mode === "add" ? "Add New Category" : "Edit Category"}
                open={categoryModal.isOpen}
                onCancel={closeCategoryModal}
                footer={null}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleCategorySubmit}>
                    <Form.Item
                        label="Category Name"
                        name="name"
                        rules={[{ required: true, message: "Category name is required" }]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={3} placeholder="Enter category description" />
                    </Form.Item>
                    <Form.Item label="Display Order" name="displayOrder" rules={[{ type: "number", min: 0 }]}>
                        <InputNumber className="w-full" placeholder="0" min={0} />
                    </Form.Item>
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={closeCategoryModal}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                        >
                            {categoryModal.mode === "add" ? "Add" : "Update"}
                        </button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onSuccess={handleDeleteSuccess}
                onDelete={handleDeleteCategory}
                item={deleteModal.category}
                itemType="Category"
                title="Delete Category"
                description="Are you sure you want to delete this category?"
                itemDisplayName={deleteModal.category?.name}
            />
        </div>
    );
}

export default CategoryManagement;


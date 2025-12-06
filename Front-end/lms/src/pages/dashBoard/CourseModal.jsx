import { Modal, Form, Input, InputNumber, message, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { adminService } from "../../api/admin.service";
import { categoryService } from "../../api/category.service";
import { authService } from "../../api/auth.service";

const { TextArea } = Input;

function CourseModal({ isOpen, onClose, onSuccess, courseId = null, mode = "add" }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [fetchingData, setFetchingData] = useState(false);
    const [categories, setCategories] = useState([]);

    const isEditMode = mode === "edit" || courseId !== null;
    const modalTitle = isEditMode ? "Edit Course" : "Add New Course";
    const submitButtonText = isEditMode ? "Update Course" : "Add Course";
    const loadingText = isEditMode ? "Updating..." : "Adding...";

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
        if (isOpen && isEditMode && courseId) {
            fetchCourseData();
        } else if (isOpen && !isEditMode) {
            form.resetFields();
            // Auto-fill instructor if user is INSTRUCTOR
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.role === "ROLE_INSTRUCTOR" && currentUser.name) {
                form.setFieldsValue({ instructor: currentUser.name });
            }
        }
    }, [isOpen, courseId, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadCategories = async () => {
        try {
            const res = await categoryService.getAllCategories();
            if (res.success && res.data) {
                setCategories(Array.isArray(res.data) ? res.data : []);
            }
        } catch (e) {
            console.error("Failed to load categories", e);
        }
    };

    const fetchCourseData = async () => {
        setFetchingData(true);
        try {
            const result = await adminService.getCourseById(courseId);
            if (result.success) {
                const formData = {
                    course_name: result.data.course_name,
                    instructor: result.data.instructor,
                    price: result.data.price,
                    description: result.data.description,
                    y_link: result.data.y_link,
                    p_link: result.data.p_link,
                    category: result.data.category?.category_id || null,
                    tags: result.data.tags || "",
                };
                form.setFieldsValue(formData);
                setImageUrl(result.data.p_link || "");
            } else {
                message.error(result.error);
                onClose();
            }
        } catch {
            message.error("Failed to fetch course data");
            onClose();
        } finally {
            setFetchingData(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            let result;
            if (isEditMode) {
                const editData = {
                    course_name: values.course_name,
                    instructor: values.instructor,
                    price: values.price,
                    description: values.description,
                    y_link: values.y_link,
                    p_link: imageUrl,
                    category: values.category ? { category_id: values.category } : null,
                    tags: values.tags || "",
                };
                result = await adminService.updateCourse(courseId, editData);
            } else {
                if (!imageUrl) {
                    message.error("Vui lòng upload ảnh khóa học");
                    setLoading(false);
                    return;
                }
                const addData = {
                    course_name: values.course_name,
                    instructor: values.instructor,
                    price: values.price,
                    description: values.description,
                    y_link: values.y_link,
                    p_link: imageUrl,
                    category: values.category ? { category_id: values.category } : null,
                    tags: values.tags || "",
                };
                result = await adminService.createCourse(addData);
            }

            if (result.success) {
                message.success(isEditMode ? "Course updated successfully!" : "Course added successfully!");
                form.resetFields();
                onClose();
                onSuccess?.();
            } else {
                message.error(result.error);
            }
        } catch {
            message.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={modalTitle}
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            width="90%"
            style={{ maxWidth: isEditMode ? 900 : 600, top: 20 }}
            className="custom-modal"
            destroyOnHidden
            styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto" } }}
        >
            {fetchingData ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                    <span className="ml-3 text-gray-600">Loading course data...</span>
                </div>
            ) : (
                <>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className="mt-2 space-y-4"
                        initialValues={{
                            course_name: "",
                            instructor: "",
                            price: 0,
                            description: "",
                            y_link: "",
                        }}
                    >
                        <Form.Item
                            label="Course Name"
                            name="course_name"
                            rules={[
                                { required: true, message: "Course name is required" },
                                { min: 3, message: "Course name must be at least 3 characters" },
                                { max: 100, message: "Course name cannot exceed 100 characters" },
                            ]}
                        >
                            <Input placeholder="Enter course name" />
                        </Form.Item>

                        <Form.Item
                            label="Instructor"
                            name="instructor"
                            rules={[
                                { required: true, message: "Instructor is required" },
                                { min: 2, message: "Instructor name must be at least 2 characters" },
                            ]}
                        >
                            <Input
                                placeholder="Enter instructor name"
                                disabled={authService.getCurrentUser()?.role === "ROLE_INSTRUCTOR"}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Price"
                            name="price"
                            rules={[
                                { required: true, message: "Price is required" },
                                { type: "number", min: 0, message: "Price must be a positive number" },
                            ]}
                        >
                            <InputNumber
                                placeholder="Enter price"
                                className="w-full"
                                min={0}
                                step={0.01}
                                formatter={(value) =>
                                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[
                                { required: true, message: "Description is required" },
                                { min: 10, message: "Description must be at least 10 characters" },
                                { max: 500, message: "Description cannot exceed 500 characters" },
                            ]}
                        >
                            <TextArea rows={4} placeholder="Enter course description" showCount maxLength={500} />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item label="Category" name="category" rules={[{ required: true, message: "Please choose a category" }]}>
                                <Select
                                    placeholder="Select a category"
                                    options={categories.map(cat => ({ value: cat.category_id, label: cat.name }))}
                                    loading={categories.length === 0}
                                />
                            </Form.Item>
                            <Form.Item label="Tags (comma separated)" name="tags">
                                <Input placeholder="frontend, react, beginner" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Video Link"
                            name="y_link"
                            rules={[
                                { required: true, message: "Video link is required" },
                                { type: "url", message: "Please enter a valid URL" },
                            ]}
                        >
                            <Input placeholder="https://example.com/video" />
                        </Form.Item>

                        <Form.Item label="Upload ảnh khóa học">
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                customRequest={async ({ file, onSuccess, onError }) => {
                                    setImageUploading(true);
                                    const res = await adminService.uploadImage(file);
                                    if (res.success) {
                                        setImageUrl(res.data.url);
                                        message.success("Tải ảnh thành công");
                                        onSuccess?.(res.data, file);
                                    } else {
                                        message.error(res.error || "Tải ảnh thất bại");
                                        onError?.(res.error);
                                    }
                                    setImageUploading(false);
                                }}
                            >
                                <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                                    <UploadOutlined /> {imageUploading ? "Đang tải..." : "Upload ảnh"}
                                </button>
                            </Upload>
                            {imageUrl && (
                                <div className="mt-2">
                                    <img src={imageUrl} alt="preview" className="w-40 h-24 object-cover rounded border" />
                                    <p className="text-xs text-gray-500 mt-1">Sẽ dùng ảnh này khi lưu khóa học.</p>
                                </div>
                            )}
                        </Form.Item>

                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[140px] flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {loadingText}
                                    </>
                                ) : (
                                    submitButtonText
                                )}
                            </button>
                        </div>
                    </Form>
                </>
            )}
        </Modal>
    );
}

export default CourseModal;
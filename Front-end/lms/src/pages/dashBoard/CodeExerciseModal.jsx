import { Modal, message, Upload, Tabs } from "antd";
import { UploadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { JUDGE0_LANGUAGES } from "../../constants/judge0Languages";
import { adminService } from "../../api/admin.service";
import { parseMarkdownToHTML } from "../../utils/markdownParser";

const buildTestCase = (index) => ({
    id: index,
    name: `Test ${index}`,
    stdin: "",
    expectedOutput: "",
    hidden: false,
});

/**
 * Modal để tạo/sửa bài tập code riêng
 * Cho phép giảng viên tạo bài tập code với tài liệu, test cases và code template
 */
function CodeExerciseModal({ isOpen, mode = "add", initialData = null, courseId = null, onClose, onSubmit }) {
    const isEdit = mode === "edit";
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [documentation, setDocumentation] = useState("");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [codeLanguageId, setCodeLanguageId] = useState(JUDGE0_LANGUAGES[0].id);
    const [codeTestCases, setCodeTestCases] = useState([buildTestCase(1)]);
    const [position, setPosition] = useState(1);
    const [estimatedMinutes, setEstimatedMinutes] = useState(30);
    const [imageUploading, setImageUploading] = useState(false);
    const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

    useEffect(() => {
        // Reset form khi modal đóng
        if (!isOpen) {
            return;
        }
        
        if (initialData) {
            console.log("Loading initialData into form:", initialData);
            setTitle(initialData.title || "");
            setDescription(initialData.description || "");
            setDocumentation(initialData.documentation || "");
            setCodeSnippet(initialData.codeSnippet || "");
            setCodeLanguageId(initialData.codeLanguageId || JUDGE0_LANGUAGES[0].id);
            setPosition(initialData.position || 1);
            setEstimatedMinutes(initialData.estimatedMinutes || 30);
            if (initialData.codeTestCases) {
                try {
                    const parsed = typeof initialData.codeTestCases === 'string' 
                        ? JSON.parse(initialData.codeTestCases) 
                        : initialData.codeTestCases;
                    if (Array.isArray(parsed) && parsed.length) {
                        setCodeTestCases(parsed.map((tc, idx) => ({
                            id: idx + 1,
                            name: tc.name || `Test ${idx + 1}`,
                            stdin: tc.stdin || "",
                            expectedOutput: tc.expectedOutput || "",
                            hidden: Boolean(tc.hidden),
                        })));
                    } else {
                        setCodeTestCases([buildTestCase(1)]);
                    }
                } catch (error) {
                    console.error("Error parsing test cases:", error);
                    setCodeTestCases([buildTestCase(1)]);
                }
            } else {
                setCodeTestCases([buildTestCase(1)]);
            }
        } else {
            // Reset form
            setTitle("");
            setDescription("");
            setDocumentation("");
            setCodeSnippet("");
            setCodeLanguageId(JUDGE0_LANGUAGES[0].id);
            setCodeTestCases([buildTestCase(1)]);
            setPosition(1);
            setEstimatedMinutes(30);
        }
    }, [initialData, isOpen]);

    const addTestCase = () => {
        setCodeTestCases((prev) => [...prev, buildTestCase(prev.length + 1)]);
    };

    const removeTestCase = (id) => {
        setCodeTestCases((prev) => {
            if (prev.length === 1) {
                message.warning("Cần ít nhất 1 test case");
                return prev;
            }
            return prev.filter((tc) => tc.id !== id).map((tc, idx) => ({ ...tc, id: idx + 1 }));
        });
    };

    const updateTestCase = (id, field, value) => {
        setCodeTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)));
    };

    const handleSubmit = async () => {
        console.log("handleSubmit called, isEdit:", isEdit);
        
        if (!title.trim()) {
            message.error("Vui lòng nhập tiêu đề bài tập");
            return;
        }
        
        // Chỉ kiểm tra courseId khi tạo mới
        if (!isEdit && !courseId) {
            message.error("Vui lòng chọn khóa học");
            return;
        }
        
        if (!codeLanguageId) {
            message.error("Vui lòng chọn ngôn ngữ Judge0");
            return;
        }
        
        if (!codeTestCases.length) {
            message.error("Vui lòng thêm ít nhất 1 test case");
            return;
        }

        let sanitizedCases = [];
        try {
            sanitizedCases = codeTestCases.map((tc) => {
                const expected = tc.expectedOutput?.trim();
                if (!expected) {
                    throw new Error("Vui lòng nhập expected output cho tất cả test case");
                }
                return {
                    name: tc.name?.trim() || "",
                    stdin: tc.stdin || "",
                    expectedOutput: expected,
                    hidden: Boolean(tc.hidden),
                };
            });
        } catch (error) {
            message.error(error.message);
            return;
        }

        const payload = {
            title: title.trim(),
            description: description.trim(),
            documentation: documentation.trim(),
            codeSnippet,
            codeLanguageId,
            codeTestCases: JSON.stringify(sanitizedCases),
            position: Number(position) || 1,
            estimatedMinutes: Number(estimatedMinutes) || 30,
        };

        // Chỉ thêm courseId khi tạo mới, không thêm khi sửa
        if (!isEdit) {
            payload.courseId = courseId;
        }

        console.log("Submitting payload:", payload);
        console.log("onSubmit function:", onSubmit);
        
        try {
            await onSubmit?.(payload);
        } catch (error) {
            console.error("Error in onSubmit:", error);
            message.error("Có lỗi xảy ra khi lưu bài tập");
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width="90%"
            style={{ maxWidth: 900 }}
            title={isEdit ? "Sửa bài tập code" : "Thêm bài tập code"}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề bài tập *</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="VD: Tính tổng hai số"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Vị trí</label>
                        <input
                            type="number"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ngôn ngữ Judge0 *</label>
                        <select
                            value={codeLanguageId}
                            onChange={(e) => setCodeLanguageId(Number(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            {JUDGE0_LANGUAGES.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Thời gian ước tính (phút)</label>
                        <input
                            type="number"
                            min="0"
                            value={estimatedMinutes}
                            onChange={(e) => setEstimatedMinutes(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="30"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Mô tả / Yêu cầu bài tập</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 h-28"
                        placeholder="Mô tả đề bài, input/output..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Code snippet ban đầu (template)</label>
                    <textarea
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 h-32 font-mono text-sm"
                        placeholder="// Viết mã ở đây"
                    />
                </div>

                {/* Tài liệu hướng dẫn */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Tài liệu hướng dẫn (Markdown)</label>
                        <button
                            type="button"
                            onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                            <QuestionCircleOutlined /> {showMarkdownHelp ? "Ẩn" : "Hiện"} hướng dẫn
                        </button>
                    </div>

                    {showMarkdownHelp && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs space-y-3 mb-3">
                            <div>
                                <strong className="text-blue-900">Định dạng văn bản:</strong>
                                <ul className="list-disc ml-5 mt-1 space-y-1 text-blue-800">
                                    <li>
                                        <code>**text**</code> hoặc <code>__text__</code> = <strong>in đậm</strong>
                                    </li>
                                    <li>
                                        <code>*text*</code> hoặc <code>_text_</code> = <em>in nghiêng</em>
                                    </li>
                                    <li>
                                        <code>{`{red:text}`}</code> = <span className="text-red-600 font-semibold">màu đỏ</span>
                                    </li>
                                    <li>
                                        <code>{`{blue:text}`}</code> = <span className="text-blue-600 font-semibold">màu xanh</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <strong className="text-blue-900">Tiêu đề:</strong>
                                <ul className="list-disc ml-5 mt-1 space-y-1 text-blue-800">
                                    <li>
                                        <code># Tiêu đề lớn</code>
                                    </li>
                                    <li>
                                        <code>## Tiêu đề vừa</code>
                                    </li>
                                    <li>
                                        <code>### Tiêu đề nhỏ</code>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <strong className="text-blue-900">Code:</strong>
                                <ul className="list-disc ml-5 mt-1 space-y-1 text-blue-800">
                                    <li>
                                        <code>`code inline`</code> = code trong dòng
                                    </li>
                                    <li>
                                        <code>```c</code> ... <code>```</code> = code block với syntax highlighting
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Upload ảnh minh họa (tùy chọn)</label>
                        <Upload
                            accept="image/*"
                            showUploadList={true}
                            maxCount={5}
                            customRequest={async ({ file, onSuccess, onError }) => {
                                setImageUploading(true);
                                try {
                                    const res = await adminService.uploadImage(file);
                                    if (res.success) {
                                        const imageUrl = res.data.url;
                                        const imageMarkdown = `![Mô tả ảnh](${imageUrl})\n\n`;
                                        setDocumentation((prev) => prev + imageMarkdown);
                                        message.success("Upload ảnh thành công! Đã chèn vào nội dung.");
                                        onSuccess?.(res.data, file);
                                    } else {
                                        message.error(res.error || "Upload ảnh thất bại");
                                        onError?.(res.error);
                                    }
                                } catch (error) {
                                    message.error("Lỗi upload ảnh");
                                    onError?.(error);
                                } finally {
                                    setImageUploading(false);
                                }
                            }}
                        >
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                                disabled={imageUploading}
                            >
                                <UploadOutlined /> {imageUploading ? "Đang tải..." : "Upload ảnh"}
                            </button>
                        </Upload>
                        <p className="text-xs text-gray-500 mt-1">Có thể upload nhiều ảnh. URL sẽ tự động chèn vào nội dung.</p>
                    </div>

                    <Tabs
                        items={[
                            {
                                key: "edit",
                                label: "Soạn thảo",
                                children: (
                                    <textarea
                                        value={documentation}
                                        onChange={(e) => setDocumentation(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 h-96 resize-y font-mono text-sm"
                                        placeholder="Nhập tài liệu hướng dẫn bằng Markdown..."
                                    />
                                ),
                            },
                            {
                                key: "preview",
                                label: "Xem trước",
                                children: (
                                    <div className="border rounded-lg p-6 bg-white h-96 overflow-y-auto">
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: parseMarkdownToHTML(documentation),
                                            }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>

                {/* Test Cases */}
                <div className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-semibold text-gray-800">Test cases *</p>
                            <p className="text-xs text-gray-500">Các test sẽ gửi tới Judge0</p>
                        </div>
                        <button
                            type="button"
                            onClick={addTestCase}
                            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Thêm test
                        </button>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {codeTestCases.map((tc) => (
                            <div key={tc.id} className="bg-white rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <input
                                        value={tc.name}
                                        onChange={(e) => updateTestCase(tc.id, "name", e.target.value)}
                                        className="flex-1 border rounded px-2 py-1 text-sm"
                                        placeholder={`Test ${tc.id}`}
                                    />
                                    <label className="flex items-center gap-2 text-xs text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={tc.hidden}
                                            onChange={(e) => updateTestCase(tc.id, "hidden", e.target.checked)}
                                        />
                                        Hidden
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeTestCase(tc.id)}
                                        className="text-red-500 text-sm"
                                    >
                                        Xóa
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Input (stdin)</label>
                                    <textarea
                                        value={tc.stdin}
                                        onChange={(e) => updateTestCase(tc.id, "stdin", e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-sm h-16"
                                        placeholder="Ví dụ: 3 4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Expected output *</label>
                                    <textarea
                                        value={tc.expectedOutput}
                                        onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-sm h-16"
                                        placeholder="Ví dụ: 7"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
                    Hủy
                </button>
                <button 
                    type="button" 
                    onClick={handleSubmit} 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    {isEdit ? "Lưu" : "Thêm"}
                </button>
            </div>
        </Modal>
    );
}

export default CodeExerciseModal;

import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { JUDGE0_LANGUAGES } from "../../constants/judge0Languages";

const TYPES = ["VIDEO", "CODE", "HOMEWORK", "MATERIAL", "QUIZ"];

const buildTestCase = (index) => ({
    id: index,
    name: `Test ${index}`,
    stdin: "",
    expectedOutput: "",
    hidden: false,
});

function LessonModal({ isOpen, mode = "add", initialData = null, modules = [], defaultModuleId = null, onClose, onSubmit }) {
    const isEdit = mode === "edit";
    const [title, setTitle] = useState("");
    const [type, setType] = useState("VIDEO");
    const [moduleId, setModuleId] = useState(defaultModuleId || null);
    const [position, setPosition] = useState(1);
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [contentUrl, setContentUrl] = useState("");
    const [description, setDescription] = useState("");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [quizData, setQuizData] = useState({
        question: "",
        options: ["", "", ""],
        correctAnswer: 0
    });
    const [codeLanguageId, setCodeLanguageId] = useState(JUDGE0_LANGUAGES[0].id);
    const [codeTestCases, setCodeTestCases] = useState([buildTestCase(1)]);

    useEffect(() => {
        setTitle(initialData?.title || "");
        setType(initialData?.type || "VIDEO");
        setModuleId(initialData?.module_id || defaultModuleId || null);
        setPosition(initialData?.position || 1);
        setDurationMinutes(initialData?.durationMinutes ?? initialData?.duration ?? 15);
        setContentUrl(initialData?.contentUrl || "");
        setDescription(initialData?.description || "");
        setCodeSnippet(initialData?.codeSnippet || "");
        if (initialData?.quizData) {
            try {
                setQuizData(JSON.parse(initialData.quizData));
            } catch {
                setQuizData({ question: "", options: ["", "", ""], correctAnswer: 0 });
            }
        } else {
            setQuizData({ question: "", options: ["", "", ""], correctAnswer: 0 });
        }
        setCodeLanguageId(initialData?.codeLanguageId || JUDGE0_LANGUAGES[0].id);
        if (initialData?.codeTestCases) {
            try {
                const parsed = JSON.parse(initialData.codeTestCases);
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
            } catch {
                setCodeTestCases([buildTestCase(1)]);
            }
        } else {
            setCodeTestCases([buildTestCase(1)]);
        }
    }, [initialData, defaultModuleId, isOpen]);

    const moduleOptions = useMemo(() => modules.map(m => ({ value: m.module_id, label: `${m.position}. ${m.title}` })), [modules]);

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
        if (!title.trim()) return message.error("Vui lòng nhập tiêu đề bài học");
        if (!moduleId) return message.error("Vui lòng chọn chương");
        if (durationMinutes < 0) return message.error("Thời lượng phải lớn hơn hoặc bằng 0");

        const base = {
            title: title.trim(),
            type,
            position: Number(position) || 1,
            durationMinutes: Number(durationMinutes) || 0,
        };
        let payload = base;
        if (type === "VIDEO") {
            payload = { ...base, contentUrl: contentUrl.trim(), description: description.trim() };
        } else if (type === "CODE") {
            if (!codeLanguageId) {
                return message.error("Vui lòng chọn ngôn ngữ Judge0");
            }
            if (!codeTestCases.length) {
                return message.error("Vui lòng thêm ít nhất 1 test case");
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
                return message.error(error.message);
            }
            payload = {
                ...base,
                description: description.trim(),
                codeSnippet,
                codeLanguageId,
                codeTestCases: JSON.stringify(sanitizedCases),
            };
        } else if (type === "MATERIAL") {
            payload = { ...base, description: description.trim() };
        } else if (type === "HOMEWORK") {
            payload = { ...base, description: description.trim() };
        } else if (type === "QUIZ") {
            if (!quizData.question.trim()) return message.error("Vui lòng nhập câu hỏi");
            if (quizData.options.some(opt => !opt.trim())) return message.error("Vui lòng điền đầy đủ các đáp án");
            payload = { ...base, description: description.trim(), quizData: JSON.stringify(quizData) };
        }

        await onSubmit?.({ moduleId, payload });
    };

    return (
        <Modal open={isOpen} onCancel={onClose} footer={null} centered width="90%" style={{ maxWidth: 720 }} title={isEdit ? "Sửa bài học" : "Thêm bài học"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="VD: Giới thiệu" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Chương</label>
                    <select value={moduleId || ""} onChange={(e) => setModuleId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                        <option value="" disabled>Chọn chương</option>
                        {moduleOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Loại bài</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                        {TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Vị trí</label>
                    <input type="number" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Thời lượng (phút)</label>
                    <input
                        type="number"
                        min="0"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Ví dụ: 15"
                    />
                </div>

                {type === "VIDEO" && (
                    <div className="md:col-span-2 space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Link YouTube / Video</label>
                            <input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mô tả (tuỳ chọn)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-28" />
                        </div>
                    </div>
                )}

                {type === "CODE" && (
                    <div className="md:col-span-2 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngôn ngữ Judge0</label>
                                <select
                                    value={codeLanguageId}
                                    onChange={(e) => setCodeLanguageId(Number(e.target.value))}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    {JUDGE0_LANGUAGES.map((lang) => (
                                        <option key={lang.id} value={lang.id}>{lang.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Code snippet ban đầu</label>
                                <textarea value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-32 font-mono text-sm" placeholder="// Viết mã ở đây" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Yêu cầu / Mô tả</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-28" placeholder="Mô tả đề bài, input/output..." />
                        </div>
                        <div className="border rounded-xl p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-gray-800">Test cases</p>
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
                                            <label className="block text-xs font-medium mb-1">Expected output</label>
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
                )}

                {type === "MATERIAL" && (
                    <div className="md:col-span-2 space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nội dung tài liệu</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 h-64 resize-y"
                                placeholder="Nhập nội dung tài liệu (không giới hạn độ dài)..."
                            />
                        </div>
                        <p className="text-xs text-gray-500">Nội dung sẽ được hiển thị trực tiếp trên trang học.</p>
                    </div>
                )}

                {type === "HOMEWORK" && (
                    <div className="md:col-span-2 space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mô tả bài tập</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-28" placeholder="Các câu hỏi trắc nghiệm và/hoặc yêu cầu code sẽ được cấu hình ở bước tiếp theo." />
                        </div>
                        <p className="text-xs text-gray-500">Phần nội dung trắc nghiệm/code chi tiết có thể quản lý ở màn hình bài kiểm tra.</p>
                    </div>
                )}

                {type === "QUIZ" && (
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hướng dẫn / Mô tả</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24" placeholder="Dựa vào kiến thức đã học ở bài trước, bạn hãy cho biết..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Câu hỏi</label>
                            <input
                                value={quizData.question}
                                onChange={(e) => setQuizData({ ...quizData, question: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="VD: Biến (variable) là gì?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Các đáp án</label>
                            <div className="space-y-2">
                                {quizData.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={quizData.correctAnswer === idx}
                                            onChange={() => setQuizData({ ...quizData, correctAnswer: idx })}
                                            className="w-4 h-4"
                                        />
                                        <input
                                            value={opt}
                                            onChange={(e) => {
                                                const newOptions = [...quizData.options];
                                                newOptions[idx] = e.target.value;
                                                setQuizData({ ...quizData, options: newOptions });
                                            }}
                                            className="flex-1 border rounded-lg px-3 py-2"
                                            placeholder={`Đáp án ${idx + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Chọn đáp án đúng bằng cách click vào radio button bên trái</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onClose} className="px-4 py-2 border rounded-lg">Hủy</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{isEdit ? "Lưu" : "Thêm"}</button>
            </div>
        </Modal>
    );
}

export default LessonModal;



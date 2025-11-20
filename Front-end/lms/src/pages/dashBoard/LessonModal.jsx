import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";

const TYPES = ["VIDEO", "CODE", "HOMEWORK", "MATERIAL", "QUIZ"];

function LessonModal({ isOpen, mode = "add", initialData = null, modules = [], defaultModuleId = null, onClose, onSubmit }) {
    const isEdit = mode === "edit";
    const [title, setTitle] = useState("");
    const [type, setType] = useState("VIDEO");
    const [moduleId, setModuleId] = useState(defaultModuleId || null);
    const [position, setPosition] = useState(1);
    const [contentUrl, setContentUrl] = useState("");
    const [description, setDescription] = useState("");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [quizData, setQuizData] = useState({
        question: "",
        options: ["", "", ""],
        correctAnswer: 0
    });

    useEffect(() => {
        setTitle(initialData?.title || "");
        setType(initialData?.type || "VIDEO");
        setModuleId(initialData?.module_id || defaultModuleId || null);
        setPosition(initialData?.position || 1);
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
    }, [initialData, defaultModuleId, isOpen]);

    const moduleOptions = useMemo(() => modules.map(m => ({ value: m.module_id, label: `${m.position}. ${m.title}` })), [modules]);

    const handleSubmit = async () => {
        if (!title.trim()) return message.error("Vui lòng nhập tiêu đề bài học");
        if (!moduleId) return message.error("Vui lòng chọn chương");

        const base = { title: title.trim(), type, position: Number(position) || 1 };
        let payload = base;
        if (type === "VIDEO") {
            payload = { ...base, contentUrl: contentUrl.trim(), description: description.trim() };
        } else if (type === "CODE") {
            payload = { ...base, description: description.trim(), codeSnippet };
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
        <Modal open={isOpen} onCancel={onClose} footer={null} centered width={720} title={isEdit ? "Sửa bài học" : "Thêm bài học"}>
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
                    <div className="md:col-span-2 space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Yêu cầu / Mô tả</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-28" placeholder="EXPECT: /function\s+sum\(/" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Code snippet ban đầu</label>
                            <textarea value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-40 font-mono text-sm" placeholder="// Viết mã ở đây" />
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



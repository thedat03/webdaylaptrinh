import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { faBackward, faCheck, faAward, faThumbsUp, faFrown, faPlay, faHistory } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Tabs, message, Card, Tag, Descriptions, Badge, Typography } from 'antd';

const { Title, Text } = Typography;
import { examService } from '../../api/exam.service';
import { JUDGE0_LANGUAGE_MAP } from '../../constants/judge0Languages';

function parseCodeTestCases(raw) {
    if (!raw) return [];
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!Array.isArray(parsed)) return [];
        return parsed.map((tc, index) => ({
            id: tc.id || `test-${index}`,
            name: tc.name || `Test ${index + 1}`,
            stdin: tc.stdin || "",
            expectedOutput: tc.expectedOutput || "",
            hidden: tc.hidden || false
        }));
    } catch {
        return [];
    }
}

function Assessment() {
    const { id, examId } = useParams();
    const navigate = useNavigate();
    const courseId = id;
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [codeAnswers, setCodeAnswers] = useState({});
    const [codeResults, setCodeResults] = useState({});
    const [selectedTestCases, setSelectedTestCases] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showExamList, setShowExamList] = useState(!examId);
    const [mySubmission, setMySubmission] = useState(null);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [loadingMySubmission, setLoadingMySubmission] = useState(false);
    const [showMySubmission, setShowMySubmission] = useState(false);
    const [showMySubmissionsList, setShowMySubmissionsList] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            const result = await examService.getPublishedExams(courseId);
            if (result.success && result.data && result.data.length > 0) {
                setExams(result.data);
                if (examId) {
                    // Nếu có examId trong URL, tìm và chọn đề thi đó
                    const found = result.data.find(e => e.id === examId);
                    if (found) {
                        selectExam(found);
                        // Tự động load bài làm của học viên nếu có
                        fetchMySubmission(found.id);
                    } else {
                        message.error('Không tìm thấy đề thi');
                        setShowExamList(true);
                    }
                } else if (result.data.length === 1) {
                    // Nếu chỉ có 1 đề thi, tự động chọn
                    selectExam(result.data[0]);
                    fetchMySubmission(result.data[0].id);
                } else {
                    // Nếu có nhiều đề thi, hiển thị danh sách
                    setShowExamList(true);
                }
            } else {
                message.error(result.error || 'Chưa có đề thi được công bố');
            }
            setLoading(false);
        };
        fetchExams();
    }, [courseId, examId]);

    const fetchMySubmission = async (examId) => {
        if (!examId) return;
        setLoadingMySubmission(true);
        // Lấy tất cả bài làm của học viên
        const result = await examService.getMySubmissions(examId);
        if (result.success && result.data && result.data.length > 0) {
            setMySubmissions(result.data);
            // Tự động chọn bài làm mới nhất
            setMySubmission(result.data[0]);
        } else {
            setMySubmissions([]);
            setMySubmission(null);
        }
        setLoadingMySubmission(false);
    };

    const selectExam = (exam) => {
        setSelectedExam(exam);
        setQuestions(exam.questions || []);
        setSelectedAnswers({});
        setCodeAnswers({});
        setCodeResults({});
        setSelectedTestCases({});
        setSubmissionResult(null);
        setShowExamList(false);
        // Cập nhật URL
        navigate(`/assessment/${courseId}/${exam.id}`, { replace: true });
    };

    const handleAnswerChange = (questionId, selectedOption) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleCodeChange = (questionId, value) => {
        setCodeAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const runCode = async (question) => {
        if (!selectedExam) return;
        const source = codeAnswers[question.id];
        if (!source || !source.trim()) {
            message.warning('Nhập code trước khi chạy');
            return;
        }
        const testCases = parseCodeTestCases(question.testCases);
        if (!testCases || testCases.length === 0) {
            message.error('Câu hỏi chưa có test case');
            return;
        }
        const payload = {
            sourceCode: source,
            testCases: JSON.stringify(testCases),
            languageId: question.languageId
        };
        const result = await examService.runCodeQuestion(selectedExam.id, question.id, payload);
        if (result.success) {
            const results = Array.isArray(result.data) ? result.data : (result.data?.data || []);
            setCodeResults((prev) => ({ ...prev, [question.id]: results }));
            const passedCount = results.filter(r => r.passed).length;
            if (passedCount === results.length) {
                message.success(`Chúc mừng! Bạn đã vượt qua tất cả ${results.length} test case.`);
            } else {
                message.warning(`Đã chạy: ${passedCount}/${results.length} test case đạt.`);
            }
        } else {
            message.error(result.error || 'Không chạy được test');
        }
    };

    const handleSubmit = async () => {
        if (!selectedExam) return;
        setSubmitting(true);
        const answers = questions.map((q) => ({
            questionId: q.id,
            selectedOption: q.type === 'MCQ' ? selectedAnswers[q.id] : null,
            codeAnswer: q.type === 'CODE' ? codeAnswers[q.id] : null
        }));
        const result = await examService.submitExam(selectedExam.id, { answers });
        setSubmitting(false);
        if (result.success) {
            setSubmissionResult(result.data);
            setOpenModal(true);
            // Tự động load lại bài làm sau khi submit
            await fetchMySubmission(selectedExam.id);
        } else {
            message.error(result.error || 'Nộp bài thất bại');
        }
    };

    const handleReset = () => {
        setSelectedAnswers({});
        setCodeAnswers({});
        setCodeResults({});
        setSubmissionResult(null);
    };

    const percent = submissionResult && submissionResult.maxScore > 0
        ? Math.round((submissionResult.totalScore / submissionResult.maxScore) * 100)
        : 0;
    const getResultMessage = () => {
        if (percent >= 80) return { message: 'Xuất sắc!', icon: faAward, color: 'text-yellow-500' };
        if (percent >= 60) return { message: 'Làm tốt lắm!', icon: faThumbsUp, color: 'text-green-500' };
        return { message: 'Tiếp tục học nhé!', icon: faFrown, color: 'text-orange-500' };
    };

    const resultData = getResultMessage();
    const answeredCount = questions.filter(q => {
        if (q.type === 'MCQ') return !!selectedAnswers[q.id];
        if (q.type === 'CODE') return !!codeAnswers[q.id];
        return false;
    }).length;
    const allAnswered = answeredCount === questions.length && questions.length > 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải bài kiểm tra...</p>
                </div>
            </div>
        );
    }

    if (showExamList) {
        return (
            <div className="min-h-screen py-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="mx-auto px-6 max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate(`/course/${courseId}`)}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                        >
                            <FontAwesomeIcon icon={faBackward} />
                            Quay lại khóa học
                        </button>
                        <h1 className="text-2xl font-bold">Chọn đề thi</h1>
                        <div></div>
                    </div>
                    {exams.length === 0 ? (
                        <Card className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2">Chưa có đề thi</h3>
                            <p className="text-gray-600">Giáo viên sẽ công bố đề thi cho khóa học này.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {exams.map((exam) => (
                                <Card
                                    key={exam.id}
                                    className="cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => selectExam(exam)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                                            {exam.description && (
                                                <p className="text-gray-600 mb-2">{exam.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>{exam.questions?.length || 0} câu hỏi</span>
                                                <Tag color="green">Đã công bố</Tag>
                                            </div>
                                        </div>
                                        <FontAwesomeIcon icon={faPlay} className="text-indigo-600 text-xl" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!selectedExam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow rounded-2xl p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">Chưa có đề thi</h3>
                    <p className="text-gray-600">Giáo viên sẽ công bố đề thi cho khóa học này.</p>
                    <button
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                    >
                        Quay lại khóa học
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                        <FontAwesomeIcon icon={faBackward} />
                        Quay lại khóa học
                    </button>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl shadow-lg">
                        <h1 className="text-xl font-bold text-center">{selectedExam.title}</h1>
                        {selectedExam.description && (
                            <p className="text-sm text-center mt-1 opacity-90">{selectedExam.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {mySubmissions.length > 0 && (
                            <button
                                onClick={() => setShowMySubmissionsList(true)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                                <FontAwesomeIcon icon={faHistory} />
                                Xem lại bài làm ({mySubmissions.length})
                            </button>
                        )}
                        <div className="bg-white rounded-lg shadow-md px-4 py-2">
                            <p className="text-sm text-gray-600">Tiến độ</p>
                            <p className="font-bold text-indigo-600">
                                {answeredCount}/{questions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="bg-indigo-100 border-b border-indigo-200 p-4 text-start">
                                <h3 className="text-lg font-semibold">
                                    Câu {index + 1}: {question.prompt || question.question}
                                </h3>
                                <p className="text-xs text-gray-500">{question.type === 'CODE' ? 'Code / Test case' : 'Trắc nghiệm'}</p>
                            </div>

                            <div className="p-6 space-y-3">
                                {question.type === 'MCQ' ? (
                                    [question.option1, question.option2, question.option3, question.option4].map((option, optionIndex) => (
                                        <label
                                            key={`${question.id}-${optionIndex}`}
                                            className={`flex items-center p-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedAnswers[question.id] === option
                                                ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-800'
                                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                checked={selectedAnswers[question.id] === option}
                                                onChange={() => handleAnswerChange(question.id, option)}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${selectedAnswers[question.id] === option
                                                    ? 'border-indigo-500 bg-indigo-500'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                {selectedAnswers[question.id] === option && (
                                                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                                                )}
                                            </div>
                                            <span className="text-gray-700 font-medium">{option}</span>
                                        </label>
                                    ))
                                ) : (
                                    <div className="space-y-4">
                                        {/* Code Editor Section - giống LessonViewer */}
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-2 bg-gray-50">
                                                <span className="text-xs font-mono">
                                                    {question.languageId ? `Judge0 #${question.languageId}` : "Chưa cấu hình ngôn ngữ"}
                                                </span>
                                                {question.languageId && JUDGE0_LANGUAGE_MAP[question.languageId] && (
                                                    <span className="text-xs text-gray-500">{JUDGE0_LANGUAGE_MAP[question.languageId]}</span>
                                                )}
                                            </div>
                                            <textarea
                                                className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 text-sm resize-none focus:outline-none"
                                                rows={12}
                                                placeholder="#include <iostream>&#10;&#10;int main() {&#10;    // Code here...&#10;    return 0;&#10;}"
                                                value={codeAnswers[question.id] || question.starterCode || ''}
                                                onChange={(e) => handleCodeChange(question.id, e.target.value)}
                                            />
                                        </div>

                                        {/* Test Cases Section */}
                                        {(() => {
                                            const testCases = parseCodeTestCases(question.testCases);
                                            const results = codeResults[question.id] || [];
                                            const selectedIdx = selectedTestCases[question.id] || 0;
                                            const currentTestCase = testCases[selectedIdx];
                                            const currentResult = results[selectedIdx];
                                            const passedCount = results.filter(r => r?.passed).length;

                                            return (
                                                <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-lg">
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Bài kiểm tra {passedCount}/{testCases.length || 0}
                                                        </span>
                                                        {results.length > 0 && (
                                                            <span className={`text-xs ${passedCount === results.length ? "text-green-600" : "text-orange-600"}`}>
                                                                {passedCount === results.length ? "Tất cả test case đạt" : "Một số test case chưa đạt"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {testCases.length > 0 ? (
                                                        <>
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {testCases.map((tc, idx) => {
                                                                    const result = results[idx];
                                                                    const isSelected = selectedIdx === idx;
                                                                    let statusClass = "bg-white text-gray-700 border border-gray-300";
                                                                    if (result) {
                                                                        statusClass = result.passed
                                                                            ? "border-green-500 text-green-700 bg-green-50"
                                                                            : "border-red-500 text-red-700 bg-red-50";
                                                                    }
                                                                    const baseClass = isSelected ? "ring-2 ring-blue-500" : "";
                                                                    return (
                                                                        <button
                                                                            key={tc.id || idx}
                                                                            onClick={() => setSelectedTestCases(prev => ({ ...prev, [question.id]: idx }))}
                                                                            className={`px-3 py-1.5 text-xs font-medium rounded transition ${statusClass} ${baseClass}`}
                                                                        >
                                                                            {tc.name || `Test ${idx + 1}`}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            {currentTestCase && (
                                                                <div className="mb-3 space-y-2">
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 mb-1">Đầu vào</p>
                                                                        <div className="bg-white border text-gray-700 p-2 rounded text-xs font-mono min-h-[40px]">
                                                                            {currentTestCase.stdin || "Không có"}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 mb-1">Đầu ra mong muốn</p>
                                                                        <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono min-h-[40px]">
                                                                            {currentTestCase.hidden ? "Ẩn (hidden test)" : (currentTestCase.expectedOutput || "Không có")}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {currentResult && (
                                                                <div className="mb-3 space-y-2">
                                                                    <div className={`p-2 rounded text-xs font-semibold ${currentResult.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                                        {currentResult.status || (currentResult.passed ? "PASSED" : "FAILED")}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 mb-1">Kết quả thực tế</p>
                                                                        <div className="bg-white border text-gray-800 p-2 rounded text-xs font-mono min-h-[40px] whitespace-pre-wrap">
                                                                            {currentResult.stdout || currentResult.compileOutput || currentResult.stderr || "Không có output"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-gray-500">Câu hỏi chưa được cấu hình test case.</p>
                                                    )}
                                                    <div className="flex justify-end mt-4">
                                                        <button
                                                            onClick={() => runCode(question)}
                                                            disabled={!question.languageId || !testCases || testCases.length === 0}
                                                            className={`px-6 py-2 rounded text-sm font-semibold text-white ${(!question.languageId || !testCases || testCases.length === 0)
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-blue-600 hover:bg-blue-700"
                                                                } transition flex items-center gap-2`}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} />
                                                            KIỂM TRA
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handleReset}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                    >
                        Làm lại
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !allAnswered}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg ${submitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                                Đang nộp bài...
                            </>
                        ) : (
                            'Nộp bài kiểm tra'
                        )}
                    </button>
                </div>
            </div>

            <Modal
                open={openModal}
                onOk={() => setOpenModal(false)}
                onCancel={() => setOpenModal(false)}
                footer={[
                    <button
                        key="ok"
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Tiếp tục học
                    </button>
                ]}
                className="assessment-modal"
                width={500}
            >
                <div className="text-center py-6">
                    <div className={`text-6xl mb-4 ${resultData.color}`}>
                        <FontAwesomeIcon icon={resultData.icon} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn thành kiểm tra!</h2>
                    <h3 className={`text-3xl font-bold mb-4 ${resultData.color}`}>{resultData.message}</h3>

                    {submissionResult && (
                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 mb-4">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">
                                {percent}%
                            </div>
                            <p className="text-gray-600">
                                Điểm: <span className="font-bold text-indigo-600">{submissionResult.totalScore}</span> /
                                <span className="font-bold text-indigo-600">{submissionResult.maxScore}</span>
                            </p>
                        </div>
                    )}

                </div>
            </Modal>

            {/* Modal danh sách bài làm của học viên */}
            <Modal
                title="Danh sách bài làm của bạn"
                open={showMySubmissionsList}
                onCancel={() => {
                    setShowMySubmissionsList(false);
                    setShowMySubmission(false);
                }}
                footer={null}
                width={800}
            >
                {mySubmissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Bạn chưa có bài làm nào cho đề thi này.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mySubmissions.map((submission, idx) => {
                            const percent = submission.maxScore > 0
                                ? Math.round((submission.totalScore / submission.maxScore) * 100)
                                : 0;
                            return (
                                <Card
                                    key={submission.id}
                                    className={`cursor-pointer hover:shadow-lg transition-all ${mySubmission?.id === submission.id ? 'border-blue-500 bg-blue-50' : ''
                                        }`}
                                    onClick={() => {
                                        setMySubmission(submission);
                                        setShowMySubmissionsList(false);
                                        setShowMySubmission(true);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Text strong className="text-lg">
                                                Lần làm bài {mySubmissions.length - idx}
                                            </Text>
                                            <div className="mt-1 flex items-center gap-2">
                                                <Text>
                                                    Điểm: {submission.totalScore || 0} / {submission.maxScore || 0}
                                                </Text>
                                                <Tag color={percent >= 60 ? 'green' : percent >= 40 ? 'orange' : 'red'}>
                                                    {percent}%
                                                </Tag>
                                                <Badge
                                                    status={submission.passed ? 'success' : 'error'}
                                                    text={submission.passed ? 'Đạt' : 'Chưa đạt'}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Text className="text-sm text-gray-500">
                                                {submission.submittedAt
                                                    ? new Date(submission.submittedAt).toLocaleString('vi-VN')
                                                    : 'N/A'}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Modal>

            {/* Modal xem lại bài làm của học viên */}
            <Modal
                title={`Bài làm của bạn - Lần ${mySubmissions.findIndex(s => s.id === mySubmission?.id) !== -1 ? mySubmissions.length - mySubmissions.findIndex(s => s.id === mySubmission?.id) : ''}`}
                open={showMySubmission}
                onCancel={() => {
                    setShowMySubmission(false);
                    if (mySubmissions.length > 1) {
                        setShowMySubmissionsList(true);
                    }
                }}
                footer={[
                    mySubmissions.length > 1 && (
                        <button
                            key="back"
                            onClick={() => {
                                setShowMySubmission(false);
                                setShowMySubmissionsList(true);
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors mr-2"
                        >
                            Quay lại danh sách
                        </button>
                    ),
                    <button
                        key="close"
                        onClick={() => setShowMySubmission(false)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Đóng
                    </button>
                ].filter(Boolean)}
                width={900}
            >
                {mySubmission && (
                    <div className="space-y-4">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Điểm">
                                <Text strong className="text-lg">
                                    {mySubmission.totalScore || 0} / {mySubmission.maxScore || 0}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tỷ lệ">
                                {(() => {
                                    const percent = mySubmission.maxScore > 0
                                        ? Math.round((mySubmission.totalScore / mySubmission.maxScore) * 100)
                                        : 0;
                                    return (
                                        <Tag color={percent >= 60 ? 'green' : percent >= 40 ? 'orange' : 'red'}>
                                            {percent}%
                                        </Tag>
                                    );
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Badge
                                    status={mySubmission.passed ? 'success' : 'error'}
                                    text={mySubmission.passed ? 'Đạt' : 'Chưa đạt'}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian nộp">
                                {mySubmission.submittedAt
                                    ? new Date(mySubmission.submittedAt).toLocaleString('vi-VN')
                                    : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="mt-4">
                            <Title level={5}>Chi tiết từng câu hỏi:</Title>
                            <div className="space-y-4 mt-2">
                                {mySubmission.answers?.map((answer, idx) => {
                                    const question = answer.question;
                                    return (
                                        <Card key={answer.id} size="small" className={`border-l-4 ${answer.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                            <div className="mb-2">
                                                <Text strong>Câu {idx + 1}: {question?.prompt}</Text>
                                                <div className="mt-1">
                                                    <Tag color={question?.type === 'CODE' ? 'purple' : 'blue'}>
                                                        {question?.type === 'CODE' ? 'Code' : 'Trắc nghiệm'}
                                                    </Tag>
                                                    <Tag color={answer.passed ? 'green' : 'red'}>
                                                        {answer.passed ? 'Đúng' : 'Sai'}
                                                    </Tag>
                                                    <Text className="ml-2">
                                                        Điểm: {answer.score || 0} / {question?.maxScore || 1}
                                                    </Text>
                                                </div>
                                            </div>
                                            {question?.type === 'MCQ' ? (
                                                <div className="mt-2">
                                                    <Text className="text-gray-600">Đáp án bạn chọn: </Text>
                                                    <Text strong className={answer.passed ? 'text-green-600' : 'text-red-600'}>
                                                        {answer.selectedOption || 'Chưa chọn'}
                                                    </Text>
                                                    <br />
                                                    <Text className="text-gray-600">Đáp án đúng: </Text>
                                                    <Text strong className="text-green-600">{question.answer}</Text>
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <Text className="text-gray-600 block mb-1">Code của bạn:</Text>
                                                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                                        {answer.codeAnswer || 'Chưa có code'}
                                                    </pre>
                                                    {answer.autoResult && (
                                                        <div className="mt-2">
                                                            <Text className="text-gray-600 block mb-1">Kết quả chạy test:</Text>
                                                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                                                {JSON.stringify(JSON.parse(answer.autoResult), null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Assessment;
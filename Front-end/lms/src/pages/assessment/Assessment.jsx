import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { faBackward, faCheck, faAward, faThumbsUp, faFrown, faPlay, faHistory, faClock, faQuestionCircle, faSearch, faFilter, faCalendar, faExclamationTriangle, faChevronLeft, faChevronRight, faSave, faRedo, faEllipsisV, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
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
    const [_loadingMySubmission, setLoadingMySubmission] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [showMySubmission, setShowMySubmission] = useState(false);
    const [showMySubmissionsList, setShowMySubmissionsList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'published', 'draft'
    const [filterHasQuestions, setFilterHasQuestions] = useState('all'); // 'all', 'has', 'empty'
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null); // in seconds
    const [examStatus] = useState('doing'); // 'doing', 'submitted', 'closed'
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Load from localStorage or default to false
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    // Save dark mode preference
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

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

    // Kiểm tra và polling để lấy feedback từ Gemini
    const checkFeedbackReady = async (examId, retryCount = 0) => {
        if (retryCount >= 5) {
            // Sau 5 lần thử (tổng ~15 giây), dừng lại
            setLoadingFeedback(false);
            return;
        }

        try {
            const result = await examService.getMySubmissions(examId);
            if (result.success && result.data && result.data.length > 0) {
                const latestSubmission = result.data[0];
                // Kiểm tra xem tất cả answers đã có feedback chưa
                const allHaveFeedback = latestSubmission.answers?.every(
                    answer => answer.feedback && answer.feedback.trim().length > 0
                );

                if (allHaveFeedback) {
                    // Đã có feedback, cập nhật state
                    setMySubmissions(result.data);
                    setMySubmission(latestSubmission);
                    setLoadingFeedback(false);
                } else {
                    // Chưa có feedback, thử lại sau 3 giây
                    setTimeout(() => {
                        checkFeedbackReady(examId, retryCount + 1);
                    }, 3000);
                }
            } else {
                setLoadingFeedback(false);
            }
        } catch (error) {
            console.error("Error checking feedback:", error);
            setLoadingFeedback(false);
        }
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
        setCurrentQuestionIndex(0); // Reset to first question
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
            // Bắt đầu loading feedback
            setLoadingFeedback(true);
            // Tự động load lại bài làm sau khi submit để có feedback từ Gemini
            // Đợi một chút để Gemini API có thời gian tạo feedback
            setTimeout(async () => {
                await fetchMySubmission(selectedExam.id);
                // Kiểm tra xem feedback đã có chưa, nếu chưa thì polling
                if (selectedExam?.id) {
                    checkFeedbackReady(selectedExam.id);
                }
            }, 2000); // Đợi 2 giây để Gemini API xử lý
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

    // Helper functions for question navigation
    const getQuestionStatus = (questionId) => {
        if (questions.find(q => q.id === questionId)?.type === 'MCQ') {
            return selectedAnswers[questionId] ? 'answered' : 'unanswered';
        } else {
            return codeAnswers[questionId] ? 'answered' : 'unanswered';
        }
    };

    const goToQuestion = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
            // Scroll to top of question container
            const questionContainer = document.querySelector('.question-container');
            if (questionContainer) {
                questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Reset to first question when questions change
    useEffect(() => {
        if (questions.length > 0 && currentQuestionIndex >= questions.length) {
            setCurrentQuestionIndex(0);
        }
    }, [questions.length, currentQuestionIndex]);

    const formatTime = (seconds) => {
        if (!seconds) return null;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer effect
    useEffect(() => {
        if (selectedExam?.duration && timeRemaining !== null && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        message.warning('Hết thời gian làm bài!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [selectedExam?.duration, timeRemaining]);

    // Initialize timer when exam is selected
    useEffect(() => {
        if (selectedExam?.duration) {
            setTimeRemaining(selectedExam.duration * 60); // Convert minutes to seconds
        }
    }, [selectedExam?.duration]);

    // Filter exams based on search and filters
    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            // Search filter
            const matchesSearch = !searchQuery ||
                exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter (all exams shown are published, but keeping for future use)
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'published' && exam.published);

            // Questions filter
            const questionCount = exam.questions?.length || 0;
            const matchesQuestions = filterHasQuestions === 'all' ||
                (filterHasQuestions === 'has' && questionCount > 0) ||
                (filterHasQuestions === 'empty' && questionCount === 0);

            return matchesSearch && matchesStatus && matchesQuestions;
        });
    }, [exams, searchQuery, filterStatus, filterHasQuestions]);

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
            <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
                }`}>
                <div className="mx-auto px-4 sm:px-6 max-w-[1040px]">
                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate(`/course/${courseId}`)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${isDarkMode
                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                                    : 'bg-white hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faBackward} />
                                <span className="hidden sm:inline">Quay lại khóa học</span>
                                <span className="sm:hidden">Quay lại</span>
                            </button>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2.5 rounded-lg transition-all duration-200 ${isDarkMode
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                            >
                                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                }`}>Chọn đề thi</h1>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Chọn một đề để bắt đầu làm bài</p>
                        </div>

                        {/* Search and Filter Section */}
                        {exams.length > 0 && (
                            <div className={`rounded-xl shadow-md p-4 mb-6 space-y-4 transition-colors duration-300 ${isDarkMode
                                ? 'bg-gray-800 border border-gray-700'
                                : 'bg-white'
                                }`}>
                                {/* Search Bar */}
                                <div className="relative">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                            }`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên đề thi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faFilter} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>Lọc:</span>
                                    </div>

                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="published">Đã công bố</option>
                                        <option value="draft">Chưa công bố</option>
                                    </select>

                                    <select
                                        value={filterHasQuestions}
                                        onChange={(e) => setFilterHasQuestions(e.target.value)}
                                        className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="has">Có câu hỏi</option>
                                        <option value="empty">Trống</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading Skeleton */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && exams.length === 0 && (
                        <Card className={`text-center py-16 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                            }`}>
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>Chưa có đề thi</h3>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Giáo viên sẽ công bố đề thi cho khóa học này.</p>
                            <button
                                onClick={() => navigate(`/course/${courseId}`)}
                                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Quay lại khóa học
                            </button>
                        </Card>
                    )}

                    {/* No Results from Filter */}
                    {!loading && exams.length > 0 && filteredExams.length === 0 && (
                        <Card className={`text-center py-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                            }`}>
                            <FontAwesomeIcon icon={faSearch} className={`text-4xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                }`} />
                            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>Không tìm thấy đề thi</h3>
                            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterStatus('all');
                                    setFilterHasQuestions('all');
                                }}
                                className={`font-medium ${isDarkMode
                                    ? 'text-indigo-400 hover:text-indigo-300'
                                    : 'text-indigo-600 hover:text-indigo-700'
                                    }`}
                            >
                                Xóa bộ lọc
                            </button>
                        </Card>
                    )}

                    {/* Exam Cards */}
                    {!loading && filteredExams.length > 0 && (
                        <div className="space-y-4">
                            {filteredExams.map((exam) => {
                                const questionCount = exam.questions?.length || 0;
                                const hasQuestions = questionCount > 0;
                                const maxScore = exam.questions?.reduce((sum, q) => sum + (q.maxScore || 1), 0) || 0;

                                return (
                                    <Card
                                        key={exam.id}
                                        className={`hover:shadow-xl transition-all duration-300 border ${isDarkMode
                                            ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
                                            : 'bg-white border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Left: Exam Info */}
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                                    }`}>{exam.title}</h3>
                                                {exam.description && (
                                                    <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>{exam.description}</p>
                                                )}

                                                {/* Meta Information with Icons */}
                                                <div className={`flex flex-wrap items-center gap-4 text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                    <div className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faQuestionCircle} className="text-indigo-500" />
                                                        <span className={!hasQuestions ? "text-orange-600 font-medium" : ""}>
                                                            {hasQuestions ? `${questionCount} câu hỏi` : "Chưa có câu hỏi"}
                                                        </span>
                                                    </div>

                                                    {exam.duration && (
                                                        <div className="flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={faClock} className="text-blue-500" />
                                                            <span>{exam.duration} phút</span>
                                                        </div>
                                                    )}

                                                    {maxScore > 0 && (
                                                        <div className="flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={faAward} className="text-yellow-500" />
                                                            <span>{maxScore} điểm</span>
                                                        </div>
                                                    )}

                                                    {exam.deadline && (
                                                        <div className="flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={faCalendar} className="text-red-500" />
                                                            <span>Hạn: {new Date(exam.deadline).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Badge */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.published
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {exam.published ? '🟢 Đã công bố' : '⚪ Nháp'}
                                                    </span>

                                                    {!hasQuestions && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                                                            Chưa có câu hỏi
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-2 md:flex-col md:min-w-[140px]">
                                                <button
                                                    onClick={() => selectExam(exam)}
                                                    disabled={!hasQuestions}
                                                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${hasQuestions
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                    title={!hasQuestions ? "Chưa có câu hỏi" : "Vào làm bài"}
                                                >
                                                    <FontAwesomeIcon icon={faPlay} />
                                                    <span className="hidden sm:inline">Vào làm bài</span>
                                                    <span className="sm:hidden">Làm bài</span>
                                                </button>


                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
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

    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
            }`}>
            {/* Header - Sticky */}
            <div className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-300 ${isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
                }`}>
                <div className="mx-auto px-4 sm:px-6 max-w-[1400px]">
                    <div className="flex items-center justify-between gap-4 py-3">
                        {/* Left: Back Button */}
                        <button
                            onClick={() => navigate(`/course/${courseId}`)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-md ${isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                                }`}
                        >
                            <FontAwesomeIcon icon={faBackward} />
                            <span className="hidden sm:inline">Quay lại</span>
                        </button>

                        {/* Center: Exam Title + Status Chip */}
                        <div className="flex-1 flex items-center justify-center gap-3">
                            <h1 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                }`}>{selectedExam.title}</h1>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${examStatus === 'doing'
                                ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                : examStatus === 'submitted'
                                    ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                    : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {examStatus === 'doing' ? 'Đang làm' :
                                    examStatus === 'submitted' ? 'Đã nộp' : 'Đã đóng'}
                            </span>
                        </div>

                        {/* Right: Progress + Timer + History + Dark Mode Toggle */}
                        <div className="flex items-center gap-3">
                            {/* Progress Bar */}
                            <div className="hidden md:flex items-center gap-2">
                                <div className={`w-24 rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}>
                                    <div
                                        className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span className={`text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {answeredCount}/{questions.length} câu
                                </span>
                            </div>

                            {/* Timer */}
                            {timeRemaining !== null && timeRemaining > 0 && (
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg ${isDarkMode
                                    ? 'bg-red-900/30 border-red-700'
                                    : 'bg-red-50 border-red-200'
                                    }`}>
                                    <FontAwesomeIcon icon={faClock} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'
                                        }`}>
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                            )}

                            {/* History Button - Secondary */}
                            {mySubmissions.length > 0 && (
                                <button
                                    onClick={() => setShowMySubmissionsList(true)}
                                    className={`flex items-center gap-2 border-2 px-3 py-2 rounded-lg transition-all duration-200 ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 hover:border-indigo-500 text-gray-200 hover:text-indigo-400'
                                        : 'bg-white border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600'
                                        }`}
                                    title={`Xem lại ${mySubmissions.length} bài làm`}
                                >
                                    <FontAwesomeIcon icon={faHistory} />
                                    <span className="hidden lg:inline">Xem lại</span>
                                </button>
                            )}

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2.5 rounded-lg transition-all duration-200 ${isDarkMode
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                            >
                                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 max-w-[1400px] py-6">
                {/* Question Navigator - Sticky Top */}
                {questions.length > 1 && (
                    <div className={`sticky top-[73px] z-40 rounded-lg shadow-md p-3 mb-6 border transition-colors duration-300 ${isDarkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                    disabled={currentQuestionIndex === 0}
                                    className={`px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Câu trước</span>
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-2 flex-wrap">
                                {questions.map((q, idx) => {
                                    const status = getQuestionStatus(q.id);
                                    const isCurrent = idx === currentQuestionIndex;
                                    let statusClass = '';
                                    if (isCurrent) {
                                        statusClass = isDarkMode
                                            ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-400'
                                            : 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300';
                                    } else if (status === 'answered') {
                                        statusClass = isDarkMode
                                            ? 'bg-green-800 text-green-200 border-green-600'
                                            : 'bg-green-100 text-green-700 border-green-400';
                                    } else {
                                        statusClass = isDarkMode
                                            ? 'bg-gray-700 text-gray-400 border-gray-600'
                                            : 'bg-gray-100 text-gray-600 border-gray-300';
                                    }

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(idx)}
                                            className={`w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200 hover:scale-110 ${statusClass}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Câu tiếp</span>
                                <button
                                    onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                    className={`px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions Container - Only show current question */}
                {questions.length > 0 && questions[currentQuestionIndex] && (() => {
                    const question = questions[currentQuestionIndex];
                    const index = currentQuestionIndex;
                    const questionStatus = getQuestionStatus(question.id);
                    const maxScore = question.maxScore || 1;
                    const isCodeQuestion = question.type === 'CODE';

                    return (
                        <div className="question-container space-y-6">
                            <div
                                key={`question-${question.id}-${index}`}
                                className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border ${isDarkMode
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                                    }`}
                                style={{ animation: 'fadeIn 0.3s ease-in' }}
                            >
                                {/* Question Header - Compact */}
                                <div className={`border-b px-4 py-3 ${isDarkMode
                                    ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-700'
                                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                                    }`}>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                                }`}>
                                                Câu {index + 1}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isCodeQuestion
                                                ? isDarkMode
                                                    ? 'bg-purple-800 text-purple-200'
                                                    : 'bg-purple-100 text-purple-700'
                                                : isDarkMode
                                                    ? 'bg-blue-800 text-blue-200'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {isCodeQuestion ? 'Code' : 'Trắc nghiệm'}
                                            </span>
                                            {maxScore > 0 && (
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                    {maxScore} điểm
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${questionStatus === 'answered'
                                            ? isDarkMode
                                                ? 'bg-green-800 text-green-200'
                                                : 'bg-green-100 text-green-700'
                                            : isDarkMode
                                                ? 'bg-gray-700 text-gray-400'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {questionStatus === 'answered' ? 'Đã lưu' : 'Chưa lưu'}
                                        </span>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="p-6">
                                    {/* Question Prompt */}
                                    <div className="mb-6">
                                        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                            {question.prompt || question.question}
                                        </p>
                                    </div>

                                    {question.type === 'MCQ' ? (
                                        /* MCQ Options - Single Column, Compact Cards */
                                        <div className="max-w-[1000px] mx-auto space-y-3">
                                            {[question.option1, question.option2, question.option3, question.option4].map((option, optionIndex) => {
                                                const isSelected = selectedAnswers[question.id] === option;
                                                return (
                                                    <label
                                                        key={`${question.id}-${optionIndex}`}
                                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${isSelected
                                                            ? isDarkMode
                                                                ? 'bg-indigo-900/50 border-indigo-500 shadow-md'
                                                                : 'bg-indigo-50 border-indigo-500 shadow-md'
                                                            : isDarkMode
                                                                ? 'bg-gray-700 border-gray-600 hover:border-indigo-400 hover:bg-gray-600'
                                                                : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            checked={isSelected}
                                                            onChange={() => handleAnswerChange(question.id, option)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${isSelected
                                                            ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-500'
                                                            : isDarkMode
                                                                ? 'border-gray-500'
                                                                : 'border-gray-400'
                                                            }`}>
                                                            {isSelected && (
                                                                <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <span className={`font-medium ${isSelected
                                                                ? isDarkMode ? 'text-indigo-200' : 'text-indigo-900'
                                                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                                }`}>
                                                                {option}
                                                            </span>
                                                            {isSelected && (
                                                                <FontAwesomeIcon icon={faCheck} className={`ml-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                                                                    }`} />
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Code Question - 2 Column Layout */
                                        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
                                            {/* Left Column: Question Details */}
                                            <div className="space-y-4">
                                                {/* Warning Banner if no test cases */}
                                                {(() => {
                                                    const testCases = parseCodeTestCases(question.testCases);
                                                    if (testCases.length === 0) {
                                                        return (
                                                            <div className={`border-l-4 p-4 rounded ${isDarkMode
                                                                ? 'bg-orange-900/30 border-orange-500'
                                                                : 'bg-orange-50 border-orange-400'
                                                                }`}>
                                                                <div className="flex items-start gap-2">
                                                                    <FontAwesomeIcon icon={faExclamationTriangle} className={`mt-0.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                                                        }`} />
                                                                    <div>
                                                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-800'
                                                                            }`}>
                                                                            Câu hỏi chưa được cấu hình test case
                                                                        </p>
                                                                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                                                            }`}>
                                                                            Bạn vẫn có thể viết code và lưu bài làm.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Constraints & Examples */}
                                                <div className={`rounded-lg p-4 space-y-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                    }`}>
                                                    <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                                        }`}>Ràng buộc:</h4>
                                                    {question.constraints ? (
                                                        <p className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                            }`}>{question.constraints}</p>
                                                    ) : (
                                                        <p className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                                            }`}>Không có ràng buộc đặc biệt</p>
                                                    )}
                                                </div>

                                                {/* Example Input/Output */}
                                                {(() => {
                                                    const testCases = parseCodeTestCases(question.testCases);
                                                    const firstTestCase = testCases[0];
                                                    if (firstTestCase && !firstTestCase.hidden) {
                                                        return (
                                                            <div className={`rounded-lg p-4 space-y-2 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                                                                }`}>
                                                                <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'
                                                                    }`}>Ví dụ:</h4>
                                                                <div>
                                                                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'
                                                                        }`}>Đầu vào:</p>
                                                                    <pre className={`p-2 rounded text-xs font-mono overflow-x-auto ${isDarkMode
                                                                        ? 'bg-gray-800 text-gray-300'
                                                                        : 'bg-white text-gray-800'
                                                                        }`}>
                                                                        {firstTestCase.stdin || "Không có"}
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'
                                                                        }`}>Đầu ra mong muốn:</p>
                                                                    <pre className={`p-2 rounded text-xs font-mono overflow-x-auto ${isDarkMode
                                                                        ? 'bg-gray-800 text-gray-300'
                                                                        : 'bg-white text-gray-800'
                                                                        }`}>
                                                                        {firstTestCase.expectedOutput || "Không có"}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>

                                            {/* Right Column: Editor + Results */}
                                            <div className="space-y-4">
                                                {/* Toolbar */}
                                                <div className={`flex items-center justify-between border rounded-lg px-4 py-2 ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600'
                                                    : 'bg-gray-50 border-gray-200'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                            }`}>
                                                            {question.languageId && JUDGE0_LANGUAGE_MAP[question.languageId]
                                                                ? JUDGE0_LANGUAGE_MAP[question.languageId]
                                                                : question.languageId
                                                                    ? `Judge0 #${question.languageId}`
                                                                    : "Chưa cấu hình ngôn ngữ"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleCodeChange(question.id, question.starterCode || '')}
                                                            className={`px-3 py-1 text-xs border rounded transition-colors ${isDarkMode
                                                                ? 'border-gray-600 hover:bg-gray-600 text-gray-300'
                                                                : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                                                }`}
                                                            title="Reset code"
                                                        >
                                                            <FontAwesomeIcon icon={faRedo} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Code Editor */}
                                                <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                                    }`}>
                                                    <textarea
                                                        className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 text-sm resize-none focus:outline-none"
                                                        rows={16}
                                                        placeholder="#include <iostream>&#10;&#10;int main() {&#10;    // Code here...&#10;    return 0;&#10;}"
                                                        value={codeAnswers[question.id] || question.starterCode || ''}
                                                        onChange={(e) => handleCodeChange(question.id, e.target.value)}
                                                    />
                                                </div>

                                                {/* Test Results Panel */}
                                                {(() => {
                                                    const testCases = parseCodeTestCases(question.testCases);
                                                    const results = codeResults[question.id] || [];
                                                    const selectedIdx = selectedTestCases[question.id] || 0;
                                                    const currentTestCase = testCases[selectedIdx];
                                                    const currentResult = results[selectedIdx];
                                                    const passedCount = results.filter(r => r?.passed).length;

                                                    return (
                                                        <div className={`border rounded-lg ${isDarkMode
                                                            ? 'border-gray-600 bg-gray-800'
                                                            : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {/* Tabs */}
                                                            <div className={`border-b flex ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                                }`}>
                                                                <button className={`px-4 py-2 text-sm font-medium border-b-2 ${isDarkMode
                                                                    ? 'text-indigo-400 border-indigo-500'
                                                                    : 'text-indigo-600 border-indigo-600'
                                                                    }`}>
                                                                    Kết quả
                                                                </button>
                                                            </div>

                                                            <div className="p-4">
                                                                {testCases.length > 0 ? (
                                                                    <>
                                                                        {/* Test Case Status */}
                                                                        <div className="mb-4 flex items-center justify-between">
                                                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                                                }`}>
                                                                                Test case: {passedCount}/{testCases.length} đạt
                                                                            </span>
                                                                            {results.length > 0 && (
                                                                                <span className={`text-xs font-medium px-2 py-1 rounded ${passedCount === results.length
                                                                                    ? isDarkMode
                                                                                        ? "bg-green-900 text-green-300"
                                                                                        : "bg-green-100 text-green-700"
                                                                                    : isDarkMode
                                                                                        ? "bg-orange-900 text-orange-300"
                                                                                        : "bg-orange-100 text-orange-700"
                                                                                    }`}>
                                                                                    {passedCount === results.length ? "✓ Tất cả đạt" : "⚠ Một số chưa đạt"}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Test Case Buttons */}
                                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                                            {testCases.map((tc, idx) => {
                                                                                const result = results[idx];
                                                                                const isSelected = selectedIdx === idx;
                                                                                let statusClass = '';
                                                                                if (result) {
                                                                                    statusClass = result.passed
                                                                                        ? isDarkMode
                                                                                            ? "bg-green-900 text-green-300 border-green-600"
                                                                                            : "bg-green-50 text-green-700 border-green-400"
                                                                                        : isDarkMode
                                                                                            ? "bg-red-900 text-red-300 border-red-600"
                                                                                            : "bg-red-50 text-red-700 border-red-400";
                                                                                } else {
                                                                                    statusClass = isDarkMode
                                                                                        ? "bg-gray-700 text-gray-400 border-gray-600"
                                                                                        : "bg-gray-50 text-gray-700 border-gray-300";
                                                                                }
                                                                                return (
                                                                                    <button
                                                                                        key={tc.id || idx}
                                                                                        onClick={() => setSelectedTestCases(prev => ({ ...prev, [question.id]: idx }))}
                                                                                        className={`px-3 py-1.5 text-xs font-medium rounded border transition ${statusClass} ${isSelected
                                                                                            ? isDarkMode
                                                                                                ? "ring-2 ring-indigo-400"
                                                                                                : "ring-2 ring-blue-500"
                                                                                            : ""
                                                                                            }`}
                                                                                    >
                                                                                        {tc.name || `Test ${idx + 1}`}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>

                                                                        {/* Current Test Case Details */}
                                                                        {currentTestCase && (
                                                                            <div className={`mb-4 space-y-3 p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                                                }`}>
                                                                                <div>
                                                                                    <p className={`text-xs mb-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                                                        }`}>Đầu vào:</p>
                                                                                    <pre className={`border p-2 rounded text-xs font-mono overflow-x-auto ${isDarkMode
                                                                                        ? 'bg-gray-800 border-gray-600 text-gray-300'
                                                                                        : 'bg-white border-gray-200 text-gray-800'
                                                                                        }`}>
                                                                                        {currentTestCase.stdin || "Không có"}
                                                                                    </pre>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-xs mb-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                                                        }`}>Đầu ra mong muốn:</p>
                                                                                    <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
                                                                                        {currentTestCase.hidden ? "Ẩn (hidden test)" : (currentTestCase.expectedOutput || "Không có")}
                                                                                    </pre>
                                                                                </div>
                                                                                {currentResult && (
                                                                                    <>
                                                                                        <div className={`p-2 rounded text-xs font-semibold ${currentResult.passed
                                                                                            ? isDarkMode
                                                                                                ? "bg-green-900 text-green-300"
                                                                                                : "bg-green-100 text-green-700"
                                                                                            : isDarkMode
                                                                                                ? "bg-red-900 text-red-300"
                                                                                                : "bg-red-100 text-red-700"
                                                                                            }`}>
                                                                                            {currentResult.status || (currentResult.passed ? "✓ PASSED" : "✗ FAILED")}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className={`text-xs mb-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                                                                }`}>Kết quả thực tế:</p>
                                                                                            <pre className={`border p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto ${isDarkMode
                                                                                                ? 'bg-gray-800 border-gray-600 text-gray-300'
                                                                                                : 'bg-white border-gray-200 text-gray-800'
                                                                                                }`}>
                                                                                                {currentResult.stdout || currentResult.compileOutput || currentResult.stderr || "Không có output"}
                                                                                            </pre>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                                        }`}>
                                                                        Chưa có test case. Bạn vẫn có thể lưu bài làm.
                                                                    </p>
                                                                )}

                                                                {/* Action Buttons */}
                                                                <div className={`flex justify-end gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                                    }`}>
                                                                    <button
                                                                        onClick={() => runCode(question)}
                                                                        disabled={!question.languageId || testCases.length === 0}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${(!question.languageId || testCases.length === 0)
                                                                            ? isDarkMode
                                                                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                                            : isDarkMode
                                                                                ? "bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-300"
                                                                                : "bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700"
                                                                            }`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlay} />
                                                                        Chạy thử
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            // Auto-save functionality could go here
                                                                            message.success('Đã lưu bài làm');
                                                                        }}
                                                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition flex items-center gap-2"
                                                                    >
                                                                        <FontAwesomeIcon icon={faSave} />
                                                                        Lưu bài
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Sticky Footer */}
                <div className={`sticky bottom-0 z-50 border-t shadow-lg mt-8 transition-colors duration-300 ${isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="mx-auto px-4 sm:px-6 max-w-[1400px] py-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* Left: Navigation */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                    disabled={currentQuestionIndex === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                    <span className="hidden sm:inline">Câu trước</span>
                                </button>
                                <button
                                    onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span className="hidden sm:inline">Câu tiếp</span>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>

                            {/* Center: Progress */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Đã trả lời:</span>
                                <span className={`text-sm font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                                    }`}>
                                    {answeredCount}/{questions.length}
                                </span>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3">
                                {/* Reset button in dropdown/menu */}
                                <button
                                    onClick={() => {
                                        Modal.confirm({
                                            title: 'Xác nhận làm lại',
                                            content: 'Bạn có chắc muốn xóa tất cả câu trả lời và làm lại từ đầu?',
                                            okText: 'Xác nhận',
                                            cancelText: 'Hủy',
                                            onOk: handleReset,
                                        });
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode
                                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                        }`}
                                    title="Làm lại"
                                >
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>

                                {/* Save Draft */}
                                <button
                                    onClick={() => {
                                        message.success('Đã lưu tạm bài làm');
                                    }}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${isDarkMode
                                        ? 'border-gray-600 hover:border-indigo-500 text-gray-300 hover:text-indigo-400'
                                        : 'border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    <span className="hidden sm:inline">Lưu tạm</span>
                                </button>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !allAnswered}
                                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${submitting
                                        ? isDarkMode
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : allAnswered
                                            ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md hover:shadow-lg'
                                            : isDarkMode
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Đang nộp...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCheck} />
                                            <span>Nộp bài</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={openModal}
                onOk={() => setOpenModal(false)}
                onCancel={() => setOpenModal(false)}
                footer={[
                    <button
                        key="view"
                        onClick={() => {
                            setOpenModal(false);
                            setShowMySubmission(true);
                            // Bắt đầu check feedback nếu chưa có
                            if (!mySubmission?.answers?.every(a => a.feedback)) {
                                setLoadingFeedback(true);
                                checkFeedbackReady(selectedExam.id);
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors mr-2 flex items-center gap-2"
                    >
                        {loadingFeedback ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang tải feedback...
                            </>
                        ) : (
                            'Xem chi tiết & Feedback AI'
                        )}
                    </button>,
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
                                            {/* Feedback từ Gemini AI */}
                                            {answer.feedback ? (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg">🤖</span>
                                                        <Text strong className="text-indigo-600">Nhận xét và lời khuyên từ AI:</Text>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500">
                                                        <Text className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {answer.feedback}
                                                        </Text>
                                                    </div>
                                                </div>
                                            ) : loadingFeedback ? (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-lg">🤖</span>
                                                        <Text strong className="text-indigo-600">AI đang phân tích và tạo feedback...</Text>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500">
                                                        <div className="flex items-center justify-center gap-3 py-4">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                            <Text className="text-gray-600 italic">
                                                                Đang xử lý, vui lòng đợi...
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg">🤖</span>
                                                        <Text className="text-gray-500 text-sm italic">
                                                            Chưa có feedback từ AI (Có thể API key chưa được cấu hình hoặc đã hết thời gian chờ)
                                                        </Text>
                                                    </div>
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

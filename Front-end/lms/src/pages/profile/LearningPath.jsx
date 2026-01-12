import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    faCheckCircle,
    faClock,
    faArrowRight,
    faBookOpen,
    faRoute,
    faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { learningStatisticsService } from "../../api/learningStatistics.service";

const LearningPath = () => {
    const [learningPath, setLearningPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLearningPath = async () => {
        setLoading(true);
        const userId = localStorage.getItem("id");
        const result = await learningStatisticsService.getLearningPath(userId);

        if (result.success) {
            setLearningPath(result.data);
        } else {
            console.error("Failed to fetch learning path:", result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLearningPath();

        // Lắng nghe event khi bài học được đánh dấu hoàn thành
        const handleLessonCompleted = (event) => {
            console.log('Lesson completed event received:', event.detail);
            // Delay một chút để đảm bảo backend đã cập nhật
            setTimeout(() => {
                fetchLearningPath();
            }, 500);
        };

        window.addEventListener('lessonCompleted', handleLessonCompleted);

        // Refresh khi window được focus lại (khi quay lại từ tab khác)
        const handleFocus = () => {
            fetchLearningPath();
        };
        window.addEventListener('focus', handleFocus);

        // Kiểm tra localStorage để biết có cập nhật mới không
        const checkForUpdates = () => {
            const lastUpdate = localStorage.getItem('lessonProgressLastUpdate');
            if (lastUpdate) {
                const now = Date.now();
                const timeSinceUpdate = now - parseInt(lastUpdate);
                // Nếu có cập nhật trong vòng 5 phút, refresh lại
                if (timeSinceUpdate < 5 * 60 * 1000) {
                    fetchLearningPath();
                }
            }
        };

        // Check mỗi 2 giây
        const intervalId = setInterval(checkForUpdates, 2000);

        return () => {
            window.removeEventListener('lessonCompleted', handleLessonCompleted);
            window.removeEventListener('focus', handleFocus);
            clearInterval(intervalId);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tải lộ trình học tập</h3>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
                </div>
            </div>
        );
    }

    if (!learningPath || !learningPath.steps || learningPath.steps.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                            <FontAwesomeIcon icon={faRoute} className="h-full w-full" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có lộ trình học tập</h3>
                        <p className="text-gray-600 mb-6">
                            Bắt đầu đăng ký khóa học để tạo lộ trình học tập cá nhân của bạn.
                        </p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                        >
                            <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                            Khám phá khóa học
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faRoute} className="text-indigo-600" />
                                Lộ trình học tập
                            </h2>
                            <p className="text-gray-600">
                                Tiến độ tổng thể: <span className="font-bold text-indigo-600">
                                    {Math.round(learningPath.overallProgress)}%
                                </span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Tổng số bước</div>
                            <div className="text-3xl font-bold text-indigo-600">
                                {learningPath.steps.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Tiến độ tổng thể</span>
                            <span className="text-sm font-bold text-indigo-600">
                                {Math.round(learningPath.overallProgress)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all"
                                style={{ width: `${learningPath.overallProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Learning Path Steps */}
                <div className="space-y-6">
                    {learningPath.steps.map((step, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${step.isCurrent
                                ? 'border-indigo-500 ring-4 ring-indigo-200'
                                : step.isCompleted
                                    ? 'border-green-500'
                                    : 'border-gray-200'
                                }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Step Number */}
                                    <div
                                        className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${step.isCompleted
                                            ? 'bg-green-500 text-white'
                                            : step.isCurrent
                                                ? 'bg-indigo-500 text-white ring-4 ring-indigo-200'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {step.isCompleted ? (
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        ) : (
                                            step.stepOrder
                                        )}
                                    </div>

                                    {/* Course Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    {step.courseName}
                                                </h3>
                                                {step.description && (
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {step.description}
                                                    </p>
                                                )}
                                            </div>
                                            {step.courseImage && (
                                                <img
                                                    src={step.courseImage}
                                                    alt={step.courseName}
                                                    className="w-24 h-24 rounded-lg object-cover ml-4"
                                                />
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-600">
                                                    Tiến độ: {Math.round(step.progress)}%
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {step.completedLessons}/{step.totalLessons} bài học
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${step.isCompleted
                                                        ? 'bg-green-500'
                                                        : step.isCurrent
                                                            ? 'bg-indigo-500'
                                                            : 'bg-gray-400'
                                                        }`}
                                                    style={{ width: `${step.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Status and Action */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {step.isCompleted ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                        Đã hoàn thành
                                                    </span>
                                                ) : step.isCurrent ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                        Đang học
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <FontAwesomeIcon icon={faBookOpen} className="mr-1" />
                                                        Chưa bắt đầu
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/course/${step.courseId}`)}
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                                            >
                                                {step.isCurrent ? 'Tiếp tục học' : 'Xem khóa học'}
                                                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LearningPath;


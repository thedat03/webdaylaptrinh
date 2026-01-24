import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    faAward,
    faDownload,
    faTrophy,
    faChartLine,
    faCheckCircle,
    faClock,
    faGraduationCap,
    faStar,
    faBookOpen,
    faComments,
    faFire,
    faThumbsUp,
    faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { performanceService } from "../../api/performance.service";
import { learningStatisticsService } from "../../api/learningStatistics.service";

const Performance = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingCert, setDownloadingCert] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        const userId = localStorage.getItem("id");

        // Fetch statistics
        const statisticsResult = await learningStatisticsService.getLearningStatistics(userId);

        if (statisticsResult.success) {
            setStatistics(statisticsResult.data);
        } else {
            console.error("Failed to fetch statistics:", statisticsResult.error);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Lắng nghe event khi bài học được đánh dấu hoàn thành
        const handleLessonCompleted = (event) => {
            console.log('Lesson completed event received:', event.detail);
            // Delay một chút để đảm bảo backend đã cập nhật
            setTimeout(() => {
                fetchData();
            }, 500);
        };

        window.addEventListener('lessonCompleted', handleLessonCompleted);

        // Refresh khi window được focus lại (khi quay lại từ tab khác)
        const handleFocus = () => {
            fetchData();
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
                    fetchData();
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

    const handleCertificateDownload = async (courseId) => {
        setDownloadingCert(courseId);
        navigate(`/certificate/${courseId}`);
        setDownloadingCert(null);
    };


    // Generate activity heatmap
    const generateActivityHeatmap = () => {
        if (!statistics || !statistics.activityHeatmap) return [];

        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const today = new Date();

        // Get last 30 days, organize by weeks
        // We need to create a grid where columns are days of week and rows are weeks
        const grid = [];

        // Initialize grid with 5 rows (weeks) and 7 columns (days)
        for (let week = 0; week < 5; week++) {
            grid[week] = Array(7).fill(null);
        }

        // Fill the grid with activity data
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const count = statistics.activityHeatmap[dateKey] || 0;

            // Calculate which week (row) and day (column)
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const weekIndex = Math.floor((29 - i) / 7);

            if (weekIndex < 5) {
                grid[weekIndex][dayOfWeek] = {
                    date: dateKey,
                    count: count,
                    day: days[dayOfWeek]
                };
            }
        }

        return grid;
    };

    const getActivityColor = (count) => {
        if (count === 0) return "bg-gray-100";
        if (count <= 2) return "bg-green-200";
        if (count <= 5) return "bg-green-400";
        if (count <= 10) return "bg-green-600";
        return "bg-green-800";
    };

    const activityWeeks = generateActivityHeatmap();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tải dữ liệu</h3>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-4">
            <div className="space-y-6">
                {/* Overview Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Khóa học đã tham gia</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {statistics?.totalCourses || 0}
                                </p>
                                <p className="text-sm text-gray-500">khóa học</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-2xl text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bài học đã học</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {statistics?.completedLessons || 0}
                                </p>
                                <p className="text-sm text-gray-500">/ {statistics?.totalLessons || 0} bài</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <FontAwesomeIcon icon={faBookOpen} className="text-2xl text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tiến độ trung bình</p>
                                <p className="text-3xl font-bold text-indigo-600">
                                    {statistics ? Math.round(statistics.averageProgress) : 0}%
                                </p>
                                <p className="text-sm text-gray-500">hoàn thành</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-indigo-600" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Discussion Stats and Activity Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Discussion Stats */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faComments} />
                                Thảo luận
                            </h2>
                        </div>
                        <div className="p-6 flex-1 flex items-center justify-center">
                            {statistics?.discussionStats ? (
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-pink-50 rounded-xl p-4 text-center">
                                        <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <FontAwesomeIcon icon={faFire} className="text-pink-600 text-xl" />
                                        </div>
                                        <p className="text-2xl font-bold text-pink-600">
                                            {statistics.discussionStats.totalTopics}
                                        </p>
                                        <p className="text-sm text-gray-600">Chủ đề</p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                        <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <FontAwesomeIcon icon={faStar} className="text-yellow-600 text-xl" />
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {statistics.discussionStats.totalRatings}
                                        </p>
                                        <p className="text-sm text-gray-600">Đánh giá</p>
                                    </div>
                                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                                        <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <FontAwesomeIcon icon={faThumbsUp} className="text-orange-600 text-xl" />
                                        </div>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {statistics.discussionStats.totalLikes}
                                        </p>
                                        <p className="text-sm text-gray-600">Lượt thích</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <FontAwesomeIcon icon={faComments} className="text-blue-600 text-xl" />
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {statistics.discussionStats.totalComments}
                                        </p>
                                        <p className="text-sm text-gray-600">Bình luận</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Chưa có dữ liệu thảo luận</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Heatmap */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendar} />
                                Hoạt động
                            </h2>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            {activityWeeks.length > 0 ? (
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex gap-0.5 mb-2">
                                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
                                            <div key={idx} className="flex-1 text-center text-xs text-gray-600 font-medium">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-0.5">
                                        {activityWeeks.map((week, weekIdx) => (
                                            <div key={weekIdx} className="flex flex-col gap-0.5 flex-1">
                                                {week.map((day, dayIdx) => (
                                                    day ? (
                                                        <div
                                                            key={dayIdx}
                                                            className={`w-full h-8 rounded ${getActivityColor(day.count)} hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer`}
                                                            title={`${day.date}: ${day.count} hoạt động`}
                                                        />
                                                    ) : (
                                                        <div key={dayIdx} className="w-full h-8 bg-gray-50 rounded" />
                                                    )
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-600">
                                        <span>Hoạt động</span>
                                        <div className="flex gap-0.5">
                                            <div className="w-2.5 h-2.5 rounded bg-gray-100"></div>
                                            <div className="w-2.5 h-2.5 rounded bg-green-200"></div>
                                            <div className="w-2.5 h-2.5 rounded bg-green-400"></div>
                                            <div className="w-2.5 h-2.5 rounded bg-green-600"></div>
                                            <div className="w-2.5 h-2.5 rounded bg-green-800"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
                                    <p>Chưa có dữ liệu hoạt động</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faGraduationCap} />
                            Khóa học đã tham gia ({statistics?.enrolledCourses?.length || 0})
                        </h2>
                    </div>
                    <div className="p-6">
                        {statistics?.enrolledCourses && statistics.enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {statistics.enrolledCourses.map((course, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => navigate(`/course/${course.courseId}`)}
                                    >
                                        <div className="relative h-32 bg-gradient-to-r from-indigo-400 to-purple-500">
                                            {course.courseImage ? (
                                                <img
                                                    src={course.courseImage}
                                                    alt={course.courseName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faGraduationCap} className="text-white text-4xl" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                                                {course.courseName}
                                            </h3>
                                            <div className="mb-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-600">Tiến độ</span>
                                                    <span className="text-sm font-bold text-indigo-600">
                                                        {Math.round(course.progressPercentage)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${course.progressPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>
                                                    <FontAwesomeIcon icon={faBookOpen} className="mr-1" />
                                                    {course.lessonsStudied}/{course.totalLessons} bài
                                                </span>
                                                <span>
                                                    {course.completedLessons === course.totalLessons ? (
                                                        <span className="text-green-600 font-medium">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                            Hoàn thành
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-600">
                                                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                            Đang học
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                    <FontAwesomeIcon icon={faGraduationCap} className="h-full w-full" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa tham gia khóa học nào</h3>
                                <p className="text-gray-500 mb-6">
                                    Bắt đầu đăng ký khóa học để xem tiến độ học tập của bạn.
                                </p>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                                >
                                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                                    Khám phá khóa học
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Performance;

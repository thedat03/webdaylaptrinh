import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers, faBook, faGraduationCap, faCreditCard, faDollarSign,
    faClock, faCheckCircle, faTimesCircle, faHourglassHalf,
    faChartLine, faTrophy, faTag, faComment, faArrowUp, faArrowDown,
    faUserPlus, faBookOpen, faShoppingCart
} from "@fortawesome/free-solid-svg-icons";
import { statisticsService } from "../../api/statistics.service";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function Dashboard({ isAuthenticated }) {
    const [stats, setStats] = useState(null);
    const [revenueChart, setRevenueChart] = useState(null);
    const [topCourses, setTopCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState("month");

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, chartRes, coursesRes] = await Promise.all([
                    statisticsService.getDashboardStats(),
                    statisticsService.getRevenueChart(chartPeriod),
                    statisticsService.getTopCourses(5)
                ]);

                if (statsRes.success) setStats(statsRes.data);
                if (chartRes.success) setRevenueChart(chartRes.data);
                if (coursesRes.success) setTopCourses(coursesRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, chartPeriod]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center text-gray-500">Không thể tải dữ liệu thống kê</div>;
    }

    // Prepare chart data
    const revenueData = revenueChart?.labels?.map((label, index) => ({
        name: label,
        revenue: revenueChart.revenues[index] || 0
    })) || [];

    const paymentStatusData = [
        { name: 'Thành công', value: stats.successfulPayments || 0, color: '#10B981' },
        { name: 'Đang chờ', value: stats.pendingPayments || 0, color: '#F59E0B' },
        { name: 'Thất bại', value: stats.failedPayments || 0, color: '#EF4444' }
    ];

    const courseStatusData = [
        { name: 'Đã duyệt', value: stats.approvedCourses || 0, color: '#10B981' },
        { name: 'Chờ duyệt', value: stats.pendingCourses || 0, color: '#F59E0B' },
        { name: 'Từ chối', value: stats.rejectedCourses || 0, color: '#EF4444' }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">
                        Tổng quan hệ thống
                    </h1>
                    <p className="text-slate-600">Thống kê và phân tích toàn diện về hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={chartPeriod}
                        onChange={(e) => setChartPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="day">7 ngày qua</option>
                        <option value="week">8 tuần qua</option>
                        <option value="month">12 tháng qua</option>
                        <option value="year">5 năm qua</option>
                    </select>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faDollarSign} className="text-2xl" />
                        </div>
                        <FontAwesomeIcon icon={faChartLine} className="text-white/50" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="text-white/80 text-sm">Tổng doanh thu</div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faArrowUp} />
                        <span>Hôm nay: {formatCurrency(stats.revenueToday)}</span>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faUsers} className="text-2xl" />
                        </div>
                        <FontAwesomeIcon icon={faUserPlus} className="text-white/50" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatNumber(stats.totalUsers)}</div>
                    <div className="text-white/80 text-sm">Tổng người dùng</div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faArrowUp} />
                        <span>Tháng này: +{formatNumber(stats.newUsersThisMonth)}</span>
                    </div>
                </div>

                {/* Total Courses */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faBook} className="text-2xl" />
                        </div>
                        <FontAwesomeIcon icon={faBookOpen} className="text-white/50" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatNumber(stats.totalCourses)}</div>
                    <div className="text-white/80 text-sm">Tổng khóa học</div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <FontAwesomeIcon icon={faArrowUp} />
                        <span>Tháng này: +{formatNumber(stats.newCoursesThisMonth)}</span>
                    </div>
                </div>

                {/* Total Enrollments */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-2xl" />
                        </div>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-white/50" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatNumber(stats.totalEnrollments)}</div>
                    <div className="text-white/80 text-sm">Tổng lượt ghi danh</div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faCreditCard} className="text-green-600 text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalPayments)}</div>
                            <div className="text-gray-600 text-sm">Tổng giao dịch</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faTag} className="text-orange-600 text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.activePromotions)}</div>
                            <div className="text-gray-600 text-sm">Khuyến mãi đang hoạt động</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faComment} className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalComments)}</div>
                            <div className="text-gray-600 text-sm">Tổng bình luận</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faHourglassHalf} className="text-red-600 text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingCourses)}</div>
                            <div className="text-gray-600 text-sm">Khóa học chờ duyệt</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Biểu đồ doanh thu</h3>
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} name="Doanh thu" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Chưa có dữ liệu
                        </div>
                    )}
                </div>

                {/* Payment Status Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Trạng thái thanh toán</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Breakdown & Top Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Phân tích doanh thu</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
                                <span className="font-medium text-gray-700">Hôm nay</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">{formatCurrency(stats.revenueToday)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDollarSign} className="text-blue-600" />
                                <span className="font-medium text-gray-700">Tuần này</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{formatCurrency(stats.revenueThisWeek)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDollarSign} className="text-purple-600" />
                                <span className="font-medium text-gray-700">Tháng này</span>
                            </div>
                            <span className="text-xl font-bold text-purple-600">{formatCurrency(stats.revenueThisMonth)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDollarSign} className="text-orange-600" />
                                <span className="font-medium text-gray-700">Năm nay</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">{formatCurrency(stats.revenueThisYear)}</span>
                        </div>
                    </div>
                </div>

                {/* Top Courses */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Top khóa học phổ biến</h3>
                        <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                    </div>
                    <div className="space-y-3">
                        {topCourses.length > 0 ? (
                            topCourses.map((course, index) => (
                                <div key={course.courseId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 truncate">{course.courseName}</div>
                                        <div className="text-sm text-gray-600">{course.instructor}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-indigo-600">{formatNumber(course.enrollmentCount)}</div>
                                        <div className="text-xs text-gray-500">học viên</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">Chưa có dữ liệu</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động hôm nay</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Người dùng mới</span>
                            <span className="font-bold text-blue-600">{formatNumber(stats.newUsersToday)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Giao dịch mới</span>
                            <span className="font-bold text-green-600">{formatNumber(stats.newPaymentsToday)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động tuần này</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Người dùng mới</span>
                            <span className="font-bold text-blue-600">{formatNumber(stats.newUsersThisWeek)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Doanh thu</span>
                            <span className="font-bold text-green-600">{formatCurrency(stats.revenueThisWeek)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Trạng thái khóa học</h3>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={courseStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {courseStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

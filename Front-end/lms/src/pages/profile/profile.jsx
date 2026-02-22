import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import ImgUpload from "./ImgUpload";
import Performance from "./Performance";
import LearningPath from "./LearningPath";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGithub,
    faLinkedin
} from "@fortawesome/free-brands-svg-icons";
import {
    faUser,
    faEnvelope,
    faPhone,
    faVenus,
    faMars,
    faCalendar,
    faBriefcase,
    faMapMarkerAlt,
    faBookOpen,
    faEdit,
    faTrophy,
    faRoute,
    faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { profileService } from "../../api/profile.service";
import { paymentService } from "../../api/payment.service";
import { authService } from "../../api/auth.service";
import EditProfileModal from "./EditProfileModal";

function Profile() {
    const id = localStorage.getItem("id");
    const [searchParams, setSearchParams] = useSearchParams();
    const [userDetails, setUserDetails] = useState(null);
    const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "");
    const [loadingImage, setLoadingImage] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [revenueData, setRevenueData] = useState(null);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
    const [groupBy, setGroupBy] = useState("month");
    const [quickRange, setQuickRange] = useState("all");
    const [courseSearch, setCourseSearch] = useState("");
    const [courseSort, setCourseSort] = useState("revenue_desc");
    const isInstructor = authService.isInstructorAuthenticated();

    // Cập nhật activeTab khi query param thay đổi
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "revenue" && !isInstructor) {
            setActiveTab("overview");
            setSearchParams({});
            return;
        }
        if (tab === "performance" || tab === "learningPath" || tab === "revenue") {
            setActiveTab(tab);
        }
    }, [searchParams, isInstructor, setSearchParams]);

    useEffect(() => {
        async function fetchUserDetails() {
            try {
                const userRes = await profileService.getUserDetails(id);
                if (userRes.success) {
                    setUserDetails(userRes.data);
                }

                try {
                    const imgRes = await profileService.getProfileImage(id);
                    if (imgRes.success && imgRes.data) {
                        setProfileImage(imgRes.data);
                    }
                } catch (error) {
                    // Không log error cho profile image (404 là bình thường)
                }
            } finally {
                setLoadingImage(false);
            }
        }
        fetchUserDetails();
    }, [id]);

    useEffect(() => {
        const loadRevenue = async () => {
            if (!isInstructor || activeTab !== "revenue") return;
            setLoadingRevenue(true);
            const params = {
                fromDate: dateFilter.from || undefined,
                toDate: dateFilter.to || undefined,
                groupBy
            };
            const result = await paymentService.getInstructorRevenueDetail(params);
            if (result.success) {
                setRevenueData(result.data);
            }
            setLoadingRevenue(false);
        };
        loadRevenue();
    }, [isInstructor, activeTab, dateFilter, groupBy]);

    const formatMoney = (value) => {
        const num = Number(value || 0);
        return `${num.toLocaleString("vi-VN")} VNĐ`;
    };

    const formatDate = (value) => {
        if (!value) return "N/A";
        return new Date(value).toLocaleDateString("vi-VN");
    };
    const formatPeriodLabel = (value) => {
        if (!value) return "";
        if (value.length === 7) return value;
        return new Date(value).toLocaleDateString("vi-VN");
    };

    const applyQuickRange = (type) => {
        setQuickRange(type);
        const today = new Date();
        const to = today.toISOString().slice(0, 10);
        if (type === "today") {
            setDateFilter({ from: to, to });
            setGroupBy("day");
            return;
        }
        if (type === "7days") {
            const fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 6);
            setDateFilter({ from: fromDate.toISOString().slice(0, 10), to });
            setGroupBy("day");
            return;
        }
        if (type === "month") {
            const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
            setDateFilter({ from: fromDate.toISOString().slice(0, 10), to });
            setGroupBy("day");
            return;
        }
        if (type === "year") {
            const fromDate = new Date(today.getFullYear(), 0, 1);
            setDateFilter({ from: fromDate.toISOString().slice(0, 10), to });
            setGroupBy("month");
            return;
        }
        setDateFilter({ from: "", to: "" });
        setGroupBy("month");
    };

    const groupLabel = groupBy === "day" ? "Ngày" : "Tháng";
    const rangeLabel = (() => {
        if (!dateFilter.from && !dateFilter.to) return "Tất cả thời gian";
        if (dateFilter.from && dateFilter.to) return `${formatDate(dateFilter.from)} → ${formatDate(dateFilter.to)}`;
        if (dateFilter.from) return `Từ ${formatDate(dateFilter.from)}`;
        return `Đến ${formatDate(dateFilter.to)}`;
    })();

    const revenueSeries = revenueData?.revenueByMonth || [];
    const maxRevenue = Math.max(
        ...revenueSeries.map((item) => Number(item.revenue || 0)),
        1
    );

    const allCourses = revenueData?.courses || [];
    const normalizedSearch = courseSearch.trim().toLowerCase();
    const filteredCourses = allCourses.filter((course) =>
        (course.courseName || "").toLowerCase().includes(normalizedSearch)
    );
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (courseSort === "sold_desc") return Number(b.soldCount || 0) - Number(a.soldCount || 0);
        if (courseSort === "name_asc") return (a.courseName || "").localeCompare(b.courseName || "");
        if (courseSort === "last_sold") {
            return new Date(b.lastSoldAt || 0) - new Date(a.lastSoldAt || 0);
        }
        return Number(b.totalRevenue || 0) - Number(a.totalRevenue || 0);
    });
    const topCourses = [...allCourses]
        .sort((a, b) => Number(b.totalRevenue || 0) - Number(a.totalRevenue || 0))
        .slice(0, 5);
    const topRevenueMax = Math.max(
        ...topCourses.map((course) => Number(course.totalRevenue || 0)),
        1
    );

    const quickButtonClass = (type) =>
        `px-3 py-2 text-sm rounded-lg border transition-all ${
            quickRange === type
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
        }`;

    const updateUser = async (updatedData) => {
        try {
            const res = await profileService.updateUser(id, updatedData);

            if (res.success) {
                setUserDetails(prevDetails => ({
                    ...prevDetails,
                    ...updatedData
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error("Error updating user:", err);
            return false;
        }
    };

    const handleEditProfile = () => {
        setIsEditModalVisible(true);
    };

    const handleModalClose = () => {
        setIsEditModalVisible(false);
    };

    const handleProfileUpdate = async (updatedData) => {
        const success = await updateUser(updatedData);
        return success;
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const res = await profileService.uploadProfileImage(id, file);
        if (res.success) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    const getGenderIcon = (gender) => {
        if (gender?.toLowerCase() === 'female') return faVenus;
        if (gender?.toLowerCase() === 'male') return faMars;
        return faUser;
    };

    if (!userDetails && !loadingImage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
                <Navbar page="profile" />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
            <Navbar page="profile" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">


                    {/* Profile Info */}
                    <div className="relative px-8 pb-8">
                        {/* Profile Picture */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-end mb-6">
                            <div className="relative z-10">
                                <ImgUpload
                                    onChange={handleImageChange}
                                    src={loadingImage ? null : profileImage}
                                    isLoading={loadingImage}
                                />
                            </div>

                            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                                            {userDetails?.username || "User"}
                                        </h2>
                                        <p className="text-gray-600 text-lg">{userDetails?.profession || "Learner"}</p>
                                        {userDetails?.location && (<div className="flex items-center text-gray-500 mt-1">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-sm" />
                                            {userDetails?.location}
                                        </div>)}
                                    </div>

                                    <button
                                        onClick={handleEditProfile}
                                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                        Chỉnh sửa hồ sơ
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {(userDetails?.linkedin_url || userDetails?.github_url) && (
                            <div className="flex gap-4 mb-6">
                                {userDetails?.linkedin_url && (
                                    <a
                                        href={userDetails.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faLinkedin} />
                                        LinkedIn
                                    </a>
                                )}
                                {userDetails?.github_url && (
                                    <a
                                        href={userDetails.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faGithub} />
                                        GitHub
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => {
                                    setActiveTab("overview");
                                    setSearchParams({});
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "overview"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-800"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                Tổng quan
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("performance");
                                    setSearchParams({ tab: "performance" });
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "performance"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-800"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faTrophy} />
                                Thành tích
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("learningPath");
                                    setSearchParams({ tab: "learningPath" });
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "learningPath"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-800"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faRoute} />
                                Lộ trình học tập
                            </button>
                            {isInstructor && (
                                <button
                                    onClick={() => {
                                        setActiveTab("revenue");
                                        setSearchParams({ tab: "revenue" });
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "revenue"
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-800"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faChartLine} />
                                    Doanh thu
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {activeTab === "overview" ? (
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="text-indigo-600" />
                                Thông tin cá nhân
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard
                                    icon={faEnvelope}
                                    label="Email"
                                    value={userDetails?.email}
                                    iconColor="text-red-500"
                                />
                                <InfoCard
                                    icon={faPhone}
                                    label="Số điện thoại"
                                    value={userDetails?.mobileNumber}
                                    iconColor="text-green-500"
                                />
                                <InfoCard
                                    icon={getGenderIcon(userDetails?.gender)}
                                    label="Giới tính"
                                    value={userDetails?.gender}
                                    iconColor="text-purple-500"
                                />
                                <InfoCard
                                    icon={faCalendar}
                                    label="Ngày sinh"
                                    value={userDetails?.dob}
                                    iconColor="text-blue-500"
                                />
                                <InfoCard
                                    icon={faBriefcase}
                                    label="Nghề nghiệp"
                                    value={userDetails?.profession}
                                    iconColor="text-orange-500"
                                />
                                <InfoCard
                                    icon={faBookOpen}
                                    label="Khóa đang học"
                                    value={userDetails?.learningCourses?.length || 0}
                                    iconColor="text-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                ) : activeTab === "performance" ? (
                    <Performance />
                ) : activeTab === "revenue" ? (
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartLine} className="text-indigo-600" />
                                Doanh thu khóa học
                            </h3>
                            <div className="bg-white/70 rounded-2xl p-4 border border-gray-100 mb-6 shadow-sm">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Từ ngày</label>
                                        <input
                                            type="date"
                                            value={dateFilter.from}
                                            onChange={(e) => {
                                                setDateFilter(prev => ({ ...prev, from: e.target.value }));
                                                setQuickRange("custom");
                                            }}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Đến ngày</label>
                                        <input
                                            type="date"
                                            value={dateFilter.to}
                                            onChange={(e) => {
                                                setDateFilter(prev => ({ ...prev, to: e.target.value }));
                                                setQuickRange("custom");
                                            }}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Nhóm theo</label>
                                        <select
                                            value={groupBy}
                                            onChange={(e) => {
                                                setGroupBy(e.target.value);
                                                setQuickRange("custom");
                                            }}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        >
                                            <option value="day">Ngày</option>
                                            <option value="month">Tháng</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => applyQuickRange("today")}
                                            className={quickButtonClass("today")}
                                        >
                                            Hôm nay
                                        </button>
                                        <button
                                            onClick={() => applyQuickRange("7days")}
                                            className={quickButtonClass("7days")}
                                        >
                                            7 ngày
                                        </button>
                                        <button
                                            onClick={() => applyQuickRange("month")}
                                            className={quickButtonClass("month")}
                                        >
                                            Tháng này
                                        </button>
                                        <button
                                            onClick={() => applyQuickRange("year")}
                                            className={quickButtonClass("year")}
                                        >
                                            Năm nay
                                        </button>
                                        <button
                                            onClick={() => applyQuickRange("all")}
                                            className={quickButtonClass("all")}
                                        >
                                            Tất cả
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                                        Khoảng: {rangeLabel}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                        Nhóm: {groupLabel}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                        Dữ liệu chỉ tính giao dịch đã hoàn tất
                                    </span>
                                </div>
                            </div>
                            {loadingRevenue ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : revenueData ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <RevenueStatCard
                                            icon={faChartLine}
                                            label="Tổng doanh thu"
                                            value={formatMoney(revenueData.totalRevenue)}
                                            accent="emerald"
                                        />
                                        <RevenueStatCard
                                            icon={faBookOpen}
                                            label="Khóa học đã bán"
                                            value={revenueData.totalCoursesSold || 0}
                                            accent="indigo"
                                        />
                                        <RevenueStatCard
                                            icon={faBriefcase}
                                            label="Số giao dịch"
                                            value={revenueData.totalPayments || 0}
                                            accent="amber"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-800">
                                                    Doanh thu theo {groupLabel.toLowerCase()}
                                                </h4>
                                                <span className="text-xs text-gray-500">
                                                    Cao nhất: {formatMoney(maxRevenue)}
                                                </span>
                                            </div>
                                            {revenueSeries.length === 0 ? (
                                                <div className="text-sm text-gray-500">Chưa có dữ liệu theo kỳ.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {revenueSeries.map((item) => {
                                                        const percent = Math.round(((item.revenue || 0) / maxRevenue) * 100);
                                                        return (
                                                            <div key={item.month} className="flex items-center gap-3">
                                                                <div className="w-28 text-sm text-gray-600">
                                                                    {formatPeriodLabel(item.month)}
                                                                </div>
                                                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }}></div>
                                                                </div>
                                                                <div className="w-32 text-right text-sm text-gray-700">
                                                                    {formatMoney(item.revenue)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-800">Top khóa bán chạy</h4>
                                                <span className="text-xs text-gray-500">Top 5 theo doanh thu</span>
                                            </div>
                                            {topCourses.length === 0 ? (
                                                <div className="text-sm text-gray-500">Chưa có dữ liệu khóa học.</div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {topCourses.map((course, index) => {
                                                        const percent = Math.round(((course.totalRevenue || 0) / topRevenueMax) * 100);
                                                        return (
                                                            <div key={course.courseId} className="flex items-center gap-3">
                                                                <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="text-sm text-gray-800">{course.courseName}</div>
                                                                        <div className="text-sm font-semibold text-indigo-600">
                                                                            {formatMoney(course.totalRevenue)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                            <h4 className="font-semibold text-gray-800">Khóa học đã bán</h4>
                                            <div className="text-xs text-gray-500">
                                                Hiển thị {sortedCourses.length}/{allCourses.length} khóa học
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <input
                                                type="text"
                                                value={courseSearch}
                                                onChange={(e) => setCourseSearch(e.target.value)}
                                                placeholder="Tìm theo tên khóa học..."
                                                className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                            <select
                                                value={courseSort}
                                                onChange={(e) => setCourseSort(e.target.value)}
                                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                            >
                                                <option value="revenue_desc">Doanh thu cao nhất</option>
                                                <option value="sold_desc">Bán nhiều nhất</option>
                                                <option value="last_sold">Bán gần đây</option>
                                                <option value="name_asc">Tên A-Z</option>
                                            </select>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-gray-600 border-b">
                                                        <th className="py-2 pr-4">Khóa học</th>
                                                        <th className="py-2 pr-4">Giá</th>
                                                        <th className="py-2 pr-4">Đã bán</th>
                                                        <th className="py-2 pr-4">Doanh thu</th>
                                                        <th className="py-2 pr-4">Bán gần nhất</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedCourses.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="py-6 text-center text-gray-500">
                                                                Không có khóa học phù hợp bộ lọc.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        sortedCourses.map((course) => (
                                                            <tr key={course.courseId} className="border-b last:border-b-0 hover:bg-gray-50">
                                                                <td className="py-2 pr-4 text-gray-800">{course.courseName}</td>
                                                                <td className="py-2 pr-4 text-gray-600">{formatMoney(course.price)}</td>
                                                                <td className="py-2 pr-4 text-gray-600">{course.soldCount}</td>
                                                                <td className="py-2 pr-4 text-gray-800 font-medium">{formatMoney(course.totalRevenue)}</td>
                                                                <td className="py-2 pr-4 text-gray-600">
                                                                    {formatDate(course.lastSoldAt)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    Chưa có dữ liệu doanh thu.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <LearningPath />
                )}
            </div>

            <EditProfileModal
                visible={isEditModalVisible}
                onCancel={handleModalClose}
                userDetails={userDetails}
                onUpdate={handleProfileUpdate}
            />
        </div>
    );
}

function InfoCard({ icon, label, value, iconColor = "text-gray-400" }) {
    return (
        <div className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100">
            <div className="flex items-start gap-3">
                <div className={`mt-1 ${iconColor}`}>
                    <FontAwesomeIcon icon={icon} className="text-lg" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">{label}</h4>
                    <p className="text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {value || "Chưa cập nhật"}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RevenueStatCard({ icon, label, value, accent = "indigo" }) {
    const accentMap = {
        indigo: {
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            bg: "from-white to-indigo-50"
        },
        emerald: {
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            bg: "from-white to-emerald-50"
        },
        amber: {
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            bg: "from-white to-amber-50"
        }
    };
    const styles = accentMap[accent] || accentMap.indigo;

    return (
        <div className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${styles.bg} p-4 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs text-gray-500 mb-2">{label}</div>
                    <div className="text-lg font-semibold text-gray-900">{value}</div>
                </div>
                <div className={`h-10 w-10 rounded-xl ${styles.iconBg} ${styles.iconColor} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={icon} className="text-lg" />
                </div>
            </div>
        </div>
    );
}

export default Profile;

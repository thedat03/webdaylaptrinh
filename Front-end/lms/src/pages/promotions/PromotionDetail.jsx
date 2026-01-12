import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faCalendarAlt, faPercent, faClock, faCheckCircle, faArrowLeft, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { promotionService } from "../../api/promotion.service";
import { message } from "antd";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";

function PromotionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPromotion = async () => {
            setLoading(true);
            try {
                const result = await promotionService.getPromotionById(id);
                if (result.success && result.data) {
                    setPromotion(result.data);
                } else {
                    message.error("Không tìm thấy khuyến mãi");
                    navigate("/home");
                }
            } catch (error) {
                console.error("Error loading promotion:", error);
                message.error("Lỗi khi tải thông tin khuyến mãi");
                navigate("/home");
            } finally {
                setLoading(false);
            }
        };
        loadPromotion();
    }, [id, navigate]);

    const getTimeRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return "Đã kết thúc";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
        if (hours > 0) return `Còn ${hours} giờ ${minutes} phút`;
        return `Còn ${minutes} phút`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-medium text-lg">Đang tải thông tin khuyến mãi...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!promotion) {
        return null;
    }

    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    const now = new Date();
    const isActive = now >= startDate && now <= endDate;
    const isUpcoming = now < startDate;
    const isEnded = now > endDate;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back button */}
                <button
                    onClick={() => navigate("/home")}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Quay lại trang chủ</span>
                </button>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-200">
                    {/* Image Header */}
                    {promotion.image_url && (
                        <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-orange-100 via-red-100 to-pink-100">
                            <img
                                src={promotion.image_url?.startsWith("http") || promotion.image_url?.startsWith("/api/")
                                    ? promotion.image_url
                                    : `/api/files/${promotion.image_url}`}
                                alt={promotion.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                            {/* Discount Badge */}
                            <div className="absolute top-6 right-6">
                                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-2xl transform rotate-[-12deg]">
                                    <span className="text-3xl font-bold">-{promotion.discount_percent}%</span>
                                    <span className="text-xs">OFF</span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-6 left-6">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${isActive
                                        ? "bg-green-500 text-white"
                                        : isUpcoming
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-500 text-white"
                                    }`}>
                                    {isActive ? (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                            Đang diễn ra
                                        </>
                                    ) : isUpcoming ? (
                                        <>
                                            <FontAwesomeIcon icon={faClock} className="mr-2" />
                                            Sắp diễn ra
                                        </>
                                    ) : (
                                        "Đã kết thúc"
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {promotion.title}
                        </h1>

                        {promotion.description && (
                            <div className="prose prose-lg max-w-none mb-8">
                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                                    {promotion.description}
                                </p>
                            </div>
                        )}

                        {/* Promo Code Section */}
                        {promotion.code && (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-indigo-200">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <FontAwesomeIcon icon={faTag} className="text-indigo-600 text-2xl" />
                                            <span className="text-sm font-medium text-indigo-800">Mã khuyến mãi của bạn:</span>
                                        </div>
                                        <div className="text-3xl font-bold text-indigo-900 font-mono">
                                            {promotion.code}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(promotion.code);
                                            message.success("Đã sao chép mã khuyến mãi!");
                                        }}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                                    >
                                        Sao chép mã
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <FontAwesomeIcon icon={faPercent} className="text-orange-500 text-xl" />
                                    <span className="font-semibold text-gray-700">Giảm giá</span>
                                </div>
                                <div className="text-3xl font-bold text-orange-600">
                                    {promotion.discount_percent}%
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-red-500 text-xl" />
                                    <span className="font-semibold text-gray-700">Thời gian</span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Bắt đầu:</span>{" "}
                                        {startDate.toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </div>
                                    <div>
                                        <span className="font-medium">Kết thúc:</span>{" "}
                                        {endDate.toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time Remaining */}
                        {isActive && (
                            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-6 mb-8 border-2 border-orange-200">
                                <div className="flex items-center gap-3 text-orange-800 font-bold text-lg">
                                    <FontAwesomeIcon icon={faClock} className="text-2xl" />
                                    <span>{getTimeRemaining(promotion.end_date)}</span>
                                </div>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate("/courses")}
                                className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                            >
                                <FontAwesomeIcon icon={faShoppingCart} />
                                Xem khóa học ngay
                            </button>
                            <button
                                onClick={() => navigate("/cart")}
                                className="flex-1 py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-3"
                            >
                                Đi đến giỏ hàng
                            </button>
                        </div>

                        {/* How to use */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cách sử dụng mã khuyến mãi</h3>
                            <ol className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</span>
                                    <span>Thêm các khóa học bạn muốn mua vào giỏ hàng</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">2</span>
                                    <span>Vào trang giỏ hàng và nhập mã khuyến mãi: <strong className="font-mono text-indigo-600">{promotion.code || "MÃ_KHUYẾN_MÃI"}</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">3</span>
                                    <span>Nhấn "Áp dụng" để xem số tiền được giảm</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">4</span>
                                    <span>Tiến hành thanh toán và tận hưởng khóa học với giá ưu đãi!</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default PromotionDetail;


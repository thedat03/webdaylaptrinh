import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartService } from "../../api/cart.service";

const statusConfig = {
    PAID: {
        title: "Thanh toán thành công!",
        subtitle: "Bạn đã được mở khoá toàn bộ nội dung học.",
        tone: "success",
    },
    FAILED: {
        title: "Thanh toán không thành công",
        subtitle: "Vui lòng thử lại hoặc chọn phương thức khác.",
        tone: "error",
    },
};

export default function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const statusParam = params.get("status");
    const responseCode = params.get("code");
    const txnRef = params.get("txnRef");
    const gatewayMessage = params.get("message");

    const pendingCourseId = localStorage.getItem("pendingCourseId");
    const pendingCourseName = localStorage.getItem("pendingCourseName");

    const resolvedStatus = statusParam || (responseCode === "00" ? "PAID" : "FAILED");
    const hasResult = statusParam || responseCode || txnRef;
    const config = statusConfig[resolvedStatus] || statusConfig.FAILED;

    useEffect(() => {
        if (hasResult) {
            localStorage.removeItem("pendingCourseId");
            localStorage.removeItem("pendingCourseName");

            // Clear cart if payment was successful and it was a cart payment
            if (resolvedStatus === "PAID") {
                const pendingCartCourseIds = localStorage.getItem("pendingCartCourseIds");
                if (pendingCartCourseIds) {
                    const userId = localStorage.getItem("id");
                    if (userId) {
                        // Clear cart after successful payment
                        cartService.clearCart(userId).then(() => {
                            // Update cart count in navbar
                            window.dispatchEvent(new Event('cartUpdated'));
                        });
                    }
                    localStorage.removeItem("pendingCartItems");
                    localStorage.removeItem("pendingCartCourseIds");
                }
            } else {
                // Remove pending cart data if payment failed
                localStorage.removeItem("pendingCartItems");
                localStorage.removeItem("pendingCartCourseIds");
            }
        }
    }, [hasResult, resolvedStatus]);

    const handleBackToCourse = () => {
        if (pendingCourseId) {
            navigate(`/courses/${pendingCourseId}`);
        } else {
            navigate("/courses");
        }
    };

    const handleGoHome = () => {
        navigate("/home");
    };

    if (!hasResult) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white max-w-md w-full shadow-lg rounded-2xl p-8 text-center space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy kết quả</h1>
                    <p className="text-gray-500">Vui lòng thực hiện thanh toán từ trang khoá học.</p>
                    <button
                        onClick={() => navigate("/courses")}
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                        Quay lại danh sách khóa học
                    </button>
                </div>
            </div>
        );
    }

    const isSuccess = resolvedStatus === "PAID";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-10 text-center space-y-6 border border-gray-100">
                <div className="flex flex-col items-center space-y-4">
                    <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${isSuccess ? "bg-emerald-50" : "bg-red-50"
                            }`}
                    >
                        <span className={`text-4xl ${isSuccess ? "text-emerald-500" : "text-red-500"}`}>
                            {isSuccess ? "🎉" : "⚠️"}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
                    <p className="text-gray-600 text-base">{gatewayMessage || config.subtitle}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3 border border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Trạng thái</span>
                        <span className={`font-semibold ${isSuccess ? "text-emerald-600" : "text-red-500"}`}>
                            {isSuccess ? "Thành công" : "Thất bại"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Mã phản hồi</span>
                        <span className="font-semibold text-gray-800">{responseCode || "Không có"}</span>
                    </div>
                    {txnRef && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Mã giao dịch</span>
                            <span className="font-semibold text-gray-800">{txnRef}</span>
                        </div>
                    )}
                    {pendingCourseName && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Khoá học</span>
                            <span className="font-semibold text-gray-800">{pendingCourseName}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {isSuccess && (
                        <button
                            onClick={handleBackToCourse}
                            className="flex-1 px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                        >
                            Vào khoá học
                        </button>
                    )}
                    <button
                        onClick={handleGoHome}
                        className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { cartService } from "../../api/cart.service";
import { paymentService } from "../../api/payment.service";
import { authService } from "../../api/auth.service";
import { promotionService } from "../../api/promotion.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faShoppingCart, faCreditCard, faTag, faCheckCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

function Cart() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("id");
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState("");

    useEffect(() => {
        if (!userId) {
            message.info("Vui lòng đăng nhập để xem giỏ hàng");
            navigate("/login");
            return;
        }

        if (!authService.isUserAuthenticated()) {
            message.info("Chỉ người dùng mới có thể sử dụng giỏ hàng");
            navigate("/home");
            return;
        }

        loadCartItems();
    }, [userId, navigate]);

    const loadCartItems = async () => {
        setLoading(true);
        try {
            const result = await cartService.getCartItems(userId);
            if (result.success) {
                setCartItems(result.data || []);
            } else {
                message.error(result.error || "Không thể tải giỏ hàng");
            }
        } catch (error) {
            console.error("Error loading cart:", error);
            message.error("Lỗi khi tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (courseId) => {
        try {
            const result = await cartService.removeFromCart(userId, courseId);
            if (result.success) {
                message.success("Đã xóa khỏi giỏ hàng");
                loadCartItems();
                // Update cart count in navbar
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                message.error(result.error || "Không thể xóa");
            }
        } catch (error) {
            console.error("Error removing item:", error);
            message.error("Lỗi khi xóa");
        }
    };

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoError("Vui lòng nhập mã khuyến mãi");
            return;
        }

        setPromoLoading(true);
        setPromoError("");
        try {
            const result = await promotionService.getPromotionByCode(promoCode.trim().toUpperCase());
            if (result.success && result.data) {
                const promotion = result.data;
                const now = new Date();
                const startDate = new Date(promotion.start_date);
                const endDate = new Date(promotion.end_date);

                if (now < startDate) {
                    setPromoError("Mã khuyến mãi chưa có hiệu lực");
                } else if (now > endDate) {
                    setPromoError("Mã khuyến mãi đã hết hạn");
                } else if (!promotion.is_active) {
                    setPromoError("Mã khuyến mãi không còn hiệu lực");
                } else {
                    setAppliedPromotion(promotion);
                    message.success(`Áp dụng mã giảm giá ${promotion.discount_percent}% thành công!`);
                }
            } else {
                setPromoError("Mã khuyến mãi không hợp lệ");
            }
        } catch (error) {
            console.error("Error applying promo code:", error);
            setPromoError("Không thể kiểm tra mã khuyến mãi");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromoCode = () => {
        setPromoCode("");
        setAppliedPromotion(null);
        setPromoError("");
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            message.info("Giỏ hàng trống");
            return;
        }

        setPaymentLoading(true);
        try {
            const courseIds = cartItems.map(item => item.courseId);
            // Store cart items in localStorage before redirecting
            localStorage.setItem("pendingCartItems", JSON.stringify(cartItems));
            localStorage.setItem("pendingCartCourseIds", JSON.stringify(courseIds));
            if (appliedPromotion) {
                localStorage.setItem("appliedPromotionCode", appliedPromotion.code);
            }

            const result = await cartService.createCartPayment(userId, courseIds, null, null, appliedPromotion?.code);

            if (result.success && result.data?.paymentUrl) {
                // Don't clear cart here - wait for payment success
                // The cart will be cleared after successful payment in PaymentResult or backend callback
                window.location.href = result.data.paymentUrl;
            } else {
                // Remove pending cart data if payment creation failed
                localStorage.removeItem("pendingCartItems");
                localStorage.removeItem("pendingCartCourseIds");
                localStorage.removeItem("appliedPromotionCode");
                message.error(result.error || "Không thể khởi tạo thanh toán");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            localStorage.removeItem("pendingCartItems");
            localStorage.removeItem("pendingCartCourseIds");
            localStorage.removeItem("appliedPromotionCode");
            message.error("Lỗi khi thanh toán");
        } finally {
            setPaymentLoading(false);
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const discountAmount = appliedPromotion
        ? (totalAmount * appliedPromotion.discount_percent) / 100
        : 0;
    const finalAmount = totalAmount - discountAmount;

    const getImageSrc = (item) => {
        // Support both pLink (camelCase) and p_link (snake_case) from backend
        const pLink = item.pLink || item.p_link || "";
        if (!pLink) return "";
        if (pLink.startsWith("http") || pLink.startsWith("/api/")) return pLink;
        return `/api/files/${pLink}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Giỏ hàng của tôi</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-500 mb-6">Bạn chưa có khóa học nào trong giỏ hàng</p>
                        <button
                            onClick={() => navigate("/courses")}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Khám phá khóa học
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const imageSrc = getImageSrc(item);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl shadow-sm p-6 flex gap-4 hover:shadow-md transition"
                                    >
                                        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={item.courseName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/128x128/4F46E5/FFFFFF?text=Course";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                                    <span className="text-4xl">📚</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {item.courseName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {item.description || "Khóa học chất lượng cao"}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-orange-600">
                                                    {item.price ? `${Number(item.price).toLocaleString()}đ` : "Miễn phí"}
                                                </span>
                                                <button
                                                    onClick={() => handleRemove(item.courseId)}
                                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

                                {/* Promo Code Section */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    {!appliedPromotion ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mã khuyến mãi
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => {
                                                        setPromoCode(e.target.value.toUpperCase());
                                                        setPromoError("");
                                                    }}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                                                    placeholder="Nhập mã"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <button
                                                    onClick={handleApplyPromoCode}
                                                    disabled={promoLoading || !promoCode.trim()}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                                >
                                                    {promoLoading ? "..." : "Áp dụng"}
                                                </button>
                                            </div>
                                            {promoError && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                    {promoError}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        Mã: {appliedPromotion.code}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleRemovePromoCode}
                                                    className="text-gray-500 hover:text-red-600 transition"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                Giảm {appliedPromotion.discount_percent}% - {appliedPromotion.title}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Số khóa học:</span>
                                        <span className="font-semibold">{cartItems.length}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tổng tiền:</span>
                                        <span className="font-semibold">
                                            {totalAmount.toLocaleString()}đ
                                        </span>
                                    </div>
                                    {appliedPromotion && (
                                        <>
                                            <div className="flex justify-between text-orange-600">
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faTag} className="text-sm" />
                                                    Giảm giá ({appliedPromotion.discount_percent}%):
                                                </span>
                                                <span className="font-semibold">
                                                    -{discountAmount.toLocaleString()}đ
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-200">
                                                <div className="flex justify-between">
                                                    <span className="text-lg font-bold text-gray-900">Thành tiền:</span>
                                                    <span className="text-2xl font-bold text-orange-600">
                                                        {finalAmount.toLocaleString()}đ
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {!appliedPromotion && (
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <span className="text-lg font-bold text-gray-900">Thành tiền:</span>
                                            <span className="text-2xl font-bold text-orange-600">
                                                {totalAmount.toLocaleString()}đ
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={paymentLoading || cartItems.length === 0}
                                    className={`w-full py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2 ${paymentLoading || cartItems.length === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                        }`}
                                >
                                    {paymentLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCreditCard} />
                                            Thanh toán
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate("/courses")}
                                    className="w-full mt-3 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Cart;


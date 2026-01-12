import React, { useEffect, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faCheckCircle, faClock, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { paymentService } from "../../api/payment.service";

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            const userId = localStorage.getItem("id");
            try {
                // Giả sử có API để lấy lịch sử thanh toán
                // const result = await paymentService.getPaymentHistory(userId);
                // if (result.success) {
                //     setPayments(result.data);
                // }
                setPayments([]);
            } catch (error) {
                console.error("Error fetching payment history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
                <Navbar page="payment-history" />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
            <Navbar page="payment-history" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faCreditCard} />
                            Lịch sử thanh toán
                        </h2>
                    </div>

                    {payments.length > 0 ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {payments.map((payment, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{payment.courseName || "Khóa học"}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatDate(payment.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    {formatCurrency(payment.amount || 0)}
                                                </p>
                                                {payment.status === "SUCCESS" ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                        Thành công
                                                    </span>
                                                ) : payment.status === "PENDING" ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                        Đang xử lý
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                                                        Thất bại
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                <FontAwesomeIcon icon={faCreditCard} className="h-full w-full" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử thanh toán</h3>
                            <p className="text-gray-500">
                                Bạn chưa thực hiện giao dịch thanh toán nào.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;


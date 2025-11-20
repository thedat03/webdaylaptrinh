import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedinIn, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faEnvelope, faLocationDot } from "@fortawesome/free-solid-svg-icons";

function Footer() {
    return (
        <footer className="bg-gradient-to-b from-indigo-50 via-sky-50 to-white text-gray-700 py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Brand + description */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold">L</div>
                        <span className="text-xl text-gray-900 font-extrabold">LearnIT</span>
                    </div>
                    <p className="text-sm leading-6 mb-4">
                        LearnIT là nền tảng tương tác trực tuyến hỗ trợ người dùng học tập, thực hành và đánh giá kỹ năng lập trình một cách nhanh chóng và chính xác.
                    </p>
                    <div className="flex items-center gap-3">
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 transition"><FontAwesomeIcon icon={faFacebookF} /></a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-rose-300 text-rose-500 transition"><FontAwesomeIcon icon={faInstagram} /></a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-blue-300 text-blue-600 transition"><FontAwesomeIcon icon={faLinkedinIn} /></a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-red-300 text-red-600 transition"><FontAwesomeIcon icon={faYoutube} /></a>
                    </div>
                </div>

                {/* Customer care */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chăm sóc khách hàng</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-indigo-700 cursor-pointer">Hướng dẫn thanh toán</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Điều kiện giao dịch chung</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Quy trình sử dụng dịch vụ</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Chính sách bảo hành</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Chính sách hoàn trả hàng</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Chính sách bảo mật</li>
                    </ul>
                </div>

                {/* Features */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-indigo-700 cursor-pointer">Học tập</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Luyện tập</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Thi đấu</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Thử thách</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Xếp hạng</li>
                        <li className="hover:text-indigo-700 cursor-pointer">Chia sẻ</li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-indigo-500" />
                            <span>Tòa FPT, Phạm Văn Bạch, Cầu Giấy, Hà Nội</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faPhone} className="mt-1 text-indigo-500" />
                            <span>1900 633 331 (8h30–21h thứ 2–6, 8h30–11h30 thứ 7)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faEnvelope} className="mt-1 text-indigo-500" />
                            <a href="mailto:support@learnit.io" className="hover:text-indigo-700">support@learnit.io</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bản quyền */}
            <div className="border-t border-gray-200 mt-10 pt-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <p className="text-sm">© {new Date().getFullYear()} LearnIT. Mọi quyền được bảo lưu.</p>
                    <div className="text-xs text-gray-500 mt-2 md:mt-0">Được tạo với ❤️ dành cho người học</div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
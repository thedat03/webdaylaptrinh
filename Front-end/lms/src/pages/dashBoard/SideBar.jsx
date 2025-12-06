import img1 from "../../assets/images/user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

function SideBar({ current, onSelect, onLogout }) {
    const menuItems = [
        { key: "dashboard", label: "Tổng quan", icon: "bx bxs-dashboard" },
        { key: "user", label: "Người dùng", icon: "bx bxs-group" },
        { key: "courses", label: "Duyệt khóa học", icon: "bx bxs-book" },
        { key: "categories", label: "Danh mục", icon: "bx bxs-category" },
        { key: "banners", label: "Banner", icon: "bx bxs-image" },
        { key: "news", label: "Tin tức", icon: "bx bxs-news" },
        { key: "comments", label: "Bình luận", icon: "bx bxs-comment-dots" },
        { key: "payments", label: "Thanh toán", icon: "bx bxs-credit-card" },
    ];

    return (
        <div className="bg-white shadow-lg flex flex-col p-4 px-6 w-64 min-h-screen flex-shrink-0">
            <div className="px-3 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                    <img
                        src={img1}
                        alt="Admin Logo"
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={() => onSelect("dashboard")}
                    />
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <span
                            className="text-lg font-semibold text-blue-900 cursor-pointer"
                            onClick={() => onSelect("dashboard")}
                        >
                            LearnIT
                        </span>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                                title="Đăng xuất"
                            >
                                <FontAwesomeIcon icon={faRightFromBracket} className="text-xl" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <ul className="flex flex-col mt-6">
                {menuItems.map((item) => (
                    <li key={item.key}>
                        <button
                            onClick={() => onSelect(item.key)}
                            className={`w-full flex items-center gap-3 p-3 transition-colors rounded-lg mx-3 mb-3 text-left ${current === item.key
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <i className={`${item.icon} text-lg`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SideBar;
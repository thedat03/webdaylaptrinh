import React from "react";
import Navbar from "../../Components/common/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const Friends = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
            <Navbar page="friends" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <FontAwesomeIcon icon={faUsers} className="h-full w-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn bè</h2>
                    <p className="text-gray-600">
                        Tính năng này đang được phát triển. Sẽ sớm có mặt!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Friends;


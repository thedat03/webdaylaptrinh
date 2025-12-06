import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUser, faChartLine, faBookOpen, faCheckCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { message, Table, Card, Select, Avatar } from "antd";
import { learningService } from "../../api/learning.service";
import { courseService } from "../../api/course.service";
import { authService } from "../../api/auth.service";
import { useNavigate, useSearchParams } from "react-router-dom";

const { Option } = Select;

function TeacherStudents() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("courseId");

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        completedLessons: 0,
        averageProgress: 0
    });

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (courseId) {
            const course = courses.find(c => c.course_id === courseId);
            if (course) {
                setSelectedCourse(course);
                loadStudents(courseId);
            }
        } else if (courses.length > 0) {
            setSelectedCourse(courses[0]);
            loadStudents(courses[0].course_id);
        }
    }, [courseId, courses]);

    const loadCourses = async () => {
        try {
            // Get current instructor info (chỉ dùng id để phân quyền)
            const currentUser = authService.getCurrentUser();
            const currentUserId = currentUser?.id || "";

            const result = await courseService.getAllCourses();
            if (result.success && result.data) {
                let allCourses = Array.isArray(result.data) ? result.data : (result.data.data || []);

                // Filter courses strictly by linked user id (không fallback theo tên để tránh trùng tên)
                const myCourses = allCourses.filter(course => {
                    // Ưu tiên: nếu course có quan hệ user, dùng user.id để so khớp
                    if (course.user && course.user.id && currentUserId && String(course.user.id) === String(currentUserId)) {
                        return true;
                    }

                    // Dự phòng: nếu backend trả về userId / ownerId...
                    if (course.userId && currentUserId && String(course.userId) === String(currentUserId)) {
                        return true;
                    }
                    if (course.ownerId && currentUserId && String(course.ownerId) === String(currentUserId)) {
                        return true;
                    }
                    return false;
                });

                setCourses(myCourses);
            }
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    };

    const loadStudents = async (courseId) => {
        if (!courseId) return;
        setLoading(true);
        try {
            const result = await learningService.getStudentsByCourse(courseId);
            if (result.success && result.data) {
                const studentsData = result.data.map(learning => ({
                    id: learning.id,
                    userId: learning.user?.id,
                    username: learning.user?.username || "N/A",
                    email: learning.user?.email || "N/A",
                    profileImage: learning.user?.profileImage,
                    enrolledDate: learning.id ? new Date(learning.id.timestamp ? learning.id.timestamp() : Date.now()).toLocaleDateString() : "N/A"
                }));
                setStudents(studentsData);
                setStats({
                    totalStudents: studentsData.length,
                    activeStudents: studentsData.length, // Có thể tính dựa trên progress
                    completedLessons: 0, // Cần API progress
                    averageProgress: 0 // Cần API progress
                });
            } else {
                message.error(result.error || "Tải danh sách học viên thất bại");
            }
        } catch (error) {
            console.error("Error loading students:", error);
            message.error("Tải danh sách học viên thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (courseId) => {
        const course = courses.find(c => c.course_id === courseId);
        setSelectedCourse(course);
        loadStudents(courseId);
        navigate(`/teacher-home?tab=students&courseId=${courseId}`);
    };

    const columns = [
        {
            title: "Ảnh đại diện",
            dataIndex: "profileImage",
            key: "avatar",
            width: 80,
            render: (profileImage) => (
                <Avatar
                    size={40}
                    src={profileImage ? `data:image/jpeg;base64,${profileImage}` : null}
                    icon={<FontAwesomeIcon icon={faUser} />}
                />
            ),
        },
        {
            title: "Tên học viên",
            dataIndex: "username",
            key: "username",
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: "Ngày đăng ký",
            dataIndex: "enrolledDate",
            key: "enrolledDate",
        },
        {
            title: "Tiến độ",
            key: "progress",
            render: () => (
                <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <span className="text-sm text-gray-600">0%</span>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: () => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đang học
                </span>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/teacher-home?tab=courses")}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
                        <p className="text-gray-600 mt-1">Xem danh sách và theo dõi tiến độ học viên</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <Card className="shadow-lg">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Chọn khóa học:</label>
                        <Select
                            value={selectedCourse?.course_id}
                            onChange={handleCourseChange}
                            style={{ width: 300 }}
                            placeholder="Chọn khóa học"
                        >
                            {courses.map(course => (
                                <Option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </Card>
            </div>

            {selectedCourse && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.totalStudents}</div>
                                    <div className="text-sm text-gray-600">Tổng học viên</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.activeStudents}</div>
                                    <div className="text-sm text-gray-600">Đang học</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="shadow-lg border-l-4 border-l-purple-500">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBookOpen} className="text-purple-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.completedLessons}</div>
                                    <div className="text-sm text-gray-600">Bài đã hoàn thành</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="shadow-lg border-l-4 border-l-orange-500">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faChartLine} className="text-orange-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-gray-900">{stats.averageProgress}%</div>
                                    <div className="text-sm text-gray-600">Tiến độ TB</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Danh sách học viên - {selectedCourse.course_name}
                            </h2>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={students}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Tổng ${total} học viên`,
                            }}
                        />
                    </Card>
                </>
            )}

            {!selectedCourse && courses.length === 0 && (
                <Card className="shadow-lg text-center py-12">
                    <FontAwesomeIcon icon={faBookOpen} className="text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg mb-4">Bạn chưa có khóa học nào</p>
                    <button
                        onClick={() => navigate("/teacher-home?tab=courses")}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200"
                    >
                        Tạo khóa học đầu tiên
                    </button>
                </Card>
            )}
        </div>
    );
}

export default TeacherStudents;


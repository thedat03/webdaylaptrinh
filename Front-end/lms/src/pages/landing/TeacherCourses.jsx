import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faBookOpen, faClipboardList, faSitemap, faCirclePlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { message } from "antd";
import { adminService } from "../../api/admin.service";
import { courseService } from "../../api/course.service";
import { authService } from "../../api/auth.service";
import CourseModal from "../dashBoard/CourseModal";
import DeleteModal from "../dashBoard/DeleteModal";
import ModuleModal from "../dashBoard/ModuleModal";
import LessonModal from "../dashBoard/LessonModal";
import { useNavigate } from "react-router-dom";

function TeacherCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [courseModal, setCourseModal] = useState({ isOpen: false, mode: "add", courseId: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [modulesByCourse, setModulesByCourse] = useState({});
    const [lessonsByModule, setLessonsByModule] = useState({});
    const [expandedModules, setExpandedModules] = useState({});
    const [moduleModal, setModuleModal] = useState({ isOpen: false, mode: "add", courseId: null, module: null });
    const [lessonModal, setLessonModal] = useState({ isOpen: false, mode: "add", module: null, lesson: null });
    const [deleteModal2, setDeleteModal2] = useState({ isOpen: false, item: null, itemType: "", onDelete: null, title: "", description: "" });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Get current instructor info (chỉ dùng id để phân quyền)
            const currentUser = authService.getCurrentUser();
            const currentUserId = currentUser?.id || "";

            // Lấy tất cả khóa học (bao gồm cả PENDING) để giáo viên thấy cả khóa đang chờ duyệt
            const result = await adminService.getAllCourses(true);
            if (result.success && result.data) {
                let coursesData = result.data;
                if (typeof coursesData === 'string' && coursesData.trim().startsWith('[')) {
                    try {
                        coursesData = JSON.parse(coursesData);
                    } catch (e) {
                        message.error("Tải khóa học thất bại: Dữ liệu không hợp lệ");
                        setCourses([]);
                        return;
                    }
                }
                let allCourses = [];
                if (Array.isArray(coursesData)) {
                    allCourses = coursesData;
                } else if (coursesData && Array.isArray(coursesData.data)) {
                    allCourses = coursesData.data;
                } else if (coursesData && Array.isArray(coursesData.courses)) {
                    allCourses = coursesData.courses;
                }

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
            console.error("Error fetching courses:", error);
            message.error("Tải khóa học thất bại");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const openAddCourseModal = () => {
        setCourseModal({ isOpen: true, mode: "add", courseId: null });
    };

    const openEditCourseModal = (course) => {
        setCourseModal({ isOpen: true, mode: "edit", courseId: course.course_id });
    };

    const closeCourseModal = () => {
        setCourseModal({ isOpen: false, mode: "add", courseId: null });
    };

    const handleCourseSuccess = () => {
        fetchCourses();
    };

    const openDeleteModal = (course) => {
        setDeleteModal({ isOpen: true, course });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, course: null });
    };

    const handleDeleteCourse = async (course) => {
        return await adminService.deleteCourse(course.course_id);
    };

    const handleDeleteSuccess = () => {
        fetchCourses();
    };

    const toggleCurriculum = async (courseId) => {
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null);
            return;
        }
        setExpandedCourseId(courseId);
        if (!modulesByCourse[courseId]) {
            await loadModules(courseId);
        }
    };

    const loadModules = async (courseId) => {
        const res = await courseService.getModules(courseId);
        if (res.success) {
            setModulesByCourse((prev) => ({ ...prev, [courseId]: res.data }));
            const results = await Promise.all(res.data.map((m) => courseService.getLessons(m.module_id)));
            const map = {};
            res.data.forEach((m, idx) => { map[m.module_id] = results[idx].success ? results[idx].data : []; });
            setLessonsByModule((prev) => ({ ...prev, ...map }));
            if (res.data && res.data.length) {
                setExpandedModules((prev) => ({ ...prev, [res.data[0].module_id]: true }));
            }
        } else {
            message.error(res.error || "Tải chương thất bại");
        }
    };

    const openAddModule = (courseId) => setModuleModal({ isOpen: true, mode: "add", courseId, module: null });
    const openEditModule = (module) => setModuleModal({ isOpen: true, mode: "edit", courseId: expandedCourseId, module });
    const submitModule = async (data) => {
        if (moduleModal.mode === "add") {
            const res = await courseService.addModule(moduleModal.courseId, data);
            if (res.success) { message.success("Đã thêm chương"); setModuleModal({ ...moduleModal, isOpen: false }); loadModules(moduleModal.courseId); }
            else message.error(res.error || "Thêm chương thất bại");
        } else {
            const res = await courseService.updateModule(moduleModal.module.module_id, data);
            if (res.success) { message.success("Đã cập nhật chương"); setModuleModal({ ...moduleModal, isOpen: false }); loadModules(expandedCourseId); }
            else message.error(res.error || "Cập nhật chương thất bại");
        }
    };
    const openDeleteModule = (module) => setDeleteModal2({ isOpen: true, item: module, itemType: "Chương", title: "Xóa chương", description: "Bạn có chắc muốn xóa chương này:", onDelete: async (m) => await courseService.deleteModule(m.module_id) });

    const openAddLesson = (module) => setLessonModal({ isOpen: true, mode: "add", module, lesson: null });
    const openEditLesson = (lesson, module) => setLessonModal({ isOpen: true, mode: "edit", module, lesson });
    const submitLesson = async ({ moduleId, payload }) => {
        if (lessonModal.mode === "add") {
            const res = await courseService.addLesson(moduleId, payload);
            if (res.success) { message.success("Đã thêm bài học"); setLessonModal({ ...lessonModal, isOpen: false }); loadModules(expandedCourseId); }
            else message.error(res.error || "Thêm bài học thất bại");
        } else {
            const res = await courseService.updateLesson(lessonModal.lesson.lesson_id, payload);
            if (res.success) { message.success("Đã cập nhật bài học"); setLessonModal({ ...lessonModal, isOpen: false }); loadModules(expandedCourseId); }
            else message.error(res.error || "Cập nhật bài học thất bại");
        }
    };
    const openDeleteLesson = (lesson) => setDeleteModal2({ isOpen: true, item: lesson, itemType: "Bài học", title: "Xóa bài học", description: "Bạn có chắc muốn xóa bài học này:", onDelete: async (l) => await courseService.deleteLesson(l.lesson_id) });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý khóa học</h1>
                            <p className="text-gray-600">Tạo và quản lý các khóa học của bạn</p>
                        </div>
                        <button
                            onClick={openAddCourseModal}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-3 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-sm" />
                            Thêm khóa học
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách khóa học...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faBookOpen} className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có khóa học</h3>
                            <p className="text-gray-500 mb-8 max-w-md">
                                Hãy bắt đầu bằng cách tạo khóa học đầu tiên. Bạn có thể thêm nội dung, quản lý học viên và theo dõi tiến độ.
                            </p>
                            <button
                                onClick={openAddCourseModal}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 py-4 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Tạo khóa học đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {Array.isArray(courses) && courses.map((course) => (
                                <div key={course.course_id} className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
                                    <div className="p-6 flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 truncate">{course.course_name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {course.instructor && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600">Giảng viên:</span>
                                                        <span className="text-sm font-medium text-gray-900">{course.instructor}</span>
                                                    </div>
                                                )}
                                                {course.price && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600">Giá:</span>
                                                        <span className="text-lg font-bold text-green-600">${course.price}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-600">Học viên:</span>
                                                    <span className="text-sm font-medium text-gray-900">{course.students || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-6">
                                            <button
                                                onClick={() => navigate(`/teacher-home?tab=students&courseId=${course.course_id}`)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <FontAwesomeIcon icon={faUsers} className="text-sm" /> Học viên
                                            </button>
                                            <button
                                                onClick={() => navigate(`/addquestions/${course.course_id}`)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <FontAwesomeIcon icon={faClipboardList} className="text-sm" /> Đề thi
                                            </button>
                                            <button
                                                onClick={() => toggleCurriculum(course.course_id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <FontAwesomeIcon icon={faSitemap} className="text-sm" /> Giáo trình
                                            </button>
                                            <button
                                                onClick={() => openEditCourseModal(course)}
                                                className="p-2.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(course)}
                                                className="p-2.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {expandedCourseId === course.course_id && (
                                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold">Chương</h4>
                                                <button
                                                    onClick={() => openAddModule(course.course_id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                                                >
                                                    <FontAwesomeIcon icon={faCirclePlus} /> Thêm chương
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {(modulesByCourse[course.course_id] || []).map((m) => (
                                                    <div key={m.module_id} className="bg-white border rounded-lg">
                                                        <button
                                                            className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                                                            onClick={() => setExpandedModules((prev) => ({ ...prev, [m.module_id]: !prev[m.module_id] }))}
                                                        >
                                                            <div className="font-medium flex items-center gap-2">
                                                                <span className={`inline-block transition-transform ${expandedModules[m.module_id] ? "rotate-90" : ""}`}>▶</span>
                                                                <span>{m.position}. {m.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={(e) => { e.stopPropagation(); openAddLesson(m); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">Thêm bài học</button>
                                                                <button onClick={(e) => { e.stopPropagation(); openEditModule(m); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm">Sửa</button>
                                                                <button onClick={(e) => { e.stopPropagation(); openDeleteModule(m); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm">Xóa</button>
                                                            </div>
                                                        </button>
                                                        {expandedModules[m.module_id] && (
                                                            <ul className="divide-y">
                                                                {(lessonsByModule[m.module_id] || []).map((l) => (
                                                                    <li key={l.lesson_id} className="px-4 py-2 text-sm flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                                                                            <span>{l.title}</span>
                                                                            <span className="ml-2 text-[10px] uppercase text-gray-500">{l.type}</span>
                                                                            <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                                {l.durationMinutes ? `${l.durationMinutes}p` : "—"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button onClick={() => openEditLesson(l, m)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm">Sửa</button>
                                                                            <button onClick={() => openDeleteLesson(l)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm">Xóa</button>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CourseModal
                isOpen={courseModal.isOpen}
                onClose={closeCourseModal}
                onSuccess={handleCourseSuccess}
                courseId={courseModal.courseId}
                mode={courseModal.mode}
            />
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onSuccess={handleDeleteSuccess}
                onDelete={handleDeleteCourse}
                item={deleteModal.course}
                itemType="Khóa học"
                title="Xóa khóa học"
                description="Bạn có chắc muốn xóa khóa học này?"
                itemDisplayName={deleteModal.course?.course_name}
            />
            <ModuleModal
                isOpen={moduleModal.isOpen}
                mode={moduleModal.mode}
                initialData={moduleModal.module}
                onClose={() => setModuleModal({ ...moduleModal, isOpen: false })}
                onSubmit={submitModule}
            />
            <LessonModal
                isOpen={lessonModal.isOpen}
                mode={lessonModal.mode}
                initialData={lessonModal.lesson}
                modules={modulesByCourse[expandedCourseId] || []}
                defaultModuleId={lessonModal.module?.module_id}
                onClose={() => setLessonModal({ ...lessonModal, isOpen: false })}
                onSubmit={submitLesson}
            />
            <DeleteModal
                isOpen={deleteModal2.isOpen}
                onClose={() => setDeleteModal2({ ...deleteModal2, isOpen: false })}
                onSuccess={() => loadModules(expandedCourseId)}
                onDelete={deleteModal2.onDelete}
                item={deleteModal2.item}
                itemType={deleteModal2.itemType}
                title={deleteModal2.title}
                description={deleteModal2.description}
                itemDisplayName={deleteModal2.itemType === "Module" ? deleteModal2.item?.title : deleteModal2.item?.title}
            />
        </div>
    );
}

export default TeacherCourses;


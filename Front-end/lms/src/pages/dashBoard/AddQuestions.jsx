import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Typography,
    message,
    Row,
    Col,
    Table,
    Modal,
    Popconfirm,
    Switch,
    Tag,
    Space,
    Tabs,
    Descriptions,
    Badge
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faQuestionCircle,
    faArrowLeft,
    faPlus,
    faEdit,
    faTrash,
    faList,
    faPaperPlane,
    faUsers,
    faEye,
    faSave
} from '@fortawesome/free-solid-svg-icons';
import { examService } from '../../api/exam.service';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function AddQuestion({ courseId: propCourseId, onBack: propOnBack }) {
    const { id } = useParams();
    const navigate = useNavigate();

    // Lấy courseId từ route params hoặc props
    const courseId = propCourseId || id;

    // Tạo hàm onBack mặc định nếu không có props
    const onBack = propOnBack || (() => navigate('/teacher-home?tab=courses'));
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [examForm] = Form.useForm();
    const [editExamForm] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [loadingExam, setLoadingExam] = useState(true);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isCreateExamModalVisible, setIsCreateExamModalVisible] = useState(false);
    const [isEditExamModalVisible, setIsEditExamModalVisible] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isSubmissionDetailVisible, setIsSubmissionDetailVisible] = useState(false);
    const [teacherFeedback, setTeacherFeedback] = useState('');
    const [savingFeedback, setSavingFeedback] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchExams();
        } else {
            message.error('Không tìm thấy ID khóa học');
            setLoadingExam(false);
        }
    }, [courseId]);

    const fetchExams = async () => {
        if (!courseId) {
            message.error('Không tìm thấy ID khóa học');
            return;
        }
        setLoadingExam(true);
        const result = await examService.getAllExams(courseId);
        if (result.success) {
            setExams(result.data || []);
            if (result.data && result.data.length > 0 && !selectedExam) {
                // Tự động chọn đề thi đầu tiên
                selectExam(result.data[0]);
            } else if (selectedExam) {
                // Cập nhật lại đề thi đã chọn
                const updated = result.data.find(e => e.id === selectedExam.id);
                if (updated) {
                    selectExam(updated);
                }
            }
        } else {
            setExams([]);
            setSelectedExam(null);
            setQuestions([]);
        }
        setLoadingExam(false);
    };

    const selectExam = async (exam) => {
        setSelectedExam(exam);
        setQuestions(exam.questions || []);
    };

    const handleSelectExam = (exam) => {
        selectExam(exam);
    };

    const handleCreateExam = async (values) => {
        if (!courseId) {
            message.error('Không tìm thấy ID khóa học');
            return;
        }
        setLoading(true);
        const payload = {
            title: values.title,
            description: values.description,
            published: false,
            maxAttempts: values.maxAttempts
        };
        const result = await examService.createExam(courseId, payload);
        setLoading(false);
        if (result.success) {
            message.success('Đã tạo đề thi. Thêm câu hỏi ngay!');
            setIsCreateExamModalVisible(false);
            examForm.resetFields();
            await fetchExams();
            if (result.data) {
                selectExam(result.data);
            }
        } else {
            message.error(result.error);
        }
    };

    const handlePublishToggle = async (checked, examId) => {
        if (!examId) return;
        const exam = exams.find(e => e.id === examId);
        if (!exam) return;
        const payload = {
            title: exam.title,
            description: exam.description,
            published: checked,
            maxAttempts: exam.maxAttempts
        };
        const result = await examService.updateExam(examId, payload);
        if (result.success) {
            message.success(checked ? 'Đã công bố đề thi' : 'Đã ẩn đề thi');
            await fetchExams();
        } else {
            message.error(result.error || 'Không thể cập nhật trạng thái');
        }
    };

    const handleSubmit = async (values) => {
        if (!selectedExam) {
            message.error('Hãy chọn đề thi trước');
            return;
        }
        setLoading(true);

        const payload = buildQuestionPayload(values);
        const result = await examService.addQuestion(selectedExam.id, payload);
        setLoading(false);

        if (result.success) {
            message.success('Đã thêm câu hỏi');
            form.resetFields();
            setIsAddModalVisible(false);
            await fetchExams();
        } else {
            message.error(result.error || 'Thêm câu hỏi thất bại');
        }
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        editForm.setFieldsValue({
            type: question.type || 'MCQ',
            prompt: question.prompt,
            option1: question.option1,
            option2: question.option2,
            option3: question.option3,
            option4: question.option4,
            answer: question.answer,
            languageId: question.languageId,
            starterCode: question.starterCode,
            testCases: question.testCases,
            maxScore: question.maxScore
        });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        if (!editingQuestion) return;
        setLoading(true);
        const payload = buildQuestionPayload(values);
        const result = await examService.updateQuestion(editingQuestion.id, payload);
        setLoading(false);
        if (result.success) {
            message.success('Đã cập nhật câu hỏi');
            setIsEditModalVisible(false);
            setEditingQuestion(null);
            await fetchExams();
        } else {
            message.error(result.error || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (questionId) => {
        const result = await examService.deleteQuestion(questionId);
        if (result.success) {
            message.success('Đã xóa câu hỏi');
            await fetchExams();
        } else {
            message.error(result.error || 'Xóa thất bại');
        }
    };

    const fetchSubmissions = async (examId) => {
        if (!examId) return;
        setLoadingSubmissions(true);
        const result = await examService.getSubmissions(examId);
        if (result.success) {
            const sorted = [...(result.data || [])].sort((a, b) => {
                const nameA = (a.user?.username || a.user?.email || '').toLowerCase();
                const nameB = (b.user?.username || b.user?.email || '').toLowerCase();
                return nameA.localeCompare(nameB, 'vi');
            });
            setSubmissions(sorted);
        } else {
            message.error(result.error || 'Không thể tải danh sách bài làm');
            setSubmissions([]);
        }
        setLoadingSubmissions(false);
    };

    const handleViewSubmission = async (submissionId) => {
        if (!selectedExam) return;
        const result = await examService.getSubmissionDetail(selectedExam.id, submissionId);
        if (result.success) {
            setSelectedSubmission(result.data);
            setTeacherFeedback(result.data?.teacherFeedback || '');
            setIsSubmissionDetailVisible(true);
        } else {
            message.error(result.error || 'Không thể tải chi tiết bài làm');
        }
    };

    const handleEditExam = (exam) => {
        setEditingExam(exam);
        editExamForm.setFieldsValue({
            title: exam.title,
            description: exam.description,
            maxAttempts: exam.maxAttempts
        });
        setIsEditExamModalVisible(true);
    };

    const handleUpdateExam = async (values) => {
        if (!editingExam) return;
        setLoading(true);
        const payload = {
            title: values.title,
            description: values.description,
            published: editingExam.published,
            maxAttempts: values.maxAttempts
        };
        const result = await examService.updateExam(editingExam.id, payload);
        setLoading(false);
        if (result.success) {
            message.success('Đã cập nhật đề thi');
            setIsEditExamModalVisible(false);
            setEditingExam(null);
            editExamForm.resetFields();
            await fetchExams();
        } else {
            message.error(result.error || 'Không thể cập nhật đề thi');
        }
    };

    const handleDeleteExam = async (examId) => {
        const result = await examService.deleteExam(examId);
        if (result.success) {
            message.success('Đã xóa đề thi');
            if (selectedExam?.id === examId) {
                setSelectedExam(null);
                setQuestions([]);
            }
            await fetchExams();
        } else {
            message.error(result.error || 'Không thể xóa đề thi');
        }
    };

    const handleSaveTeacherFeedback = async () => {
        if (!selectedExam || !selectedSubmission) return;
        setSavingFeedback(true);
        const result = await examService.updateSubmissionFeedback(
            selectedExam.id,
            selectedSubmission.id,
            { feedback: teacherFeedback }
        );
        setSavingFeedback(false);
        if (result.success) {
            message.success('Đã gửi feedback cho học viên');
            setSelectedSubmission(result.data);
        } else {
            message.error(result.error || 'Không thể gửi feedback');
        }
    };

    const submissionColumns = [
        {
            title: 'Học viên',
            dataIndex: ['user', 'username'],
            key: 'username',
            render: (text, record) => record.user?.username || record.user?.email || 'N/A'
        },
        {
            title: 'Điểm',
            key: 'score',
            render: (_, record) => (
                <Text strong>
                    {record.totalScore || 0} / {record.maxScore || 0}
                </Text>
            )
        },
        {
            title: 'Tỷ lệ',
            key: 'percent',
            render: (_, record) => {
                const percent = record.maxScore > 0
                    ? Math.round((record.totalScore / record.maxScore) * 100)
                    : 0;
                return (
                    <Tag color={percent >= 60 ? 'green' : percent >= 40 ? 'orange' : 'red'}>
                        {percent}%
                    </Tag>
                );
            }
        },
        {
            title: 'Trạng thái',
            key: 'passed',
            render: (_, record) => (
                <Badge
                    status={record.passed ? 'success' : 'error'}
                    text={record.passed ? 'Đạt' : 'Chưa đạt'}
                />
            )
        },
        {
            title: 'Thời gian nộp',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (text) => text ? new Date(text).toLocaleString('vi-VN') : 'N/A'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<FontAwesomeIcon icon={faEye} />}
                    onClick={() => handleViewSubmission(record.id)}
                >
                    Xem chi tiết
                </Button>
            )
        }
    ];

    const buildQuestionPayload = (values) => {
        const base = {
            type: values.type,
            prompt: values.prompt,
            maxScore: values.maxScore || 1
        };
        if (values.type === 'MCQ') {
            return {
                ...base,
                option1: values.option1,
                option2: values.option2,
                option3: values.option3,
                option4: values.option4,
                answer: values.answer
            };
        }
        return {
            ...base,
            languageId: Number(values.languageId),
            starterCode: values.starterCode,
            testCases: values.testCases
        };
    };

    const columns = useMemo(() => [
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type) => (
                <Tag color={type === 'CODE' ? 'purple' : 'blue'}>
                    {type === 'CODE' ? 'Code' : 'Trắc nghiệm'}
                </Tag>
            ),
        },
        {
            title: 'Câu hỏi / Đề bài',
            dataIndex: 'prompt',
            key: 'prompt',
            render: (text) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
        },
        {
            title: 'Điểm',
            dataIndex: 'maxScore',
            key: 'maxScore',
            width: 100,
            render: (v) => <Text strong>{v || 1}</Text>,
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="text" size="small" onClick={() => handleEdit(record)}>
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Popconfirm
                        title="Xóa câu hỏi"
                        description="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" size="small" danger>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ], []);

    const QuestionForm = ({ form, onFinish, loading, submitText }) => {
        const type = Form.useWatch('type', form) || 'MCQ';
        return (
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                className="space-y-4"
                initialValues={{ type: 'MCQ', maxScore: 1 }}
            >
                <Form.Item
                    label="Loại câu hỏi"
                    name="type"
                    rules={[{ required: true, message: 'Chọn loại câu hỏi' }]}
                >
                    <Select>
                        <Option value="MCQ">Trắc nghiệm</Option>
                        <Option value="CODE">Code (tự luận chấm test)</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Nội dung"
                    name="prompt"
                    rules={[
                        { required: true, message: 'Nhập nội dung' },
                        { min: 5, message: 'Tối thiểu 5 ký tự' }
                    ]}
                >
                    <TextArea rows={3} showCount maxLength={1000} />
                </Form.Item>

                <Form.Item
                    label="Điểm tối đa"
                    name="maxScore"
                    rules={[{ required: true, message: 'Nhập điểm' }]}
                >
                    <Input type="number" min={0.1} step="0.1" />
                </Form.Item>

                {type === 'MCQ' ? (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Option A" name="option1" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Option B" name="option2" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Option C" name="option3" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Option D" name="option4" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label="Đáp án đúng" name="answer" rules={[{ required: true }]}>
                            <Select>
                                <Option value={form.getFieldValue('option1')}>Option A</Option>
                                <Option value={form.getFieldValue('option2')}>Option B</Option>
                                <Option value={form.getFieldValue('option3')}>Option C</Option>
                                <Option value={form.getFieldValue('option4')}>Option D</Option>
                            </Select>
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item label="Ngôn ngữ Judge0 ID" name="languageId" rules={[{ required: true }]}>
                            <Input type="number" placeholder="VD: 63 cho JavaScript" />
                        </Form.Item>
                        <Form.Item label="Starter code (optional)" name="starterCode">
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            label="Test cases (JSON mảng CodeTestCase)"
                            name="testCases"
                            rules={[{ required: true, message: 'Nhập test cases' }]}
                        >
                            <TextArea rows={6} placeholder='[{"stdin":"1 2","expectedOutput":"3"}]' />
                        </Form.Item>
                    </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        onClick={() => {
                            form.resetFields();
                            setIsAddModalVisible(false);
                            setIsEditModalVisible(false);
                            setEditingQuestion(null);
                        }}
                    >
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} className="bg-blue-600">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {submitText}
                    </Button>
                </div>
            </Form>
        );
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <Card className="mb-4 rounded-2xl shadow-sm border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button type="text" onClick={onBack} className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Quay lại
                        </Button>
                        <Title level={3} className="!mb-0">
                            <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-blue-600" />
                            Quản lý đề thi
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => setIsCreateExamModalVisible(true)}
                    >
                        Tạo đề thi mới
                    </Button>
                </div>
            </Card>

            {/* Danh sách đề thi */}
            <Card className="mb-4 rounded-2xl shadow-sm border-gray-100">
                <Title level={4} className="mb-4">Danh sách đề thi ({exams.length})</Title>
                {loadingExam ? (
                    <div className="text-center py-8">Đang tải...</div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Chưa có đề thi nào. Hãy tạo đề thi mới!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedExam?.id === exam.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => handleSelectExam(exam)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Title level={5} className="!mb-0">{exam.title}</Title>
                                            <Tag color={exam.published ? 'green' : 'default'}>
                                                {exam.published ? 'Đã công bố' : 'Chưa công bố'}
                                            </Tag>
                                        </div>
                                        {exam.description && (
                                            <Text className="text-gray-600">{exam.description}</Text>
                                        )}
                                        <div className="mt-2 text-sm text-gray-500">
                                            {exam.questions?.length || 0} câu hỏi
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Space onClick={(e) => e.stopPropagation()}>
                                            <Button type="text" size="small" onClick={() => handleEditExam(exam)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Popconfirm
                                                title="Xóa đề thi"
                                                description="Bạn chắc chắn muốn xóa đề thi này?"
                                                onConfirm={() => handleDeleteExam(exam.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                            >
                                                <Button type="text" size="small" danger>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </Popconfirm>
                                            <span className="text-sm text-gray-600">Công bố:</span>
                                            <Switch
                                                checked={exam.published}
                                                onChange={(checked) => handlePublishToggle(checked, exam.id)}
                                            />
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {selectedExam && (
                <>
                    <Card className="rounded-2xl shadow-sm border-gray-100 mb-4">
                        <Tabs
                            activeKey={activeTab}
                            onChange={(key) => {
                                setActiveTab(key);
                                if (key === 'submissions') {
                                    fetchSubmissions(selectedExam.id);
                                }
                            }}
                            items={[
                                {
                                    key: 'questions',
                                    label: (
                                        <span>
                                            <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                                            Câu hỏi ({questions.length})
                                        </span>
                                    ),
                                    children: (
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <Title level={4} className="!mb-0">
                                                    Câu hỏi của đề thi: {selectedExam.title}
                                                </Title>
                                                <Button
                                                    type="primary"
                                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                                    onClick={() => setIsAddModalVisible(true)}
                                                >
                                                    Thêm câu hỏi
                                                </Button>
                                            </div>
                                            <Table
                                                columns={columns}
                                                dataSource={questions}
                                                rowKey="id"
                                                loading={loadingExam}
                                                pagination={{ pageSize: 10 }}
                                            />
                                        </>
                                    )
                                },
                                {
                                    key: 'submissions',
                                    label: (
                                        <span>
                                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                            Bài làm ({submissions.length})
                                        </span>
                                    ),
                                    children: (
                                        <>
                                            <div className="mb-3">
                                                <Title level={4} className="!mb-0">
                                                    Danh sách bài làm của đề thi: {selectedExam.title}
                                                </Title>
                                            </div>
                                            <Table
                                                columns={submissionColumns}
                                                dataSource={submissions}
                                                rowKey="id"
                                                loading={loadingSubmissions}
                                                pagination={{ pageSize: 10 }}
                                            />
                                        </>
                                    )
                                }
                            ]}
                        />
                    </Card>

                    <Modal
                        title="Thêm câu hỏi"
                        open={isAddModalVisible}
                        onCancel={() => {
                            setIsAddModalVisible(false);
                            form.resetFields();
                        }}
                        footer={null}
                        width={900}
                    >
                        <QuestionForm
                            form={form}
                            onFinish={handleSubmit}
                            loading={loading}
                            submitText="Thêm câu hỏi"
                        />
                    </Modal>

                    <Modal
                        title="Chỉnh sửa câu hỏi"
                        open={isEditModalVisible}
                        onCancel={() => {
                            setIsEditModalVisible(false);
                            setEditingQuestion(null);
                        }}
                        footer={null}
                        width={900}
                    >
                        <QuestionForm
                            form={editForm}
                            onFinish={handleEditSubmit}
                            loading={loading}
                            submitText="Lưu thay đổi"
                        />
                    </Modal>

                    <Modal
                        title="Tạo đề thi mới"
                        open={isCreateExamModalVisible}
                        onCancel={() => {
                            setIsCreateExamModalVisible(false);
                            examForm.resetFields();
                        }}
                        footer={null}
                        width={600}
                    >
                        <Form layout="vertical" form={examForm} onFinish={handleCreateExam}>
                            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                                <Input placeholder="Ví dụ: Kiểm tra giữa khóa" />
                            </Form.Item>
                            <Form.Item name="description" label="Mô tả">
                                <TextArea rows={3} />
                            </Form.Item>
                            <Form.Item
                                name="maxAttempts"
                                label="Số lần làm tối đa"
                                rules={[{ required: true, message: 'Nhập số lần làm tối đa' }]}
                            >
                                <InputNumber min={1} className="w-full" />
                            </Form.Item>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button onClick={() => {
                                    setIsCreateExamModalVisible(false);
                                    examForm.resetFields();
                                }}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<FontAwesomeIcon icon={faPaperPlane} />}>
                                    Tạo đề thi
                                </Button>
                            </div>
                        </Form>
                    </Modal>

                    <Modal
                        title="Chỉnh sửa đề thi"
                        open={isEditExamModalVisible}
                        onCancel={() => {
                            setIsEditExamModalVisible(false);
                            setEditingExam(null);
                            editExamForm.resetFields();
                        }}
                        footer={null}
                        width={600}
                    >
                        <Form layout="vertical" form={editExamForm} onFinish={handleUpdateExam}>
                            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                                <Input placeholder="Ví dụ: Kiểm tra giữa khóa" />
                            </Form.Item>
                            <Form.Item name="description" label="Mô tả">
                                <TextArea rows={3} />
                            </Form.Item>
                            <Form.Item
                                name="maxAttempts"
                                label="Số lần làm tối đa"
                                rules={[{ required: true, message: 'Nhập số lần làm tối đa' }]}
                            >
                                <InputNumber min={1} className="w-full" />
                            </Form.Item>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button onClick={() => {
                                    setIsEditExamModalVisible(false);
                                    setEditingExam(null);
                                    editExamForm.resetFields();
                                }}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<FontAwesomeIcon icon={faSave} />}>
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </Form>
                    </Modal>

                    {/* Modal chi tiết bài làm */}
                    <Modal
                        title="Chi tiết bài làm"
                        open={isSubmissionDetailVisible}
                        onCancel={() => {
                            setIsSubmissionDetailVisible(false);
                            setSelectedSubmission(null);
                        }}
                        footer={null}
                        width={900}
                    >
                        {selectedSubmission && (
                            <div className="space-y-4">
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="Học viên">
                                        {selectedSubmission.user?.username || selectedSubmission.user?.email || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm">
                                        <Text strong className="text-lg">
                                            {selectedSubmission.totalScore || 0} / {selectedSubmission.maxScore || 0}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tỷ lệ">
                                        {(() => {
                                            const percent = selectedSubmission.maxScore > 0
                                                ? Math.round((selectedSubmission.totalScore / selectedSubmission.maxScore) * 100)
                                                : 0;
                                            return (
                                                <Tag color={percent >= 60 ? 'green' : percent >= 40 ? 'orange' : 'red'}>
                                                    {percent}%
                                                </Tag>
                                            );
                                        })()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Badge
                                            status={selectedSubmission.passed ? 'success' : 'error'}
                                            text={selectedSubmission.passed ? 'Đạt' : 'Chưa đạt'}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thời gian nộp" span={2}>
                                        {selectedSubmission.submittedAt
                                            ? new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <Title level={5} className="!mb-2">Feedback của giáo viên</Title>
                                    <TextArea
                                        rows={4}
                                        value={teacherFeedback}
                                        onChange={(e) => setTeacherFeedback(e.target.value)}
                                        placeholder="Nhập nhận xét cho học viên (nếu muốn)"
                                    />
                                    <div className="flex justify-end mt-3">
                                        <Button
                                            type="primary"
                                            loading={savingFeedback}
                                            onClick={handleSaveTeacherFeedback}
                                        >
                                            Gửi feedback
                                        </Button>
                                    </div>
                                    {selectedSubmission.teacherFeedbackAt && (
                                        <Text className="text-xs text-gray-500 block mt-2">
                                            Đã gửi: {new Date(selectedSubmission.teacherFeedbackAt).toLocaleString('vi-VN')}
                                        </Text>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <Title level={5}>Chi tiết từng câu hỏi:</Title>
                                    <div className="space-y-4 mt-2">
                                        {selectedSubmission.answers?.map((answer, idx) => {
                                            const question = answer.question;
                                            return (
                                                <Card key={answer.id} size="small" className="border-l-4 border-l-blue-500">
                                                    <div className="mb-2">
                                                        <Text strong>Câu {idx + 1}: {question?.prompt}</Text>
                                                        <div className="mt-1">
                                                            <Tag color={question?.type === 'CODE' ? 'purple' : 'blue'}>
                                                                {question?.type === 'CODE' ? 'Code' : 'Trắc nghiệm'}
                                                            </Tag>
                                                            <Tag color={answer.passed ? 'green' : 'red'}>
                                                                {answer.passed ? 'Đúng' : 'Sai'}
                                                            </Tag>
                                                            <Text className="ml-2">
                                                                Điểm: {answer.score || 0} / {question?.maxScore || 1}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    {question?.type === 'MCQ' ? (
                                                        <div className="mt-2">
                                                            <Text className="text-gray-600">Đáp án học viên chọn: </Text>
                                                            <Text strong>{answer.selectedOption || 'Chưa chọn'}</Text>
                                                            <br />
                                                            <Text className="text-gray-600">Đáp án đúng: </Text>
                                                            <Text strong className="text-green-600">{question.answer}</Text>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <Text className="text-gray-600 block mb-1">Code học viên:</Text>
                                                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                                                {answer.codeAnswer || 'Chưa có code'}
                                                            </pre>
                                                            {answer.autoResult && (
                                                                <div className="mt-2">
                                                                    <Text className="text-gray-600 block mb-1">Kết quả chạy test:</Text>
                                                                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                                                        {JSON.stringify(JSON.parse(answer.autoResult), null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
}

export default AddQuestion;

import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
import AdminLogin from './pages/auth/admin-login';
import Register from './pages/auth/register'
import Course from './pages/course/course.jsx';
import Courses from './pages/course/Courses';
import CourseDetail from './pages/course/CourseDetail';
import Profile from './pages/profile/profile';
import Learnings from './pages/learning/learnings';
import HomeWrapper from './pages/landing/HomeWrapper';
import Home from './pages/landing/Home';
import TeacherHome from './pages/landing/TeacherHome';
import TeachingAssistantHome from './pages/landing/TeachingAssistantHome';
import TAComments from './pages/landing/TAComments';
import TAQuestions from './pages/landing/TAQuestions';
import TAProgress from './pages/landing/TAProgress';
import TAReminders from './pages/landing/TAReminders';
import TAStudentDetail from './pages/landing/TAStudentDetail';
import TAAssignments from './pages/dashBoard/TAAssignments';
import DCourses from './pages/dashBoard/DCourses';
import Assessment from './pages/assessment/Assessment';
import ErrorPage from './pages/error/ErrorPage';
import AddQuestions from './pages/dashBoard/AddQuestions';
import Performance from './pages/profile/Performance';
import Certificate from './pages/assessment/certificate';
import Forum from './pages/course/forum';
import AdminDashboard from './pages/dashBoard/AdminDashboard';
import LessonViewer from './pages/learning/LessonViewer';
import CodeExerciseViewer from './pages/learning/CodeExerciseViewer';
import PaymentResult from './pages/payment/PaymentResult';
import Chat from './pages/chat/Chat';
import Notifications from './pages/notifications/Notifications';
import Friends from './pages/profile/Friends';
import PaymentHistory from './pages/profile/PaymentHistory';
import Cart from './pages/cart/Cart';
import PromotionDetail from './pages/promotions/PromotionDetail';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/public-home" element={<Home />} />
          <Route path="/addquestions/:id" element={<AddQuestions />} />
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/login' element={<Login />} />
          <Route path='/admin-login' element={<AdminLogin />} />
          <Route path='/register' element={<Register />} />
          <Route path='/home' element={<HomeWrapper />} />
          <Route path='/teacher-home' element={<TeacherHome />} />
          <Route path='/teaching-assistant-home' element={<TeachingAssistantHome />} />
          <Route path='/ta-comments' element={<TAComments />} />
          <Route path='/ta-questions' element={<TAQuestions />} />
          <Route path='/ta-progress' element={<TAProgress />} />
          <Route path='/ta-reminders' element={<TAReminders />} />
          <Route path='/ta-student-detail' element={<TAStudentDetail />} />
          <Route path='/admin/ta-assignments' element={<TAAssignments />} />
          <Route path='/courses' element={<Courses />} />
          <Route path='/courses/:id' element={<CourseDetail />} />
          <Route path='/course/:id' element={<Course />} />
          <Route path='/discussion/:id' element={<Forum />} />
          <Route path='/certificate/:courseId' element={<Certificate />} />
          <Route path='/assessment/:id/:examId?' element={<Assessment />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/Learnings' element={<Learnings />} />
          <Route path='/lesson/:lessonId' element={<LessonViewer />} />
          <Route path='/code-exercise/:exerciseId' element={<CodeExerciseViewer />} />
          <Route path='/payment-result' element={<PaymentResult />} />
          <Route path='/Dcourses' element={<DCourses />} />
          <Route path='/Performance' element={<Performance />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/friends' element={<Friends />} />
          <Route path='/payment-history' element={<PaymentHistory />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/promotion/:id' element={<PromotionDetail />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
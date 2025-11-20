import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
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
import DCourses from './pages/dashBoard/DCourses';
import Assessment from './pages/assessment/Assessment';
import ErrorPage from './pages/error/ErrorPage';
import AddQuestions from './pages/dashBoard/AddQuestions';
import Performance from './pages/profile/Performance';
import Certificate from './pages/assessment/certificate';
import Forum from './pages/course/forum';
import AdminDashboard from './pages/dashBoard/AdminDashboard';
import LessonViewer from './pages/learning/LessonViewer';

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
          <Route path='/register' element={<Register />} />
          <Route path='/home' element={<HomeWrapper />} />
          <Route path='/teacher-home' element={<TeacherHome />} />
          <Route path='/teaching-assistant-home' element={<TeachingAssistantHome />} />
          <Route path='/courses' element={<Courses />} />
          <Route path='/courses/:id' element={<CourseDetail />} />
          <Route path='/course/:id' element={<Course />} />
          <Route path='/discussion/:id' element={<Forum />} />
          <Route path='/certificate/:courseId' element={<Certificate />} />
          <Route path='/assessment/:id' element={<Assessment />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/Learnings' element={<Learnings />} />
          <Route path='/lesson/:lessonId' element={<LessonViewer />} />
          <Route path='/Dcourses' element={<DCourses />} />
          <Route path='/Performance' element={<Performance />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
# 🚀 Online Programming Learning Platform

A full-stack web platform designed to help learners study programming through courses, coding practice, and progress tracking.

The system integrates an online coding environment, automatic code grading, and AI-powered feedback to enhance the programming learning experience.

# 📌 Introduction

Programming has become an essential skill in the modern digital world. However, many learners face difficulties when theory and practice are separated.

This project develops an online programming learning platform that connects the entire learning workflow, including:

Learning through video lectures

Practicing coding exercises

Automatic grading using test cases

Tracking learning progress

# 🛠 Tech Stack
Frontend

ReactJS

TailwindCSS

Axios

Backend

Spring Boot

Spring Security

JWT Authentication

RESTful API

Database

MySQL

External APIs

Judge0 API – code execution

Gemini API – AI feedback

# ✨ Features
## 👨‍🎓 Learner (Student)

Register and login

Browse programming courses

Watch lecture videos

Read learning materials

Take quizzes and exams

Practice coding exercises

Submit code and receive automatic grading

View AI-generated feedback

Track learning progress

## 👨‍🏫 Teacher

Create and manage programming courses

Organize course modules and lessons

Upload lecture videos and learning materials

Create quizzes and coding exercises

Define test cases for automatic grading

Submit courses for admin approval

## 🧑‍💻 Teaching Assistant

Monitor student learning progress

Answer student questions

Provide guidance and reminders

Support teachers in managing courses

## 👨‍💼 Admin

Manage users and roles

Approve or reject courses created by teachers

Assign teaching assistants to courses

Manage system operations

# 👥 User Roles
Role	Description
Learner	Participate in courses and practice programming
Teacher	Create and manage courses
Teaching Assistant	Support learners and monitor progress
Admin	Manage users, courses, and system operations
# 🏗 System Architecture

The system follows a Client–Server architecture using RESTful APIs.

Frontend (ReactJS)
        ↓
REST API
        ↓
Backend (Spring Boot)
        ↓
Database (MySQL)
        ↓
External Services (Judge0 API / Gemini API)
# ⚙️ Installation
## Clone repository
```bash git clone https://github.com/thedat03/webdaylaptrinh.git ```

## Backend runs at
```bash http://localhost:8080 ```

## Frontend

cd frontend

npm install

npm start
## Frontend runs at

```bash http://localhost:5173 ```

# 🗄 Database

Import the SQL file into MySQL.

Main tables include:

Users

Courses

Modules

Lessons

Quizzes

Coding Exercises

Learning Progress

Payments

# 🔐 Security

The system implements:

JWT Authentication

Role-Based Access Control (RBAC)

Secure API endpoints

Input validation

# 📈 Future Improvements

Possible future improvements:

Mobile application support

AI-based course recommendations

Real-time collaborative coding

More programming language support

Performance optimization

# 👨‍💻 Author

Nguyễn Thế Đạt
Hanoi University of Science and Technology

# ⭐ Project Purpose

This project was developed as a graduation thesis to explore the design and implementation of an online programming learning platform.

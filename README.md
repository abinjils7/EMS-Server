### Setup
npm install
cp .env.example .env
npm run dev


# Employee Management System - Backend

The backend of the **Employee Management System (EMS)** is a RESTful API built with **Node.js**, **Express.js**, and **MongoDB**. It provides secure authentication, role-based authorization, employee management, attendance tracking, task management, leave management, and calendar event APIs.

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT Authentication
- Role-Based Access Control (Admin, Manager, Employee)
- Secure Password Hashing (bcrypt)
- Login & Logout
- Forgot Password
- Reset Password
- Change Password
- Protected Routes

---

### 👥 Employee Management

Admin can:

- Add Employee
- Update Employee
- Delete Employee
- View Employee Details
- Search Employees
- Filter Employees
- Manage Departments

Employee Information:

- Employee ID
- Name
- Email
- Phone
- Department
- Designation
- Joining Date
- Salary (Optional)
- Profile Picture
- Status (Active/Inactive)

---

### 🕒 Attendance Management

Employees can:

- Check In
- Check Out

Attendance stores:

- Date
- Check-In Time
- Check-Out Time
- Total Working Hours
- Late Arrival
- Overtime
- Attendance Status

Attendance Status:

- Present
- Absent
- Leave
- Half Day
- Holiday

---

### 📋 Daily Task Management

Employees can:

- Submit Daily Work
- Update Task Status

Task Details:

- Date
- Task Title
- Description
- Hours Worked
- Status

Task Status:

- Pending
- In Progress
- Completed

Managers can:

- Review Tasks
- Comment on Tasks
- Approve Tasks

---

### 🌴 Leave Management

Employees can:

- Apply for Leave
- View Leave Status

Managers/Admin can:

- Approve Leave
- Reject Leave

---

### 📅 Calendar Events

- Create Company Events
- Update Events
- Delete Events
- View Events

---

### 📊 Reports

- Monthly Attendance Report
- Employee Attendance History
- Task Reports
- Leave Reports
- Dashboard Statistics

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Cookie Parser
- Express Validator
- Multer (Profile Image Upload)
- Cloudinary (Optional)
- Nodemailer (Password Reset)
- dotenv
- CORS

---

## 📁 Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validations/
├── uploads/
├── app.js
└── server.js
```

---

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/your-username/employee-management-system.git
```

### Navigate to backend

```bash
cd employee-management-system/backend
```

### Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email

EMAIL_PASS=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

---

## ▶️ Running the Server

Development

```bash
npm run dev
```

Production

```bash
npm start
```

Server runs on:

```
http://localhost:5000
```

---

## 🔗 API Modules

- Authentication
- Users
- Employees
- Attendance
- Tasks
- Leave Management
- Departments
- Calendar Events
- Reports

---

## 🔒 Security

- JWT Authentication
- Password Hashing with bcrypt
- Protected Routes
- Role-Based Authorization
- Input Validation
- CORS Configuration
- Environment Variables
- HTTP-only Cookies (Optional)

---

## 📈 Future Enhancements

- Payroll Management
- Real-time Notifications (Socket.IO)
- Email Notifications
- Audit Logs
- Performance Analytics
- Multi-Company Support
- API Documentation (Swagger)
- Docker Deployment
- CI/CD Pipeline

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Developed with ❤️ by **ABIN JILS**


### Endpoints
POST  /api/auth/register
POST  /api/auth/login
POST  /api/auth/logout
POST  /api/auth/refresh
POST  /api/auth/forgot-password
POST  /api/auth/reset-password/:token
PATCH /api/auth/change-password   (Authorization: Bearer <token>)

GET   /api/health

### Department Endpoints (all require Bearer token)
GET    /api/departments          — All roles
GET    /api/departments/:id      — All roles
POST   /api/departments          — Admin only
PATCH  /api/departments/:id      — Admin only
DELETE /api/departments/:id      — Admin only

### Employee Endpoints (all require Bearer token)
GET    /api/employees            — Admin, Manager
GET    /api/employees/me         — All roles (own profile)
GET    /api/employees/:id        — Admin, Manager
POST   /api/employees            — Admin only
PATCH  /api/employees/:id        — Admin only
DELETE /api/employees/:id        — Admin only

### Attendance Endpoints (all require Bearer token)

POST   /api/attendance/checkin         — Employee: check in for today
PATCH  /api/attendance/checkout        — Employee: check out for today
GET    /api/attendance/me              — Employee: all own attendance records
GET    /api/attendance/me/monthly      — Employee: monthly summary (?month=6&year=2025)
GET    /api/attendance                 — Admin, Manager: all records (?date=YYYY-MM-DD&employeeId=x)
GET    /api/attendance/:id             — Admin, Manager: single record
POST   /api/attendance/holiday         — Admin: mark a date as holiday for all employees

### Task Endpoints (all require Bearer token)
POST   /api/tasks              — Employee: submit task
GET    /api/tasks/me           — Employee: own tasks
GET    /api/tasks              — Admin, Manager (?employeeId=x&date=YYYY-MM-DD)
GET    /api/tasks/:id          — Admin, Manager
PATCH  /api/tasks/:id          — Employee/Admin/Manager: update task
PATCH  /api/tasks/:id/comment  — Admin, Manager: add comment
DELETE /api/tasks/:id          — Employee: delete own pending task

### Leave Endpoints (all require Bearer token)
POST   /api/leaves             — Employee: apply for leave
GET    /api/leaves/me          — Employee: own leave requests
GET    /api/leaves             — Admin, Manager (?status=Pending&employeeId=x)
GET    /api/leaves/:id         — Admin, Manager
PATCH  /api/leaves/:id/approve — Admin, Manager
PATCH  /api/leaves/:id/reject  — Admin, Manager: { rejectedReason }
PATCH  /api/leaves/:id/cancel  — Employee: cancel own pending leave

### Dashboard Endpoints (all require Bearer token)
GET  /api/dashboard/admin    — Admin only
GET  /api/dashboard/manager  — Admin, Manager
GET  /api/dashboard/employee — All roles (own data)

### Event Endpoints (all require Bearer token)
GET    /api/events      — All roles
GET    /api/events/:id  — All roles
POST   /api/events      — Admin only: { title, description, date }
PATCH  /api/events/:id  — Admin only
DELETE /api/events/:id  — Admin only

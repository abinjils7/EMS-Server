### Setup
npm install
cp .env.example .env
npm run dev

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

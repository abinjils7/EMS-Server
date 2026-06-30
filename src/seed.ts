import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import { User } from './models/User.model.js'
import { Employee } from './models/Employee.model.js'
import { Department } from './models/Department.model.js'
import { Attendance } from './models/Attendance.model.js'
import { Task } from './models/Task.model.js'
import { Leave } from './models/Leave.model.js'
import { Event } from './models/Event.model.js'

const getToday = (): string => new Date().toISOString().slice(0, 10)

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...')
    await connectDB()
    console.log('Connected!')

    // Clear existing data
    console.log('Clearing existing collections...')
    await User.deleteMany({})
    await Employee.deleteMany({})
    await Department.deleteMany({})
    await Attendance.deleteMany({})
    await Task.deleteMany({})
    await Leave.deleteMany({})
    await Event.deleteMany({})
    console.log('Cleared successfully.')

    // 1. Create Departments
    console.log('Creating Departments...')
    const engineering = await Department.create({
      name: 'Engineering',
      description: 'Software development, testing, and system operations.',
    })
    const hr = await Department.create({
      name: 'Human Resources',
      description: 'Talent acquisition, employee welfare, and relations.',
    })
    const sales = await Department.create({
      name: 'Sales & Marketing',
      description: 'Customer outreach, promotions, and client acquisitions.',
    })
    console.log('Departments created.')

    // 2. Create Users (hashed automatically by pre('save') hook)
    console.log('Creating Users...')
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ems.com',
      password: 'password123',
      role: 'Admin',
      isActive: true,
    })

    const managerEngUser = await User.create({
      name: 'Sarah Connor',
      email: 'sarah.c@ems.com',
      password: 'password123',
      role: 'Manager',
      isActive: true,
    })

    const managerHrUser = await User.create({
      name: 'Michael Scott',
      email: 'michael.s@ems.com',
      password: 'password123',
      role: 'Manager',
      isActive: true,
    })

    const dev1User = await User.create({
      name: 'John Doe',
      email: 'john.d@ems.com',
      password: 'password123',
      role: 'Employee',
      isActive: true,
    })

    const dev2User = await User.create({
      name: 'Jane Smith',
      email: 'jane.s@ems.com',
      password: 'password123',
      role: 'Employee',
      isActive: true,
    })

    const hrSpecUser = await User.create({
      name: 'Toby Flenderson',
      email: 'toby.f@ems.com',
      password: 'password123',
      role: 'Employee',
      isActive: true,
    })

    const salesExecUser = await User.create({
      name: 'Jim Halpert',
      email: 'jim.h@ems.com',
      password: 'password123',
      role: 'Employee',
      isActive: true,
    })
    console.log('Users created.')

    // 3. Create Employee Profiles
    console.log('Creating Employee Profiles...')
    // Admin profile (sometimes admin is also an employee, but let's register all as employees for a complete view)
    const adminEmp = await Employee.create({
      userId: adminUser._id,
      employeeId: 'EMP001',
      phone: '+15550001',
      department: hr._id,
      designation: 'System Administrator',
      joiningDate: new Date('2024-01-15'),
      salary: 95000,
      status: 'Active',
    })

    const managerEngEmp = await Employee.create({
      userId: managerEngUser._id,
      employeeId: 'EMP002',
      phone: '+15550002',
      department: engineering._id,
      designation: 'Engineering Lead',
      joiningDate: new Date('2024-02-10'),
      salary: 110000,
      status: 'Active',
    })

    const managerHrEmp = await Employee.create({
      userId: managerHrUser._id,
      employeeId: 'EMP003',
      phone: '+15550003',
      department: hr._id,
      designation: 'HR Manager',
      joiningDate: new Date('2024-03-01'),
      salary: 85000,
      status: 'Active',
    })

    const dev1Emp = await Employee.create({
      userId: dev1User._id,
      employeeId: 'EMP004',
      phone: '+15550004',
      department: engineering._id,
      designation: 'Senior Software Engineer',
      joiningDate: new Date('2024-06-01'),
      salary: 90000,
      status: 'Active',
    })

    const dev2Emp = await Employee.create({
      userId: dev2User._id,
      employeeId: 'EMP005',
      phone: '+15550005',
      department: engineering._id,
      designation: 'Frontend Engineer',
      joiningDate: new Date('2024-09-15'),
      salary: 75000,
      status: 'Active',
    })

    const hrSpecEmp = await Employee.create({
      userId: hrSpecUser._id,
      employeeId: 'EMP006',
      phone: '+15550006',
      department: hr._id,
      designation: 'HR Coordinator',
      joiningDate: new Date('2025-01-10'),
      salary: 60000,
      status: 'Active',
    })

    const salesExecEmp = await Employee.create({
      userId: salesExecUser._id,
      employeeId: 'EMP007',
      phone: '+15550007',
      department: sales._id,
      designation: 'Key Account Executive',
      joiningDate: new Date('2024-05-15'),
      salary: 70000,
      status: 'Active',
    })
    console.log('Employee Profiles created.')

    // 4. Create Today's Attendance
    console.log("Creating Today's Attendance...")
    const today = getToday()

    // 1. Admin: Present & On-Time
    await Attendance.create({
      employeeId: adminEmp._id,
      date: today,
      checkIn: new Date(`${today}T09:00:00Z`),
      checkOut: new Date(`${today}T17:00:00Z`),
      totalHours: 8,
      isLate: false,
      status: 'Present',
    })

    // 2. Manager Eng: Present & Late
    await Attendance.create({
      employeeId: managerEngEmp._id,
      date: today,
      checkIn: new Date(`${today}T09:45:00Z`),
      checkOut: new Date(`${today}T18:00:00Z`),
      totalHours: 8.25,
      isLate: true,
      status: 'Present',
    })

    // 3. Manager HR: Absent
    await Attendance.create({
      employeeId: managerHrEmp._id,
      date: today,
      isLate: false,
      status: 'Absent',
    })

    // 4. Dev 1: Present
    await Attendance.create({
      employeeId: dev1Emp._id,
      date: today,
      checkIn: new Date(`${today}T08:55:00Z`),
      checkOut: new Date(`${today}T17:30:00Z`),
      totalHours: 8.5,
      isLate: false,
      status: 'Present',
    })

    // 5. Dev 2: Half Day
    await Attendance.create({
      employeeId: dev2Emp._id,
      date: today,
      checkIn: new Date(`${today}T09:00:00Z`),
      checkOut: new Date(`${today}T13:00:00Z`),
      totalHours: 4,
      isLate: false,
      status: 'Half Day',
    })

    // 6. HR Spec: Holiday (or let's just make it Leave)
    await Attendance.create({
      employeeId: hrSpecEmp._id,
      date: today,
      status: 'Leave',
    })

    // 7. Sales Exec: Present
    await Attendance.create({
      employeeId: salesExecEmp._id,
      date: today,
      checkIn: new Date(`${today}T09:10:00Z`),
      checkOut: new Date(`${today}T17:00:00Z`),
      totalHours: 7.83,
      isLate: false,
      status: 'Present',
    })
    console.log('Attendance records created.')

    // 5. Create Tasks
    console.log('Creating Tasks...')
    await Task.create({
      employeeId: dev1Emp._id,
      date: today,
      title: 'Design API Schemas',
      description: 'Draft the data model schemas for attendance and tasks.',
      hoursWorked: 4,
      status: 'Completed',
      managerComment: 'Great layout, very comprehensive.',
    })

    await Task.create({
      employeeId: dev1Emp._id,
      date: today,
      title: 'Implement Database Connection',
      description: 'Setup mongoose boilerplate and cluster connection string.',
      hoursWorked: 4,
      status: 'Completed',
    })

    await Task.create({
      employeeId: dev2Emp._id,
      date: today,
      title: 'Setup Dashboard Frontend Router',
      description: 'Configure layout component boundaries and react router dom configuration.',
      hoursWorked: 4,
      status: 'In Progress',
    })

    await Task.create({
      employeeId: salesExecEmp._id,
      date: today,
      title: 'Q3 Sales Strategy Pitch',
      description: 'Prepare presentation slides for the sales team kickoff meeting.',
      hoursWorked: 6,
      status: 'Pending',
    })
    console.log('Tasks created.')

    // 6. Create Leaves
    console.log('Creating Leaves...')
    // Pending leaves
    await Leave.create({
      employeeId: dev1Emp._id,
      type: 'Annual',
      startDate: '2026-07-10',
      endDate: '2026-07-15',
      totalDays: 5,
      reason: 'Summer family vacation trip.',
      status: 'Pending',
    })

    await Leave.create({
      employeeId: dev2Emp._id,
      type: 'Sick',
      startDate: today,
      endDate: today,
      totalDays: 1,
      reason: 'Dental appointment and recovery.',
      status: 'Approved',
      approvedBy: 'Sarah Connor',
    })

    await Leave.create({
      employeeId: salesExecEmp._id,
      type: 'Casual',
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      totalDays: 2,
      reason: 'Attending personal ceremony.',
      status: 'Rejected',
      rejectedReason: 'Client meeting scheduled for those dates.',
      approvedBy: 'Admin User',
    })
    console.log('Leaves created.')

    // 7. Create Events
    console.log('Creating Events...')
    await Event.create({
      title: 'Company Q3 Planning Meeting',
      description: 'Discussing goals, strategy, and hiring targets.',
      date: '2026-07-05',
      createdBy: adminUser._id,
    })

    await Event.create({
      title: 'Engineering Technical Review',
      description: 'Discuss backend architecture improvements and security audits.',
      date: '2026-07-12',
      createdBy: managerEngUser._id,
    })
    console.log('Events created.')

    console.log('Database Seeding Completed Successfully! 🎉')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()

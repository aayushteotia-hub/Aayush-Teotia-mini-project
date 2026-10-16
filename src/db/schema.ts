import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('student'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  head: text('head'),
  description: text('description'),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  departmentId: integer('department_id'),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  duration: text('duration').notNull(),
  totalSemesters: integer('total_semesters').notNull().default(8),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id'),
  name: text('name').notNull(),
  semester: integer('semester').notNull(),
  section: text('section').notNull(),
  academicYear: text('academic_year').notNull(),
});

export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  employeeId: text('employee_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  department: text('department').notNull(),
  designation: text('designation').notNull(),
  qualification: text('qualification'),
  avatar: text('avatar'),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  rollNumber: text('roll_number').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  course: text('course').notNull(),
  branch: text('branch').notNull(),
  semester: integer('semester').notNull(),
  section: text('section').notNull(),
  avatar: text('avatar'),
  faceDescriptor: text('face_descriptor'),
  behaviourScore: text('behaviour_score').default('Good'),
  behaviourRemarks: text('behaviour_remarks'),
  dob: text('dob'),
  address: text('address'),
});

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  course: text('course').notNull(),
  semester: integer('semester').notNull(),
  credits: integer('credits').notNull().default(3),
  teacherName: text('teacher_name'),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull(),
  studentRoll: text('student_roll').notNull(),
  studentName: text('student_name').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  subject: text('subject').notNull(),
  teacherName: text('teacher_name').notNull(),
  status: text('status').notNull(),
  method: text('method').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const marks = pgTable('marks', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull(),
  studentRoll: text('student_roll').notNull(),
  studentName: text('student_name').notNull(),
  subject: text('subject').notNull(),
  semester: integer('semester').notNull(),
  examType: text('exam_type').notNull(),
  marksObtained: integer('marks_obtained').notNull(),
  totalMarks: integer('total_marks').notNull().default(100),
  grade: text('grade').notNull(),
  date: text('date'),
});

export const timetable = pgTable('timetable', {
  id: serial('id').primaryKey(),
  dayOfWeek: text('day_of_week').notNull(),
  timeSlot: text('time_slot').notNull(),
  subject: text('subject').notNull(),
  teacherName: text('teacher_name').notNull(),
  room: text('room').notNull(),
  course: text('course').notNull(),
  semester: integer('semester').notNull(),
  section: text('section').notNull(),
});

export const notices = pgTable('notices', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  createdBy: text('created_by').notNull(),
  creatorRole: text('creator_role').notNull(),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatGroups = pgTable('chat_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull(),
  createdRole: text('created_role').notNull(),
  membersCount: integer('members_count').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const helpRequests = pgTable('help_requests', {
  id: serial('id').primaryKey(),
  studentName: text('student_name').notNull(),
  studentRoll: text('student_roll').notNull(),
  teacherName: text('teacher_name'),
  subject: text('subject').notNull(),
  problem: text('problem').notNull(),
  status: text('status').notNull().default('Pending'),
  response: text('response'),
  respondedAt: text('responded_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  studentName: text('student_name').notNull(),
  studentRoll: text('student_roll').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Pending'),
  reviewedBy: text('reviewed_by'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const votingIssues = pgTable('voting_issues', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  options: text('options').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('Open'),
  totalVotes: integer('total_votes').default(0),
  result: text('result'),
  actionTaken: text('action_taken'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  issueId: integer('issue_id').notNull(),
  studentRoll: text('student_roll').notNull(),
  selectedOption: text('selected_option').notNull(),
  votedAt: timestamp('voted_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  targetRole: text('target_role'),
  targetRoll: text('target_roll'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

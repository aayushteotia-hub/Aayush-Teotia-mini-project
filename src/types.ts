export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id?: number;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  rollNumber?: string;
  employeeId?: string;
}

export interface Student {
  id: number;
  userId?: number;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  course: string;
  branch: string;
  semester: number;
  section: string;
  avatar?: string;
  faceDescriptor?: string;
  behaviourScore?: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  behaviourRemarks?: string;
  dob?: string;
  address?: string;
}

export interface Teacher {
  id: number;
  userId?: number;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  qualification?: string;
  avatar?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  head?: string;
  description?: string;
}

export interface Course {
  id: number;
  departmentId?: number;
  name: string;
  code: string;
  duration: string;
  totalSemesters: number;
}

export interface UniversityClass {
  id: number;
  courseId?: number;
  name: string;
  semester: number;
  section: string;
  academicYear: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  course: string;
  semester: number;
  credits: number;
  teacherName?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentRoll: string;
  studentName: string;
  date: string;
  time: string;
  subject: string;
  teacherName: string;
  status: 'Present' | 'Absent' | 'Late';
  method: 'Face Recognition' | 'Roll Number Verification';
  remarks?: string;
  createdAt?: string;
}

export interface MarkRecord {
  id: number;
  studentId: number;
  studentRoll: string;
  studentName: string;
  subject: string;
  semester: number;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  date?: string;
}

export interface TimetableSlot {
  id: number;
  dayOfWeek: string;
  timeSlot: string;
  subject: string;
  teacherName: string;
  room: string;
  course: string;
  semester: number;
  section: string;
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  category: 'Exam Notice' | 'Class Notice' | 'Holiday Notice' | 'Assignment Notice' | 'University Announcement';
  date: string;
  createdBy: string;
  creatorRole: string;
  isPinned?: boolean;
}

export interface ChatGroup {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdRole: string;
  membersCount: number;
}

export interface ChatMessage {
  id: number;
  groupId: number;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

export interface HelpRequest {
  id: number;
  studentName: string;
  studentRoll: string;
  teacherName?: string;
  subject: string;
  problem: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  response?: string;
  respondedAt?: string;
  createdAt?: string;
}

export interface Complaint {
  id: number;
  studentName: string;
  studentRoll: string;
  category: 'Academic' | 'Attendance' | 'Infrastructure' | 'Faculty' | 'Examination' | 'Technical' | 'Other';
  title: string;
  description: string;
  status: 'Pending' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
  reviewedBy?: string;
  resolutionNotes?: string;
  createdAt?: string;
}

export interface VotingIssue {
  id: number;
  title: string;
  description: string;
  options: string;
  parsedOptions?: string[];
  optionsTally?: Record<string, number>;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Resolved';
  totalVotes: number;
  hasVoted?: boolean;
  userSelectedOption?: string;
  result?: string;
  actionTaken?: string;
}

export interface NotificationItem {
  id: number;
  targetRole?: string;
  targetRoll?: string;
  title: string;
  message: string;
  type: 'notice' | 'chat' | 'help' | 'complaint' | 'voting' | 'attendance';
  isRead: boolean;
  createdAt?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendance: number;
  pendingComplaints: number;
  openVoting: number;
}

export interface FeeItem {
  id: string;
  title: string;
  semester: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  receiptNo?: string;
  paymentDate?: string;
}

export interface SubjectSyllabus {
  code: string;
  name: string;
  credits: number;
  type: string;
  modules: {
    unit: string;
    title: string;
    topics: string[];
  }[];
}

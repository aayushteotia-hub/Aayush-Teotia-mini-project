import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  AlertTriangle,
  Vote,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  Eye,
  Shield,
  Building,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Student,
  Teacher,
  Course,
  Department,
  UniversityClass,
  Subject,
  AttendanceRecord,
  Notice,
  Complaint,
  VotingIssue,
  DashboardStats,
} from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'students'
    | 'teachers'
    | 'courses'
    | 'departments'
    | 'classes'
    | 'subjects'
    | 'attendance'
    | 'notices'
    | 'complaints'
    | 'voting'
  >('dashboard');

  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
    pendingComplaints: 0,
    openVoting: 0,
  });

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classesList, setClassesList] = useState<UniversityClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [votingIssues, setVotingIssues] = useState<VotingIssue[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showAddVote, setShowAddVote] = useState(false);
  const [reviewingComplaint, setReviewingComplaint] = useState<Complaint | null>(null);
  const [viewingStudentProfile, setViewingStudentProfile] = useState<Student | null>(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    rollNumber: '',
    name: '',
    email: '',
    phone: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    behaviourScore: 'Good' as any,
    behaviourRemarks: '',
  });

  const [teacherForm, setTeacherForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    qualification: 'M.Tech / Ph.D',
  });

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    duration: '4 Years',
    totalSemesters: 8,
  });

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    head: '',
    description: '',
  });

  const [classForm, setClassForm] = useState({
    name: '',
    semester: 6,
    section: 'A',
    academicYear: '2024-2025',
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    course: 'B.Tech',
    semester: 6,
    credits: 3,
    teacherName: '',
  });

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    description: '',
    category: 'University Announcement' as any,
    isPinned: false,
  });

  const [voteForm, setVoteForm] = useState({
    title: '',
    description: '',
    options: 'Option A\nOption B\nOption C',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2025-05-30',
  });

  const [complaintReviewForm, setComplaintReviewForm] = useState({
    status: 'In Progress' as any,
    resolutionNotes: '',
  });

  // Fetch all initial data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        studentsRes,
        teachersRes,
        coursesRes,
        deptRes,
        classesRes,
        subjectsRes,
        attendanceRes,
        noticesRes,
        complaintsRes,
        votingRes,
      ] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/students'),
        fetch('/api/teachers'),
        fetch('/api/courses'),
        fetch('/api/departments'),
        fetch('/api/classes'),
        fetch('/api/subjects'),
        fetch('/api/attendance'),
        fetch('/api/notices'),
        fetch('/api/complaints'),
        fetch('/api/voting'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (classesRes.ok) setClassesList(await classesRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (attendanceRes.ok) setAttendanceLogs(await attendanceRes.json());
      if (noticesRes.ok) setNotices(await noticesRes.json());
      if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      if (votingRes.ok) setVotingIssues(await votingRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Student CRUD
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        const res = await fetch(`/api/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentForm),
        });
        if (res.ok) {
          const updated = await res.json();
          setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setEditingStudent(null);
          setShowAddStudent(false);
        }
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentForm),
        });
        if (res.ok) {
          const created = await res.json();
          setStudents((prev) => [...prev, created]);
          setShowAddStudent(false);
          setStats((prev) => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to remove this student record?')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        setStats((prev) => ({ ...prev, totalStudents: Math.max(0, prev.totalStudents - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Teacher CRUD
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });
      if (res.ok) {
        const created = await res.json();
        setTeachers((prev) => [...prev, created]);
        setShowAddTeacher(false);
        setStats((prev) => ({ ...prev, totalTeachers: prev.totalTeachers + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm('Delete this faculty member?')) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Course CRUD
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        const created = await res.json();
        setCourses((prev) => [...prev, created]);
        setShowAddCourse(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Department CRUD
  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm),
      });
      if (res.ok) {
        const created = await res.json();
        setDepartments((prev) => [...prev, created]);
        setShowAddDept(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Class CRUD
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm),
      });
      if (res.ok) {
        const created = await res.json();
        setClassesList((prev) => [...prev, created]);
        setShowAddClass(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subject CRUD
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm),
      });
      if (res.ok) {
        const created = await res.json();
        setSubjects((prev) => [...prev, created]);
        setShowAddSubject(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notice CRUD
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noticeForm,
          createdBy: 'University Administration',
          creatorRole: 'admin',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setNotices((prev) => [created, ...prev]);
        setShowAddNotice(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!confirm('Remove this notice?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Voting CRUD
  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const optionsArray = voteForm.options
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: voteForm.title,
          description: voteForm.description,
          options: optionsArray,
          startDate: voteForm.startDate,
          endDate: voteForm.endDate,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setVotingIssues((prev) => [created, ...prev]);
        setShowAddVote(false);
        setStats((prev) => ({ ...prev, openVoting: prev.openVoting + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Complaint Review
  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingComplaint) return;
    try {
      const res = await fetch(`/api/complaints/${reviewingComplaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: complaintReviewForm.status,
          resolutionNotes: complaintReviewForm.resolutionNotes,
          reviewedBy: 'Dr. Rajesh Sharma (Dean / Admin)',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setReviewingComplaint(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.branch.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-white">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#141414] rounded-2xl border border-[#262626] p-4 shadow-sm h-fit">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#262626]">
          <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] border border-[#262626] text-[#8B5CF6] flex items-center justify-center font-bold text-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Admin Control</h3>
            <p className="text-[11px] text-gray-400">University Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'students', label: 'Students', icon: Users, count: students.length },
            { id: 'teachers', label: 'Teachers / Faculty', icon: UserCheck, count: teachers.length },
            { id: 'courses', label: 'Courses', icon: GraduationCap },
            { id: 'departments', label: 'Departments', icon: Building },
            { id: 'classes', label: 'Classes', icon: Calendar },
            { id: 'subjects', label: 'Subjects / Accounts', icon: BookOpen },
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { id: 'notices', label: 'Notices', icon: FileText, count: notices.length },
            { id: 'complaints', label: 'Complaints', icon: AlertTriangle, count: stats.pendingComplaints },
            { id: 'voting', label: 'Voting / Polls', icon: Vote, count: stats.openVoting },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-[#1C1C1C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#262626] text-gray-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 space-y-6">
        {/* ------------------------------------------------------------- */}
        {/* 1. DASHBOARD OVERVIEW */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">University Administrator Dashboard</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Overview of university records, daily attendance, active student notices, and campus grievances.
              </p>
            </div>

            {/* Dashboard Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-xs">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Students
                </span>
                <span className="text-2xl font-extrabold text-[#3B82F6] mt-1 block">
                  {stats.totalStudents}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Enrolled Candidates</span>
              </div>

              <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-xs">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Teachers
                </span>
                <span className="text-2xl font-extrabold text-[#8B5CF6] mt-1 block">
                  {stats.totalTeachers}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Faculty & HODs</span>
              </div>

              <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-xs">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Classes
                </span>
                <span className="text-2xl font-extrabold text-[#10B981] mt-1 block">
                  {stats.totalClasses}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Active Sections</span>
              </div>

              <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-xs">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Today's Attendance
                </span>
                <span className="text-2xl font-extrabold text-[#10B981] mt-1 block">
                  {stats.todayAttendance}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Logged Today</span>
              </div>

              <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-xs">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Complaints
                </span>
                <span className="text-2xl font-extrabold text-[#F59E0B] mt-1 block">
                  {stats.pendingComplaints}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Pending Review</span>
              </div>

              <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-xs">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Voting Polls
                </span>
                <span className="text-2xl font-extrabold text-[#8B5CF6] mt-1 block">
                  {stats.openVoting}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Active Ballots</span>
              </div>
            </div>

            {/* Quick Actions & Recent Notices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Administrative Quick Operations
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setStudentForm({
                        rollNumber: `2024CS${100 + students.length + 1}`,
                        name: '',
                        email: '',
                        phone: '',
                        course: 'B.Tech',
                        branch: 'Computer Science & Engineering',
                        semester: 6,
                        section: 'A',
                        behaviourScore: 'Good',
                        behaviourRemarks: '',
                      });
                      setShowAddStudent(true);
                    }}
                    className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 font-semibold text-left transition-colors flex items-center justify-between"
                  >
                    <span>Add New Student</span>
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAddTeacher(true)}
                    className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-800 font-semibold text-left transition-colors flex items-center justify-between"
                  >
                    <span>Register Teacher</span>
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAddNotice(true)}
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 font-semibold text-left transition-colors flex items-center justify-between"
                  >
                    <span>Publish Notice</span>
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAddVote(true)}
                    className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-800 font-semibold text-left transition-colors flex items-center justify-between"
                  >
                    <span>Create Campus Poll</span>
                    <Vote className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Notices Snapshot */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Recent University Notices
                  </h3>
                  <button
                    onClick={() => setActiveTab('notices')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {notices.slice(0, 3).map((notice) => (
                    <div
                      key={notice.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {notice.category}
                        </span>
                        <h4 className="font-bold text-slate-800 mt-1 line-clamp-1">{notice.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                        {notice.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. STUDENTS MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Directory & Records</h3>
                <p className="text-xs text-slate-500">
                  Manage student profiles, rolls, branches, behaviour ratings, and biometric credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search name, roll..."
                    className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({
                      rollNumber: `2024CS${100 + students.length + 1}`,
                      name: '',
                      email: '',
                      phone: '',
                      course: 'B.Tech',
                      branch: 'Computer Science & Engineering',
                      semester: 6,
                      section: 'A',
                      behaviourScore: 'Good',
                      behaviourRemarks: '',
                    });
                    setShowAddStudent(true);
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Student
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Roll Number</th>
                    <th className="py-3 px-3">Course / Branch</th>
                    <th className="py-3 px-3">Sem & Sec</th>
                    <th className="py-3 px-3">Behaviour</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              s.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                s.name
                              )}`
                            }
                            alt={s.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[10px] text-slate-500 block">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {s.rollNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {s.course} ({s.branch.split(' ')[0]})
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        Sem {s.semester} - {s.section}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.behaviourScore === 'Excellent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.behaviourScore === 'Good'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.behaviourScore || 'Good'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <button
                          onClick={() => setViewingStudentProfile(s)}
                          className="p-1 text-slate-400 hover:text-blue-700 rounded transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setStudentForm({
                              rollNumber: s.rollNumber,
                              name: s.name,
                              email: s.email,
                              phone: s.phone || '',
                              course: s.course,
                              branch: s.branch,
                              semester: s.semester,
                              section: s.section,
                              behaviourScore: s.behaviourScore || 'Good',
                              behaviourRemarks: s.behaviourRemarks || '',
                            });
                            setShowAddStudent(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. TEACHERS / FACULTY MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Faculty & Professors</h3>
                <p className="text-xs text-slate-500">
                  Manage teaching staff, departmental assignments, and designations.
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacher(true)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Faculty
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Faculty Name</th>
                    <th className="py-3 px-3">Employee ID</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Designation</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              t.avatar ||
                              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
                            }
                            alt={t.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{t.name}</span>
                            <span className="text-[10px] text-slate-500">{t.qualification}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {t.employeeId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{t.department}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{t.designation}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">
                        {t.email}
                        {t.phone && <span className="block text-slate-400">{t.phone}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. COURSES MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">University Academic Courses</h3>
                <p className="text-xs text-slate-500">Degree programs and curriculum duration.</p>
              </div>
              <button
                onClick={() => setShowAddCourse(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Course
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-slate-500">{c.duration}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                  <p className="text-xs text-slate-600">Total Semesters: {c.totalSemesters}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. DEPARTMENTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Academic Departments</h3>
                <p className="text-xs text-slate-500">Divisions, Heads of Department, and descriptions.</p>
              </div>
              <button
                onClick={() => setShowAddDept(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Department
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      Code: {d.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                  <p className="text-xs text-slate-600">Head: {d.head || 'To be appointed'}</p>
                  <p className="text-[11px] text-slate-500">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. CLASSES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Classes & Sections</h3>
                <p className="text-xs text-slate-500">Student cohorts and academic year cohorts.</p>
              </div>
              <button
                onClick={() => setShowAddClass(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Class
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {classesList.map((cl) => (
                <div key={cl.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {cl.academicYear}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{cl.name}</h4>
                  <p className="text-xs text-slate-600">
                    Semester {cl.semester} • Section {cl.section}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 7. SUBJECTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'subjects' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Curriculum Subjects</h3>
                <p className="text-xs text-slate-500">Subject codes, credit units, and faculty instructors.</p>
              </div>
              <button
                onClick={() => setShowAddSubject(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Subject Code</th>
                    <th className="py-3 px-3">Subject Name</th>
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Semester</th>
                    <th className="py-3 px-3">Credits</th>
                    <th className="py-3 px-3">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{sub.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sub.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{sub.course}</td>
                      <td className="py-2.5 px-3 text-slate-700">Sem {sub.semester}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{sub.credits}</td>
                      <td className="py-2.5 px-3 text-slate-700">{sub.teacherName || 'Assigned per Timetable'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 8. ATTENDANCE LOGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">University Attendance Audit Logs</h3>
                <p className="text-xs text-slate-500">
                  Verified biometric and roll-number attendance logs recorded across all university classes.
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Roll Number</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No attendance records logged yet. Use the Teacher attendance scanner to record presence.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {log.date} <span className="text-[10px] text-slate-400">{log.time}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{log.studentName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                          {log.studentRoll}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">{log.subject}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{log.method}</td>
                        <td className="py-2.5 px-3 text-slate-600">{log.teacherName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 9. NOTICES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'notices' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">University Notices & Circulars</h3>
                <p className="text-xs text-slate-500">Publish exam notifications, circulars, and announcements.</p>
              </div>
              <button
                onClick={() => setShowAddNotice(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Post Notice
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border text-xs transition-all ${
                    n.isPinned
                      ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                          {n.category}
                        </span>
                        {n.isPinned && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Pinned
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">{n.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h4>
                      <p className="text-slate-600 leading-relaxed mt-1">{n.description}</p>
                      <p className="text-[11px] text-slate-400">Published by: {n.createdBy}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 10. COMPLAINTS & GRIEVANCES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Complaints & Grievance Cell</h3>
              <p className="text-xs text-slate-500">
                Review problems filed by students regarding infrastructure, exams, academics, or faculty.
              </p>
            </div>

            <div className="space-y-3">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                        {c.category}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        By {c.studentName} ({c.studentRoll})
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : c.status === 'Under Review'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{c.description}</p>

                  {c.resolutionNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 text-xs mt-2">
                      <span className="font-bold block text-emerald-950">Action / Resolution Notes:</span>
                      <p>{c.resolutionNotes}</p>
                      {c.reviewedBy && (
                        <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                          Signed: {c.reviewedBy}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setReviewingComplaint(c);
                        setComplaintReviewForm({
                          status: c.status,
                          resolutionNotes: c.resolutionNotes || '',
                        });
                      }}
                      className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Review & Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 11. VOTING SYSTEM */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'voting' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Campus Voting & Student Polls</h3>
                <p className="text-xs text-slate-500">
                  Create democratic campus ballots and view live student vote tallies.
                </p>
              </div>
              <button
                onClick={() => setShowAddVote(true)}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Poll
              </button>
            </div>

            <div className="space-y-4">
              {votingIssues.map((v) => (
                <div key={v.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Status: {v.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Total Votes: <strong className="text-slate-900">{v.totalVotes}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{v.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{v.description}</p>
                  </div>

                  {/* Options & Progress Bars */}
                  <div className="space-y-2 pt-2">
                    {v.parsedOptions?.map((opt) => {
                      const count = v.optionsTally?.[opt] || 0;
                      const pct = v.totalVotes > 0 ? Math.round((count / v.totalVotes) * 100) : 0;
                      return (
                        <div key={opt} className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-700">
                            <span className="font-semibold">{opt}</span>
                            <span className="font-mono text-slate-500">
                              {count} votes ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODALS: ADD STUDENT */}
      {/* ------------------------------------------------------------- */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? 'Edit Student Record' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setShowAddStudent(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Course</label>
                  <select
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Branch</label>
                  <input
                    type="text"
                    value={studentForm.branch}
                    onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Section</label>
                  <input
                    type="text"
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Behaviour Score</label>
                  <select
                    value={studentForm.behaviourScore}
                    onChange={(e) => setStudentForm({ ...studentForm, behaviourScore: e.target.value as any })}
                    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: VIEW STUDENT PROFILE */}
      {/* ------------------------------------------------------------- */}
      {viewingStudentProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Student Profile Card</h3>
              <button
                onClick={() => setViewingStudentProfile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <img
                src={
                  viewingStudentProfile.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    viewingStudentProfile.name
                  )}`
                }
                alt={viewingStudentProfile.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-blue-500 shadow-md"
              />
              <h4 className="font-bold text-slate-900 text-lg mt-2">{viewingStudentProfile.name}</h4>
              <p className="text-xs font-mono font-bold text-blue-700">{viewingStudentProfile.rollNumber}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-200 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Course & Branch:</span>
                <span className="font-semibold">{viewingStudentProfile.course} ({viewingStudentProfile.branch})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Semester & Sec:</span>
                <span className="font-semibold">Sem {viewingStudentProfile.semester} - Sec {viewingStudentProfile.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold">{viewingStudentProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold">{viewingStudentProfile.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Behaviour Rating:</span>
                <span className="font-bold text-emerald-700">{viewingStudentProfile.behaviourScore || 'Good'}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingStudentProfile(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD TEACHER */}
      {/* ------------------------------------------------------------- */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Add Faculty Member</h3>
              <button onClick={() => setShowAddTeacher(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Employee ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP105"
                  value={teacherForm.employeeId}
                  onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                  className="w-full border rounded-lg p-2 font-mono text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Department</label>
                <input
                  type="text"
                  value={teacherForm.department}
                  onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Designation</label>
                <input
                  type="text"
                  value={teacherForm.designation}
                  onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: POST NOTICE */}
      {/* ------------------------------------------------------------- */}
      {showAddNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Publish University Notice</h3>
              <button onClick={() => setShowAddNotice(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Mid-Term Exams"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Category</label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                >
                  <option value="Exam Notice">Exam Notice</option>
                  <option value="Class Notice">Class Notice</option>
                  <option value="Holiday Notice">Holiday Notice</option>
                  <option value="Assignment Notice">Assignment Notice</option>
                  <option value="University Announcement">University Announcement</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Notice Body / Description</label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  placeholder="Write notice details..."
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="pinNotice" className="text-slate-700 font-medium">
                  Pin to top of portal
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddNotice(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE VOTING ISSUE */}
      {/* ------------------------------------------------------------- */}
      {showAddVote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Create Campus Poll / Issue</h3>
              <button onClick={() => setShowAddVote(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVote} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Issue / Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Choose Annual Tech Fest Theme"
                  value={voteForm.title}
                  onChange={(e) => setVoteForm({ ...voteForm, title: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={voteForm.description}
                  onChange={(e) => setVoteForm({ ...voteForm, description: e.target.value })}
                  placeholder="Briefly describe the voting topic..."
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Options (One per line)</label>
                <textarea
                  required
                  rows={4}
                  value={voteForm.options}
                  onChange={(e) => setVoteForm({ ...voteForm, options: e.target.value })}
                  className="w-full border rounded-lg p-2 font-mono text-slate-900 border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddVote(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: COMPLAINT REVIEW */}
      {/* ------------------------------------------------------------- */}
      {reviewingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Review Student Complaint</h3>
              <button
                onClick={() => setReviewingComplaint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl border space-y-1">
              <span className="font-bold text-slate-900 block">{reviewingComplaint.title}</span>
              <p className="text-slate-600">{reviewingComplaint.description}</p>
              <p className="text-[10px] text-slate-400 pt-1">
                From: {reviewingComplaint.studentName} ({reviewingComplaint.studentRoll})
              </p>
            </div>

            <form onSubmit={handleUpdateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Status</label>
                <select
                  value={complaintReviewForm.status}
                  onChange={(e) => setComplaintReviewForm({ ...complaintReviewForm, status: e.target.value as any })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Resolution / Action Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Electrician scheduled; projector replaced with new bulb."
                  value={complaintReviewForm.resolutionNotes}
                  onChange={(e) => setComplaintReviewForm({ ...complaintReviewForm, resolutionNotes: e.target.value })}
                  className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewingComplaint(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Update & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Calendar,
  BarChart2,
  Bookmark,
  CreditCard,
  Network,
  User,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Camera,
  LogOut,
  Phone,
  Mail,
  Home,
  X,
  FileText,
  HelpCircle,
  AlertTriangle,
  Vote,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import {
  Student,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  Notice,
  SubjectSyllabus,
  FeeItem,
} from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { NotificationDrawer } from './NotificationDrawer.tsx';

interface StudentMobileAppProps {
  onOpenHelp?: () => void;
  onOpenComplaints?: () => void;
  onOpenVoting?: () => void;
}

export const StudentMobileApp: React.FC<StudentMobileAppProps> = ({
  onOpenHelp,
  onOpenComplaints,
  onOpenVoting,
}) => {
  const { user, signOut } = useAuth();
  const currentRoll = user?.rollNumber || '2024CS101';

  // Screen routing
  type Screen = 'home' | 'timetable' | 'attendance' | 'syllabus' | 'fees' | 'hierarchy' | 'profile' | 'scanner';
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Shared Data States
  const [student, setStudent] = useState<Student | null>(null);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // UI Interactive States
  const [lectureAccordionOpen, setLectureAccordionOpen] = useState(false);
  const [timetableSearch, setTimetableSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingSyllabusModal, setViewingSyllabusModal] = useState<SubjectSyllabus | null>(null);
  const [viewingProfileCategory, setViewingProfileCategory] = useState<
    'personal' | 'academic' | 'communication' | 'educational' | null
  >(null);

  // -------------------------------------------------------------
  // Real-Time Face Scanner Attendance State
  // -------------------------------------------------------------
  const [scannerStep, setScannerStep] = useState<
    'idle' | 'scanning' | 'awaiting_approval' | 'approved' | 'rejected' | 'duplicate'
  >('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [activeVerificationRequestId, setActiveVerificationRequestId] = useState<string | null>(null);
  const [activeLectureInfo, setActiveLectureInfo] = useState({
    subject: 'Database Management Systems',
    teacher: 'Dr. Vikram Rathore',
    room: 'Room 301',
    period: 1,
  });
  const [scanStatusMessage, setScanStatusMessage] = useState('');

  // Sample Fee Data
  const sampleFees: FeeItem[] = [
    {
      id: 'fee-01',
      title: 'Tuition Fee - Semester 6',
      semester: 'Semester 6',
      amount: 45000,
      dueDate: '2025-01-15',
      status: 'PAID',
      receiptNo: 'REC-2025-0981',
      paymentDate: '2025-01-10',
    },
    {
      id: 'fee-02',
      title: 'Laboratory & AI Computing Fee',
      semester: 'Semester 6',
      amount: 8500,
      dueDate: '2025-01-15',
      status: 'PAID',
      receiptNo: 'REC-2025-0982',
      paymentDate: '2025-01-10',
    },
    {
      id: 'fee-03',
      title: 'Mid-Term Examination Fee',
      semester: 'Semester 6',
      amount: 2500,
      dueDate: '2025-03-25',
      status: 'PENDING',
    },
  ];

  // Sample Syllabi with Modules
  const sampleSyllabi: SubjectSyllabus[] = [
    {
      code: 'CS601',
      name: 'Distributed Operating Systems',
      credits: 4,
      type: 'Theory',
      modules: [
        {
          unit: 'Unit 1',
          title: 'Introduction to Distributed Systems',
          topics: ['Architecture models', 'Middleware', 'Communication primitives', 'RPC and RMI'],
        },
        {
          unit: 'Unit 2',
          title: 'Synchronization & Clocks',
          topics: ['Lamport logical clocks', 'Vector clocks', 'Mutual exclusion algorithms', 'Election protocols'],
        },
        {
          unit: 'Unit 3',
          title: 'Distributed Transactions & Consensus',
          topics: ['Two-phase commit', 'Paxos consensus', 'Deadlock detection in distributed systems'],
        },
      ],
    },
    {
      code: 'CS602',
      name: 'Database Management Systems',
      credits: 4,
      type: 'Theory',
      modules: [
        {
          unit: 'Unit 1',
          title: 'Relational Data Model & SQL',
          topics: ['Relational algebra', 'Tuple calculus', 'Advanced SQL joins & views', 'Integrity constraints'],
        },
        {
          unit: 'Unit 2',
          title: 'Database Normalization',
          topics: ['Functional dependencies', '1NF, 2NF, 3NF, BCNF', 'Lossless decomposition', 'Multi-valued dependencies'],
        },
        {
          unit: 'Unit 3',
          title: 'Transaction Management & Concurrency',
          topics: ['ACID properties', 'Serializability', 'Two-phase locking protocol (2PL)', 'Timestamp ordering'],
        },
      ],
    },
    {
      code: 'CS603',
      name: 'Computer Networks',
      credits: 3,
      type: 'Theory',
      modules: [
        {
          unit: 'Unit 1',
          title: 'Network Layer Protocols',
          topics: ['IPv4 & IPv6 addressing', 'Subnetting', 'Routing algorithms (Dijkstra, Bellman-Ford)', 'BGP and OSPF'],
        },
        {
          unit: 'Unit 2',
          title: 'Transport Layer Protocols',
          topics: ['TCP 3-way handshake', 'Flow control & congestion control (Slow start)', 'UDP sockets'],
        },
      ],
    },
    {
      code: 'CS604',
      name: 'Artificial Intelligence & Machine Learning',
      credits: 4,
      type: 'Theory & Lab',
      modules: [
        {
          unit: 'Unit 1',
          title: 'Search Algorithms & Heuristics',
          topics: ['State space search', 'A* search algorithm', 'Alpha-Beta pruning', 'CSP problems'],
        },
        {
          unit: 'Unit 2',
          title: 'Supervised Learning',
          topics: ['Linear regression', 'Decision trees', 'Support Vector Machines', 'Deep Neural Networks'],
        },
      ],
    },
  ];

  // Fetch student info & initial dataset
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [studentRes, timetableRes, attRes, noticesRes, subRes] = await Promise.all([
          fetch(`/api/students?roll=${currentRoll}`),
          fetch('/api/timetable'),
          fetch(`/api/attendance?studentRoll=${currentRoll}`),
          fetch('/api/notices'),
          fetch('/api/subjects'),
        ]);

        if (studentRes.ok) setStudent(await studentRes.json());
        if (timetableRes.ok) setTimetable(await timetableRes.json());
        if (attRes.ok) setAttendanceRecords(await attRes.json());
        if (noticesRes.ok) setNotices(await noticesRes.json());
        if (subRes.ok) setSubjects(await subRes.json());
      } catch (e) {
        console.warn('Error fetching student portal data:', e);
      }
    };

    fetchStudentData();
  }, [currentRoll]);

  // Polling for teacher approval if student is awaiting approval
  useEffect(() => {
    if (scannerStep !== 'awaiting_approval' || !activeVerificationRequestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/attendance/check-status/${activeVerificationRequestId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'APPROVED') {
            setScannerStep('approved');
            setScanStatusMessage('Attendance Marked Successfully! Verified by Dr. Vikram Rathore.');
            // Refresh attendance
            fetch(`/api/attendance?studentRoll=${currentRoll}`)
              .then((r) => r.json())
              .then((records) => setAttendanceRecords(records));
            clearInterval(interval);
          } else if (data.status === 'REJECTED') {
            setScannerStep('rejected');
            setScanStatusMessage('Attendance verification declined by the instructor.');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scannerStep, activeVerificationRequestId, currentRoll]);

  // Handle Face Scan Trigger (Simulated / Camera biometric flow)
  const handleInitiateFaceScan = () => {
    setScannerStep('scanning');
    setScanProgress(0);
    setScanStatusMessage('Acquiring facial landmarks & matching biometric embedding...');

    let current = 0;
    const timer = setInterval(() => {
      current += 25;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(timer);
        // Send scan verification request to server
        dispatchScanRequest();
      }
    }, 350);
  };

  const dispatchScanRequest = async () => {
    try {
      setScanStatusMessage(`Face identified! Dispatching real-time verification to ${activeLectureInfo.teacher}...`);
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRoll: student?.rollNumber || currentRoll,
          subject: activeLectureInfo.subject,
          teacherName: activeLectureInfo.teacher,
          room: activeLectureInfo.room,
          lectureNumber: activeLectureInfo.period,
          matchConfidence: 98.8,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setScannerStep('duplicate');
        setScanStatusMessage(data.error || 'Duplicate Attendance: Already marked for today.');
      } else if (res.ok) {
        setActiveVerificationRequestId(data.requestId);
        setScannerStep('awaiting_approval');
        setScanStatusMessage(
          `Face Verified (98.8% match). Waiting for ${activeLectureInfo.teacher} in ${activeLectureInfo.room} to approve attendance...`
        );
      } else {
        setScannerStep('rejected');
        setScanStatusMessage(data.error || 'Failed to dispatch verification request.');
      }
    } catch (err: any) {
      setScannerStep('rejected');
      setScanStatusMessage(err.message || 'Network error.');
    }
  };

  // Compute stats
  const totalAttended = attendanceRecords.filter((a) => a.status === 'Present').length;
  const overallPct =
    attendanceRecords.length > 0 ? Math.round((totalAttended / attendanceRecords.length) * 100) : 92;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans pb-20 select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER (BLACK BACKGROUND) */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#000000] border-b border-[#262626] h-14 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1 text-white hover:text-gray-300 transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-white text-base tracking-tight truncate">
            Apex University
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-Time Scan Shortcut */}
          <button
            onClick={() => {
              setCurrentScreen('scanner');
              setScannerStep('idle');
            }}
            className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] text-xs font-bold text-[#10B981] px-2.5 py-1 rounded-full transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden sm:inline">Face Scanner</span>
          </button>

          {/* Notification Icon */}
          <button
            onClick={() => setShowNotificationDrawer(true)}
            className="p-1.5 text-white hover:text-gray-300 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#10B981]"></span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION DRAWER */}
      {/* ------------------------------------------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex animate-fade-in">
          <div className="w-72 bg-[#000000] border-r border-[#262626] h-full p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <span className="font-extrabold text-white text-sm tracking-tight">
                  University Student Portal
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Persona in Drawer */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-[#262626]">
                <img
                  src={
                    student?.avatar ||
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
                  }
                  alt={student?.name || 'Student'}
                  className="w-10 h-10 rounded-full object-cover border border-[#262626]"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-white text-xs truncate">{student?.name || 'Aayush Sharma'}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{student?.rollNumber || currentRoll}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1 text-xs font-semibold">
                {[
                  { id: 'home', label: 'Home Dashboard', icon: Home },
                  { id: 'timetable', label: 'TimeTable', icon: Calendar },
                  { id: 'attendance', label: 'Attendance', icon: BarChart2 },
                  { id: 'scanner', label: 'Face Scan Attendance', icon: Camera, accent: 'text-[#10B981]' },
                  { id: 'syllabus', label: 'Syllabus', icon: Bookmark },
                  { id: 'fees', label: 'Fee Details', icon: CreditCard },
                  { id: 'hierarchy', label: 'My Hierarchy', icon: Network },
                  { id: 'profile', label: 'Profile', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentScreen(item.id as Screen);
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#1C1C1C] text-white font-bold border border-[#262626]'
                          : 'text-gray-300 hover:bg-[#141414] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.accent || 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Extra Student Modules */}
              <div className="pt-2 border-t border-[#262626] space-y-1 text-xs">
                <span className="text-[10px] text-gray-500 uppercase font-bold px-3">
                  Campus Engagement
                </span>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onOpenHelp) onOpenHelp();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white"
                >
                  <HelpCircle className="w-4 h-4 text-[#3B82F6]" />
                  <span>Student Help Desk</span>
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onOpenComplaints) onOpenComplaints();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white"
                >
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  <span>Grievances / Complaints</span>
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onOpenVoting) onOpenVoting();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white"
                >
                  <Vote className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Campus Voting & Polls</span>
                </button>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 p-3 rounded-xl bg-[#141414] hover:bg-rose-950/30 text-rose-400 text-xs font-bold transition-colors w-full border border-[#262626]"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCREEN CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full max-w-md mx-auto px-3 pt-3 flex-1">
        {/* ========================================================= */}
        {/* HOME DASHBOARD SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'home' && (
          <div className="space-y-3.5">
            {/* Banner Area */}
            <div className="rounded-2xl overflow-hidden border border-[#262626] relative bg-[#141414] aspect-16/7 shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80"
                alt="University Campus Banner"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                  Session 2024–2025
                </span>
                <h3 className="text-sm font-extrabold text-white leading-tight">
                  Department of Computer Science & Engineering
                </h3>
              </div>
            </div>

            {/* Student Information Card */}
            <div className="bg-[#141414] rounded-2xl border border-[#262626] p-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                {/* Circular Profile Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={
                      student?.avatar ||
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
                    }
                    alt={student?.name || 'Student'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#262626]"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#141414]"></span>
                </div>

                {/* Right Details */}
                <div className="space-y-0.5 text-xs flex-1 min-w-0">
                  <h2 className="text-base font-extrabold text-white truncate">
                    {student?.name || 'Aayush Sharma'}
                  </h2>
                  <p className="text-gray-400 font-mono text-[11px]">
                    ID: <span className="text-white font-bold">{student?.rollNumber || currentRoll}</span>
                  </p>
                  <p className="text-gray-400 text-[11px] truncate">
                    Course: <span className="text-white">{student?.course || 'B.Tech'} ({student?.branch || 'CSE'})</span>
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-gray-400">
                      Admission:{' '}
                      <strong className="text-[#10B981] font-semibold">Regular</strong>
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Sem: <strong className="text-white font-semibold">{student?.semester || 6}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider & Updates Ticker */}
              <div className="mt-3 pt-2.5 border-t border-[#262626]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    Updates
                  </span>
                  <div className="overflow-hidden whitespace-nowrap flex-1">
                    <span className="text-xs font-semibold text-[#10B981] animate-ticker">
                      📢 Mid-term examinations commence Oct 25 • Submit project synopsis by Friday • Coding Club Hackathon registration open • Library reading hall timings extended to 9:30 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Lecture Accordion Card */}
            <div className="bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden shadow-xs transition-all">
              <button
                onClick={() => setLectureAccordionOpen(!lectureAccordionOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1C1C1C] transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white block">Today's Lecture</span>
                  <p className="text-xs text-gray-400">
                    Lecture 1 • CS602 (Database Systems) • Room 301
                  </p>
                </div>
                {lectureAccordionOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>

              {lectureAccordionOpen && (
                <div className="px-4 pb-4 border-t border-[#262626] pt-3 space-y-2 text-xs">
                  {timetable.slice(0, 3).map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-[#3B82F6] bg-blue-950/60 px-1.5 py-0.5 rounded">
                            Lec {idx + 1}
                          </span>
                          <span className="font-bold text-white">{slot.subject}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {slot.teacherName} • Venue: {slot.room}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">
                        {slot.timeSlot}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------- */}
            {/* 6-CARD DASHBOARD 2-COLUMN GRID */}
            {/* --------------------------------------------------------- */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. TimeTable */}
              <button
                onClick={() => setCurrentScreen('timetable')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-950/50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <span className="font-bold text-white text-xs tracking-tight">TimeTable</span>
              </button>

              {/* 2. Attendance */}
              <button
                onClick={() => setCurrentScreen('attendance')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/50 flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-[#10B981]" />
                </div>
                <span className="font-bold text-white text-xs tracking-tight">Attendance</span>
              </button>

              {/* 3. Syllabus */}
              <button
                onClick={() => setCurrentScreen('syllabus')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-950/50 flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <span className="font-bold text-white text-xs tracking-tight">Syllabus</span>
              </button>

              {/* 4. Fee Details */}
              <button
                onClick={() => setCurrentScreen('fees')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-950/50 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#A855F7]" />
                </div>
                <span className="font-bold text-white text-xs tracking-tight">Fee Details</span>
              </button>

              {/* 5. My Hierarchy */}
              <button
                onClick={() => setCurrentScreen('hierarchy')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/50 flex items-center justify-center">
                  <Network className="w-6 h-6 text-[#10B981]" />
                </div>
                <span className="font-bold text-white text-xs tracking-tight">My Hierarchy</span>
              </button>

              {/* 6. Profile */}
              <button
                onClick={() => setCurrentScreen('profile')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-950/50 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <span className="font-bold text-white text-xs tracking-tight">Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TIMETABLE SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'timetable' && (
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-1 text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-white">Time Table</h2>
            </div>

            {/* Date Selector Card */}
            <div className="bg-[#141414] rounded-2xl border border-[#262626] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#3B82F6]" />
                <div>
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                    Enter Date
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-white border-b-2 border-[#3B82F6] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search subject or lecture..."
                value={timetableSearch}
                onChange={(e) => setTimetableSearch(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            {/* Lecture Cards List */}
            <div className="space-y-3">
              {timetable
                .filter(
                  (t) =>
                    t.subject.toLowerCase().includes(timetableSearch.toLowerCase()) ||
                    t.teacherName.toLowerCase().includes(timetableSearch.toLowerCase())
                )
                .map((lec, idx) => (
                  <div
                    key={lec.id}
                    className="bg-[#141414] rounded-2xl border border-[#262626] p-4 space-y-2 text-xs"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white">Lecture : {idx + 1}</span>
                      <span className="font-mono font-bold text-[#3B82F6] bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                        {subjects[idx]?.code || `CS60${idx + 1}`}
                      </span>
                    </div>

                    {/* Section & Room */}
                    <p className="text-gray-400 text-[11px]">
                      Theory • CSE-6A • Room: <span className="text-white font-medium">{lec.room}</span>
                    </p>

                    {/* Faculty */}
                    <p className="text-gray-300 font-semibold">{lec.teacherName}</p>

                    {/* Subject Name */}
                    <h4 className="text-sm font-extrabold text-white">{lec.subject}</h4>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                      <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" /> {lec.timeSlot}
                      </span>
                      <span className="text-[10px] font-bold text-[#10B981] bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SYLLABUS SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'syllabus' && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-1 text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-white">Syllabus</h2>
            </div>

            <div className="space-y-3">
              {sampleSyllabi.map((s) => (
                <div
                  key={s.code}
                  className="bg-[#141414] rounded-2xl border border-[#262626] p-4 space-y-2 text-xs"
                >
                  <h4 className="text-sm font-extrabold text-white">{s.name}</h4>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-400">
                      Sub. Code :{' '}
                      <strong className="text-[#3B82F6] font-mono">{s.code}</strong>
                    </span>
                    <span className="text-gray-400">
                      Credit : <strong className="text-white">{s.credits}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#262626]">
                    <span className="text-gray-400">
                      Type : <span className="text-white">{s.type}</span>
                    </span>
                    <button
                      onClick={() => setViewingSyllabusModal(s)}
                      className="text-[#3B82F6] hover:text-cyan-400 font-bold transition-colors"
                    >
                      Content : View Syllabus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ATTENDANCE SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'attendance' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1 text-white hover:text-gray-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-white">Attendance</h2>
              </div>

              {/* Quick Face Scan trigger */}
              <button
                onClick={() => {
                  setCurrentScreen('scanner');
                  setScannerStep('idle');
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-black" /> Scan Face
              </button>
            </div>

            {/* Overall Attendance Summary Banner */}
            <div className="bg-[#141414] rounded-2xl border border-[#262626] p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                  Cumulative Percentage
                </span>
                <span className="text-2xl font-extrabold text-[#10B981]">
                  {overallPct}%
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Criteria: 75% minimum required
                </p>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#262626]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={overallPct >= 75 ? 'text-[#10B981]' : 'text-[#F59E0B]'}
                    strokeDasharray={`${overallPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-white">
                  {overallPct}%
                </span>
              </div>
            </div>

            {/* Subject Attendance Cards */}
            <div className="space-y-3">
              {[
                { code: 'CS601', name: 'Distributed Operating Systems', teacher: 'Prof. Ananya Sen', credit: 4, type: 'Theory', held: 14, attended: 13, pct: 93 },
                { code: 'CS602', name: 'Database Management Systems', teacher: 'Dr. Vikram Rathore', credit: 4, type: 'Theory', held: 12, attended: 12, pct: 100 },
                { code: 'CS603', name: 'Computer Networks', teacher: 'Prof. Neha Gupta', credit: 3, type: 'Theory', held: 11, attended: 9, pct: 82 },
                { code: 'CS604', name: 'Artificial Intelligence & Machine Learning', teacher: 'Prof. Ananya Sen', credit: 4, type: 'Theory', held: 13, attended: 12, pct: 92 },
              ].map((subj) => (
                <div
                  key={subj.code}
                  className="bg-[#141414] rounded-2xl border border-[#262626] p-4 flex items-center justify-between text-xs"
                >
                  {/* Left Side */}
                  <div className="space-y-1 pr-2 flex-1">
                    <span className="font-mono font-bold text-[#3B82F6]">{subj.code}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{subj.name}</h4>
                    <p className="text-[11px] text-gray-400">{subj.teacher}</p>
                    <div className="flex gap-2 text-[10px] text-gray-500">
                      <span>Credit : {subj.credit}</span>
                      <span>Type : {subj.type}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block pt-0.5">
                      WMed. Att.
                    </span>
                  </div>

                  {/* Right Side: Circular Attendance Progress Indicator */}
                  <div className="flex flex-col items-center shrink-0 pl-2 border-l border-[#262626]">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#262626]"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={subj.pct >= 75 ? 'text-[#10B981]' : 'text-[#F59E0B]'}
                          strokeDasharray={`${subj.pct}, 100`}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-extrabold text-white">
                        {subj.pct}%
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 mt-1">
                      Attend/Held : {subj.attended}/{subj.held}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      WMed. Att. % : {subj.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SMART FACE SCANNER (IN-LECTURE VERIFICATION FLOW) */}
        {/* ========================================================= */}
        {currentScreen === 'scanner' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={() => setCurrentScreen('attendance')}
                className="p-1 text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-white">
                Biometric Face Scanner
              </h2>
            </div>

            {/* Current Active Lecture Pill */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#10B981]">
                  Current In-Session Lecture
                </span>
                <p className="font-bold text-white">{activeLectureInfo.subject}</p>
                <p className="text-[11px] text-gray-400">
                  {activeLectureInfo.teacher} • {activeLectureInfo.room}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#3B82F6] bg-blue-950/60 px-2 py-1 rounded">
                Period 1
              </span>
            </div>

            {/* Biometric Camera Viewfinder */}
            <div className="relative aspect-4/3 bg-black rounded-2xl overflow-hidden border border-[#262626] flex items-center justify-center shadow-lg">
              {/* Simulated camera background */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-950 via-black to-black"></div>

              {/* Targeting HUD Reticle */}
              <div className="relative w-56 h-56 border-2 border-dashed border-[#10B981]/60 rounded-3xl flex items-center justify-center pointer-events-none">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#10B981]"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#10B981]"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#10B981]"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#10B981]"></div>

                {scannerStep === 'scanning' && (
                  <div className="absolute inset-x-2 h-1 bg-[#10B981] shadow-[0_0_15px_#10B981] animate-laser"></div>
                )}

                {/* Center target dot */}
                <div className="w-10 h-10 rounded-full border border-[#10B981]/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                </div>
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md rounded-xl p-3 border border-[#262626] text-center text-xs">
                {scannerStep === 'idle' && (
                  <p className="text-gray-300 font-medium">
                    Position your face within the frame and tap <strong>"Scan Face"</strong>.
                  </p>
                )}

                {scannerStep === 'scanning' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-[#10B981]">
                      <span>Extracting Face Embeddings...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#10B981] h-full transition-all duration-200"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {scannerStep === 'awaiting_approval' && (
                  <div className="space-y-1 text-center animate-pulse">
                    <p className="text-sm font-bold text-[#F59E0B] flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4" /> Awaiting Faculty Verification
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Attendance request sent to <strong>{activeLectureInfo.teacher}</strong>. Please hold while they confirm...
                    </p>
                  </div>
                )}

                {scannerStep === 'approved' && (
                  <div className="space-y-1 text-[#10B981]">
                    <p className="text-sm font-extrabold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Attendance Marked Successfully
                    </p>
                    <p className="text-[11px] text-gray-300">
                      Logged in Cloud SQL • Verified by instructor.
                    </p>
                  </div>
                )}

                {scannerStep === 'duplicate' && (
                  <div className="space-y-1 text-[#F59E0B]">
                    <p className="text-xs font-bold flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Duplicate Entry Blocked
                    </p>
                    <p className="text-[11px] text-gray-300">{scanStatusMessage}</p>
                  </div>
                )}

                {scannerStep === 'rejected' && (
                  <div className="space-y-1 text-[#EF4444]">
                    <p className="text-xs font-bold">{scanStatusMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {scannerStep === 'idle' && (
                <button
                  onClick={handleInitiateFaceScan}
                  className="w-full bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Camera className="w-4 h-4 text-black" /> Scan & Match Biometric Face
                </button>
              )}

              {scannerStep === 'awaiting_approval' && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center text-xs text-gray-400">
                  <span className="text-[#F59E0B] font-bold block mb-1">
                    Waiting for Teacher's One-Click Approval
                  </span>
                  Tip: Switch to Teacher role in top bar to see the incoming notification and click [Accept]!
                </div>
              )}

              {(scannerStep === 'approved' || scannerStep === 'duplicate' || scannerStep === 'rejected') && (
                <button
                  onClick={() => setScannerStep('idle')}
                  className="w-full bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Scan Another / Done
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FEE DETAILS SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'fees' && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-1 text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-white">Fee Details</h2>
            </div>

            <div className="space-y-3">
              {sampleFees.map((fee) => (
                <div
                  key={fee.id}
                  className="bg-[#141414] rounded-2xl border border-[#262626] p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{fee.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fee.status === 'PAID'
                          ? 'bg-emerald-950 text-[#10B981] border border-emerald-800'
                          : 'bg-amber-950 text-[#F59E0B] border border-amber-800'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Amount:</span>
                    <strong className="text-white font-mono text-sm">
                      ₹{fee.amount.toLocaleString()}
                    </strong>
                  </div>

                  {fee.receiptNo && (
                    <div className="flex justify-between text-gray-500 text-[11px] pt-1 border-t border-[#262626]">
                      <span>Receipt: {fee.receiptNo}</span>
                      <span>Paid on: {fee.paymentDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MY HIERARCHY SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'hierarchy' && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-1 text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-white">My Hierarchy</h2>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-[#262626] p-4 space-y-3 text-xs">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                University Academic Governance Structure
              </span>

              {[
                { level: 'Chancellor', name: 'Dr. K. S. Verma', dept: 'Board of Governors' },
                { level: 'Vice Chancellor', name: 'Prof. M. R. Nambiar', dept: 'Executive Office' },
                { level: 'Dean of Academics', name: 'Dr. Suresh Nair', dept: 'Faculty of Engineering' },
                { level: 'Head of Department', name: 'Dr. Arvind Mehta', dept: 'Computer Science & Engineering' },
                { level: 'Faculty Class Advisor', name: 'Prof. Ananya Sen', dept: 'B.Tech CSE - Section A' },
                { level: 'Student (You)', name: student?.name || 'Aayush Sharma', dept: `Roll: ${currentRoll}` },
              ].map((h, idx) => (
                <div
                  key={h.level}
                  className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#10B981]">{h.level}</span>
                    <h5 className="font-bold text-white text-xs mt-0.5">{h.name}</h5>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{h.dept}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PROFILE SCREEN */}
        {/* ========================================================= */}
        {currentScreen === 'profile' && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-1 text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-white">Profile</h2>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-[#141414] rounded-2xl border border-[#262626] p-4 flex items-center gap-4">
              <img
                src={
                  student?.avatar ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
                }
                alt={student?.name || 'Student'}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#262626] shrink-0"
              />
              <div className="space-y-0.5 text-xs">
                <h3 className="text-base font-extrabold text-white">
                  {student?.name || 'Aayush Sharma'}
                </h3>
                <p className="text-gray-400 font-mono text-[11px]">
                  Roll No: {student?.rollNumber || currentRoll}
                </p>
                <p className="text-gray-400 text-[11px]">
                  Semester {student?.semester || 6} • Section {student?.section || 'A'}
                </p>
              </div>
            </div>

            {/* 2-Column Grid (4 Cards) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Personal Details */}
              <button
                onClick={() => setViewingProfileCategory('personal')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all aspect-square"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-950/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <span className="font-bold text-white text-xs leading-tight">
                  Personal Details
                </span>
              </button>

              {/* Academic Details */}
              <button
                onClick={() => setViewingProfileCategory('academic')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all aspect-square"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-950/50 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <span className="font-bold text-white text-xs leading-tight">
                  Academic Details
                </span>
              </button>

              {/* Communicational Details */}
              <button
                onClick={() => setViewingProfileCategory('communication')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all aspect-square"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-950/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="font-bold text-white text-xs leading-tight">
                  Communicational Details
                </span>
              </button>

              {/* Educational Details */}
              <button
                onClick={() => setViewingProfileCategory('educational')}
                className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all aspect-square"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-950/50 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-[#A855F7]" />
                </div>
                <span className="font-bold text-white text-xs leading-tight">
                  Educational Details
                </span>
              </button>
            </div>

            {/* Full-width Log Out Button */}
            <button
              onClick={signOut}
              className="w-full bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-bold text-rose-400 transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 7. FIXED BOTTOM NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#000000] border-t border-[#262626] h-14 z-30 flex items-center justify-around px-6">
        {/* Profile (Left) */}
        <button
          onClick={() => setCurrentScreen('profile')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            currentScreen === 'profile' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>

        {/* Home (Center Active) */}
        <button
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            currentScreen === 'home' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 text-[#10B981]" />
          <span className="text-[10px] text-[#10B981]">Home</span>
        </button>

        {/* Notifications (Right) */}
        <button
          onClick={() => setShowNotificationDrawer(true)}
          className="flex flex-col items-center gap-0.5 text-xs text-gray-400 hover:text-white transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Alerts</span>
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#10B981]"></span>
        </button>
      </nav>

      {/* Notification Drawer Component */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />

      {/* Modal: View Syllabus Detail */}
      {viewingSyllabusModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-sm w-full p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
              <div>
                <span className="text-[10px] font-mono text-[#3B82F6] font-bold">
                  {viewingSyllabusModal.code}
                </span>
                <h3 className="font-extrabold text-white text-sm">{viewingSyllabusModal.name}</h3>
              </div>
              <button
                onClick={() => setViewingSyllabusModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {viewingSyllabusModal.modules.map((m) => (
                <div key={m.unit} className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                  <span className="font-bold text-[#10B981] text-[11px] block">{m.unit}: {m.title}</span>
                  <ul className="list-disc pl-4 text-gray-400 text-[11px] space-y-0.5">
                    {m.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewingSyllabusModal(null)}
              className="w-full bg-[#1C1C1C] hover:bg-[#262626] text-white font-bold py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal: Profile Detail Categories */}
      {viewingProfileCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
              <h3 className="font-extrabold text-white text-sm capitalize">
                {viewingProfileCategory} Details
              </h3>
              <button
                onClick={() => setViewingProfileCategory(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {viewingProfileCategory === 'personal' && (
                <>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Full Name</span>
                    <span className="text-white font-bold">{student?.name || 'Aayush Sharma'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Date of Birth</span>
                    <span className="text-white">{student?.dob || '2003-08-15'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Blood Group</span>
                    <span className="text-white">O+ Positive</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Address</span>
                    <span className="text-white text-right">{student?.address || 'Campus Hostel'}</span>
                  </div>
                </>
              )}

              {viewingProfileCategory === 'academic' && (
                <>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Roll Number</span>
                    <span className="text-white font-mono font-bold">{student?.rollNumber || currentRoll}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Course / Branch</span>
                    <span className="text-white">{student?.course} ({student?.branch})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Semester & Sec</span>
                    <span className="text-white">Sem {student?.semester} - Sec {student?.section}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Cumulative GPA</span>
                    <span className="text-[#10B981] font-bold">8.65 / 10.0</span>
                  </div>
                </>
              )}

              {viewingProfileCategory === 'communication' && (
                <>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{student?.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Contact Phone</span>
                    <span className="text-white">{student?.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Parent / Guardian Contact</span>
                    <span className="text-white">+91 98765 00112</span>
                  </div>
                </>
              )}

              {viewingProfileCategory === 'educational' && (
                <>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Class 12th Board</span>
                    <span className="text-white font-bold">CBSE • 94.2%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#262626]">
                    <span className="text-gray-400">Class 10th Board</span>
                    <span className="text-white font-bold">CBSE • 96.0%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Entrance Rank</span>
                    <span className="text-white font-mono">JEE Mains: 12,480</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setViewingProfileCategory(null)}
              className="w-full bg-[#1C1C1C] hover:bg-[#262626] text-white font-bold py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

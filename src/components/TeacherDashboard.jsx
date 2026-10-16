import { useState, useEffect } from "react";
import {
  Users,
  Camera,
  Award,
  Star,
  Calendar,
  Bell,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  BookOpen,
  Layers,
  Plus,
  Send,
  Check
} from "lucide-react";
import { AttendanceScanner } from "./AttendanceScanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [chatGroups, setChatGroups] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [helpRequests, setHelpRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showAddMark, setShowAddMark] = useState(false);
  const [markForm, setMarkForm] = useState({
    studentRoll: "2024CS101",
    subject: "Database Management Systems",
    semester: 6,
    examType: "Mid Term",
    marksObtained: 85,
    totalMarks: 100,
    grade: "A"
  });
  const [activeStudentForRemarks, setActiveStudentForRemarks] = useState(null);
  const [behaviourForm, setBehaviourForm] = useState({
    score: "Good",
    remarks: ""
  });
  const [respondingHelp, setRespondingHelp] = useState(null);
  const [helpResponseText, setHelpResponseText] = useState("");
  const [helpStatus, setHelpStatus] = useState("In Progress");
  const [chatInput, setChatInput] = useState("");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    description: "",
    category: "Class Notice"
  });
  const loadFacultyData = async () => {
    try {
      const [
        studentsRes,
        subjectsRes,
        marksRes,
        timetableRes,
        noticesRes,
        groupsRes,
        helpRes,
        complaintsRes,
        attRes
      ] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/subjects"),
        fetch("/api/marks"),
        fetch("/api/timetable"),
        fetch("/api/notices"),
        fetch("/api/chat/groups"),
        fetch("/api/help-requests"),
        fetch("/api/complaints"),
        fetch("/api/attendance")
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (marksRes.ok) setMarksList(await marksRes.json());
      if (timetableRes.ok) setTimetable(await timetableRes.json());
      if (noticesRes.ok) setNotices(await noticesRes.json());
      if (groupsRes.ok) {
        const groups = await groupsRes.json();
        setChatGroups(groups);
        if (groups.length > 0 && !selectedGroup) {
          setSelectedGroup(groups[0]);
        }
      }
      if (helpRes.ok) setHelpRequests(await helpRes.json());
      if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      if (attRes.ok) setRecentAttendance(await attRes.json());
    } catch (err) {
      console.error("Error fetching faculty data:", err);
    }
  };
  useEffect(() => {
    loadFacultyData();
    const checkPending = async () => {
      try {
        const res = await fetch("/api/attendance/pending-requests");
        if (res.ok) {
          const list = await res.json();
          setPendingVerifications(list.filter((x) => x.status === "PENDING"));
        }
      } catch (e) {
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 2500);
    return () => clearInterval(interval);
  }, []);
  const handleVerifyRequest = async (requestId, decision) => {
    try {
      const res = await fetch("/api/attendance/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          decision,
          status: "Present",
          teacherName: user?.name || "Prof. Ananya Sen"
        })
      });
      if (res.ok) {
        setPendingVerifications((prev) => prev.filter((p) => p.requestId !== requestId));
        loadFacultyData();
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (selectedGroup) {
      fetch(`/api/chat/messages?groupId=${selectedGroup.id}`).then((res) => res.json()).then((msgs) => setChatMessages(msgs)).catch((e) => console.warn(e));
    }
  }, [selectedGroup]);
  const handleSaveMark = async (e) => {
    e.preventDefault();
    try {
      const matched = students.find((s) => s.rollNumber === markForm.studentRoll);
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...markForm,
          studentId: matched?.id || 1,
          studentName: matched?.name || "Aayush Sharma"
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setMarksList((prev) => [saved, ...prev]);
        setShowAddMark(false);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleUpdateBehaviour = async (e) => {
    e.preventDefault();
    if (!activeStudentForRemarks) return;
    try {
      const res = await fetch(`/api/students/${activeStudentForRemarks.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeStudentForRemarks,
          behaviourScore: behaviourForm.score,
          behaviourRemarks: behaviourForm.remarks
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        setActiveStudentForRemarks(null);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleRespondHelp = async (e) => {
    e.preventDefault();
    if (!respondingHelp) return;
    try {
      const res = await fetch(`/api/help-requests/${respondingHelp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: helpStatus,
          response: helpResponseText,
          teacherName: user?.name || "Prof. Ananya Sen"
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setHelpRequests((prev) => prev.map((h) => h.id === updated.id ? updated : h));
        setRespondingHelp(null);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGroup) return;
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          senderName: user?.name || "Prof. Ananya Sen",
          senderRole: "teacher",
          message: chatInput.trim()
        })
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages((prev) => [...prev, msg]);
        setChatInput("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNotice,
          createdBy: user?.name || "Prof. Ananya Sen",
          creatorRole: "teacher"
        })
      });
      if (res.ok) {
        const created = await res.json();
        setNotices((prev) => [created, ...prev]);
        setShowNoticeModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const pendingHelpCount = helpRequests.filter((h) => h.status === "Pending").length;
  return <div className="flex flex-col lg:flex-row gap-6">
      {
    /* Teacher Navigation Sidebar */
  }
      <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-sm">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Faculty Portal</h3>
            <p className="text-[11px] text-slate-500">Academic Instructor</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
    { id: "dashboard", label: "Dashboard", icon: Layers },
    { id: "attendance", label: "Attendance (Face / Roll)", icon: Camera, highlight: true },
    { id: "students", label: "Student Information", icon: Users },
    { id: "marks", label: "Marks & Grades", icon: Award },
    { id: "behaviour", label: "Behaviour / Performance", icon: Star },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "notices", label: "Notices / Announcements", icon: Bell },
    { id: "chat", label: "Chat Groups", icon: MessageSquare },
    { id: "help", label: "Student Help Requests", icon: HelpCircle, count: pendingHelpCount },
    { id: "complaints", label: "Complaints", icon: AlertTriangle },
    { id: "academic", label: "Academic Information", icon: BookOpen }
  ].map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-indigo-700 text-white shadow-xs" : item.highlight ? "bg-indigo-50 text-indigo-900 hover:bg-indigo-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
    >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== void 0 && item.count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                    {item.count}
                  </span>}
              </button>;
  })}
        </nav>
      </aside>

      {
    /* Main Faculty Content */
  }
      <main className="flex-1 space-y-6">
        {
    /* Real-Time Live Attendance Verification Toast Banner */
  }
        {pendingVerifications.length > 0 && <div className="bg-[#141414] border-2 border-[#10B981] rounded-2xl p-4 shadow-xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                <h4 className="font-extrabold text-sm text-[#10B981] flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> Live In-Lecture Face Scan Requests ({pendingVerifications.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Action Required</span>
            </div>

            <div className="space-y-2">
              {pendingVerifications.map((reqItem) => <div
    key={reqItem.requestId}
    className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3"
  >
                  <div className="flex items-center gap-3">
                    <img
    src={reqItem.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
    alt={reqItem.studentName}
    className="w-12 h-12 rounded-xl object-cover border border-[#262626] shrink-0"
  />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{reqItem.studentName}</span>
                        <span className="font-mono text-xs text-[#3B82F6] font-bold">{reqItem.studentRoll}</span>
                        <span className="text-[10px] bg-emerald-950 text-[#10B981] px-2 py-0.5 rounded-full font-semibold border border-emerald-800">
                          {reqItem.matchConfidence}% Biometric Match
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Subject: <strong className="text-white">{reqItem.subject}</strong> • Venue: {reqItem.room} • {reqItem.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
    onClick={() => handleVerifyRequest(reqItem.requestId, "APPROVED")}
    className="flex-1 sm:flex-none bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
  >
                      <Check className="w-4 h-4" /> Accept Attendance
                    </button>
                    <button
    onClick={() => handleVerifyRequest(reqItem.requestId, "REJECTED")}
    className="flex-1 sm:flex-none bg-[#1C1C1C] hover:bg-rose-950 text-rose-400 border border-[#262626] font-bold px-3 py-2 rounded-xl text-xs transition-colors"
  >
                      Deny
                    </button>
                  </div>
                </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 1. TEACHER DASHBOARD OVERVIEW */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "dashboard" && <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Welcome back, {user?.name || "Prof. Ananya Sen"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Department of Computer Science & Engineering • Academic Session 2024–2025
                </p>
              </div>

              <button
    onClick={() => setActiveTab("attendance")}
    className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs flex items-center gap-2 self-start transition-all"
  >
                <Camera className="w-4 h-4" /> Launch Attendance Scanner
              </button>
            </div>

            {
    /* Quick Metrics */
  }
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">My Students</span>
                <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">
                  {students.length}
                </span>
                <span className="text-[10px] text-slate-400">Class Roster (Sec A)</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Subjects Taught</span>
                <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
                  {subjects.length}
                </span>
                <span className="text-[10px] text-slate-400">DBMS, AI/ML, OS</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Doubts</span>
                <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                  {pendingHelpCount}
                </span>
                <span className="text-[10px] text-slate-400">Awaiting Response</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Lectures</span>
                <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">3</span>
                <span className="text-[10px] text-slate-400">Scheduled Slots</span>
              </div>
            </div>

            {
    /* Attendance Highlight Card */
  }
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                  Featured Viva System
                </span>
                <h3 className="text-xl font-bold">Biometric Face Recognition & Roll Verification</h3>
                <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                  Real-time face detection with camera stream, duplicate attendance check, student identification card, and instant cloud database logging.
                </p>
              </div>
              <button
    onClick={() => setActiveTab("attendance")}
    className="bg-white text-indigo-900 hover:bg-blue-50 font-extrabold text-xs px-5 py-3 rounded-xl shadow transition-all shrink-0 flex items-center gap-2"
  >
                <Camera className="w-4 h-4 text-indigo-700" /> Start Marking Attendance
              </button>
            </div>

            {
    /* Today's Timetable Preview */
  }
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-700" /> Today's Lecture Schedule
                </h3>
                <button
    onClick={() => setActiveTab("timetable")}
    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold"
  >
                  Full Timetable
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {timetable.slice(0, 3).map((slot) => <div key={slot.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {slot.timeSlot}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{slot.subject}</h4>
                    <p className="text-[11px] text-slate-500">
                      {slot.room} • Sem {slot.semester} Sec {slot.section}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 2. ATTENDANCE SCANNER TAB */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "attendance" && <AttendanceScanner
    students={students}
    subjects={subjects}
    onAttendanceMarked={loadFacultyData}
  />}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 3. STUDENT INFORMATION */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "students" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enrolled Students Roster</h3>
                <p className="text-xs text-slate-500">
                  Review student academic standing, contact info, and behaviour remarks.
                </p>
              </div>
              <input
    type="text"
    value={studentSearch}
    onChange={(e) => setStudentSearch(e.target.value)}
    placeholder="Search student..."
    className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.filter((s) => s.name.toLowerCase().includes(studentSearch.toLowerCase())).map((student) => <div key={student.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                    <img
    src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      student.name
    )}`}
    alt={student.name}
    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
  />
                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{student.name}</h4>
                        <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                          {student.rollNumber}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        {student.course} ({student.branch}) • Sem {student.semester}
                      </p>
                      <p className="text-[11px] text-slate-500">{student.email}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Behaviour: {student.behaviourScore || "Good"}
                        </span>
                        <button
    onClick={() => {
      setActiveStudentForRemarks(student);
      setBehaviourForm({
        score: student.behaviourScore || "Good",
        remarks: student.behaviourRemarks || ""
      });
    }}
    className="text-indigo-700 hover:text-indigo-900 font-bold text-[11px]"
  >
                          Edit Remarks
                        </button>
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 4. MARKS & GRADES */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "marks" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Marks & Grade Records</h3>
                <p className="text-xs text-slate-500">Record and review internal, mid-term, and practical evaluations.</p>
              </div>
              <button
    onClick={() => setShowAddMark(true)}
    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
  >
                <Plus className="w-3.5 h-3.5" /> Enter Marks
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Roll Number</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Exam Type</th>
                    <th className="py-3 px-3">Marks Obtained</th>
                    <th className="py-3 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marksList.map((m) => <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.studentName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {m.studentRoll}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{m.subject}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.examType}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {m.marksObtained} / {m.totalMarks}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                          {m.grade}
                        </span>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 5. BEHAVIOUR & PERFORMANCE */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "behaviour" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Behaviour & Performance Evaluations</h3>
              <p className="text-xs text-slate-500">
                Log qualitative behavioral feedback, classroom discipline, and project engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((s) => <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                      <span className="font-mono text-indigo-700 font-bold">{s.rollNumber}</span>
                    </div>
                    <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.behaviourScore === "Excellent" ? "bg-emerald-100 text-emerald-800" : s.behaviourScore === "Good" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
  >
                      {s.behaviourScore || "Good"}
                    </span>
                  </div>

                  <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{s.behaviourRemarks || "Regular participant in lectures and practical labs."}"
                  </p>

                  <button
    onClick={() => {
      setActiveStudentForRemarks(s);
      setBehaviourForm({
        score: s.behaviourScore || "Good",
        remarks: s.behaviourRemarks || ""
      });
    }}
    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold"
  >
                    Update Feedback
                  </button>
                </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 6. TIMETABLE */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "timetable" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Weekly Faculty Schedule</h3>
              <p className="text-xs text-slate-500">Lecture hours, room numbers, and laboratory sessions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {timetable.map((slot) => <div key={slot.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                      {slot.dayOfWeek}
                    </span>
                    <span className="font-mono text-slate-600">{slot.timeSlot}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{slot.subject}</h4>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Venue: {slot.room}</span>
                    <span>Sem {slot.semester} (Sec {slot.section})</span>
                  </div>
                </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 7. CHAT GROUPS */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "chat" && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {
    /* Groups Sidebar */
  }
            <div className="md:col-span-4 border-r border-slate-200 p-4 space-y-3 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                My Class Groups
              </h4>
              <div className="space-y-1.5">
                {chatGroups.map((g) => <button
    key={g.id}
    onClick={() => setSelectedGroup(g)}
    className={`w-full text-left p-3 rounded-xl text-xs transition-all ${selectedGroup?.id === g.id ? "bg-indigo-700 text-white font-bold shadow-xs" : "bg-white hover:bg-slate-200 text-slate-800 border border-slate-200"}`}
  >
                    <p className="truncate">{g.name}</p>
                    <span
    className={`text-[10px] block mt-0.5 ${selectedGroup?.id === g.id ? "text-indigo-100" : "text-slate-400"}`}
  >
                      {g.membersCount} members
                    </span>
                  </button>)}
              </div>
            </div>

            {
    /* Chat Messages Viewport */
  }
            <div className="md:col-span-8 flex flex-col justify-between p-4">
              {selectedGroup ? <>
                  <div className="border-b pb-3 mb-3 border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedGroup.name}</h4>
                      <p className="text-[11px] text-slate-500">{selectedGroup.description}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 max-h-80 p-2">
                    {chatMessages.map((m) => <div
    key={m.id}
    className={`flex flex-col ${m.senderRole === "teacher" ? "items-end" : "items-start"}`}
  >
                        <div
    className={`max-w-sm p-3 rounded-2xl text-xs ${m.senderRole === "teacher" ? "bg-indigo-700 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}
  >
                          <span className="font-bold text-[10px] block mb-0.5 opacity-80">
                            {m.senderName} ({m.senderRole})
                          </span>
                          <p className="leading-relaxed">{m.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{m.timestamp}</span>
                      </div>)}
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                    <input
    type="text"
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    placeholder="Type a message to the group..."
    className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
                    <button
    type="submit"
    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-xs"
  >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                </> : <div className="text-center py-16 text-slate-400 text-xs">
                  Select a class group to start communicating.
                </div>}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 8. STUDENT HELP REQUESTS */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "help" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Help Requests & Doubts</h3>
              <p className="text-xs text-slate-500">
                Review conceptual and academic questions submitted by students.
              </p>
            </div>

            <div className="space-y-3">
              {helpRequests.map((h) => <div key={h.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded text-[10px]">
                        {h.subject}
                      </span>
                      <span className="text-slate-600 font-semibold">
                        From: {h.studentName} ({h.studentRoll})
                      </span>
                    </div>

                    <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : h.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
  >
                      {h.status}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">"{h.problem}"</p>

                  {h.response && <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 text-xs">
                      <span className="font-bold block text-emerald-950">Faculty Response:</span>
                      <p>{h.response}</p>
                      <span className="text-[10px] text-emerald-700 block mt-1">
                        Responded at: {h.respondedAt}
                      </span>
                    </div>}

                  <div className="pt-2 flex justify-end">
                    <button
    onClick={() => {
      setRespondingHelp(h);
      setHelpResponseText(h.response || "");
      setHelpStatus(h.status);
    }}
    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
  >
                      {h.response ? "Update Answer" : "Respond to Student"}
                    </button>
                  </div>
                </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 9. NOTICES */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "notices" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Class Notices & Announcements</h3>
                <p className="text-xs text-slate-500">Post announcements specifically for your enrolled cohorts.</p>
              </div>
              <button
    onClick={() => setShowNoticeModal(true)}
    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs"
  >
                <Plus className="w-3.5 h-3.5" /> Post Announcement
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((n) => <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded text-[10px]">
                      {n.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{n.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{n.description}</p>
                </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 10. ACADEMIC INFO */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "academic" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Academic Curriculum & Syllabus Guidelines</h3>
              <p className="text-xs text-slate-500">Subject syllabus breakdowns and university marking distribution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((s) => <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                    <span className="font-semibold text-slate-600">{s.credits} Credits</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                  <p className="text-slate-600">Course: {s.course} • Semester {s.semester}</p>
                  <div className="bg-white p-2.5 rounded-lg border text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Mid-Term Exam Weightage:</span>
                      <span className="font-bold">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End-Term Theory Weightage:</span>
                      <span className="font-bold">50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internal Practical & Attendance:</span>
                      <span className="font-bold">20%</span>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}
      </main>

      {
    /* ------------------------------------------------------------- */
  }
      {
    /* MODAL: ENTER MARKS */
  }
      {
    /* ------------------------------------------------------------- */
  }
      {showAddMark && <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Enter Student Marks</h3>
              <button onClick={() => setShowAddMark(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>
            <form onSubmit={handleSaveMark} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Select Student</label>
                <select
    value={markForm.studentRoll}
    onChange={(e) => setMarkForm({ ...markForm, studentRoll: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  >
                  {students.map((s) => <option key={s.id} value={s.rollNumber}>
                      {s.rollNumber} - {s.name}
                    </option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Subject</label>
                <select
    value={markForm.subject}
    onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  >
                  {subjects.map((sub) => <option key={sub.id} value={sub.name}>
                      {sub.code}: {sub.name}
                    </option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Exam Type</label>
                  <select
    value={markForm.examType}
    onChange={(e) => setMarkForm({ ...markForm, examType: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  >
                    <option value="Mid Term">Mid Term</option>
                    <option value="End Term">End Term</option>
                    <option value="Internal Assessment">Internal Assessment</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Semester</label>
                  <input
    type="number"
    value={markForm.semester}
    onChange={(e) => setMarkForm({ ...markForm, semester: Number(e.target.value) })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Obtained</label>
                  <input
    type="number"
    required
    value={markForm.marksObtained}
    onChange={(e) => {
      const val = Number(e.target.value);
      let g = "F";
      if (val >= 90) g = "A+";
      else if (val >= 80) g = "A";
      else if (val >= 70) g = "B+";
      else if (val >= 60) g = "B";
      else if (val >= 50) g = "C";
      setMarkForm({ ...markForm, marksObtained: val, grade: g });
    }}
    className="w-full border rounded-lg p-2 font-bold text-slate-900 border-slate-300"
  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Total</label>
                  <input
    type="number"
    value={markForm.totalMarks}
    onChange={(e) => setMarkForm({ ...markForm, totalMarks: Number(e.target.value) })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Grade</label>
                  <input
    type="text"
    readOnly
    value={markForm.grade}
    className="w-full border rounded-lg p-2 bg-slate-100 font-extrabold text-blue-700 border-slate-300"
  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
    type="button"
    onClick={() => setShowAddMark(false)}
    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
  >
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* ------------------------------------------------------------- */
  }
      {
    /* MODAL: UPDATE BEHAVIOUR REMARKS */
  }
      {
    /* ------------------------------------------------------------- */
  }
      {activeStudentForRemarks && <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Performance Evaluation: {activeStudentForRemarks.name}
              </h3>
              <button
    onClick={() => setActiveStudentForRemarks(null)}
    className="text-slate-400 hover:text-slate-600"
  >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateBehaviour} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Behaviour Rating</label>
                <select
    value={behaviourForm.score}
    onChange={(e) => setBehaviourForm({ ...behaviourForm, score: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300 font-bold"
  >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Teacher Remarks & Feedback</label>
                <textarea
    rows={3}
    required
    value={behaviourForm.remarks}
    onChange={(e) => setBehaviourForm({ ...behaviourForm, remarks: e.target.value })}
    placeholder="e.g. Shows proactive curiosity in practical exercises, regular submission."
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
    type="button"
    onClick={() => setActiveStudentForRemarks(null)}
    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
  >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* ------------------------------------------------------------- */
  }
      {
    /* MODAL: RESPOND TO HELP REQUEST */
  }
      {
    /* ------------------------------------------------------------- */
  }
      {respondingHelp && <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Answer Student Doubt</h3>
              <button onClick={() => setRespondingHelp(null)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <span className="font-bold text-slate-900 block">
                {respondingHelp.studentName} ({respondingHelp.studentRoll})
              </span>
              <p className="text-slate-600 italic">"{respondingHelp.problem}"</p>
            </div>

            <form onSubmit={handleRespondHelp} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Status</label>
                <select
    value={helpStatus}
    onChange={(e) => setHelpStatus(e.target.value)}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Your Explanation / Response</label>
                <textarea
    rows={4}
    required
    value={helpResponseText}
    onChange={(e) => setHelpResponseText(e.target.value)}
    placeholder="Provide guidance or suggest a consultation slot..."
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
    type="button"
    onClick={() => setRespondingHelp(null)}
    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
  >
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};

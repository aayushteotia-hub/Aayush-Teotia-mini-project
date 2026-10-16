import { useState, useEffect } from "react";
import {
  User,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Vote,
  Plus,
  Send,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Check,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
export const StudentDashboard = () => {
  const { user } = useAuth();
  const currentRoll = user?.rollNumber || "2024CS101";
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [myMarks, setMyMarks] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [chatGroups, setChatGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [myHelpRequests, setMyHelpRequests] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [votingIssues, setVotingIssues] = useState([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpForm, setHelpForm] = useState({
    subject: "Database Management Systems",
    problem: ""
  });
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: "Academic",
    title: "",
    description: ""
  });
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const loadStudentData = async () => {
    try {
      const [
        studentRes,
        attendanceRes,
        marksRes,
        timetableRes,
        noticesRes,
        groupsRes,
        helpRes,
        complaintsRes,
        votingRes
      ] = await Promise.all([
        fetch(`/api/students?roll=${currentRoll}`),
        fetch(`/api/attendance?studentRoll=${currentRoll}`),
        fetch(`/api/marks?studentRoll=${currentRoll}`),
        fetch("/api/timetable"),
        fetch("/api/notices"),
        fetch("/api/chat/groups"),
        fetch(`/api/help-requests?studentRoll=${currentRoll}`),
        fetch(`/api/complaints?studentRoll=${currentRoll}`),
        fetch(`/api/voting?studentRoll=${currentRoll}`)
      ]);
      if (studentRes.ok) setProfile(await studentRes.json());
      if (attendanceRes.ok) setMyAttendance(await attendanceRes.json());
      if (marksRes.ok) setMyMarks(await marksRes.json());
      if (timetableRes.ok) setTimetable(await timetableRes.json());
      if (noticesRes.ok) setNotices(await noticesRes.json());
      if (groupsRes.ok) {
        const groups = await groupsRes.json();
        setChatGroups(groups);
        if (groups.length > 0 && !selectedGroup) setSelectedGroup(groups[0]);
      }
      if (helpRes.ok) setMyHelpRequests(await helpRes.json());
      if (complaintsRes.ok) setMyComplaints(await complaintsRes.json());
      if (votingRes.ok) setVotingIssues(await votingRes.json());
    } catch (err) {
      console.error("Failed to load student data:", err);
    }
  };
  useEffect(() => {
    loadStudentData();
  }, [currentRoll]);
  useEffect(() => {
    if (selectedGroup) {
      fetch(`/api/chat/messages?groupId=${selectedGroup.id}`).then((res) => res.json()).then((msgs) => setChatMessages(msgs)).catch((e) => console.warn(e));
    }
  }, [selectedGroup]);
  const handleAskHelp = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: profile.name,
          studentRoll: profile.rollNumber,
          subject: helpForm.subject,
          problem: helpForm.problem
        })
      });
      if (res.ok) {
        const created = await res.json();
        setMyHelpRequests((prev) => [created, ...prev]);
        setShowHelpModal(false);
        setHelpForm({ subject: "Database Management Systems", problem: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: profile.name,
          studentRoll: profile.rollNumber,
          category: complaintForm.category,
          title: complaintForm.title,
          description: complaintForm.description
        })
      });
      if (res.ok) {
        const created = await res.json();
        setMyComplaints((prev) => [created, ...prev]);
        setShowComplaintModal(false);
        setComplaintForm({ category: "Academic", title: "", description: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleVote = async (issueId, selectedOption) => {
    try {
      const res = await fetch(`/api/voting/${issueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRoll: currentRoll,
          selectedOption
        })
      });
      const data = await res.json();
      if (res.ok) {
        const refreshed = await fetch(`/api/voting?studentRoll=${currentRoll}`).then((r) => r.json());
        setVotingIssues(refreshed);
      } else {
        alert(data.error || "Vote could not be registered");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !profile) return;
    try {
      const res = await fetch("/api/chat/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim() || "Student Project & Study Room",
          createdBy: profile.name,
          createdRole: "student"
        })
      });
      if (res.ok) {
        const created = await res.json();
        setChatGroups((prev) => [created, ...prev]);
        setSelectedGroup(created);
        setShowCreateGroupModal(false);
        setNewGroupName("");
        setNewGroupDesc("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGroup || !profile) return;
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          senderName: profile.name,
          senderRole: "student",
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
  const totalClassesAttended = myAttendance.filter((a) => a.status === "Present").length;
  const attendanceRate = myAttendance.length > 0 ? Math.round(totalClassesAttended / myAttendance.length * 100) : 88;
  const avgMarks = myMarks.length > 0 ? Math.round(
    myMarks.reduce((acc, m) => acc + m.marksObtained / m.totalMarks * 100, 0) / myMarks.length
  ) : 86;
  return <div className="flex flex-col lg:flex-row gap-6">
      {
    /* Student Navigation Sidebar */
  }
      <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Student Portal</h3>
            <p className="text-[11px] text-slate-500 font-mono">{currentRoll}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
    { id: "profile", label: "My Profile", icon: User },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "marks", label: "Marks & Grades", icon: Award },
    { id: "performance", label: "Academic Performance", icon: TrendingUp },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "notices", label: "Notices", icon: FileText, count: notices.length },
    { id: "chat", label: "Chat Groups", icon: MessageSquare },
    { id: "help", label: "Ask for Help", icon: HelpCircle, count: myHelpRequests.length },
    { id: "complaints", label: "Complaints", icon: AlertTriangle, count: myComplaints.length },
    { id: "voting", label: "Voting & Polls", icon: Vote, count: votingIssues.length }
  ].map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-emerald-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
    >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== void 0 && item.count > 0 && <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}
    >
                    {item.count}
                  </span>}
              </button>;
  })}
        </nav>
      </aside>

      {
    /* Main Student Content */
  }
      <main className="flex-1 space-y-6">
        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 1. MY PROFILE */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "profile" && <div className="space-y-6">
            {
    /* Student ID Card Banner */
  }
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
              <img
    src={profile?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"}
    alt={profile?.name || "Student"}
    className="w-28 h-28 rounded-2xl object-cover border-4 border-emerald-500 shadow-md shrink-0"
  />

              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Verified Student
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                    Roll: {profile?.rollNumber || currentRoll}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Sem {profile?.semester || 6} • Sec {profile?.section || "A"}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.name || "Aayush Sharma"}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {profile?.course || "B.Tech"} in {profile?.branch || "Computer Science & Engineering"}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> {profile?.email || "aayush.s@univ.edu"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" /> {profile?.phone || "+91 98765 43210"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> {profile?.address || "University Campus"}
                  </span>
                </div>
              </div>

              {
    /* Attendance Quick Badge */
  }
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center shrink-0 w-36">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Overall Attendance
                </span>
                <span className="text-3xl font-extrabold text-emerald-700 block my-0.5">
                  {attendanceRate}%
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {attendanceRate >= 75 ? "Criteria Cleared" : "Short Attendance"}
                </span>
              </div>
            </div>

            {
    /* Profile Detail Cards */
  }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-600" /> Average Score
                </span>
                <p className="text-2xl font-extrabold text-slate-900">{avgMarks}%</p>
                <p className="text-xs text-slate-500">Cumulative Semester Evaluation</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Behaviour & Standing
                </span>
                <p className="text-2xl font-extrabold text-emerald-700">
                  {profile?.behaviourScore || "Excellent"}
                </p>
                <p className="text-xs text-slate-500">
                  {profile?.behaviourRemarks || "Consistently active in lab practicals."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Biometric Identity
                </span>
                <p className="text-2xl font-extrabold text-indigo-700">Enrolled</p>
                <p className="text-xs text-slate-500">Face recognition biometric template registered</p>
              </div>
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 2. ATTENDANCE */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "attendance" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Attendance Log History</h3>
                <p className="text-xs text-slate-500">
                  Verified biometric face recognition and roll number check-ins.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Attendance: {attendanceRate}%
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Verification Method</th>
                    <th className="py-3 px-3">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.length === 0 ? <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No individual attendance entries found yet for roll number {currentRoll}.
                      </td>
                    </tr> : myAttendance.map((a) => <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{a.date}</td>
                        <td className="py-2.5 px-3 text-slate-500">{a.time}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{a.subject}</td>
                        <td className="py-2.5 px-3">
                          <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.status === "Present" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
  >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-indigo-700 font-medium">{a.method}</td>
                        <td className="py-2.5 px-3 text-slate-600">{a.teacherName}</td>
                      </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 3. MARKS & GRADES */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "marks" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Academic Scorecard & Grades</h3>
              <p className="text-xs text-slate-500">
                Official grading results for mid-term, internal assessments, and lab evaluations.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Semester</th>
                    <th className="py-3 px-3">Examination</th>
                    <th className="py-3 px-3">Marks Obtained</th>
                    <th className="py-3 px-3">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myMarks.map((m) => <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.subject}</td>
                      <td className="py-2.5 px-3 text-slate-600">Sem {m.semester}</td>
                      <td className="py-2.5 px-3 text-slate-700">{m.examType}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {m.marksObtained} / {m.totalMarks}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
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
    /* 4. ACADEMIC PERFORMANCE */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "performance" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Academic Analytics & Insights</h3>
              <p className="text-xs text-slate-500">Detailed breakdown of subject progress and faculty feedback.</p>
            </div>

            <div className="space-y-3">
              {myMarks.map((m) => {
    const pct = Math.round(m.marksObtained / m.totalMarks * 100);
    return <div key={m.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-sm">{m.subject}</span>
                      <span className="font-mono font-bold text-emerald-700">{pct}% ({m.grade})</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
      className="bg-emerald-600 h-full rounded-full"
      style={{ width: `${pct}%` }}
    />
                    </div>
                  </div>;
  })}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 5. TIMETABLE */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "timetable" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Class Timetable</h3>
              <p className="text-xs text-slate-500">Weekly schedule of lectures and lab sessions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {timetable.map((slot) => <div key={slot.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {slot.dayOfWeek}
                    </span>
                    <span className="font-mono text-slate-600">{slot.timeSlot}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{slot.subject}</h4>
                  <p className="text-slate-600">Faculty: {slot.teacherName}</p>
                  <p className="text-[11px] text-slate-500">Venue: {slot.room}</p>
                </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 6. NOTICES */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "notices" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">University Notices & Circulars</h3>
              <p className="text-xs text-slate-500">Official circulars, exam notices, and event announcements.</p>
            </div>

            <div className="space-y-3">
              {notices.map((n) => <div
    key={n.id}
    className={`p-4 rounded-xl border text-xs space-y-1.5 ${n.isPinned ? "bg-blue-50/50 border-blue-200" : "bg-slate-50/50 border-slate-200"}`}
  >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                      {n.category}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{n.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{n.description}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Published by: {n.createdBy}
                  </span>
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
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Discussion Groups
                </h4>
                <button
    onClick={() => setShowCreateGroupModal(true)}
    className="text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1"
  >
                  <Plus className="w-3.5 h-3.5" /> New Group
                </button>
              </div>

              <div className="space-y-1.5">
                {chatGroups.map((g) => <button
    key={g.id}
    onClick={() => setSelectedGroup(g)}
    className={`w-full text-left p-3 rounded-xl text-xs transition-all ${selectedGroup?.id === g.id ? "bg-emerald-700 text-white font-bold shadow-xs" : "bg-white hover:bg-slate-200 text-slate-800 border border-slate-200"}`}
  >
                    <p className="truncate">{g.name}</p>
                    <span
    className={`text-[10px] block mt-0.5 ${selectedGroup?.id === g.id ? "text-emerald-100" : "text-slate-400"}`}
  >
                      {g.membersCount} participants
                    </span>
                  </button>)}
              </div>
            </div>

            {
    /* Chat Messages */
  }
            <div className="md:col-span-8 flex flex-col justify-between p-4">
              {selectedGroup ? <>
                  <div className="border-b pb-3 mb-3 border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedGroup.name}</h4>
                    <p className="text-[11px] text-slate-500">{selectedGroup.description}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 max-h-80 p-2">
                    {chatMessages.map((m) => <div
    key={m.id}
    className={`flex flex-col ${m.senderRole === "student" ? "items-end" : "items-start"}`}
  >
                        <div
    className={`max-w-sm p-3 rounded-2xl text-xs ${m.senderRole === "student" ? "bg-emerald-700 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}
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
    placeholder="Type your message..."
    className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
  />
                    <button
    type="submit"
    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-xs"
  >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                </> : <div className="text-center py-16 text-slate-400 text-xs">
                  Select a group to view discussion.
                </div>}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 8. ASK FOR HELP */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "help" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Academic Help Desk</h3>
                <p className="text-xs text-slate-500">
                  Submit problem statements or queries directly to professors and faculty advisors.
                </p>
              </div>
              <button
    onClick={() => setShowHelpModal(true)}
    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs"
  >
                <Plus className="w-3.5 h-3.5" /> Ask for Help
              </button>
            </div>

            <div className="space-y-3">
              {myHelpRequests.length === 0 ? <p className="text-xs text-slate-400 py-6 text-center">
                  You have not submitted any help requests yet. Click "Ask for Help" to submit a question.
                </p> : myHelpRequests.map((h) => <div key={h.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        {h.subject}
                      </span>
                      <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : h.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
  >
                        Status: {h.status}
                      </span>
                    </div>

                    <p className="text-slate-800 font-semibold">"{h.problem}"</p>

                    {h.response ? <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900">
                        <span className="font-bold block text-emerald-950">
                          {h.teacherName || "Faculty"} Responded:
                        </span>
                        <p className="mt-0.5">{h.response}</p>
                        <span className="text-[10px] text-emerald-700 block mt-1 font-mono">
                          {h.respondedAt}
                        </span>
                      </div> : <p className="text-[11px] text-slate-400 italic">
                        Faculty review pending. You will receive a notification when answered.
                      </p>}
                  </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 9. COMPLAINTS */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "complaints" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">My Grievances & Complaints</h3>
                <p className="text-xs text-slate-500">
                  Report infrastructure, academic, or campus concerns to university authorities.
                </p>
              </div>
              <button
    onClick={() => setShowComplaintModal(true)}
    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs"
  >
                <Plus className="w-3.5 h-3.5" /> Submit Complaint
              </button>
            </div>

            <div className="space-y-3">
              {myComplaints.length === 0 ? <p className="text-xs text-slate-400 py-6 text-center">
                  No complaints filed yet.
                </p> : myComplaints.map((c) => <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                        Category: {c.category}
                      </span>
                      <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : c.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
  >
                        {c.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                    <p className="text-slate-600">{c.description}</p>

                    {c.resolutionNotes && <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900">
                        <span className="font-bold block text-emerald-950">Resolution Remarks:</span>
                        <p>{c.resolutionNotes}</p>
                        <span className="text-[10px] text-emerald-700 block mt-1">
                          Reviewer: {c.reviewedBy}
                        </span>
                      </div>}
                  </div>)}
            </div>
          </div>}

        {
    /* ------------------------------------------------------------- */
  }
        {
    /* 10. VOTING */
  }
        {
    /* ------------------------------------------------------------- */
  }
        {activeTab === "voting" && <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Campus Voting & Student Voice</h3>
              <p className="text-xs text-slate-500">
                Exercise your single authorized student ballot on active university issues.
              </p>
            </div>

            <div className="space-y-4">
              {votingIssues.map((v) => <div key={v.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      Status: {v.status}
                    </span>
                    {v.hasVoted && <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ballot Recorded
                      </span>}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{v.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{v.description}</p>
                  </div>

                  {
    /* Options List */
  }
                  <div className="space-y-2 pt-2">
                    {v.parsedOptions?.map((opt) => {
    const count = v.optionsTally?.[opt] || 0;
    const pct = v.totalVotes > 0 ? Math.round(count / v.totalVotes * 100) : 0;
    const isMyChoice = v.userSelectedOption === opt;
    return <div
      key={opt}
      className={`p-3 rounded-xl border transition-all ${isMyChoice ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-200"}`}
    >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              {isMyChoice && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              {opt}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-mono">
                                {count} votes ({pct}%)
                              </span>
                              {!v.hasVoted && <button
      onClick={() => handleVote(v.id, opt)}
      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors"
    >
                                  Vote
                                </button>}
                            </div>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
      className={`h-full rounded-full transition-all duration-300 ${isMyChoice ? "bg-emerald-600" : "bg-purple-600"}`}
      style={{ width: `${pct}%` }}
    />
                          </div>
                        </div>;
  })}
                  </div>
                </div>)}
            </div>
          </div>}
      </main>

      {
    /* ------------------------------------------------------------- */
  }
      {
    /* MODAL: ASK FOR HELP */
  }
      {
    /* ------------------------------------------------------------- */
  }
      {showHelpModal && <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Ask Faculty for Help</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>
            <form onSubmit={handleAskHelp} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Subject</label>
                <select
    value={helpForm.subject}
    onChange={(e) => setHelpForm({ ...helpForm, subject: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300 font-medium"
  >
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Distributed Operating Systems">Distributed Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & ML</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Describe Your Problem / Doubt</label>
                <textarea
    rows={4}
    required
    placeholder="Explain clearly what concept or assignment question you need assistance with..."
    value={helpForm.problem}
    onChange={(e) => setHelpForm({ ...helpForm, problem: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
    type="button"
    onClick={() => setShowHelpModal(false)}
    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
  >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* ------------------------------------------------------------- */
  }
      {
    /* MODAL: SUBMIT COMPLAINT */
  }
      {
    /* ------------------------------------------------------------- */
  }
      {showComplaintModal && <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Submit Grievance / Complaint</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Category</label>
                <select
    value={complaintForm.category}
    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300 font-medium"
  >
                  <option value="Academic">Academic</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Examination">Examination</option>
                  <option value="Technical">Technical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Complaint Title</label>
                <input
    type="text"
    required
    placeholder="e.g. Broken bench in Room 302"
    value={complaintForm.title}
    onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Details & Description</label>
                <textarea
    rows={4}
    required
    placeholder="Describe the problem in detail..."
    value={complaintForm.description}
    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
    type="button"
    onClick={() => setShowComplaintModal(false)}
    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
  >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* ------------------------------------------------------------- */
  }
      {
    /* MODAL: CREATE CHAT GROUP */
  }
      {
    /* ------------------------------------------------------------- */
  }
      {showCreateGroupModal && <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Create Study / Chat Group</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Group Name</label>
                <input
    type="text"
    required
    placeholder="e.g. AI Lab Project Squad"
    value={newGroupName}
    onChange={(e) => setNewGroupName(e.target.value)}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300 font-medium"
  />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Description / Topic</label>
                <textarea
    rows={2}
    placeholder="Describe the group purpose..."
    value={newGroupDesc}
    onChange={(e) => setNewGroupDesc(e.target.value)}
    className="w-full border rounded-lg p-2 text-slate-900 border-slate-300"
  />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
    type="button"
    onClick={() => setShowCreateGroupModal(false)}
    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
  >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};

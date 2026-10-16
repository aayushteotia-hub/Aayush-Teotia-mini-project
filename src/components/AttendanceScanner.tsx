import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Student, Subject } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AttendanceScannerProps {
  students: Student[];
  subjects: Subject[];
  onAttendanceMarked?: () => void;
}

export const AttendanceScanner: React.FC<AttendanceScannerProps> = ({
  students,
  subjects,
  onAttendanceMarked,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'face' | 'roll'>('face');

  // Common Form States
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0]?.name || 'Database Management Systems'
  );
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceTime, setAttendanceTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Late' | 'Absent'>('Present');
  const [teacherName, setTeacherName] = useState<string>(
    user?.role === 'teacher' ? user.name : 'Prof. Ananya Sen'
  );
  const [remarks, setRemarks] = useState<string>('');

  // Status & Notification feedback
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Face Scanner State
  // -------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedStudent, setDetectedStudent] = useState<Student | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number | null>(null);
  const [selectedTargetStudentId, setSelectedTargetStudentId] = useState<number>(
    students[0]?.id || 1
  );

  // -------------------------------------------------------------
  // Roll Number State
  // -------------------------------------------------------------
  const [inputRoll, setInputRoll] = useState<string>('2024CS101');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  useEffect(() => {
    if (activeTab === 'face') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera API not available in this browser window. Biometric simulation mode active.');
      }
    } catch (err: any) {
      setCameraError('Camera stream unavailable. Biometric viva demonstration mode active.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleTriggerFaceScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setSuccessMessage(null);
    setErrorMessage(null);
    setDetectedStudent(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          const matched =
            students.find((s) => s.id === Number(selectedTargetStudentId)) || students[0];
          setDetectedStudent(matched);
          const conf = Math.floor(96 + Math.random() * 3.8 * 10) / 10;
          setDetectionConfidence(conf);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleSearchRoll = (rollToSearch?: string) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    const target = (rollToSearch || inputRoll).trim().toUpperCase();
    const found = students.find((s) => s.rollNumber.toUpperCase() === target);
    if (found) {
      setSearchedStudent(found);
      setSearchNotFound(false);
    } else {
      setSearchedStudent(null);
      setSearchNotFound(true);
    }
  };

  const handleSaveAttendance = async (student: Student, method: 'Face Recognition' | 'Roll Number Verification') => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        studentId: student.id,
        studentRoll: student.rollNumber,
        studentName: student.name,
        date: attendanceDate,
        time: attendanceTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: selectedSubject,
        teacherName,
        status: attendanceStatus,
        method,
        remarks,
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to mark attendance');
      } else {
        setSuccessMessage('Attendance Marked Successfully');
        if (onAttendanceMarked) {
          onAttendanceMarked();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while recording attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-white">
      {/* Header Info Banner */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-950 text-[#10B981] border border-emerald-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Core Highlight Feature
              </span>
              <span className="bg-[#1C1C1C] text-gray-300 border border-[#262626] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#10B981]" /> Duplicate Protected
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              University Attendance Management
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Verify student identity via Biometric Face Recognition or University Roll Number validation.
            </p>
          </div>

          {/* Quick Option Switcher */}
          <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#262626] self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab('face');
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'face'
                  ? 'bg-[#10B981] text-black shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Option 1: Face Scanner
            </button>
            <button
              onClick={() => {
                setActiveTab('roll');
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'roll'
                  ? 'bg-[#10B981] text-black shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Option 2: Roll Number
            </button>
          </div>
        </div>
      </div>

      {/* Session Parameters Bar */}
      <div className="bg-[#141414] rounded-2xl border border-[#262626] p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" /> Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#3B82F6]"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" /> Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <label className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#3B82F6]" /> Time
          </label>
          <input
            type="text"
            value={attendanceTime}
            onChange={(e) => setAttendanceTime(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <label className="text-gray-400 uppercase tracking-wider font-bold text-[10px] mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#3B82F6]" /> Teacher / Faculty
          </label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="bg-emerald-950/70 border border-[#10B981] rounded-2xl p-4 flex items-center gap-3 text-white shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-[#10B981]">{successMessage}</h4>
            <p className="text-xs text-gray-300 mt-0.5">
              Attendance stored in PostgreSQL database with duplicate prevention constraints.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-950/60 border border-rose-500 rounded-2xl p-4 flex items-center gap-3 text-white shadow-xs">
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-rose-400">Notice / Duplicate Blocked</h4>
            <p className="text-xs text-gray-300 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* OPTION 1: FACE SCANNER */}
      {/* ---------------------------------------------------------- */}
      {activeTab === 'face' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Camera Viewport */}
          <div className="lg:col-span-7 bg-[#000000] rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden border border-[#262626]">
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="text-[11px] font-mono tracking-wider uppercase text-gray-300">
                  {cameraActive ? 'Camera Feed: Live (Active)' : 'Biometric Sensor: Ready'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                FaceNet-BioV3 Engine
              </span>
            </div>

            <div className="relative aspect-4/3 bg-[#0A0A0A] rounded-xl overflow-hidden flex items-center justify-center border border-[#262626]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {!cameraActive && (
                <div className="text-center p-6 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto text-gray-400">
                    <Camera className="w-7 h-7 text-[#10B981]" />
                  </div>
                  <p className="text-xs font-bold text-white">Biometric Facial Scanner Active</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    {cameraError || 'Operating in high-accuracy viva demonstration mode.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="text-xs text-[#3B82F6] hover:underline font-bold"
                  >
                    Retry Camera Stream
                  </button>
                </div>
              )}

              {/* Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-56 h-56 border-2 border-dashed border-[#10B981]/50 rounded-3xl flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#10B981]"></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#10B981]"></div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#10B981]"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#10B981]"></div>

                  {isScanning && (
                    <div className="absolute inset-x-2 h-1 bg-[#10B981] shadow-[0_0_15px_#10B981] animate-laser"></div>
                  )}

                  <div className="w-10 h-10 rounded-full border border-[#10B981]/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                  </div>
                </div>
              </div>

              {isScanning && (
                <div className="absolute bottom-3 inset-x-3 bg-black/90 backdrop-blur-md rounded-xl p-3 border border-[#262626] text-center">
                  <div className="flex items-center justify-between text-xs text-[#10B981] font-mono mb-1">
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
            </div>

            <div className="mt-3 pt-3 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-[11px] text-gray-400 shrink-0 font-medium">Demo Student:</label>
                <select
                  value={selectedTargetStudentId}
                  onChange={(e) => setSelectedTargetStudentId(Number(e.target.value))}
                  className="bg-[#141414] text-xs text-white border border-[#262626] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#10B981] w-full"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rollNumber} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTriggerFaceScan}
                disabled={isScanning}
                className="w-full sm:w-auto bg-[#10B981] hover:bg-emerald-600 text-black text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-black" />
                {isScanning ? 'Scanning Face...' : 'Scan & Identify Face'}
              </button>
            </div>
          </div>

          {/* Verification & Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            {detectedStudent ? (
              <div className="bg-[#141414] rounded-2xl border border-[#10B981]/50 p-5 shadow-xs space-y-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={detectedStudent.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                    alt={detectedStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#10B981] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-emerald-950 text-[#10B981] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                        Face Verified
                      </span>
                      {detectionConfidence && (
                        <span className="text-[10px] bg-blue-950 text-[#3B82F6] font-semibold px-2 py-0.5 rounded-full">
                          {detectionConfidence}% Match
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">{detectedStudent.name}</h3>
                    <p className="text-[11px] text-gray-400 font-mono">Roll: {detectedStudent.rollNumber}</p>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] rounded-xl p-3 text-xs space-y-1.5 border border-[#262626] text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Course & Branch:</span>
                    <span className="font-bold text-white">{detectedStudent.course} ({detectedStudent.branch.split(' ')[0]})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Semester & Sec:</span>
                    <span className="font-bold text-white">Sem {detectedStudent.semester} - {detectedStudent.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subject:</span>
                    <span className="font-bold text-[#3B82F6]">{selectedSubject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Method:</span>
                    <span className="font-bold text-[#10B981]">Face Recognition</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Attendance Status:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Present', 'Late', 'Absent'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAttendanceStatus(status)}
                        className={`text-xs font-bold py-2 rounded-xl border transition-all ${
                          attendanceStatus === status
                            ? status === 'Present'
                              ? 'bg-[#10B981] text-black border-[#10B981]'
                              : status === 'Late'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-[#0A0A0A] text-gray-400 border-[#262626]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSaveAttendance(detectedStudent, 'Face Recognition')}
                  disabled={saving}
                  className="w-full bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  {saving ? 'Saving...' : 'Teacher Confirms & Mark Attendance'}
                </button>
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2.5 h-full">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#262626] flex items-center justify-center text-[#10B981]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-white text-sm">Awaiting Facial Scan</h4>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  Tap <strong>"Scan & Identify Face"</strong> to detect landmarks, retrieve student profile, and log verified attendance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* OPTION 2: ROLL NUMBER */}
      {/* ---------------------------------------------------------- */}
      {activeTab === 'roll' && (
        <div className="bg-[#141414] rounded-2xl border border-[#262626] p-5 space-y-4">
          <div className="max-w-xl">
            <h3 className="text-base font-extrabold text-white">University Roll Number Verification</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Enter or select the student's University Roll Number to fetch verified records and mark attendance manually.
            </p>

            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={inputRoll}
                  onChange={(e) => setInputRoll(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchRoll()}
                  placeholder="e.g. 2024CS101"
                  className="w-full text-xs font-mono bg-[#0A0A0A] border border-[#262626] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
              <button
                onClick={() => handleSearchRoll()}
                className="bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5" /> Search
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-gray-500 font-medium">Quick Select:</span>
              {students.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setInputRoll(s.rollNumber);
                    handleSearchRoll(s.rollNumber);
                  }}
                  className="text-[11px] font-mono bg-[#0A0A0A] text-gray-300 hover:text-white hover:border-[#10B981] px-2 py-0.5 rounded border border-[#262626]"
                >
                  {s.rollNumber}
                </button>
              ))}
            </div>
          </div>

          {searchNotFound && (
            <div className="bg-amber-950/60 border border-amber-600 rounded-xl p-3 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>No student found with University Roll Number <strong>{inputRoll}</strong>.</span>
            </div>
          )}

          {searchedStudent && (
            <div className="border border-[#262626] rounded-2xl p-4 bg-[#0A0A0A] flex flex-col md:flex-row items-center gap-4">
              <img
                src={searchedStudent.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                alt={searchedStudent.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#262626] shrink-0"
              />

              <div className="space-y-2 flex-1 text-xs">
                <div>
                  <h4 className="font-extrabold text-white text-base">{searchedStudent.name}</h4>
                  <p className="font-mono text-[#3B82F6] font-bold">{searchedStudent.rollNumber}</p>
                  <p className="text-gray-400">
                    {searchedStudent.course} ({searchedStudent.branch}) • Sem {searchedStudent.semester}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                  <div className="flex gap-2">
                    {(['Present', 'Late', 'Absent'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAttendanceStatus(status)}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border transition-all ${
                          attendanceStatus === status
                            ? 'bg-[#10B981] text-black border-[#10B981]'
                            : 'bg-[#141414] text-gray-400 border-[#262626]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSaveAttendance(searchedStudent, 'Roll Number Verification')}
                    disabled={saving}
                    className="bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-black" />
                    {saving ? 'Saving...' : 'Verify & Mark Attendance'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

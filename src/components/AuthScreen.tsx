import React from 'react';
import {
  GraduationCap,
  Shield,
  UserCheck,
  User,
  ArrowRight,
  Camera,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthScreen: React.FC = () => {
  const { loginAsRole, signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#262626] text-[#10B981] flex items-center justify-center mx-auto shadow-md mb-4">
          <GraduationCap className="w-9 h-9 text-[#10B981]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          University Student Management System
        </h1>
        <p className="mt-2 text-xs font-bold text-[#10B981] uppercase tracking-wider">
          Login / Authentication
        </p>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Select your portal role to access the mobile-first dashboard or authenticate via university Google SSO.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Student Role */}
          <div className="bg-[#141414] rounded-2xl border border-[#262626] hover:border-[#10B981] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="bg-emerald-950 text-[#10B981] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800/40">
                  Mobile Portal
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                Student Self-Service
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Student</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Personal dark mobile dashboard, Face Scan attendance, timetable, syllabus, fees, group chat, and voting.
              </p>

              <div className="mt-4 pt-4 border-t border-[#262626] space-y-1.5 text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> Smart Face Scanner Attendance
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> Timetable & Syllabus Topics
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> Campus Polls & Help Requests
                </div>
              </div>
            </div>

            <button
              onClick={() => loginAsRole('student')}
              className="mt-5 w-full bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Login as Student <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Teacher / Faculty Role */}
          <div className="bg-[#141414] rounded-2xl border border-[#262626] hover:border-[#3B82F6] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-800/40 text-[#3B82F6] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="bg-blue-950 text-[#3B82F6] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-800/40 flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Live Approvals
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                Academic Faculty
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Teacher / Faculty</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                In-lecture live attendance verification queue, marks entry, behavior evaluations, and student doubt help desk.
              </p>

              <div className="mt-4 pt-4 border-t border-[#262626] space-y-1.5 text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3B82F6]" /> Real-Time Face Scan Queue
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3B82F6]" /> Duplicate Protected Attendance
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3B82F6]" /> Marks, Grades & Conduct
                </div>
              </div>
            </div>

            <button
              onClick={() => loginAsRole('teacher')}
              className="mt-5 w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Login as Faculty <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Administrator Role */}
          <div className="bg-[#141414] rounded-2xl border border-[#262626] hover:border-[#8B5CF6] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-800/40 text-[#8B5CF6] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider">
                University Controller
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Administrator</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Global control over students, faculty, departments, courses, classes, circulars, grievances, and campus voting.
              </p>

              <div className="mt-4 pt-4 border-t border-[#262626] space-y-1.5 text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#8B5CF6]" /> Full Relational CRUD Operations
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#8B5CF6]" /> Global Attendance Audit Logs
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#8B5CF6]" /> Grievance Review & Campus Polls
                </div>
              </div>
            </div>

            <button
              onClick={() => loginAsRole('admin')}
              className="mt-5 w-full bg-[#8B5CF6] hover:bg-purple-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Login as Admin <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alternative Google Sign-In with Firebase Auth */}
        <div className="mt-8 pt-6 border-t border-[#262626] text-center">
          <p className="text-xs text-gray-400 mb-3 font-medium">
            Or authenticate with Google Workspace via Firebase:
          </p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-3 bg-[#141414] hover:bg-[#1C1C1C] text-white text-xs font-semibold py-2.5 px-6 rounded-xl border border-[#262626] shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign In with Google SSO (Firebase)
          </button>
        </div>
      </div>
    </div>
  );
};

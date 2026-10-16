import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { AuthScreen } from './components/AuthScreen.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { TeacherDashboard } from './components/TeacherDashboard.jsx';
import { StudentMobileApp } from './components/StudentMobileApp.jsx';
import { StudentDashboard } from './components/StudentDashboard.jsx';

function MainLayout() {
  const { isAuthenticated, role } = useAuth();
  const [studentViewMode, setStudentViewMode] = useState('mobile');
  const [, setStudentPortalTab] = useState('standard');

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <Navbar
        deviceMode={studentViewMode}
        onToggleDeviceMode={() =>
          setStudentViewMode((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'))
        }
      />

      <div className="flex-1 w-full flex flex-col items-center">
        {role === 'admin' && (
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <AdminDashboard />
          </div>
        )}

        {role === 'teacher' && (
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <TeacherDashboard />
          </div>
        )}

        {role === 'student' && (
          <>
            {studentViewMode === 'mobile' ? (
              <div className="w-full flex justify-center py-2 sm:py-6 bg-[#0A0A0A]">
                {/* Mobile Device Simulation Frame */}
                <div className="w-full max-w-[430px] min-h-[844px] bg-[#0A0A0A] border border-[#262626] sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
                  <StudentMobileApp
                    onOpenHelp={() => setStudentPortalTab('extra')}
                    onOpenComplaints={() => setStudentPortalTab('extra')}
                    onOpenVoting={() => setStudentPortalTab('extra')}
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex items-center justify-between bg-[#141414] border border-[#262626] p-3 rounded-2xl">
                  <span className="text-xs font-bold text-gray-300">
                    Student Mode: Desktop Expanded Roster
                  </span>
                  <button
                    onClick={() => setStudentViewMode('mobile')}
                    className="text-xs text-[#10B981] font-bold hover:underline"
                  >
                    Switch back to Mobile Layout
                  </button>
                </div>
                <StudentDashboard />
              </div>
            )}
          </>
        )}
      </div>

      <footer className="bg-[#000000] border-t border-[#262626] py-3 px-6 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-300">
          Apex University Student Management System
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          College Minor Project • Pure Dark Mode UI • Cloud SQL (PostgreSQL) • Face Scanner with Teacher Verification
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

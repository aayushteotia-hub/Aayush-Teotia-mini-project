import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  Shield,
  UserCheck,
  User,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { NotificationDrawer } from './NotificationDrawer.tsx';

interface NavbarProps {
  deviceMode?: 'mobile' | 'desktop';
  onToggleDeviceMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ deviceMode = 'mobile', onToggleDeviceMode }) => {
  const { user, role, loginAsRole, signOut } = useAuth();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const rollParam = user?.rollNumber ? `&roll=${user.rollNumber}` : '';
      const res = await fetch(`/api/notifications?role=${role}${rollParam}`);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 12000);
    return () => clearInterval(interval);
  }, [role, user]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#000000] border-b border-[#262626] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#262626] text-[#10B981] flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-sm sm:text-base leading-tight tracking-tight">
                  University Student Management System
                </h1>
                <p className="text-[10px] font-semibold text-[#10B981] hidden sm:block">
                  College Minor Project • Cloud SQL & React
                </p>
              </div>
            </div>

            {/* Center: Viva 1-Click Role Switcher */}
            <div className="hidden sm:flex items-center bg-[#141414] p-1 rounded-xl border border-[#262626]">
              <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Role:</span>
              <button
                onClick={() => loginAsRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  role === 'student'
                    ? 'bg-[#10B981] text-black shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-[#1C1C1C]'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Student
              </button>
              <button
                onClick={() => loginAsRole('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  role === 'teacher'
                    ? 'bg-[#3B82F6] text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-[#1C1C1C]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Faculty
              </button>
              <button
                onClick={() => loginAsRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  role === 'admin'
                    ? 'bg-[#8B5CF6] text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-[#1C1C1C]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            </div>

            {/* Right: Controls, Device Frame Toggle, & Profile */}
            <div className="flex items-center gap-2.5">
              {/* Optional Mobile Frame Toggle for Student screen */}
              {role === 'student' && onToggleDeviceMode && (
                <button
                  onClick={onToggleDeviceMode}
                  className="hidden md:flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] text-[11px] font-bold text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors"
                  title="Toggle Mobile Simulator vs Full Desktop width"
                >
                  {deviceMode === 'mobile' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Mobile Frame</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Desktop Frame</span>
                    </>
                  )}
                </button>
              )}

              {/* Notification Button */}
              <button
                onClick={() => setShowNotifDrawer(true)}
                className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#141414] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                )}
              </button>

              {/* User Persona Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#262626]">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      user?.name || 'User'
                    )}`
                  }
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#262626]"
                />
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-bold text-white leading-none">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5 font-medium">
                    {user?.role} {user?.rollNumber ? `• ${user.rollNumber}` : ''}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-[#141414] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={showNotifDrawer} onClose={() => setShowNotifDrawer(false)} />
    </>
  );
};

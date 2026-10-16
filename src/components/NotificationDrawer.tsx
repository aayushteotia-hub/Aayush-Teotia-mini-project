import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, FileText, MessageSquare, HelpCircle, AlertTriangle, Vote, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const rollParam = user?.rollNumber ? `&roll=${user.rollNumber}` : '';
      const res = await fetch(`/api/notifications?role=${role}${rollParam}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, role, user]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'notice':
        return <FileText className="w-4 h-4 text-[#3B82F6]" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-[#10B981]" />;
      case 'help':
        return <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />;
      case 'complaint':
        return <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
      case 'voting':
        return <Vote className="w-4 h-4 text-[#A855F7]" />;
      case 'attendance':
        return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-sm bg-[#000000] border-l border-[#262626] h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#000000]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-extrabold text-white text-base">Notifications</h3>
            <span className="text-[10px] bg-emerald-950 text-[#10B981] border border-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <CheckCheck className="w-8 h-8 mx-auto text-gray-600" />
              <p className="text-xs">You're all caught up! No unread alerts.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-[#0A0A0A] border-[#262626] text-gray-400'
                    : 'bg-[#141414] border-[#10B981]/40 text-white shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#262626] shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-bold text-white truncate">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
                      )}
                    </div>
                    <p className="text-gray-400 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-[#262626] bg-[#000000] flex items-center justify-between text-xs text-gray-500">
          <span>Role: {role.toUpperCase()}</span>
          <button
            onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
            className="text-[#10B981] hover:underline font-bold text-[11px]"
          >
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
};

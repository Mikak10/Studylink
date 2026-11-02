import React, { useState, useRef, useEffect } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  Star,
  XCircle,
  FileText,
  Check,
  Calendar,
  X,
} from 'lucide-react';

interface NotificationCenterProps {
  onSelectBooking?: (bookingId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectBooking }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentUser,
    activePersona,
  } = useStudyLinkData();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter notifications for active user (or all if in demo mode)
  const userNotifications = notifications.filter(n => {
    if (!currentUser) return true; // in guest mode show all prototype notifications
    return (
      n.recipientUserId === currentUser.id ||
      n.recipientUserId === currentUser.username ||
      n.recipientUserId === activePersona.id ||
      (activePersona.tutorProfileId && n.recipientUserId === activePersona.tutorProfileId)
    );
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) {
      markNotificationAsRead(n.id);
    }
    if (n.bookingId && onSelectBooking) {
      onSelectBooking(n.bookingId);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'BOOKING_REQUEST':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'SESSION_COMPLETED':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'BOOKING_CANCELLED':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'TUTOR_FEEDBACK':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'REVIEW_RECEIVED':
        return <Star className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
        title="Notification Center"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
          {/* Header */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full font-mono">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {userNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When a session is booked, approved, or reviewed, updates will appear here.
                </p>
              </div>
            ) : (
              userNotifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    item.read
                      ? 'bg-white hover:bg-slate-50 opacity-80'
                      : 'bg-emerald-50/50 hover:bg-emerald-50/80 font-medium'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-slate-900 truncate text-xs">
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.bookingId && (
                        <span className="text-emerald-700 font-semibold underline">
                          View Session Details →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
            LAU StudyLink Real-time Peer Notification System
          </div>
        </div>
      )}
    </div>
  );
};

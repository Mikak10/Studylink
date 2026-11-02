import React from 'react';
import { Booking } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';
import { X, User, Mail, GraduationCap, MapPin, Calendar, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

interface StudentProfileModalProps {
  booking: Booking | null;
  onClose: () => void;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  booking,
  onClose,
  onAccept,
  onDecline,
}) => {
  const { accounts, bookings } = useStudyLinkData();

  if (!booking) return null;

  // Find student account if registered
  const studentAccount = accounts.find(
    a => a.id === booking.studentId || a.username === booking.studentId || a.email === booking.studentEmail
  );

  // Past sessions history for this student
  const studentPastSessions = bookings.filter(
    b => (b.studentId === booking.studentId || b.studentEmail === booking.studentEmail) && b.id !== booking.id
  );
  const completedCount = studentPastSessions.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden shrink-0">
              {studentAccount?.avatarUrl ? (
                <img src={studentAccount.avatarUrl} alt={booking.studentName} className="w-full h-full object-cover" />
              ) : (
                <span>{booking.studentName[0]}</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {booking.studentName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {studentAccount?.username ? `@${studentAccount.username} · ` : ''}LAU Student
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Academic Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              Academic Profile
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Major: </strong>
                  {studentAccount?.major || booking.studentMajor || 'Undergraduate Degree Program'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Campus: </strong>
                  {studentAccount?.campus || booking.campus} Campus
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Email: </strong>
                  <a href={`mailto:${booking.studentEmail}`} className="text-emerald-800 hover:underline">
                    {booking.studentEmail}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Session Request Summary */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
              Requested Session Details
            </h4>
            <div className="space-y-1.5 text-emerald-950">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{booking.courseCode} — {booking.courseName}</span>
                <span className="px-2 py-0.5 bg-white text-emerald-800 rounded font-mono font-bold text-[10px] border border-emerald-200">
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  {booking.date}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  {booking.timeSlot}
                </span>
                <span className="font-medium text-slate-700">
                  {booking.format}
                </span>
              </div>
              {booking.studentNote && (
                <div className="mt-2 pt-2 border-t border-emerald-200/60 text-slate-700">
                  <strong className="block text-emerald-900 mb-0.5">Student Focus Notes:</strong>
                  <p className="italic bg-white/70 p-2 rounded border border-emerald-150">
                    &ldquo;{booking.studentNote}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Past Experience Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 font-medium">Completed LAU Peer Sessions:</span>
            </div>
            <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-white border border-slate-200 rounded">
              {completedCount} sessions
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        {booking.status === 'PENDING' && onAccept && onDecline ? (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
            <button
              onClick={() => {
                onDecline(booking.id);
                onClose();
              }}
              className="px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <XCircle className="w-4 h-4" />
              Decline Request
            </button>
            <button
              onClick={() => {
                onAccept(booking.id);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Session
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Booking } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  MessageSquare,
  Star,
  BookOpen,
  Send,
  FileText,
} from 'lucide-react';

interface SessionDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
  onOpenReviewModal?: (booking: Booking) => void;
  onViewStudentProfile?: (booking: Booking) => void;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  booking,
  onClose,
  onOpenReviewModal,
  onViewStudentProfile,
}) => {
  const {
    currentUser,
    activePersona,
    accounts,
    tutors,
    updateBookingStatus,
    cancelBooking,
    addTutorFeedback,
  } = useStudyLinkData();

  const [tutorNoteInput, setTutorNoteInput] = useState('');
  const [showTutorFeedbackForm, setShowTutorFeedbackForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!booking) return null;

  const isTutorViewing =
    activePersona.role === 'tutor' ||
    (currentUser && (currentUser.tutorProfileId === booking.tutorId || currentUser.name === booking.tutorName));

  const isStudentViewing = !isTutorViewing;

  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';
  const isCompleted = booking.status === 'COMPLETED';
  const isCancelled = booking.status === 'CANCELLED';

  const handleApprove = () => {
    updateBookingStatus(booking.id, 'CONFIRMED');
    onClose();
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      setShowDeclineInput(true);
      return;
    }
    updateBookingStatus(booking.id, 'CANCELLED', declineReason.trim());
    onClose();
  };

  const handleMarkCompleted = () => {
    updateBookingStatus(booking.id, 'COMPLETED');
  };

  const handleSaveTutorFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (tutorNoteInput.trim()) {
      addTutorFeedback(booking.id, tutorNoteInput.trim());
      setShowTutorFeedbackForm(false);
    }
  };

  const handleCancelRequest = () => {
    cancelBooking(booking.id, 'Cancelled by student');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-emerald-800 text-sm bg-emerald-100 px-2 py-0.5 rounded">
                {booking.courseCode}
              </span>
              <span className="text-base font-bold text-slate-900 leading-tight">
                {booking.courseName}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Peer Tutoring Session Details & Status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Status Timeline Banner */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2">
              {isPending && <Clock className="w-5 h-5 text-amber-500 shrink-0" />}
              {isConfirmed && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isCompleted && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
              {isCancelled && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {isPending && 'Status: Pending Tutor Approval'}
                  {isConfirmed && 'Status: Confirmed & Scheduled'}
                  {isCompleted && 'Status: Successfully Completed'}
                  {isCancelled && 'Status: Session Cancelled / Declined'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isPending && 'Tutor has been notified and needs to accept or decline.'}
                  {isConfirmed && 'Both student and tutor have locked this time slot.'}
                  {isCompleted && 'Session concluded. Check tutor notes and ratings below.'}
                  {isCancelled && (booking.declineReason ? `Reason: ${booking.declineReason}` : 'Booking was cancelled.')}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isConfirmed
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPending
                  ? 'bg-amber-100 text-amber-800'
                  : isCompleted
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {booking.status}
            </span>
          </div>

          {/* Time & Place Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <span className="font-semibold text-slate-900 text-xs">{booking.date}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Slot</span>
                <span className="font-mono font-semibold text-slate-900 text-xs">{booking.timeSlot}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:col-span-2 pt-2 border-t border-slate-200/60">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Location ({booking.campus} Campus · {booking.format})
                </span>
                <span className="font-medium text-slate-800 text-xs">{booking.locationDetails}</span>
              </div>
            </div>
          </div>

          {/* Participants: Student & Tutor Cards */}
          {(() => {
            const studentAccount = accounts.find(
              a => a.id === booking.studentId || a.username === booking.studentId || a.email === booking.studentEmail
            );
            const assignedTutor = tutors.find(t => t.id === booking.tutorId);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Student Requesting
                    </span>
                    {onViewStudentProfile && (
                      <button
                        onClick={() => onViewStudentProfile(booking)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {studentAccount?.avatarUrl ? (
                        <img src={studentAccount.avatarUrl} alt={booking.studentName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{booking.studentName[0]}</span>
                      )}
                    </div>
                    <span>{booking.studentName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{booking.studentEmail}</p>
                  {booking.studentMajor && (
                    <span className="inline-block text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {booking.studentMajor}
                    </span>
                  )}
                </div>

                {/* Tutor Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Tutor
                  </span>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {assignedTutor?.avatarUrl ? (
                        <img src={assignedTutor.avatarUrl} alt={booking.tutorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{booking.tutorName[0]}</span>
                      )}
                    </div>
                    <span>{booking.tutorName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">LAU Peer Tutor</p>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold border border-emerald-200">
                    Peer Tutoring Verified
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Student Focus Topics */}
          {booking.studentNote && (
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Student&apos;s Focus Questions & Notes
              </span>
              <p className="text-amber-950 italic">
                &ldquo;{booking.studentNote}&rdquo;
              </p>
            </div>
          )}

          {/* Tutor Study Feedback & Wrap-up Notes */}
          {booking.tutorFeedback && (
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  Tutor&apos;s Study Notes & Recommendations
                </span>
                {booking.tutorFeedbackDate && (
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {booking.tutorFeedbackDate}
                  </span>
                )}
              </div>
              <p className="text-emerald-950 font-normal leading-relaxed">
                {booking.tutorFeedback}
              </p>
            </div>
          )}

          {/* Tutor Feedback Form (available if Tutor and session confirmed/completed) */}
          {isTutorViewing && (isConfirmed || isCompleted) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  {booking.tutorFeedback ? 'Update Session Study Notes' : 'Leave Study Feedback for Student'}
                </span>
                {!showTutorFeedbackForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setTutorNoteInput(booking.tutorFeedback || '');
                      setShowTutorFeedbackForm(true);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    {booking.tutorFeedback ? 'Edit Notes' : '+ Add Study Notes'}
                  </button>
                )}
              </div>

              {showTutorFeedbackForm && (
                <form onSubmit={handleSaveTutorFeedback} className="space-y-2 pt-1">
                  <textarea
                    value={tutorNoteInput}
                    onChange={e => setTutorNoteInput(e.target.value)}
                    placeholder="Write key concepts reviewed, problem sets solved, or recommendations for the student's next exam..."
                    rows={3}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTutorFeedbackForm(false)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Save Notes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Decline Reason Input if active */}
          {showDeclineInput && (
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold text-rose-950 text-xs">
                  Are you sure you want to decline this session request?
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                The student ({booking.studentName}) will be notified and this reserved slot will be released back to the directory.
              </p>
              <label className="block font-semibold text-rose-900 text-[11px]">
                Reason for Declining (Optional):
              </label>
              <input
                type="text"
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                placeholder="e.g. Schedule conflict with midterm exam..."
                className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeclineInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="px-3.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Yes, Decline Request
                </button>
              </div>
            </div>
          )}

          {showCancelConfirm && (
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold text-rose-950 text-xs">
                  Are you sure you want to cancel this booking request?
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Your request to study with {booking.tutorName} will be withdrawn and the slot released.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  onClick={handleCancelRequest}
                  className="px-3.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Yes, Cancel Request
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div>
            {onViewStudentProfile && (
              <button
                type="button"
                onClick={() => onViewStudentProfile(booking)}
                className="px-3 py-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                Student Profile
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tutor Actions */}
            {isTutorViewing && isPending && (
              <>
                {!showDeclineInput && (
                  <button
                    onClick={() => setShowDeclineInput(true)}
                    className="px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                )}
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Session
                </button>
              </>
            )}

            {isTutorViewing && isConfirmed && (
              <button
                onClick={handleMarkCompleted}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Completed
              </button>
            )}

            {/* Student Actions */}
            {isStudentViewing && isPending && (
              <>
                {!showCancelConfirm && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Request
                  </button>
                )}
              </>
            )}

            {isStudentViewing && isCompleted && !booking.reviewSubmitted && onOpenReviewModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReviewModal(booking);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Star className="w-4 h-4" />
                Leave Feedback & Rating
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

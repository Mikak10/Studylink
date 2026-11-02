import React, { useState } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { Booking } from '../../types';
import { CalendarView } from '../common/CalendarView';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  ArrowRight,
  AlertTriangle,
  X,
  List,
  Calendar as CalendarIcon,
  User,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface MySessionsViewProps {
  onBrowseTutors: () => void;
  onOpenReviewModal: (booking: Booking) => void;
  onSelectBookingDetails: (booking: Booking) => void;
}

export const MySessionsView: React.FC<MySessionsViewProps> = ({
  onBrowseTutors,
  onOpenReviewModal,
  onSelectBookingDetails,
}) => {
  const {
    activePersona,
    currentUser,
    bookings,
    cancelBooking,
    openAuthModal,
  } = useStudyLinkData();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'completed' | 'cancelled'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TUTOR'>('ALL');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const isTutorUser =
    activePersona.role === 'tutor' ||
    Boolean(activePersona.tutorProfileId) ||
    Boolean(currentUser?.tutorProfileId);

  // Filter bookings for active user:
  // If user is a tutor, show both sessions where they tutor AND where they study!
  const userBookings = bookings.filter(b => {
    const isStudent =
      b.studentId === activePersona.id ||
      (currentUser && b.studentEmail === currentUser.email) ||
      (activePersona.name && b.studentName.toLowerCase() === activePersona.name.toLowerCase());

    const isTutor =
      (activePersona.tutorProfileId && b.tutorId === activePersona.tutorProfileId) ||
      (currentUser && (currentUser.tutorProfileId === b.tutorId || currentUser.name === b.tutorName)) ||
      (activePersona.name && b.tutorName.toLowerCase() === activePersona.name.toLowerCase());

    if (!isStudent && !isTutor) return false;

    if (roleFilter === 'STUDENT' && !isStudent) return false;
    if (roleFilter === 'TUTOR' && !isTutor) return false;

    return true;
  });

  const upcomingBookings = userBookings.filter(b => b.status === 'CONFIRMED');
  const pendingBookings = userBookings.filter(b => b.status === 'PENDING');
  const completedBookings = userBookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = userBookings.filter(b => b.status === 'CANCELLED');

  const currentList =
    activeTab === 'upcoming'
      ? upcomingBookings
      : activeTab === 'pending'
      ? pendingBookings
      : activeTab === 'completed'
      ? completedBookings
      : cancelledBookings;

  const handleConfirmCancel = () => {
    if (cancellingBookingId) {
      cancelBooking(cancellingBookingId, 'Cancelled by student');
      setCancellingBookingId(null);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                My Tutoring Sessions
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {activePersona.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Peer tutoring schedule, requests, and study notes for{' '}
              <strong className="text-slate-800">{activePersona.name}</strong>
              {currentUser?.username && <span className="font-mono"> (@{currentUser.username})</span>}
              {' '}· {activePersona.major}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: List vs Calendar */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar View
              </button>
            </div>

            <button
              onClick={onBrowseTutors}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
            >
              Book Another Session
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Guest Banner if not logged in */}
        {!currentUser && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-900 leading-relaxed">
                You are currently browsing as <strong>Guest</strong>. Sign in or register to link all your tutoring sessions to your personal student account.
              </span>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shrink-0 cursor-pointer shadow-xs"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* VIEW 1: CALENDAR VIEW */}
        {viewMode === 'calendar' ? (
          <div className="space-y-4">
            <CalendarView
              bookings={userBookings}
              onSelectBooking={booking => onSelectBookingDetails(booking)}
              roleContext={activePersona.role === 'tutor' ? 'tutor' : 'student'}
            />
          </div>
        ) : (
          /* VIEW 2: LIST VIEW */
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-white border-x border-t border-slate-200 text-emerald-800 font-bold shadow-xs -mb-px'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Upcoming Confirmed
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[11px] font-bold">
                  {upcomingBookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-white border-x border-t border-slate-200 text-emerald-800 font-bold shadow-xs -mb-px'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Pending Approval
                {pendingBookings.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-mono text-[11px] font-bold">
                    {pendingBookings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-white border-x border-t border-slate-200 text-emerald-800 font-bold shadow-xs -mb-px'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Completed & Feedback
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-full font-mono text-[11px] font-bold">
                  {completedBookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cancelled')}
                className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === 'cancelled'
                    ? 'bg-white border-x border-t border-slate-200 text-emerald-800 font-bold shadow-xs -mb-px'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                Cancelled
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full font-mono text-[11px] font-bold">
                  {cancelledBookings.length}
                </span>
              </button>
            </div>

            {/* Optional Dual Role Filter (Student vs Tutor) for student-tutors */}
            {isTutorUser && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold mb-4">
                <span className="text-slate-500 px-2 text-[11px]">Role:</span>
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    roleFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All My Sessions
                </button>
                <button
                  onClick={() => setRoleFilter('STUDENT')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    roleFilter === 'STUDENT'
                      ? 'bg-blue-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Studying (As Student)
                </button>
                <button
                  onClick={() => setRoleFilter('TUTOR')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    roleFilter === 'TUTOR'
                      ? 'bg-amber-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tutoring (As Tutor)
                </button>
              </div>
            )}

            {/* Bookings List */}
            {currentList.length > 0 ? (
              <div className="space-y-4">
                {currentList.map(booking => {
                  const isConfirmed = booking.status === 'CONFIRMED';
                  const isPending = booking.status === 'PENDING';
                  const isCompleted = booking.status === 'COMPLETED';
                  const isCancelled = booking.status === 'CANCELLED';

                  const isStudentRole =
                    booking.studentId === activePersona.id ||
                    (currentUser && booking.studentEmail === currentUser.email) ||
                    (activePersona.name && booking.studentName.toLowerCase() === activePersona.name.toLowerCase());

                  const isTutorRole =
                    (activePersona.tutorProfileId && booking.tutorId === activePersona.tutorProfileId) ||
                    (currentUser && (currentUser.tutorProfileId === booking.tutorId || currentUser.name === booking.tutorName)) ||
                    (activePersona.name && booking.tutorName.toLowerCase() === activePersona.name.toLowerCase());

                  return (
                    <div
                      key={booking.id}
                      onClick={() => onSelectBookingDetails(booking)}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Course & Status Badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {booking.courseCode} — {booking.courseName}
                          </span>

                          {isTutorUser && isStudentRole && (
                            <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Attending as Student
                            </span>
                          )}

                          {isTutorUser && isTutorRole && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Teaching as Tutor
                            </span>
                          )}

                          {isConfirmed && (
                            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirmed Session
                            </span>
                          )}

                          {isPending && (
                            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting Tutor Approval
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-xs bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                              Completed Session
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Cancelled / Declined
                            </span>
                          )}
                        </div>

                        {/* People & Schedule Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-slate-600 mb-3">
                          {/* Student requesting info */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Student:</span>
                            <strong className="text-slate-800">{booking.studentName}</strong>
                            {booking.studentMajor && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                ({booking.studentMajor.split(' ')[0]})
                              </span>
                            )}
                          </div>

                          {/* Tutor info */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Tutor:</span>
                            <strong className="text-slate-800">{booking.tutorName}</strong>
                          </div>

                          {/* Date and Time */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="font-semibold text-slate-800">{booking.date}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-slate-600">{booking.timeSlot}</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{booking.locationDetails}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-500 font-medium">{booking.format}</span>
                          </div>
                        </div>

                        {/* Student focus note */}
                        {booking.studentNote && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-600 mb-2">
                            <strong className="text-slate-700 font-medium">Student Focus: </strong>
                            &ldquo;{booking.studentNote}&rdquo;
                          </div>
                        )}

                        {/* Tutor study feedback if present */}
                        {booking.tutorFeedback && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold text-emerald-900 block">Tutor Study Notes:</strong>
                              <span>{booking.tutorFeedback}</span>
                            </div>
                          </div>
                        )}

                        {/* Decline reason if cancelled */}
                        {isCancelled && booking.declineReason && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                            <strong>Reason: </strong>
                            {booking.declineReason}
                          </div>
                        )}
                      </div>

                      {/* Right action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectBookingDetails(booking);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {isPending && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setCancellingBookingId(booking.id);
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        )}

                        {isCompleted && !booking.reviewSubmitted && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onOpenReviewModal(booking);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Leave Review
                          </button>
                        )}

                        {isCompleted && booking.reviewSubmitted && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No {activeTab} tutoring sessions
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                  {activeTab === 'pending'
                    ? 'You have no session requests pending tutor approval.'
                    : activeTab === 'upcoming'
                    ? 'No confirmed upcoming sessions scheduled yet.'
                    : activeTab === 'completed'
                    ? 'No past completed tutoring sessions recorded.'
                    : 'No cancelled sessions.'}
                </p>
                <button
                  onClick={onBrowseTutors}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  Find a Peer Tutor
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Student Cancellation */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Cancel Session Request?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to cancel this pending booking request? Your tutor will be notified and the slot will be released.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Keep Request
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Yes, Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { Booking, AvailabilitySlot, SessionFormat } from '../../types';
import { CalendarView } from '../common/CalendarView';
import { BrandMark } from '../common/BrandLogo';
import {
  Check,
  X,
  Clock,
  Calendar,
  Users,
  Star,
  DollarSign,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  User,
  MessageSquare,
  FileText,
  List,
  Calendar as CalendarIcon,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { STANDARD_TUTORING_TIME_SLOTS } from './TutorRegistrationModal';

interface TutorDashboardProps {
  onOpenEditProfile: () => void;
  onBrowseTutors: () => void;
  onViewStudentProfile?: (booking: Booking) => void;
  onSelectBookingDetails?: (booking: Booking) => void;
  onOpenRegisterModal?: () => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  onOpenEditProfile,
  onBrowseTutors,
  onViewStudentProfile,
  onSelectBookingDetails,
  onOpenRegisterModal,
}) => {
  const {
    activePersona,
    currentUser,
    setActivePersonaId,
    tutors,
    bookings,
    updateBookingStatus,
    updateTutorProfile,
    addTutorFeedback,
  } = useStudyLinkData();

  // Determine if active user is legitimately a tutor
  const isTutorUser = currentUser?.role === 'tutor';

  // Find tutor profile matching currentUser
  const tutorProfile = isTutorUser
    ? (currentUser?.tutorProfileId ? tutors.find(t => t.id === currentUser.tutorProfileId) : null) ||
      (currentUser?.email ? tutors.find(t => t.email.toLowerCase() === currentUser.email.toLowerCase()) : null) ||
      (currentUser?.id === 'nour' || currentUser?.username === 'nour' ? tutors.find(t => t.id === 'tutor-nour') : null) ||
      (currentUser?.id === 'karim' || currentUser?.username === 'karim' ? tutors.find(t => t.id === 'tutor-karim') : null) ||
      tutors[0]
    : null;

  // View mode for sessions: list vs calendar
  const [sessionsViewMode, setSessionsViewMode] = useState<'list' | 'calendar'>('list');

  // Decline modal state
  const [decliningBookingId, setDecliningBookingId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Study feedback modal state
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Availability slot deletion confirmation state
  const [slotToDelete, setSlotToDelete] = useState<AvailabilitySlot | null>(null);

  // Inline slot addition state
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newDay, setNewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [newTime, setNewTime] = useState('14:00 - 15:00');
  const [newFormat, setNewFormat] = useState<SessionFormat>('In-Person');
  const [newLocation, setNewLocation] = useState('Riyad Nassar Library, Beirut');

  // If viewing without tutor role, show clean access barrier
  if (!isTutorUser || !tutorProfile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Peer Tutor Access Only</h2>
        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          This dashboard is reserved for verified LAU Peer Tutors to set their weekly availability slots, accept or decline session requests, and submit post-session feedback.
        </p>
        <div className="flex items-center justify-center gap-2.5">
          {currentUser?.role === 'student' && onOpenRegisterModal && (
            <button
              onClick={() => onOpenRegisterModal?.()}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
            >
              Apply to Become a Tutor
            </button>
          )}
          <button
            onClick={onBrowseTutors}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
          >
            Browse Peer Tutors
          </button>
        </div>
      </div>
    );
  }

  const tutorBookings = bookings.filter(b => b.tutorId === tutorProfile?.id);
  const pendingRequests = tutorBookings.filter(b => b.status === 'PENDING');
  const confirmedSessions = tutorBookings.filter(b => b.status === 'CONFIRMED');
  const completedSessions = tutorBookings.filter(b => b.status === 'COMPLETED');

  const handleAcceptRequest = (booking: Booking) => {
    updateBookingStatus(booking.id, 'CONFIRMED');
  };

  const handleConfirmDecline = () => {
    if (decliningBookingId) {
      updateBookingStatus(
        decliningBookingId,
        'CANCELLED',
        declineReason.trim() || 'Tutor has an unavoidable scheduling conflict.'
      );
      setDecliningBookingId(null);
      setDeclineReason('');
    }
  };

  const handleMarkCompleted = (booking: Booking) => {
    updateBookingStatus(booking.id, 'COMPLETED');
    // Prompt tutor to optionally leave study notes right away
    setFeedbackBooking(booking);
    setFeedbackInput(booking.tutorFeedback || '');
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackBooking && feedbackInput.trim()) {
      addTutorFeedback(feedbackBooking.id, feedbackInput.trim());
      setFeedbackBooking(null);
      setFeedbackInput('');
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: newDay,
      timeSlot: newTime,
      format: newFormat,
      location: newLocation,
    };
    updateTutorProfile(tutorProfile.id, {
      availability: [...tutorProfile.availability, newSlot],
    });
    setShowAddSlot(false);
  };

  const handleDeleteSlot = (slotId: string) => {
    updateTutorProfile(tutorProfile.id, {
      availability: tutorProfile.availability.filter(s => s.id !== slotId),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {tutorProfile.avatarUrl ? (
              <img
                src={tutorProfile.avatarUrl}
                alt={tutorProfile.fullName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-bold text-2xl flex items-center justify-center shrink-0 border border-emerald-200">
                {tutorProfile.fullName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {tutorProfile.fullName}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  <BrandMark className="w-3.5 h-3 shrink-0" />
                  Verified LAU Tutor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {tutorProfile.major} · {tutorProfile.academicYear} · {tutorProfile.campus} Campus
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                <span>
                  Rate: <strong>{tutorProfile.hourlyRate === 0 ? 'Free Peer Volunteer' : `$${tutorProfile.hourlyRate}/hr`}</strong>
                </span>
                <span>·</span>
                <span>
                  Email: <strong className="text-slate-800">{tutorProfile.email}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenEditProfile}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Edit Profile
            </button>
            <button
              onClick={onBrowseTutors}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              Browse Directory
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <span className="block text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Pending Requests
            </span>
            <span className="text-2xl font-bold text-amber-950 font-mono tabular-nums">
              {pendingRequests.length}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <span className="block text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Upcoming Sessions
            </span>
            <span className="text-2xl font-bold text-emerald-950 font-mono tabular-nums">
              {confirmedSessions.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Completed Hours
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {completedSessions.length + tutorProfile.totalSessionsCompleted}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {tutorProfile.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                ({tutorProfile.totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Student-Tutor Dual Role Notice & Quick Action */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-emerald-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 leading-tight">
                Also Studying at LAU? Request Peer Tutoring in Other Courses
              </h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                As an LAU peer tutor, you remain an enrolled student and can book 1-on-1 sessions with other peer tutors whenever you need academic assistance (self-booking is prevented).
              </p>
            </div>
          </div>
          <button
            onClick={onBrowseTutors}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            Find a Peer Tutor
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Decline Reason Modal with Are You Sure Confirmation */}
      {decliningBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Are you sure you want to decline this request?
            </h3>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Declining will notify the student that you cannot host this session and the reserved slot will be released. You can optionally share a reason or suggest an alternate time below.
            </p>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Reason for student (optional):
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="e.g. Schedule conflict with a midterm exam, please book my Thursday slot..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 mb-4 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDecliningBookingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Yes, Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutor Study Notes / Feedback Modal */}
      {feedbackBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Session Study Notes & Recommendations
                </h3>
              </div>
              <button
                onClick={() => setFeedbackBooking(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Leave study advice and recommendations for <strong className="text-slate-800">{feedbackBooking.studentName}</strong> for{' '}
              <strong className="text-slate-800">{feedbackBooking.courseCode}</strong>.
            </p>
            <form onSubmit={handleSaveFeedback} className="space-y-3">
              <textarea
                rows={4}
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                placeholder="e.g. Mastered multivariable chain rule; recommended completing exercises 20-35 in Stewart Calculus before the midterm..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackBooking(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Save Study Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 1: INCOMING BOOKING REQUESTS (WITH STUDENT PROFILE INSPECTION) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Incoming Booking Requests
            </h2>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold text-xs rounded-full">
                {pendingRequests.length} action required
              </span>
            )}
          </div>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div
                key={request.id}
                className="bg-white rounded-xl border-2 border-amber-300/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                      New Request
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {request.studentName}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {request.studentEmail}
                    </span>
                    {request.studentMajor && (
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        {request.studentMajor}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-slate-600 mb-2">
                    <div>
                      <strong className="text-slate-700">Course: </strong>
                      {request.courseCode} — {request.courseName}
                    </div>
                    <div>
                      <strong className="text-slate-700">Time: </strong>
                      {request.date} ({request.timeSlot})
                    </div>
                    <div className="sm:col-span-2">
                      <strong className="text-slate-700">Location: </strong>
                      {request.locationDetails} ({request.format})
                    </div>
                  </div>

                  {request.studentNote && (
                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-150 text-xs text-amber-900">
                      <strong>Student Note: </strong>
                      &ldquo;{request.studentNote}&rdquo;
                    </div>
                  )}
                </div>

                {/* Action Buttons: View Profile, View Details, Accept, Decline */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {onViewStudentProfile && (
                    <button
                      onClick={() => onViewStudentProfile(request)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Inspect student academic profile before approving"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      View Student Profile
                    </button>
                  )}

                  {onSelectBookingDetails && (
                    <button
                      onClick={() => onSelectBookingDetails(request)}
                      className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  )}

                  <button
                    onClick={() => setDecliningBookingId(request.id)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>

                  <button
                    onClick={() => handleAcceptRequest(request)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <strong className="block font-bold text-slate-800 text-sm mb-1">
              All Caught Up!
            </strong>
            No pending booking requests awaiting your review right now.
          </div>
        )}
      </section>

      {/* SECTION 2: UPCOMING TUTORING SESSIONS (LIST & CALENDAR TOGGLE) */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Upcoming Tutoring Schedule ({confirmedSessions.length} confirmed)
          </h2>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setSessionsViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sessionsViewMode === 'list'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>
            <button
              onClick={() => setSessionsViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sessionsViewMode === 'calendar'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>
        </div>

        {sessionsViewMode === 'calendar' ? (
          <CalendarView
            bookings={tutorBookings}
            onSelectBooking={booking => onSelectBookingDetails && onSelectBookingDetails(booking)}
            roleContext="tutor"
          />
        ) : confirmedSessions.length > 0 ? (
          <div className="space-y-3">
            {confirmedSessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed
                    </span>
                    <strong className="text-sm text-slate-900">
                      {session.courseCode} with {session.studentName}
                    </strong>
                    {session.studentMajor && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({session.studentMajor})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{session.date}</span>
                    <span>·</span>
                    <span className="font-mono">{session.timeSlot}</span>
                    <span>·</span>
                    <span>{session.locationDetails}</span>
                  </div>

                  {session.tutorFeedback && (
                    <div className="mt-2 p-2 bg-emerald-50/70 rounded border border-emerald-200 text-xs text-emerald-950">
                      <strong className="text-emerald-900">Study Notes: </strong>
                      {session.tutorFeedback}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {onViewStudentProfile && (
                    <button
                      onClick={() => onViewStudentProfile(session)}
                      className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-medium cursor-pointer"
                    >
                      Student Profile
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setFeedbackBooking(session);
                      setFeedbackInput(session.tutorFeedback || '');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {session.tutorFeedback ? 'Edit Study Notes' : 'Study Notes'}
                  </button>

                  <button
                    onClick={() => handleMarkCompleted(session)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            No confirmed sessions scheduled yet.
          </div>
        )}
      </section>

      {/* SECTION 3: AVAILABILITY & TIME SLOTS MANAGER */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Weekly Tutoring Availability Slots
            </h2>
            <p className="text-xs text-slate-500">
              Students can book sessions during any of your active weekly time slots.
            </p>
          </div>

          <button
            onClick={() => setShowAddSlot(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddSlot ? 'Cancel' : 'Add Slot'}
          </button>
        </div>

        {/* Add Slot Form */}
        {showAddSlot && (
          <form onSubmit={handleAddSlot} className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs space-y-3">
            <h3 className="font-bold text-slate-800">Add New Weekly Slot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Day of Week</label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Time Slot</label>
                <select
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg cursor-pointer font-mono font-semibold text-emerald-900"
                >
                  {STANDARD_TUTORING_TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Format</label>
                <select
                  value={newFormat}
                  onChange={e => setNewFormat(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="In-Person">In-Person</option>
                  <option value="Online">Online MS Teams</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Location / Details</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g. Beirut Library Level 3"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSlot(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
              >
                Add Availability
              </button>
            </div>
          </form>
        )}

        {/* Existing Slots List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tutorProfile.availability.map(slot => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{slot.dayOfWeek}</span>
                  <span className="font-mono text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {slot.timeSlot}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {slot.format} · {slot.location}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSlotToDelete(slot)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Remove slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Remove Slot Confirmation Modal */}
      {slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Are you sure you want to remove this availability slot?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to remove <strong>{slotToDelete.dayOfWeek} ({slotToDelete.timeSlot})</strong>? Students will no longer be able to request tutoring sessions during this recurring slot.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Keep Slot
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteSlot(slotToDelete.id);
                  setSlotToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Yes, Remove Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

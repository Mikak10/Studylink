import React from 'react';
import { TutorProfile } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';
import { BrandMark } from '../common/BrandLogo';
import { X, Star, MapPin, Calendar, Clock, CheckCircle2, BookOpen, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

interface TutorProfileModalProps {
  tutor: TutorProfile | null;
  onClose: () => void;
  onRequestBooking: (tutor: TutorProfile) => void;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({
  tutor,
  onClose,
  onRequestBooking,
}) => {
  const { getReviewsForTutor, currentUser, activePersona } = useStudyLinkData();

  if (!tutor) return null;

  const isSelf = Boolean(
    (currentUser?.tutorProfileId && currentUser.tutorProfileId === tutor.id) ||
    (activePersona.tutorProfileId && activePersona.tutorProfileId === tutor.id) ||
    (currentUser?.email && tutor.email && currentUser.email.toLowerCase() === tutor.email.toLowerCase()) ||
    (activePersona.email && tutor.email && activePersona.email.toLowerCase() === tutor.email.toLowerCase()) ||
    (currentUser?.name && tutor.fullName && currentUser.name.toLowerCase() === tutor.fullName.toLowerCase()) ||
    activePersona.id === tutor.id
  );

  const tutorReviews = getReviewsForTutor(tutor.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-start gap-4">
            {tutor.avatarUrl ? (
              <img
                src={tutor.avatarUrl}
                alt={tutor.fullName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-bold text-2xl flex items-center justify-center shrink-0 border border-emerald-200">
                {tutor.fullName[0]}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{tutor.fullName}</h2>
                {isSelf && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    You (Your Profile)
                  </span>
                )}
                {tutor.isPeerCertified && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <BrandMark className="w-3.5 h-3 shrink-0" />
                    Verified Peer Tutor
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{tutor.academicYear}</span>
                <span aria-hidden="true">·</span>
                <span>{tutor.major}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  {tutor.campus === 'Both' ? 'Beirut & Byblos' : `${tutor.campus} Campus`}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs mt-2">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-mono tabular-nums">{tutor.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({tutorReviews.length} reviews)</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-mono tabular-nums">
                  {tutor.totalSessionsCompleted} completed sessions
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {tutor.hourlyRate === 0 ? 'Free Volunteer' : `$${tutor.hourlyRate}/hr`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Self Profile Notice */}
          {isSelf && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-xs text-amber-950">This is Your Peer Tutor Profile</strong>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  As an LAU tutor, you cannot book a tutoring session with yourself. You can freely explore the directory to book sessions with other peer tutors for courses you want help with.
                </p>
              </div>
            </div>
          )}

          {/* About Bio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              About the Tutor
            </h4>
            <p className="text-slate-700 leading-relaxed text-sm">
              {tutor.bio}
            </p>
          </div>

          {/* Courses & Verified Grades */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Supported Courses & Grades Achieved
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tutor.courses.map(course => (
                <div
                  key={course.courseId}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{course.courseCode}</span>
                    <span className="text-slate-600 text-[11px] block">{course.courseName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">LAU Grade</span>
                    <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {course.gradeAchieved}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Schedule */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              Regular Weekly Availability
            </h4>
            <div className="space-y-1.5">
              {tutor.availability.map(slot => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-800 w-24">{slot.dayOfWeek}</span>
                    <span className="font-mono text-slate-600 tabular-nums">{slot.timeSlot}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-2">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      {slot.format}
                    </span>
                    {slot.location && <span className="hidden sm:inline">({slot.location})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                Verified Student Reviews ({tutorReviews.length})
              </h4>
            </div>

            {tutorReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">
                No reviews recorded yet. Be the first to book and share feedback!
              </p>
            ) : (
              <div className="space-y-3">
                {tutorReviews.map(review => (
                  <div
                    key={review.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{review.studentName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          for {review.courseCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic mb-1">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <span className="text-[10px] text-slate-400 block text-right font-mono">
                      {review.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>LAU Academic Integrity Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            {!currentUser ? (
              <button
                disabled
                className="px-5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed opacity-80"
                title="Please sign in with your student account to book a tutoring session"
              >
                Sign in to Book Slot
              </button>
            ) : isSelf ? (
              <button
                disabled
                className="px-5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                title="You cannot book a tutoring session with yourself."
              >
                Cannot Book Yourself (Your Profile)
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRequestBooking(tutor);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Request Tutoring Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

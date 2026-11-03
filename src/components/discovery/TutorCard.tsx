import React from 'react';
import { TutorProfile } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';
import { BrandMark } from '../common/BrandLogo';
import { Star, MapPin, Clock, CheckCircle2, ChevronRight, MessageSquareQuote } from 'lucide-react';

interface TutorCardProps {
  tutor: TutorProfile;
  onViewProfile: (tutor: TutorProfile) => void;
  onRequestBooking: (tutor: TutorProfile) => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  onViewProfile,
  onRequestBooking,
}) => {
  const { getReviewsForTutor, currentUser, activePersona } = useStudyLinkData();
  const tutorReviews = getReviewsForTutor(tutor.id);
  const latestReview = tutorReviews[0];

  const isSelf = Boolean(
    (currentUser?.tutorProfileId && currentUser.tutorProfileId === tutor.id) ||
    (activePersona.tutorProfileId && activePersona.tutorProfileId === tutor.id) ||
    (currentUser?.email && tutor.email && currentUser.email.toLowerCase() === tutor.email.toLowerCase()) ||
    (activePersona.email && tutor.email && activePersona.email.toLowerCase() === tutor.email.toLowerCase()) ||
    (currentUser?.name && tutor.fullName && currentUser.name.toLowerCase() === tutor.fullName.toLowerCase()) ||
    activePersona.id === tutor.id
  );

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between group ${
      isSelf ? 'border-emerald-300 ring-1 ring-emerald-200 shadow-2xs' : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
    }`}>
      <div>
        {/* Card Header: Avatar & Name */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative">
            {tutor.avatarUrl ? (
              <img
                src={tutor.avatarUrl}
                alt={tutor.fullName}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center shrink-0 border border-emerald-200">
                {tutor.fullName[0]}
              </div>
            )}
            {tutor.isPeerCertified && (
              <span
                title="Verified LAU Peer Tutor"
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs"
              >
                <BrandMark className="w-4 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-900 transition-colors">
                  {tutor.fullName}
                </h3>
                {isSelf && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    You (Tutor)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-mono tabular-nums">{tutor.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Unboxed Metadata with Typographic Middots */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>{tutor.academicYear}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{tutor.major}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
              <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>{tutor.campus === 'Both' ? 'Beirut & Byblos' : `${tutor.campus} Campus`}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-500 font-mono tabular-nums">{tutor.totalSessionsCompleted} sessions</span>
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {tutor.bio}
        </p>

        {/* Verified Course Strengths & Grades Achieved */}
        <div className="mb-3 pt-2.5 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Verified Courses & Achieved Grades
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tutor.courses.map(c => (
              <span
                key={c.courseId}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1"
                title={`${c.courseName} (Achieved: ${c.gradeAchieved})`}
              >
                <strong className="font-bold text-slate-900">{c.courseCode}</strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  Grade: <strong className="text-emerald-700">{c.gradeAchieved}</strong>
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Student Review Quote Excerpt */}
        {latestReview && (
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-150 mb-3 text-[11px] text-slate-600 leading-snug">
            <div className="flex items-center gap-1 text-amber-700 font-semibold mb-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono">{latestReview.rating}.0</span>
              <span className="text-slate-400 font-normal">from {latestReview.studentName}:</span>
            </div>
            <p className="italic line-clamp-1 text-slate-600">
              &ldquo;{latestReview.comment}&rdquo;
            </p>
          </div>
        )}

        {/* Availability Slots Count */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
          <Clock className="w-3 h-3 text-emerald-700" />
          <span>{tutor.availability.length} weekly open slots for peer booking</span>
        </div>
      </div>

      {/* Card Footer: Rate & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-bold">Rate</span>
          <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
            {tutor.hourlyRate === 0 ? (
              <span className="text-emerald-700 font-bold">Free Volunteer</span>
            ) : (
              `$${tutor.hourlyRate} / hr`
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile(tutor)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Profile
          </button>
          {!currentUser ? (
            <button
              disabled
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed opacity-80"
              title="Sign in with your student account to book a tutoring slot"
            >
              Book Slot
            </button>
          ) : isSelf ? (
            <button
              disabled
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
              title="You cannot book a tutoring session with yourself. You can book other peer tutors."
            >
              Cannot Book Self
            </button>
          ) : (
            <button
              onClick={() => onRequestBooking(tutor)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Book Slot
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

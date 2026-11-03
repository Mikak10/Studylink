import React, { useState, useEffect } from 'react';
import { TutorProfile, SessionFormat } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, DollarSign, BookOpen } from 'lucide-react';

interface BookingModalProps {
  tutor: TutorProfile | null;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  tutor,
  onClose,
  onBookingSuccess,
}) => {
  const { activePersona, createBooking, isSlotAlreadyBooked, currentUser, openAuthModal } = useStudyLinkData();

  // Tomorrow's date helper
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<'Beirut' | 'Byblos'>('Beirut');
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<SessionFormat>('In-Person');
  const [studentNote, setStudentNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Synchronize when tutor changes
  useEffect(() => {
    if (tutor) {
      if (tutor.courses[0]) {
        setSelectedCourse(`${tutor.courses[0].courseCode} - ${tutor.courses[0].courseName}`);
      }
      setSelectedCampus(tutor.campus === 'Byblos' ? 'Byblos' : 'Beirut');
      setSelectedDate(getTomorrowDate());
      setSelectedSlot(tutor.availability[0]?.timeSlot || '14:00 - 15:00');
      setSelectedFormat(tutor.availability[0]?.format || 'In-Person');
      setStudentNote('');
      setValidationError(null);
      setIsSubmitted(false);
    }
  }, [tutor?.id]);

  if (!tutor) return null;

  // Check if current user is trying to book themselves
  const isSelfBooking = Boolean(
    (currentUser?.tutorProfileId && currentUser.tutorProfileId === tutor.id) ||
    (activePersona.tutorProfileId && activePersona.tutorProfileId === tutor.id) ||
    (currentUser?.email && tutor.email && currentUser.email.toLowerCase() === tutor.email.toLowerCase()) ||
    (activePersona.email && tutor.email && activePersona.email.toLowerCase() === tutor.email.toLowerCase()) ||
    (currentUser?.name && tutor.fullName && currentUser.name.toLowerCase() === tutor.fullName.toLowerCase()) ||
    activePersona.id === tutor.id
  );

  const isNotSignedIn = !currentUser;

  // Real-time conflict detection
  const hasConflict = isSlotAlreadyBooked(tutor.id, selectedDate, selectedSlot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isNotSignedIn) {
      setValidationError('You must be signed in with your LAU student account to book a tutoring session.');
      return;
    }

    if (isSelfBooking) {
      setValidationError('You cannot book a tutoring session with yourself. As an LAU tutor, you can request peer tutoring sessions with any other tutor on the platform.');
      return;
    }

    if (!selectedCourse) {
      setValidationError('Please select a course to cover.');
      return;
    }

    if (!selectedDate) {
      setValidationError('Please select a valid date.');
      return;
    }

    if (!selectedSlot) {
      setValidationError('Please select a time slot.');
      return;
    }

    if (hasConflict) {
      setValidationError(
        `This time slot (${selectedSlot} on ${selectedDate}) has already been booked. Please pick another available time slot.`
      );
      return;
    }

    const courseParts = selectedCourse.split(' - ');
    const courseCode = courseParts[0] || 'GEN';
    const courseName = courseParts[1] || selectedCourse;

    const locationDetails =
      selectedFormat === 'Online'
        ? 'Official LAU Microsoft Teams Peer Room'
        : selectedCampus === 'Beirut'
        ? 'Riyad Nassar Library Level 3, Beirut Campus'
        : 'Byblos Student Center Level 2, Byblos Campus';

    const result = createBooking({
      tutorId: tutor.id,
      tutorName: tutor.fullName,
      studentId: activePersona.id,
      studentName: activePersona.name,
      studentEmail: activePersona.email,
      studentMajor: activePersona.major,
      courseCode,
      courseName,
      campus: selectedCampus,
      date: selectedDate,
      timeSlot: selectedSlot,
      format: selectedFormat,
      locationDetails,
      studentNote: studentNote.trim(),
    });

    if (result.success) {
      setIsSubmitted(true);
      setTimeout(() => {
        onBookingSuccess();
        onClose();
        setIsSubmitted(false);
      }, 2000);
    } else {
      setValidationError(result.error || 'Failed to submit booking request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            {tutor.avatarUrl ? (
              <img
                src={tutor.avatarUrl}
                alt={tutor.fullName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-emerald-300 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                {tutor.fullName[0]}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isSubmitted ? 'Booking Request Submitted!' : 'Request Peer Tutoring Session'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                with <strong className="text-slate-800">{tutor.fullName}</strong> · {tutor.hourlyRate === 0 ? 'Free Peer Volunteer' : `$${tutor.hourlyRate}/hr`}
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

        {/* Success Notification View */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Notification Sent to {tutor.fullName}!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Your request to book <strong>{selectedSlot}</strong> on <strong>{selectedDate}</strong> for <strong>{selectedCourse}</strong> has been submitted.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl max-w-sm mx-auto text-left text-xs text-emerald-950 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Awaiting Tutor Confirmation</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  A notification has been dispatched to {tutor.fullName}. You can track this pending session in <strong>My Sessions</strong>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Modal Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Active Student Persona Indicator */}
          <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
            <span className="text-emerald-950 font-medium">
              Student Requesting: <strong>{activePersona.name}</strong>
              {currentUser && (
                <span className="ml-1 text-[11px] font-mono text-emerald-700">
                  (@{currentUser.username})
                </span>
              )}
            </span>
            {currentUser ? (
              <span className="text-emerald-700 text-[11px] font-mono">{activePersona.major}</span>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-emerald-800 underline hover:text-emerald-950 text-[11px] font-bold cursor-pointer"
              >
                Sign In to Save
              </button>
            )}
          </div>

          {/* Self-booking Warning Banner */}
          {isSelfBooking && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-xs text-amber-950">You Cannot Book Yourself</strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  You are currently logged in as <strong>{tutor.fullName}</strong>. Peer tutors cannot book sessions with themselves. You are free to browse and request peer tutoring sessions with any other tutor on the platform.
                </p>
              </div>
            </div>
          )}

          {/* Conflict Warning Banner if slot is taken */}
          {hasConflict && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Time Slot Unavailable (Double Booking)</strong>
                <span className="leading-relaxed">
                  Another student has already reserved this slot ({selectedSlot} on {selectedDate}) for {tutor.fullName}. Please select an alternative time or date below.
                </span>
              </div>
            </div>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Course Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              Course to Cover *
            </label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              required
            >
              {tutor.courses.map(c => (
                <option key={c.courseId} value={`${c.courseCode} - ${c.courseName}`}>
                  {c.courseCode} — {c.courseName} (Tutor achieved: Grade {c.gradeAchieved})
                </option>
              ))}
            </select>
          </div>

          {/* Campus Location & Format Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Campus Location *
              </label>
              <select
                value={selectedCampus}
                onChange={e => setSelectedCampus(e.target.value as 'Beirut' | 'Byblos')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Beirut">Beirut Campus (Riyad Nassar)</option>
                <option value="Byblos">Byblos Campus (Student Center)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Delivery Format *
              </label>
              <select
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value as SessionFormat)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="In-Person">In-Person (Campus Hub)</option>
                <option value="Online">Online (MS Teams)</option>
                <option value="Hybrid">Hybrid / Flexible</option>
              </select>
            </div>
          </div>

          {/* Date & Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Session Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Available Time Slot *
              </label>
              <select
                value={selectedSlot}
                onChange={e => setSelectedSlot(e.target.value)}
                className={`w-full p-2.5 bg-slate-50 border rounded-lg font-semibold focus:ring-2 focus:outline-none cursor-pointer ${
                  hasConflict
                    ? 'border-rose-400 text-rose-900 focus:ring-rose-400'
                    : 'border-slate-200 text-slate-900 focus:ring-emerald-500'
                }`}
              >
                {tutor.availability.map(slot => {
                  const isSlotTaken = isSlotAlreadyBooked(tutor.id, selectedDate, slot.timeSlot);
                  return (
                    <option key={slot.id} value={slot.timeSlot}>
                      {slot.dayOfWeek}: {slot.timeSlot} ({slot.format}) {isSlotTaken ? '— [UNAVAILABLE / BOOKED]' : ''}
                    </option>
                  );
                })}
                <option value="10:00 - 11:00">Custom: 10:00 - 11:00 AM</option>
                <option value="11:00 - 12:00">Custom: 11:00 - 12:00 PM</option>
                <option value="14:00 - 15:00">Custom: 02:00 - 03:00 PM</option>
                <option value="16:00 - 17:00">Custom: 04:00 - 05:00 PM</option>
              </select>
            </div>
          </div>

          {/* Student Focus Topics Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Focus Topics & Exam Prep (Optional)
            </label>
            <textarea
              rows={3}
              value={studentNote}
              onChange={e => setStudentNote(e.target.value)}
              placeholder="e.g. Midterm 1 review, tricky homework problem sets, vectors and matrices..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Meeting Point Summary */}
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-2 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              Designated Hub: {selectedFormat === 'Online' ? 'Official LAU MS Teams Peer Room' : selectedCampus === 'Beirut' ? 'Riyad Nassar Library Level 3, Beirut' : 'Byblos Student Center Level 2, Byblos'}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasConflict || isSelfBooking || isNotSignedIn}
              className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                hasConflict || isSelfBooking || isNotSignedIn
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isNotSignedIn
                ? 'Sign In Required to Book'
                : isSelfBooking
                ? 'Cannot Book Yourself'
                : hasConflict
                ? 'Slot Booked — Choose Another'
                : 'Confirm & Send Request'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

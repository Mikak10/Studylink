import React, { useState } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { Campus, School, TutorCourseCompetency, AvailabilitySlot, SessionFormat } from '../../types';
import { LAU_MAJORS_BY_SCHOOL } from '../../data/lauMajors';
import {
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Award,
  BookOpen,
  AlertCircle,
  ShieldCheck,
  Clock,
  GraduationCap,
  Calendar,
} from 'lucide-react';

export const STANDARD_TUTORING_TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '09:30 - 11:00',
  '11:00 - 12:30',
  '12:30 - 14:00',
  '14:00 - 15:30',
  '15:30 - 17:00',
];

interface TutorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

export const TutorRegistrationModal: React.FC<TutorRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { courses, submitTutorApplication, currentUser, activePersona, openAuthModal } = useStudyLinkData();

  const [fullName, setFullName] = useState(currentUser?.name || activePersona.name || '');
  const [email, setEmail] = useState(currentUser?.email || activePersona.email || '');
  const [campus, setCampus] = useState<Campus>(activePersona.campus || 'Beirut');
  const [school, setSchool] = useState<School>('SAS');
  const [major, setMajor] = useState(currentUser?.major || activePersona.major || 'Computer Science');
  const [academicYear, setAcademicYear] = useState<'Sophomore' | 'Junior' | 'Senior' | 'Graduate'>('Junior');
  const [gpa, setGpa] = useState('3.80');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(10);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  // Sync state when user logs in/out
  React.useEffect(() => {
    setFullName(currentUser?.name || activePersona.name || '');
    setEmail(currentUser?.email || activePersona.email || '');
    setCampus(activePersona.campus || 'Beirut');
    setMajor(currentUser?.major || activePersona.major || 'Computer Science');
  }, [currentUser?.id, activePersona.id]);

  // Selected courses
  const [selectedCourses, setSelectedCourses] = useState<TutorCourseCompetency[]>([
    { courseId: 'lau-mth201', courseCode: 'MTH201', courseName: 'Calculus III', gradeAchieved: 'A' },
  ]);

  const [courseToAddId, setCourseToAddId] = useState(courses[0]?.id || 'c1');
  const [gradeToAdd, setGradeToAdd] = useState('A');

  // Weekly Tutoring Availability Slots
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { id: 'av-init-1', dayOfWeek: 'Tuesday', timeSlot: '14:00 - 15:00', format: 'In-Person', location: 'Library Level 3, Beirut' },
    { id: 'av-init-2', dayOfWeek: 'Thursday', timeSlot: '16:00 - 17:00', format: 'Online', location: 'Official LAU Microsoft Teams' },
  ]);

  const [newSlotDay, setNewSlotDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [newSlotTime, setNewSlotTime] = useState<string>('14:00 - 15:00');
  const [newSlotFormat, setNewSlotFormat] = useState<SessionFormat>('In-Person');
  const [newSlotLocation, setNewSlotLocation] = useState<string>('Library Study Pods');

  if (!isOpen) return null;

  const handleAddCourse = () => {
    setFormError(null);
    const found = courses.find(c => c.id === courseToAddId);
    if (found && !selectedCourses.some(sc => sc.courseId === found.id)) {
      setSelectedCourses(prev => [
        ...prev,
        {
          courseId: found.id,
          courseCode: found.code,
          courseName: found.name,
          gradeAchieved: gradeToAdd,
        },
      ]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(c => c.courseId !== courseId));
  };

  const handleAddSlot = () => {
    setFormError(null);
    setAvailabilitySlots(prev => [
      ...prev,
      {
        id: `av-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        dayOfWeek: newSlotDay,
        timeSlot: newSlotTime,
        format: newSlotFormat,
        location: newSlotLocation.trim() || `${campus} Campus Library`,
      },
    ]);
  };

  const handleRemoveSlot = (slotId: string) => {
    setAvailabilitySlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedCourses.length === 0) {
      setFormError('Please add at least one course you excel in and are qualified to tutor.');
      return;
    }

    if (availabilitySlots.length === 0) {
      setFormError('Please add at least one weekly tutoring availability slot.');
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setFormError('Please provide your full name and university email address.');
      return;
    }

    const result = submitTutorApplication({
      applicantUserId: currentUser?.id || (activePersona.id !== 'guest' ? activePersona.id : undefined),
      applicantName: fullName.trim(),
      applicantEmail: email.trim(),
      campus,
      school,
      major: major.trim(),
      academicYear,
      gpa: gpa.trim() || undefined,
      bio: bio.trim() || 'LAU peer tutor dedicated to collaborative learning and academic excellence.',
      hourlyRate: Number(hourlyRate),
      courses: selectedCourses,
      availability: availabilitySlots,
      avatarUrl: currentUser?.avatarUrl || activePersona.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    if (!result.success) {
      setFormError(result.error || 'Failed to submit application.');
      return;
    }

    setSubmittedSuccessfully(true);
    setTimeout(() => {
      onRegistered();
      onClose();
      setSubmittedSuccessfully(false);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Apply to Become an LAU Peer Tutor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Any LAU student can apply &bull; Subject to Academic Administration review
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

        {/* Student Role Verification Guard */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">LAU Student Sign-In Required</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Applying to become an LAU peer tutor is only available for currently enrolled students. Please sign in or register with your LAU student account.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Sign In as Student
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('signup');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        ) : currentUser.role !== 'student' ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentUser.role === 'tutor' ? 'Already an Active Peer Tutor' : 'Academic Administrator Portal'}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                {currentUser.role === 'tutor'
                  ? 'You are already registered and active as an LAU Peer Tutor. You can configure your weekly availability slots and review booking requests directly from your Tutor Dashboard.'
                  : 'You are signed in with an administrative account. Administrators oversee, review, and approve peer tutor applications in the Admin Portal.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : submittedSuccessfully ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Submitted for Review!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Thank you, <strong>{fullName}</strong>. Your peer tutor application has been forwarded to the LAU Academic Administration (Dr. Mona Majdalani).
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl max-w-sm mx-auto text-left text-xs text-amber-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Pending Admin Approval</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Once an academic administrator approves your credentials, your tutor profile will be published to the campus directory and you'll receive a notification.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Scrollable Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Informational Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Peer Tutoring Administrative Approval</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Any enrolled LAU student is eligible to tutor. Our academic administration oversees tutor credentials to verify course grades and maintain high peer tutoring standards.
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">LAU Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Campus</label>
                <select
                  value={campus}
                  onChange={e => setCampus(e.target.value as Campus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="Beirut">Beirut Campus</option>
                  <option value="Byblos">Byblos Campus</option>
                  <option value="Both">Both Campuses</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">LAU School</label>
                <select
                  value={school}
                  onChange={e => setSchool(e.target.value as School)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="SAS">Arts & Sciences (SAS)</option>
                  <option value="SOE">Engineering (SOE)</option>
                  <option value="AKSOB">Business (AKSOB)</option>
                  <option value="SArD">Architecture & Design (SArD)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cumulative GPA</label>
                <input
                  type="text"
                  placeholder="e.g. 3.82"
                  value={gpa}
                  onChange={e => setGpa(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Major / Degree Track *</label>
                <select
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  required
                >
                  {LAU_MAJORS_BY_SCHOOL.map(group => (
                    <optgroup key={group.school} label={group.schoolName}>
                      {group.majors.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hourly Rate (USD) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono text-[11px] font-bold">
                    {hourlyRate === 0 ? 'Free / Volunteer' : 'USD / hr'}
                  </span>
                </div>
              </div>
            </div>

            {/* Courses Tutor Can Teach */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                Courses You Excel In & Can Tutor (Minimum 1 course required)
              </label>

              <div className="flex gap-2">
                <select
                  value={courseToAddId}
                  onChange={e => setCourseToAddId(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  {['SAS', 'SOE', 'AKSOB', 'SArD'].map(sch => {
                    const schoolCourses = courses.filter(c => c.school === sch);
                    if (schoolCourses.length === 0) return null;
                    const label =
                      sch === 'SAS'
                        ? 'School of Arts & Sciences (SAS)'
                        : sch === 'SOE'
                        ? 'School of Engineering (SOE)'
                        : sch === 'AKSOB'
                        ? 'Adnan Kassar School of Business (AKSOB)'
                        : 'School of Architecture & Design (SArD)';
                    return (
                      <optgroup key={sch} label={label}>
                        {schoolCourses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.code} — {c.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <select
                  value={gradeToAdd}
                  onChange={e => setGradeToAdd(e.target.value)}
                  className="w-20 p-2 bg-white border border-slate-200 rounded-lg font-bold font-mono text-emerald-800 cursor-pointer"
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-3.5 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Added Courses Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedCourses.map(sc => (
                  <div
                    key={sc.courseId}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-2 shadow-2xs"
                  >
                    <strong className="text-slate-900">{sc.courseCode}</strong>
                    <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-1 rounded text-[10px]">
                      Grade: {sc.gradeAchieved}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(sc.courseId)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Course"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teaching Overview & Academic Strengths *
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="e.g. Dean's honor list student specializing in step-by-step problem walkthroughs, free body diagrams, and midterm preparation..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-normal focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            {/* Weekly Tutoring Availability Slots */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Weekly Tutoring Availability Slots (Minimum 1 slot required)
              </label>
              <p className="text-[11px] text-slate-500">
                Pick your available days and time slots. Students can request bookings only during these verified slots.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Day</label>
                  <select
                    value={newSlotDay}
                    onChange={e => setNewSlotDay(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg cursor-pointer font-medium"
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
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Time Slot</label>
                  <select
                    value={newSlotTime}
                    onChange={e => setNewSlotTime(e.target.value)}
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
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Format</label>
                  <select
                    value={newSlotFormat}
                    onChange={e => setNewSlotFormat(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg cursor-pointer font-medium"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Online">Online MS Teams</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Location</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newSlotLocation}
                      onChange={e => setNewSlotLocation(e.target.value)}
                      placeholder="e.g. Library Level 3"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="px-3 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Add availability slot"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Slots List */}
              <div className="flex flex-wrap gap-2 pt-1">
                {availabilitySlots.map(slot => (
                  <div
                    key={slot.id}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-2xs text-[11px]"
                  >
                    <span className="font-bold text-slate-900">{slot.dayOfWeek}</span>
                    <span className="text-emerald-800 font-mono font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {slot.timeSlot}
                    </span>
                    <span className="text-slate-500">({slot.format})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Reviewed by LAU Academic Admin
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

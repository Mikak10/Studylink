import React, { useState } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { ApplicationStatus, TutorApplication } from '../../types';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck,
  UserCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const AdminApprovalPanel: React.FC = () => {
  const {
    tutorApplications,
    approveTutorApplication,
    rejectTutorApplication,
    activePersona,
    currentUser,
    setActivePersonaId,
  } = useStudyLinkData();

  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('PENDING');
  const [campusFilter, setCampusFilter] = useState<'ALL' | 'Beirut' | 'Byblos'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for actions
  const [selectedAppForAction, setSelectedAppForAction] = useState<TutorApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const isAdmin = currentUser?.role === 'admin' || activePersona.role === 'admin';

  // Metrics
  const totalCount = tutorApplications.length;
  const pendingCount = tutorApplications.filter(a => a.status === 'PENDING').length;
  const approvedCount = tutorApplications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = tutorApplications.filter(a => a.status === 'REJECTED').length;

  // Filtered applications
  const filteredApplications = tutorApplications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (campusFilter !== 'ALL' && app.campus !== campusFilter && app.campus !== 'Both') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.applicantName.toLowerCase().includes(q);
      const matchEmail = app.applicantEmail.toLowerCase().includes(q);
      const matchMajor = app.major.toLowerCase().includes(q);
      const matchCourse = app.courses.some(
        c => c.courseCode.toLowerCase().includes(q) || c.courseName.toLowerCase().includes(q)
      );
      if (!matchName && !matchEmail && !matchMajor && !matchCourse) return false;
    }
    return true;
  });

  const handleOpenApproveModal = (app: TutorApplication) => {
    setSelectedAppForAction(app);
    setActionType('APPROVE');
    setAdminNoteInput('Approved for LAU Peer Tutoring Program. Exceptional academic record and course competence.');
  };

  const handleOpenRejectModal = (app: TutorApplication) => {
    setSelectedAppForAction(app);
    setActionType('REJECT');
    setAdminNoteInput('Department requires a minimum A- in prerequisite coursework before peer tutoring eligibility.');
  };

  const handleConfirmAction = () => {
    if (!selectedAppForAction || !actionType) return;

    if (actionType === 'APPROVE') {
      approveTutorApplication(selectedAppForAction.id, adminNoteInput.trim() || undefined);
    } else {
      rejectTutorApplication(selectedAppForAction.id, adminNoteInput.trim() || undefined);
    }

    setSelectedAppForAction(null);
    setActionType(null);
    setAdminNoteInput('');
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Restricted Administrative Area</h2>
        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          Access to the Tutor Application Review Portal is restricted strictly to authorized LAU Academic Administrators.
        </p>
        <p className="text-[11px] text-slate-400">
          Please sign in with your administrative credentials to manage tutor applications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Main Admin Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-[11px] font-bold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                LAU Academic Administration Oversight
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Tutor Application Review Portal
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Oversee the student tutor verification workflow. Any student can apply to tutor; administrators review academic standing, prerequisite grades, and schedule availability before granting public peer certification.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center shadow-xs">
                {currentUser?.role === 'admin' ? 'MM' : 'ADM'}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-white">
                  {currentUser?.name || 'Dr. Mona Majdalani'}
                </div>
                <div className="text-emerald-200 text-[11px]">Academic Coordinator</div>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-600/60 rounded text-[10px] font-mono text-emerald-100 font-semibold">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-700/50">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white/20 border-white shadow-xs'
                  : 'bg-emerald-950/30 border-emerald-700/40 hover:bg-white/10'
              }`}
            >
              <div className="text-emerald-200 text-[11px] font-medium">All Applications</div>
              <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            </button>

            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-500/25 border-amber-300 shadow-xs'
                  : 'bg-emerald-950/30 border-emerald-700/40 hover:bg-white/10'
              }`}
            >
              {pendingCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              <div className="text-amber-200 text-[11px] font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Pending Approval
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</div>
            </button>

            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                statusFilter === 'APPROVED'
                  ? 'bg-emerald-500/30 border-emerald-300 shadow-xs'
                  : 'bg-emerald-950/30 border-emerald-700/40 hover:bg-white/10'
              }`}
            >
              <div className="text-emerald-200 text-[11px] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                Approved Tutors
              </div>
              <div className="text-2xl font-black text-white mt-1">{approvedCount}</div>
            </button>

            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                statusFilter === 'REJECTED'
                  ? 'bg-rose-500/25 border-rose-300 shadow-xs'
                  : 'bg-emerald-950/30 border-emerald-700/40 hover:bg-white/10'
              }`}
            >
              <div className="text-rose-200 text-[11px] font-medium flex items-center gap-1.5">
                <XCircle className="w-3 h-3 text-rose-300" />
                Declined
              </div>
              <div className="text-2xl font-black text-rose-200 mt-1">{rejectedCount}</div>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            {(
              [
                { id: 'PENDING', label: `Pending Review (${pendingCount})` },
                { id: 'APPROVED', label: `Approved (${approvedCount})` },
                { id: 'REJECTED', label: `Declined (${rejectedCount})` },
                { id: 'ALL', label: `All (${totalCount})` },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Campus dropdown */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-slate-500 font-semibold whitespace-nowrap">Campus:</span>
              <select
                value={campusFilter}
                onChange={e => setCampusFilter(e.target.value as any)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">All Campuses</option>
                <option value="Beirut">Beirut Campus</option>
                <option value="Byblos">Byblos Campus</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              <input
                type="text"
                placeholder="Search applicant or course..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Application Cards List */}
        <div className="p-4 sm:p-6 space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No applications match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching the status tab or clearing the search query to view applicant records.
              </p>
            </div>
          ) : (
            filteredApplications.map(app => {
              const isPending = app.status === 'PENDING';
              const isApproved = app.status === 'APPROVED';
              const isRejected = app.status === 'REJECTED';

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-2xl border transition-all duration-150 p-5 sm:p-6 shadow-2xs hover:shadow-xs ${
                    isPending
                      ? 'border-amber-200 ring-1 ring-amber-100'
                      : isApproved
                      ? 'border-emerald-200'
                      : 'border-slate-200 opacity-90'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={
                          app.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            app.applicantName
                          )}&background=006751&color=fff`
                        }
                        alt={app.applicantName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {app.applicantName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isPending
                              ? 'Pending Review'
                              : isApproved
                              ? 'Approved & Certified'
                              : 'Declined'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {app.id}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-slate-800">{app.major}</span>
                          <span>&bull;</span>
                          <span className="text-slate-500">{app.school}</span>
                          <span>&bull;</span>
                          <span className="text-slate-500">{app.academicYear}</span>
                          <span>&bull;</span>
                          <span className="text-slate-700 font-medium">{app.campus} Campus</span>
                          <span>&bull;</span>
                          <span className="text-slate-500">{app.applicantEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rates & Academic Highlights */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {app.gpa && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-black rounded-lg border border-emerald-200 font-mono text-xs">
                            GPA {app.gpa}
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg font-mono text-xs">
                          {app.hourlyRate === 0 ? 'Volunteer / Free' : `$${app.hourlyRate} / hr`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Courses Qualified to Tutor */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        Qualified Subject Competencies & Prerequisite Grades:
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {app.courses.length} course{app.courses.length === 1 ? '' : 's'} registered
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {app.courses.map((c, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs"
                        >
                          <span className="font-mono font-bold text-slate-900">{c.courseCode}</span>
                          <span className="text-slate-600 font-medium text-[11px]">
                            {c.courseName}
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-black text-[10px] rounded">
                            Grade: {c.gradeAchieved}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposed Weekly Availability */}
                  {app.availability && app.availability.length > 0 && (
                    <div className="pt-3 space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        Proposed Weekly Office Hours / Tutoring Slots:
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {app.availability.map((slot, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 flex items-center gap-1.5"
                          >
                            <span className="font-semibold text-slate-900">{slot.dayOfWeek}</span>
                            <span className="font-mono text-emerald-800">{slot.timeSlot}</span>
                            <span className="text-[10px] px-1 bg-white border border-slate-200 rounded text-slate-500">
                              {slot.format} &bull; {slot.location}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio / Motivation */}
                  <div className="pt-3">
                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                      "{app.bio}"
                    </p>
                  </div>

                  {/* Admin Notes if reviewed */}
                  {app.adminNotes && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isApproved
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>Admin Review Notes:</span>
                          {app.adminReviewerName && (
                            <span className="font-normal text-[11px] opacity-80">
                              by {app.adminReviewerName}
                            </span>
                          )}
                          {app.reviewedAt && (
                            <span className="font-normal text-[10px] opacity-70">
                              &bull; {new Date(app.reviewedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 leading-relaxed">{app.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Controls for Admin */}
                  {isPending && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting administrative decision before student profile is published.
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenRejectModal(app)}
                          className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline Application
                        </button>
                        <button
                          onClick={() => handleOpenApproveModal(app)}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve & Publish Tutor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Approve / Reject Dialog Modal */}
      {selectedAppForAction && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                actionType === 'APPROVE'
                  ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-100 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                    actionType === 'APPROVE' ? 'bg-emerald-700' : 'bg-rose-700'
                  }`}
                >
                  {actionType === 'APPROVE' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    {actionType === 'APPROVE'
                      ? 'Are you sure you want to approve this application?'
                      : 'Are you sure you want to decline this application?'}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    Applicant: <strong>{selectedAppForAction.applicantName}</strong> &bull; {selectedAppForAction.major} ({selectedAppForAction.campus})
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {actionType === 'APPROVE' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    Immediate Impact of Approval:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-800">
                    <li>Promotes student account role to <strong>Tutor</strong>.</li>
                    <li>Generates a certified <strong>TutorProfile</strong> in the LAU directory.</li>
                    <li>
                      Authorizes tutoring in:{' '}
                      <strong>{selectedAppForAction.courses.map(c => c.courseCode).join(', ')}</strong>.
                    </li>
                    <li>Dispatches official approval notification to applicant.</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                    Decline Notice:
                  </p>
                  <p className="text-[11px] text-rose-800">
                    The student will be notified of this decision with the feedback provided below.
                    They may re-apply after addressing prerequisite requirements.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {actionType === 'APPROVE'
                    ? 'Administrative Approval Remarks / Notes:'
                    : 'Reason for Declining / Feedback for Student:'}
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Enter remarks..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppForAction(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {actionType === 'APPROVE' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Confirm Decline
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

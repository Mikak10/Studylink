import React, { useState } from 'react';
import { DataProvider, useStudyLinkData } from './context/DataContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { TutorDirectory } from './components/discovery/TutorDirectory';
import { TutorProfileModal } from './components/discovery/TutorProfileModal';
import { BookingModal } from './components/booking/BookingModal';
import { MySessionsView } from './components/booking/MySessionsView';
import { ReviewModal } from './components/booking/ReviewModal';
import { TutorDashboard } from './components/tutor/TutorDashboard';
import { TutorRegistrationModal } from './components/tutor/TutorRegistrationModal';
import { TutorProfileEditorModal } from './components/tutor/TutorProfileEditorModal';
import { AuthModal } from './components/auth/AuthModal';
import { SessionDetailsModal } from './components/booking/SessionDetailsModal';
import { StudentProfileModal } from './components/tutor/StudentProfileModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AdminApprovalPanel } from './components/admin/AdminApprovalPanel';
import { TutorProfile, Booking } from './types';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

function MainAppContent() {
  const { toastMessage, currentUser, activePersona, bookings, updateBookingStatus } = useStudyLinkData();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'find' | 'sessions' | 'dashboard' | 'become-tutor' | 'admin'>('find');

  // Modals state
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<TutorProfile | null>(null);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState<TutorProfile | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [selectedBookingForStudentProfile, setSelectedBookingForStudentProfile] = useState<Booking | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  // Strict Role-Based Tab Enforcement
  React.useEffect(() => {
    if (!currentUser) {
      if (activeTab === 'dashboard' || activeTab === 'admin') {
        setActiveTab('find');
      }
      return;
    }

    if (currentUser.role === 'admin') {
      if (activeTab === 'dashboard') {
        setActiveTab('admin');
      }
    } else if (currentUser.role === 'tutor') {
      if (activeTab === 'admin') {
        setActiveTab('dashboard');
      }
    } else {
      // Student role: strict protection
      if (activeTab === 'dashboard' || activeTab === 'admin') {
        setActiveTab('find');
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
        onSelectBookingDetails={bookingId => {
          const found = bookings.find(b => b.id === bookingId);
          if (found) setSelectedBookingForDetails(found);
        }}
      />

      {/* 3. Main Dynamic View Container */}
      <div className="flex-1">
        {activeTab === 'find' && (
          <TutorDirectory
            onViewProfile={tutor => setSelectedTutorForProfile(tutor)}
            onRequestBooking={tutor => setSelectedTutorForBooking(tutor)}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          />
        )}

        {activeTab === 'sessions' && (
          <MySessionsView
            onBrowseTutors={() => setActiveTab('find')}
            onOpenReviewModal={booking => setSelectedBookingForReview(booking)}
            onSelectBookingDetails={booking => setSelectedBookingForDetails(booking)}
          />
        )}

        {activeTab === 'dashboard' && currentUser?.role === 'tutor' && (
          <TutorDashboard
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
            onBrowseTutors={() => setActiveTab('find')}
            onViewStudentProfile={booking => setSelectedBookingForStudentProfile(booking)}
            onSelectBookingDetails={booking => setSelectedBookingForDetails(booking)}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && currentUser?.role !== 'tutor' && (
          <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Peer Tutor Access Only</h2>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This dashboard is restricted to verified LAU Peer Tutors. If you are an enrolled student, you can apply to tutor courses you have excelled in.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Apply as Peer Tutor
              </button>
              <button
                onClick={() => setActiveTab('find')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Find a Tutor
              </button>
            </div>
          </div>
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <AdminApprovalPanel />
          </div>
        )}

        {activeTab === 'admin' && currentUser?.role !== 'admin' && (
          <div className="max-w-md mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Restricted Administrative Area</h2>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Access is restricted to authorized LAU Academic Administration and Department Coordinators.
            </p>
            <button
              onClick={() => setActiveTab('find')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        )}
      </div>

      {/* 4. Global Modals */}
      {/* Tutor Profile Details Modal */}
      <TutorProfileModal
        tutor={selectedTutorForProfile}
        onClose={() => setSelectedTutorForProfile(null)}
        onRequestBooking={tutor => {
          setSelectedTutorForProfile(null);
          setSelectedTutorForBooking(tutor);
        }}
      />

      {/* Booking Wizard Modal */}
      <BookingModal
        tutor={selectedTutorForBooking}
        onClose={() => setSelectedTutorForBooking(null)}
        onBookingSuccess={() => {
          setActiveTab('sessions');
        }}
      />

      {/* Review Feedback Modal */}
      <ReviewModal
        booking={selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        onReviewSubmitted={() => {
          // Handled via data context
        }}
      />

      {/* Comprehensive Session Details Modal */}
      <SessionDetailsModal
        booking={selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        onOpenReviewModal={booking => {
          setSelectedBookingForDetails(null);
          setSelectedBookingForReview(booking);
        }}
        onViewStudentProfile={booking => {
          setSelectedBookingForDetails(null);
          setSelectedBookingForStudentProfile(booking);
        }}
      />

      {/* Student Profile Modal (for tutors inspecting before approving) */}
      <StudentProfileModal
        booking={selectedBookingForStudentProfile}
        onClose={() => setSelectedBookingForStudentProfile(null)}
        onAccept={bookingId => {
          updateBookingStatus(bookingId, 'CONFIRMED');
          setSelectedBookingForStudentProfile(null);
        }}
        onDecline={bookingId => {
          updateBookingStatus(bookingId, 'CANCELLED', 'Declined by tutor after reviewing profile.');
          setSelectedBookingForStudentProfile(null);
        }}
      />

      {/* Tutor Registration Modal */}
      <TutorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegistered={() => {
          setActiveTab('find');
        }}
      />

      {/* Tutor Profile Editor Modal */}
      <TutorProfileEditorModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />

      {/* User Profile & Picture Modal (for all Students and Tutors) */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
      />

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal />

      {/* 5. Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainAppContent />
    </DataProvider>
  );
}

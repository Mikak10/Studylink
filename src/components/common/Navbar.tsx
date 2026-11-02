import React, { useState } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { NotificationCenter } from './NotificationCenter';
import { BrandLockup } from './BrandLogo';
import {
  Calendar,
  Compass,
  BookOpen,
  User,
  Menu,
  X,
  LogIn,
  LogOut,
  UserPlus,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'find' | 'sessions' | 'dashboard' | 'become-tutor' | 'admin';
  setActiveTab: (tab: 'find' | 'sessions' | 'dashboard' | 'become-tutor' | 'admin') => void;
  onOpenRegisterModal: () => void;
  onSelectBookingDetails?: (bookingId: string) => void;
  onOpenUserProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRegisterModal,
  onSelectBookingDetails,
  onOpenUserProfile,
}) => {
  const {
    currentUser,
    logout,
    openAuthModal,
    bookings,
    tutorApplications,
  } = useStudyLinkData();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Student pending / upcoming count
  const studentSessionsCount = currentUser
    ? bookings.filter(
        b =>
          (b.studentId === currentUser.id || b.studentEmail.toLowerCase() === currentUser.email.toLowerCase()) &&
          (b.status === 'CONFIRMED' || b.status === 'PENDING')
      ).length
    : 0;

  // Tutor pending count
  const tutorPendingCount =
    currentUser?.role === 'tutor' && currentUser.tutorProfileId
      ? bookings.filter(
          b => b.tutorId === currentUser.tutorProfileId && b.status === 'PENDING'
        ).length
      : 0;

  // Admin pending applications count
  const pendingAdminCount =
    currentUser?.role === 'admin'
      ? tutorApplications.filter(a => a.status === 'PENDING').length
      : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* ========================================================================= */}
        {/* BRAND TITLE                                                               */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('find');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <BrandLockup size="md" />
            <span className="hidden xl:inline-block text-[10px] font-bold tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-1 self-center">
              Peer Tutoring
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ROLE-BASED NAVIGATION LINKS                                               */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          {/* Find a Tutor - Visible to Everyone */}
          <button
            onClick={() => setActiveTab('find')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
              activeTab === 'find' ? 'text-emerald-800 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-700" />
            Find a Tutor
            {activeTab === 'find' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
            )}
          </button>

          {/* My Sessions - Visible to Logged-in Users */}
          {currentUser && (
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'sessions' ? 'text-emerald-800 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              My Sessions
              {studentSessionsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full font-mono">
                  {studentSessionsCount}
                </span>
              )}
              {activeTab === 'sessions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
              )}
            </button>
          )}

          {/* Tutor Dashboard - ONLY Visible to Tutors */}
          {currentUser?.role === 'tutor' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'dashboard' ? 'text-emerald-800 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Tutor Dashboard
              {tutorPendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full font-mono">
                  {tutorPendingCount} new
                </span>
              )}
              {activeTab === 'dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
              )}
            </button>
          )}

          {/* Admin Portal - ONLY Visible to Administrators */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'admin' ? 'text-emerald-800 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Admin Portal
              {pendingAdminCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full font-mono">
                  {pendingAdminCount} pending
                </span>
              )}
              {activeTab === 'admin' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
              )}
            </button>
          )}

          {/* Apply to Tutor - Visible to Students & Guests */}
          {(!currentUser || currentUser.role === 'student') && (
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              Apply as Tutor
            </button>
          )}
        </nav>

        {/* ========================================================================= */}
        {/* AUTH CONTROLS & USER PROFILE BADGE                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notification Center Bell (Shown for logged-in users) */}
          {currentUser && <NotificationCenter onSelectBooking={onSelectBookingDetails} />}

          {/* If Logged In: Show Account Badge + Sign Out */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenUserProfile}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-colors text-xs cursor-pointer group text-left"
                title="View & Edit Profile"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.name[0]}</span>
                  )}
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <span className="block font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono capitalize">
                    {currentUser.role === 'admin'
                      ? 'Administrator'
                      : currentUser.role === 'tutor'
                      ? 'Peer Tutor'
                      : 'Student'}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Sign Out of this account"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            /* If Not Logged In: Show Sign In & Sign Up Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('find');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg font-semibold ${
              activeTab === 'find' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              Find a Tutor
            </span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setActiveTab('sessions');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg font-semibold ${
                activeTab === 'sessions' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                My Sessions
              </span>
              {studentSessionsCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[11px]">
                  {studentSessionsCount}
                </span>
              )}
            </button>
          )}

          {currentUser?.role === 'tutor' && (
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg font-semibold ${
                activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Tutor Dashboard
              </span>
              {tutorPendingCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-mono text-[11px]">
                  {tutorPendingCount} new
                </span>
              )}
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg font-semibold ${
                activeTab === 'admin' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Admin Portal
              </span>
              {pendingAdminCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-mono text-[11px]">
                  {pendingAdminCount} pending
                </span>
              )}
            </button>
          )}

          {(!currentUser || currentUser.role === 'student') && (
            <button
              onClick={() => {
                onOpenRegisterModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
            >
              <Award className="w-4 h-4 text-emerald-700" />
              Apply as Peer Tutor
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            {currentUser ? (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    onOpenUserProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-center font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Profile ({currentUser.name})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
                >
                  Sign Out ({currentUser.name})
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center font-bold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center font-bold text-white bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

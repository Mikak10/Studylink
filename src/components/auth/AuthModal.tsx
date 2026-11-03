import React, { useState } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { Campus } from '../../types';
import { LAU_MAJORS_BY_SCHOOL, ALL_LAU_MAJORS } from '../../data/lauMajors';
import { BrandAppIcon } from '../common/BrandLogo';
import { X, Lock, User, Mail, GraduationCap, MapPin, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalDefaultTab, login, signup } = useStudyLinkData();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalDefaultTab || 'login');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up State
  const [signupRole, setSignupRole] = useState<'student' | 'tutor'>('student');
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCampus, setSignupCampus] = useState<Campus>('Beirut');
  const [signupMajor, setSignupMajor] = useState<string>(ALL_LAU_MAJORS[0] || 'B.E. in Computer Engineering');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  // Synchronize tab when opened
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalDefaultTab);
      setLoginError(null);
      setSignupError(null);
    }
  }, [isAuthModalOpen, authModalDefaultTab]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = login(loginIdentifier, loginPassword);
    if (result.success) {
      closeAuthModal();
    } else {
      setLoginError(result.error || 'Invalid credentials.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please retype your password.');
      return;
    }

    const result = signup({
      name: signupName.trim(),
      username: signupUsername.trim().toLowerCase(),
      email: signupEmail.trim().toLowerCase(),
      password: signupPassword,
      role: signupRole,
      campus: signupCampus === 'Both' ? 'Beirut' : signupCampus,
      major: signupMajor.trim() || 'General Studies',
    });

    if (result.success) {
      closeAuthModal();
    } else {
      setSignupError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <BrandAppIcon className="w-10 h-10 rounded-xl shadow-xs" variant="rounded" />
            <div>
              <h3 className="text-base font-black font-nunito text-[#0c2a23] leading-tight">
                LAU StudentLink
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeTab === 'login' ? 'Sign in with your university account' : 'Register your student or tutor account'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setSignupError(null);
            }}
            className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* ================================================================= */}
          {/* SIGN IN FORM                                                      */}
          {/* ================================================================= */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </div>
              )}

              {/* Username or Email Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Username or LAU Email *
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. sami or sami.abboud@lau.edu"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    defaultChecked
                  />
                  <span>Remember my login</span>
                </label>
                <span className="text-slate-400">
                  LAU Single Sign-On Ready
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4 text-xs"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Fast 1-Click Demo Login Shortcuts */}
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  Demo Quick Login:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('admin');
                      setLoginPassword('password123');
                    }}
                    className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-[10px] text-center transition-colors cursor-pointer"
                    title="Sign in as Admin (Approval portal only)"
                  >
                    Dr. Mona (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('sami');
                      setLoginPassword('password123');
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-[10px] text-center transition-colors cursor-pointer"
                    title="Sign in as Student"
                  >
                    Sami (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('nour');
                      setLoginPassword('password123');
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-[10px] text-center transition-colors cursor-pointer"
                    title="Sign in as Peer Tutor"
                  >
                    Nour (Tutor)
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-slate-500 text-[11px]">Don&apos;t have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-emerald-700 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* ================================================================= */
            /* SIGN UP FORM                                                      */
            /* ================================================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              {signupError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{signupError}</span>
                </div>
              )}

              {/* Role Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Type / Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('student')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      signupRole === 'student'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">Student</span>
                    <span className="text-[10px] text-slate-500 font-normal">Book peer tutors</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('tutor')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      signupRole === 'tutor'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">Peer Tutor</span>
                    <span className="text-[10px] text-slate-500 font-normal">Offer tutoring</span>
                  </button>
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    placeholder="e.g. Maya Khoury"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value)}
                    placeholder="e.g. maya_k"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Email & Campus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">LAU Email *</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="e.g. maya.khoury@lau.edu"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus *</label>
                  <select
                    value={signupCampus}
                    onChange={e => setSignupCampus(e.target.value as Campus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="Beirut">Beirut Campus</option>
                    <option value="Byblos">Byblos Campus</option>
                  </select>
                </div>
              </div>

              {/* Major */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Degree / Major * (Official LAU Programs)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Grouped by School</span>
                </label>
                <select
                  value={signupMajor}
                  onChange={e => setSignupMajor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium cursor-pointer"
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

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={e => setSignupConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Register & Sign In
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-500 text-[11px]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-emerald-700 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

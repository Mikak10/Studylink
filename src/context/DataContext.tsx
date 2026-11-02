import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  TutorProfile,
  Booking,
  Review,
  DemoPersona,
  PersonaId,
  BookingStatus,
  UserAccount,
  AppNotification,
  TutorApplication,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_TUTORS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  DEMO_PERSONAS,
  INITIAL_ACCOUNTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_APPLICATIONS,
} from '../data/seedData';

interface DataContextType {
  // Authentication & Users
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  login: (usernameOrEmail: string, password: string) => { success: boolean; error?: string; user?: UserAccount };
  signup: (data: Omit<UserAccount, 'id' | 'createdAt'>) => { success: boolean; error?: string; user?: UserAccount };
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalDefaultTab: 'login' | 'signup';

  // Active persona (syncs with currentUser)
  activePersona: DemoPersona;
  setActivePersonaId: (id: PersonaId) => void;

  // Domain catalog & state
  courses: Course[];
  tutors: TutorProfile[];
  bookings: Booking[];
  reviews: Review[];
  updateUserProfile: (updates: { name?: string; avatarUrl?: string; major?: string; campus?: 'Beirut' | 'Byblos' }) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => { success: boolean; error?: string; booking?: Booking };
  updateBookingStatus: (bookingId: string, status: BookingStatus, declineReason?: string) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  addReview: (reviewData: Omit<Review, 'id' | 'date'>) => void;
  addTutorFeedback: (bookingId: string, feedback: string) => void;
  registerTutor: (newTutor: Omit<TutorProfile, 'id' | 'rating' | 'totalReviews' | 'totalSessionsCompleted'>) => TutorProfile;
  updateTutorProfile: (tutorId: string, updates: Partial<TutorProfile>) => void;
  resetDemoData: () => void;
  getTutorById: (tutorId: string) => TutorProfile | undefined;
  getReviewsForTutor: (tutorId: string) => Review[];
  getBookingsForStudent: (studentId: string) => Booking[];
  getBookingsForTutor: (tutorId: string) => Booking[];
  isSlotAlreadyBooked: (tutorId: string, date: string, timeSlot: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Tutor Applications & Admin Approval Workflow
  tutorApplications: TutorApplication[];
  submitTutorApplication: (appData: Omit<TutorApplication, 'id' | 'status' | 'submittedAt'>) => {
    success: boolean;
    application?: TutorApplication;
    error?: string;
  };
  approveTutorApplication: (applicationId: string, adminNotes?: string) => void;
  rejectTutorApplication: (applicationId: string, reason?: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

const STORAGE_KEYS = {
  ACCOUNTS: 'lausl_accounts_v2',
  CURRENT_USER: 'lausl_current_user_v2',
  PERSONA: 'lausl_persona_v2',
  TUTORS: 'lausl_tutors_v2',
  BOOKINGS: 'lausl_bookings_v2',
  REVIEWS: 'lausl_reviews_v2',
  NOTIFICATIONS: 'lausl_notifications_v2',
  APPLICATIONS: 'lausl_applications_v2',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Registered Accounts
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || localStorage.getItem('lausl_accounts_v2');
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        // Ensure all INITIAL_ACCOUNTS (specifically admin, sami, nour, karim, ziad) are present
        const existingIds = new Set(parsed.map(a => a.id));
        const missing = INITIAL_ACCOUNTS.filter(
          a => !existingIds.has(a.id) && !parsed.some(p => p.username.toLowerCase() === a.username.toLowerCase())
        );
        let merged = [...parsed, ...missing];
        // Guarantee admin account has role 'admin'
        merged = merged.map(a =>
          a.id === 'admin' || a.username.toLowerCase() === 'admin' ? { ...a, role: 'admin' as const } : a
        );
        return merged;
      }
      return INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  // 2. Current Logged-in User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // 3. Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'login' | 'signup'>('login');

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 4. Derived active persona
  const activePersona: DemoPersona = currentUser
    ? {
        id: (currentUser.role === 'admin' || currentUser.username === 'admin' || currentUser.id === 'admin'
          ? 'admin'
          : currentUser.username === 'nour' || currentUser.id === 'nour'
          ? 'nour'
          : currentUser.username === 'sami' || currentUser.id === 'sami'
          ? 'sami'
          : currentUser.username) as PersonaId,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        title: `${
          currentUser.role === 'admin'
            ? 'LAU Academic Coordinator (Admin)'
            : currentUser.role === 'tutor'
            ? 'Peer Tutor'
            : 'Student'
        } (${currentUser.name})`,
        campus: currentUser.campus,
        major: currentUser.major,
        avatarUrl: currentUser.avatarUrl,
        tutorProfileId: currentUser.tutorProfileId,
      }
    : {
        id: 'guest',
        name: 'Guest Visitor',
        email: 'guest@lau.edu',
        role: 'guest',
        title: 'Guest Visitor',
        campus: 'Beirut',
        major: 'Prospective Student',
      };

  // Quick switch between accounts (Guaranteed to work for admin, tutors, students, and guests)
  const setActivePersonaId = (id: PersonaId) => {
    if (id === 'guest') {
      setCurrentUser(null);
      showToast('Switched to Guest student mode (browsing catalog)');
      return;
    }

    // 1. Look in active accounts
    let matchedAccount = accounts.find(
      a => a.id === id || a.username.toLowerCase() === id.toLowerCase()
    );

    // 2. Fallback to INITIAL_ACCOUNTS if not found in state
    if (!matchedAccount) {
      const initialMatch = INITIAL_ACCOUNTS.find(
        a => a.id === id || a.username.toLowerCase() === id.toLowerCase()
      );
      if (initialMatch) {
        matchedAccount = initialMatch;
        setAccounts(prev => [initialMatch, ...prev.filter(a => a.id !== initialMatch.id)]);
      }
    }

    // 3. Explicit fallback for admin persona
    if (!matchedAccount && id === 'admin') {
      matchedAccount = {
        id: 'admin',
        username: 'admin',
        email: 'mona.majdalani@lau.edu',
        password: 'password123',
        name: 'Dr. Mona Majdalani',
        role: 'admin',
        campus: 'Beirut',
        major: 'LAU Academic & Tutoring Coordinator',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        createdAt: '2026-08-01T10:00:00.000Z',
      };
      setAccounts(prev => [matchedAccount!, ...prev.filter(a => a.id !== 'admin')]);
    }

    if (matchedAccount) {
      setCurrentUser(matchedAccount);
      showToast(`Switched account: ${matchedAccount.name} (${matchedAccount.role.toUpperCase()})`);
    }
  };

  // Login handler
  const login = (usernameOrEmail: string, password: string) => {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = password.trim();

    let matched = accounts.find(
      acc =>
        (acc.username.toLowerCase() === cleanIdentifier || acc.email.toLowerCase() === cleanIdentifier) &&
        acc.password === cleanPassword
    );

    // Resilient fallback to seed accounts
    if (!matched) {
      const initMatch = INITIAL_ACCOUNTS.find(
        acc =>
          (acc.username.toLowerCase() === cleanIdentifier || acc.email.toLowerCase() === cleanIdentifier) &&
          acc.password === cleanPassword
      );
      if (initMatch) {
        matched = initMatch;
        setAccounts(prev => [initMatch, ...prev.filter(a => a.id !== initMatch.id)]);
      }
    }

    if (!matched) {
      return {
        success: false,
        error: 'Invalid username/email or password. Please verify your credentials and try again.',
      };
    }

    setCurrentUser(matched);
    showToast(`Welcome back, ${matched.name}! (${matched.role.toUpperCase()})`);
    return { success: true, user: matched };
  };

  // Signup handler
  const signup = (data: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check unique username or email
    const exists = accounts.some(
      a => a.username.toLowerCase() === cleanUsername || a.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      return {
        success: false,
        error: 'An account with this username or LAU email already exists. Please choose another username or log in.',
      };
    }

    const newId = `user-${Date.now()}`;
    let newTutorProfileId: string | undefined = undefined;

    // If registering as a tutor, auto-provision a starter tutor profile so they appear in discovery
    if (data.role === 'tutor') {
      newTutorProfileId = `tutor-${Date.now()}`;
      const newTutorProfile: TutorProfile = {
        id: newTutorProfileId,
        fullName: data.name,
        email: data.email,
        campus: data.campus,
        school: 'SAS',
        major: data.major,
        academicYear: 'Senior',
        bio: `${data.name} is a peer tutor at LAU specializing in peer academic support.`,
        hourlyRate: 10,
        rating: 5.0,
        totalReviews: 0,
        totalSessionsCompleted: 0,
        isPeerCertified: true,
        courses: [
          { courseId: 'lau-mth201', courseCode: 'MTH201', courseName: 'Calculus III', gradeAchieved: 'A' },
        ],
        availability: [
          { id: `slot-${Date.now()}-1`, dayOfWeek: 'Tuesday', timeSlot: '14:00 - 15:00', format: 'In-Person', location: `${data.campus} Library Level 3` },
          { id: `slot-${Date.now()}-2`, dayOfWeek: 'Thursday', timeSlot: '16:00 - 17:00', format: 'Online', location: 'Official LAU Microsoft Teams' },
        ],
      };
      setTutors(prev => [newTutorProfile, ...prev]);
    }

    const newAccount: UserAccount = {
      ...data,
      id: newId,
      username: cleanUsername,
      email: cleanEmail,
      tutorProfileId: newTutorProfileId,
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => [newAccount, ...prev]);
    setCurrentUser(newAccount);
    showToast(`Account created successfully! Welcome to LAU StudyLink, ${newAccount.name}.`);
    return { success: true, user: newAccount };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    showToast('You have been signed out.');
  };

  // 5. Courses State
  const [courses] = useState<Course[]>(INITIAL_COURSES);

  // 6. Tutors State
  const [tutors, setTutors] = useState<TutorProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TUTORS);
      return saved ? JSON.parse(saved) : INITIAL_TUTORS;
    } catch {
      return INITIAL_TUTORS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
  }, [tutors]);

  // 7. Bookings State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  // 8. Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  // 9. Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // 10. Tutor Applications State (Admin Approval Workflow)
  const [tutorApplications, setTutorApplications] = useState<TutorApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || localStorage.getItem('lausl_applications_v2');
      if (saved) {
        const parsed: TutorApplication[] = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Ensure all initial applications exist
          const existingIds = new Set(parsed.map(a => a.id));
          const missing = INITIAL_APPLICATIONS.filter(a => !existingIds.has(a.id));
          return [...parsed, ...missing];
        }
      }
      return INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(tutorApplications));
  }, [tutorApplications]);

  const addNotification = (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3800);
  };

  // Conflict detection
  const isSlotAlreadyBooked = (tutorId: string, date: string, timeSlot: string): boolean => {
    return bookings.some(
      b =>
        b.tutorId === tutorId &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        (b.status === 'PENDING' || b.status === 'CONFIRMED')
    );
  };

  // Create booking
  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    // Self-booking prevention: A student-tutor cannot book a session with themselves
    const targetTutor = tutors.find(t => t.id === bookingData.tutorId);
    const isSelfBooking =
      bookingData.studentId === bookingData.tutorId ||
      (currentUser?.tutorProfileId && currentUser.tutorProfileId === bookingData.tutorId) ||
      (activePersona.tutorProfileId && activePersona.tutorProfileId === bookingData.tutorId) ||
      (targetTutor && currentUser?.email && targetTutor.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (targetTutor && activePersona.email && targetTutor.email.toLowerCase() === activePersona.email.toLowerCase()) ||
      (targetTutor && currentUser?.name && targetTutor.fullName.toLowerCase() === currentUser.name.toLowerCase()) ||
      (targetTutor && activePersona.name && targetTutor.fullName.toLowerCase() === activePersona.name.toLowerCase());

    if (isSelfBooking) {
      return {
        success: false,
        error: 'You cannot book a tutoring session with yourself. As an LAU tutor, you can request peer tutoring sessions with any other tutor on the platform.',
      };
    }

    if (isSlotAlreadyBooked(bookingData.tutorId, bookingData.date, bookingData.timeSlot)) {
      return {
        success: false,
        error: `This time slot (${bookingData.timeSlot} on ${bookingData.date}) has already been requested or confirmed for this tutor. Please pick another available slot.`,
      };
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `b-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);

    // Send notification to the tutor
    addNotification({
      recipientUserId: bookingData.tutorId,
      title: 'New Booking Request',
      message: `${bookingData.studentName} requested a session for ${bookingData.courseCode} on ${bookingData.date} (${bookingData.timeSlot}).`,
      type: 'BOOKING_REQUEST',
      bookingId: newBooking.id,
    });

    showToast(`Session request sent to ${bookingData.tutorName}! It is now pending approval.`);
    return { success: true, booking: newBooking };
  };

  // Update booking status
  const updateBookingStatus = (bookingId: string, status: BookingStatus, declineReason?: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            declineReason: declineReason ?? b.declineReason,
          };
        }
        return b;
      })
    );

    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      if (status === 'CONFIRMED') {
        showToast(`Session with ${booking.studentName} has been confirmed!`);
        addNotification({
          recipientUserId: booking.studentId,
          title: 'Booking Confirmed!',
          message: `Tutor ${booking.tutorName} accepted your session for ${booking.courseCode} on ${booking.date} at ${booking.timeSlot}.`,
          type: 'BOOKING_CONFIRMED',
          bookingId,
        });
      } else if (status === 'CANCELLED') {
        showToast(`Session with ${booking.studentName} was declined.`);
        addNotification({
          recipientUserId: booking.studentId,
          title: 'Session Request Declined',
          message: `Your request for ${booking.courseCode} with ${booking.tutorName} was declined.${declineReason ? ` Reason: ${declineReason}` : ''}`,
          type: 'BOOKING_CANCELLED',
          bookingId,
        });
      } else if (status === 'COMPLETED') {
        showToast(`Session marked as completed.`);
        addNotification({
          recipientUserId: booking.studentId,
          title: 'Session Completed',
          message: `Your session for ${booking.courseCode} with ${booking.tutorName} has concluded. Please leave a review!`,
          type: 'SESSION_COMPLETED',
          bookingId,
        });
      }
    }
  };

  // Cancel booking
  const cancelBooking = (bookingId: string, reason?: string) => {
    updateBookingStatus(bookingId, 'CANCELLED', reason || 'Cancelled by student');
  };

  // Tutor leaves feedback & study notes for student
  const addTutorFeedback = (bookingId: string, feedback: string) => {
    const today = new Date().toISOString().split('T')[0];
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, tutorFeedback: feedback, tutorFeedbackDate: today }
          : b
      )
    );
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (targetBooking) {
      addNotification({
        recipientUserId: targetBooking.studentId,
        title: 'Tutor Session Feedback Added',
        message: `${targetBooking.tutorName} added study notes & recommendations for your ${targetBooking.courseCode} session.`,
        type: 'TUTOR_FEEDBACK',
        bookingId,
      });
      showToast('Session feedback & study notes saved for the student.');
    }
  };

  // Add review
  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews(prev => [newReview, ...prev]);

    setBookings(prev =>
      prev.map(b => (b.id === reviewData.bookingId ? { ...b, reviewSubmitted: true } : b))
    );

    setTutors(prev =>
      prev.map(t => {
        if (t.id === reviewData.tutorId) {
          const tutorAllReviews = [newReview, ...reviews.filter(r => r.tutorId === t.id)];
          const sum = tutorAllReviews.reduce((acc, r) => acc + r.rating, 0);
          const avg = Number((sum / tutorAllReviews.length).toFixed(1));
          return {
            ...t,
            rating: avg,
            totalReviews: tutorAllReviews.length,
          };
        }
        return t;
      })
    );

    showToast('Feedback submitted successfully! Thank you for supporting peer learning.');
  };

  // Register tutor
  const registerTutor = (newTutor: Omit<TutorProfile, 'id' | 'rating' | 'totalReviews' | 'totalSessionsCompleted'>): TutorProfile => {
    const tutor: TutorProfile = {
      ...newTutor,
      id: `tutor-${Date.now()}`,
      rating: 5.0,
      totalReviews: 0,
      totalSessionsCompleted: 0,
    };
    setTutors(prev => [tutor, ...prev]);
    showToast(`Congratulations ${newTutor.fullName}! Your tutor profile has been created.`);
    return tutor;
  };

  // Submit tutor application (Any student can apply, reviewed by Admin)
  const submitTutorApplication = (
    data: Omit<TutorApplication, 'id' | 'status' | 'submittedAt'>
  ): { success: boolean; application?: TutorApplication; error?: string } => {
    // Check if user already has an active pending application
    const existingPending = tutorApplications.find(
      app =>
        app.status === 'PENDING' &&
        (app.applicantEmail.toLowerCase() === data.applicantEmail.toLowerCase() ||
          (data.applicantUserId && app.applicantUserId === data.applicantUserId))
    );

    if (existingPending) {
      return {
        success: false,
        error: 'You already have an application under review by LAU Administration. You will be notified once reviewed.',
      };
    }

    const newApp: TutorApplication = {
      ...data,
      id: `app-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    setTutorApplications(prev => [newApp, ...prev]);

    // Send notification to Admin
    addNotification({
      recipientUserId: 'admin',
      title: 'New Tutor Application Received',
      message: `${newApp.applicantName} (${newApp.major}, ${newApp.campus}) submitted a tutor application for ${newApp.courses.map(c => c.courseCode).join(', ')}.`,
      type: 'TUTOR_APPLICATION_SUBMITTED',
      applicationId: newApp.id,
    });

    // Also notify the applicant that it was successfully submitted
    if (newApp.applicantUserId) {
      addNotification({
        recipientUserId: newApp.applicantUserId,
        title: 'Tutor Application Submitted',
        message: 'Your tutor application has been received by LAU Administration. An academic coordinator will review your qualifications shortly.',
        type: 'TUTOR_APPLICATION_SUBMITTED',
        applicationId: newApp.id,
      });
    }

    showToast('Application submitted! LAU Administration will review your profile shortly.');
    return { success: true, application: newApp };
  };

  // Admin approves tutor application
  const approveTutorApplication = (applicationId: string, adminNotes?: string) => {
    const targetApp = tutorApplications.find(a => a.id === applicationId);
    if (!targetApp) return;

    const reviewedAt = new Date().toISOString();
    const reviewerName = currentUser?.name || 'Dr. Mona Majdalani (Admin)';

    // 1. Update application status
    setTutorApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              status: 'APPROVED',
              reviewedAt,
              adminReviewerName: reviewerName,
              adminNotes: adminNotes || 'Approved for LAU Peer Tutoring Program',
            }
          : a
      )
    );

    // 2. Provision or update TutorProfile
    const newTutorId = `tutor-${Date.now()}`;
    const newTutorProfile: TutorProfile = {
      id: newTutorId,
      fullName: targetApp.applicantName,
      email: targetApp.applicantEmail,
      campus: targetApp.campus,
      school: targetApp.school,
      major: targetApp.major,
      academicYear: targetApp.academicYear,
      bio: targetApp.bio,
      hourlyRate: targetApp.hourlyRate,
      rating: 5.0,
      totalReviews: 0,
      totalSessionsCompleted: 0,
      isPeerCertified: true,
      courses: targetApp.courses,
      availability: targetApp.availability,
      avatarUrl: targetApp.avatarUrl,
    };

    setTutors(prev => {
      const existingIdx = prev.findIndex(t => t.email.toLowerCase() === targetApp.applicantEmail.toLowerCase());
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...newTutorProfile, id: copy[existingIdx].id };
        return copy;
      }
      return [newTutorProfile, ...prev];
    });

    // 3. Update applicant user account to role 'tutor'
    setAccounts(prev =>
      prev.map(acc => {
        if (
          acc.id === targetApp.applicantUserId ||
          acc.email.toLowerCase() === targetApp.applicantEmail.toLowerCase()
        ) {
          return {
            ...acc,
            role: 'tutor',
            tutorProfileId: newTutorId,
          };
        }
        return acc;
      })
    );

    // If current logged-in user is this applicant, keep session in sync
    if (
      currentUser &&
      (currentUser.id === targetApp.applicantUserId ||
        currentUser.email.toLowerCase() === targetApp.applicantEmail.toLowerCase())
    ) {
      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              role: 'tutor',
              tutorProfileId: newTutorId,
            }
          : null
      );
    }

    // 4. Send approval notification to applicant
    addNotification({
      recipientUserId: targetApp.applicantUserId || targetApp.applicantEmail,
      title: 'Tutor Application Approved! 🎉',
      message: `Congratulations ${targetApp.applicantName}! Your application to become an LAU Peer Tutor has been approved by ${reviewerName}. Your profile is now live in the directory.`,
      type: 'TUTOR_APPLICATION_APPROVED',
      applicationId,
    });

    showToast(`Application for ${targetApp.applicantName} approved! Tutor profile is now active.`);
  };

  // Admin rejects tutor application
  const rejectTutorApplication = (applicationId: string, reason?: string) => {
    const targetApp = tutorApplications.find(a => a.id === applicationId);
    if (!targetApp) return;

    const reviewedAt = new Date().toISOString();
    const reviewerName = currentUser?.name || 'Dr. Mona Majdalani (Admin)';

    setTutorApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              status: 'REJECTED',
              reviewedAt,
              adminReviewerName: reviewerName,
              adminNotes: reason || 'Application did not meet departmental peer tutoring criteria at this time.',
            }
          : a
      )
    );

    // Notify applicant
    addNotification({
      recipientUserId: targetApp.applicantUserId || targetApp.applicantEmail,
      title: 'Tutor Application Status Update',
      message: `Your application to become an LAU Peer Tutor was not approved by administration.${
        reason ? ` Feedback: ${reason}` : ' Please consult the Academic Coordinator for further details.'
      }`,
      type: 'TUTOR_APPLICATION_REJECTED',
      applicationId,
    });

    showToast(`Application for ${targetApp.applicantName} has been declined.`);
  };

  // Cross-window / cross-tab storage sync (allows testing on same machine across 2 browser windows/tabs in real-time)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === STORAGE_KEYS.BOOKINGS && e.newValue) {
          setBookings(JSON.parse(e.newValue));
        }
        if (e.key === STORAGE_KEYS.NOTIFICATIONS && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        if (e.key === STORAGE_KEYS.TUTORS && e.newValue) {
          setTutors(JSON.parse(e.newValue));
        }
        if (e.key === STORAGE_KEYS.REVIEWS && e.newValue) {
          setReviews(JSON.parse(e.newValue));
        }
        if (e.key === STORAGE_KEYS.ACCOUNTS && e.newValue) {
          setAccounts(JSON.parse(e.newValue));
        }
        if (e.key === STORAGE_KEYS.APPLICATIONS && e.newValue) {
          setTutorApplications(JSON.parse(e.newValue));
        }
      } catch {
        // ignore parse errors
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update user profile (picture, name, major, campus)
  const updateUserProfile = (updates: {
    name?: string;
    avatarUrl?: string;
    major?: string;
    campus?: 'Beirut' | 'Byblos';
  }) => {
    if (!currentUser) return;

    const updatedUser: UserAccount = {
      ...currentUser,
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
      ...(updates.major ? { major: updates.major } : {}),
      ...(updates.campus ? { campus: updates.campus } : {}),
    };

    setCurrentUser(updatedUser);
    setAccounts(prev => prev.map(a => (a.id === currentUser.id ? updatedUser : a)));

    // If current user is also a registered tutor, sync tutor profile fields as well!
    if (currentUser.tutorProfileId) {
      setTutors(prev =>
        prev.map(t =>
          t.id === currentUser.tutorProfileId
            ? {
                ...t,
                ...(updates.name ? { fullName: updates.name } : {}),
                ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
                ...(updates.major ? { major: updates.major } : {}),
                ...(updates.campus ? { campus: updates.campus } : {}),
              }
            : t
        )
      );
    }

    showToast('Profile and photo updated successfully!');
  };

  // Update tutor profile
  const updateTutorProfile = (tutorId: string, updates: Partial<TutorProfile>) => {
    setTutors(prev =>
      prev.map(t => (t.id === tutorId ? { ...t, ...updates } : t))
    );

    // If current logged-in user is this tutor, keep user account in sync
    if (currentUser && currentUser.tutorProfileId === tutorId) {
      const updatedUser: UserAccount = {
        ...currentUser,
        ...(updates.fullName ? { name: updates.fullName } : {}),
        ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
        ...(updates.major ? { major: updates.major } : {}),
        ...(updates.campus && updates.campus !== 'Both' ? { campus: updates.campus } : {}),
      };
      setCurrentUser(updatedUser);
      setAccounts(prev => prev.map(a => (a.id === currentUser.id ? updatedUser : a)));
    }

    showToast('Tutor profile & availability updated successfully.');
  };

  // Reset demo data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.TUTORS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);

    setAccounts(INITIAL_ACCOUNTS);
    setCurrentUser(INITIAL_ACCOUNTS[0]);
    setTutors(INITIAL_TUTORS);
    setBookings(INITIAL_BOOKINGS);
    setReviews(INITIAL_REVIEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTutorApplications(INITIAL_APPLICATIONS);

    showToast('Application data reset to clean initial baseline.');
  };

  // Helper getters
  const getTutorById = (tutorId: string) => tutors.find(t => t.id === tutorId);
  const getReviewsForTutor = (tutorId: string) => reviews.filter(r => r.tutorId === tutorId);
  const getBookingsForStudent = (studentId: string) =>
    bookings.filter(b => b.studentId === studentId || (currentUser && b.studentEmail === currentUser.email));
  const getBookingsForTutor = (tutorId: string) => bookings.filter(b => b.tutorId === tutorId);

  return (
    <DataContext.Provider
      value={{
        currentUser,
        accounts,
        login,
        signup,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalDefaultTab,
        activePersona,
        setActivePersonaId,
        courses,
        tutors,
        bookings,
        reviews,
        updateUserProfile,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        addReview,
        addTutorFeedback,
        registerTutor,
        updateTutorProfile,
        resetDemoData,
        getTutorById,
        getReviewsForTutor,
        getBookingsForStudent,
        getBookingsForTutor,
        isSlotAlreadyBooked,
        toastMessage,
        showToast,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        tutorApplications,
        submitTutorApplication,
        approveTutorApplication,
        rejectTutorApplication,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useStudyLinkData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useStudyLinkData must be used within a DataProvider');
  }
  return context;
};

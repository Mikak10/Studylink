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
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../lib/firebase';

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
  resetDemoData: () => Promise<void>;
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
  isFirebaseConnected: boolean;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'lausl_current_user_v2',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Test connection on mount
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // 1. Registered Accounts
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);

  // 2. Current Logged-in User (Session-scoped: starts signed out by default whenever opening the app)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('lausl_current_user_v2');
      localStorage.removeItem('lausl_persona_v2');
      localStorage.removeItem('lausl_persona');

      const saved = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('lausl_current_user_v2');
    } catch {}
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

  const setActivePersonaId = (id: PersonaId) => {
    if (id === 'guest') {
      setCurrentUser(null);
      showToast('Switched to Guest student mode (browsing catalog)');
      return;
    }

    let matchedAccount = accounts.find(
      a => a.id === id || a.username.toLowerCase() === id.toLowerCase()
    );

    if (!matchedAccount) {
      const initialMatch = INITIAL_ACCOUNTS.find(
        a => a.id === id || a.username.toLowerCase() === id.toLowerCase()
      );
      if (initialMatch) {
        matchedAccount = initialMatch;
      }
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

  // Logout handler
  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('lausl_current_user_v2');
    } catch {}
    setCurrentUser(null);
    showToast('You have been signed out.');
  };

  // Domain Catalog State
  const [courses] = useState<Course[]>(INITIAL_COURSES);
  const [tutors, setTutors] = useState<TutorProfile[]>(INITIAL_TUTORS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [tutorApplications, setTutorApplications] = useState<TutorApplication[]>(INITIAL_APPLICATIONS);

  // =========================================================================
  // FIREBASE REAL-TIME LISTENERS & AUTO-SEEDING
  // =========================================================================

  // 1. Sync Tutors
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tutors'), async snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_TUTORS.forEach(t => {
          batch.set(doc(db, 'tutors', t.id), t);
        });
        await batch.commit().catch(console.error);
        setTutors(INITIAL_TUTORS);
      } else {
        const remoteTutors = snapshot.docs.map(d => d.data() as TutorProfile);
        setTutors(remoteTutors);
      }
    }, err => {
      console.warn('Firestore tutors listener warning:', err);
    });
    return () => unsub();
  }, []);

  // 2. Sync Bookings
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bookings'), async snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_BOOKINGS.forEach(b => {
          batch.set(doc(db, 'bookings', b.id), b);
        });
        await batch.commit().catch(console.error);
        setBookings(INITIAL_BOOKINGS);
      } else {
        const remoteBookings = snapshot.docs.map(d => d.data() as Booking);
        setBookings(remoteBookings);
      }
    }, err => {
      console.warn('Firestore bookings listener warning:', err);
    });
    return () => unsub();
  }, []);

  // 3. Sync Reviews
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), async snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_REVIEWS.forEach(r => {
          batch.set(doc(db, 'reviews', r.id), r);
        });
        await batch.commit().catch(console.error);
        setReviews(INITIAL_REVIEWS);
      } else {
        const remoteReviews = snapshot.docs.map(d => d.data() as Review);
        setReviews(remoteReviews);
      }
    }, err => {
      console.warn('Firestore reviews listener warning:', err);
    });
    return () => unsub();
  }, []);

  // 4. Sync Accounts
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'accounts'), async snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_ACCOUNTS.forEach(a => {
          batch.set(doc(db, 'accounts', a.id), a);
        });
        await batch.commit().catch(console.error);
        setAccounts(INITIAL_ACCOUNTS);
      } else {
        const remoteAccounts = snapshot.docs.map(d => d.data() as UserAccount);
        const hasAdmin = remoteAccounts.some(a => a.id === 'admin' || a.username.toLowerCase() === 'admin');
        if (!hasAdmin) {
          const adminAccount = INITIAL_ACCOUNTS.find(a => a.id === 'admin')!;
          setDoc(doc(db, 'accounts', 'admin'), adminAccount).catch(console.error);
          setAccounts([...remoteAccounts, adminAccount]);
        } else {
          setAccounts(remoteAccounts);
        }
      }
    }, err => {
      console.warn('Firestore accounts listener warning:', err);
    });
    return () => unsub();
  }, []);

  // 5. Sync Tutor Applications
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'applications'), async snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_APPLICATIONS.forEach(a => {
          batch.set(doc(db, 'applications', a.id), a);
        });
        await batch.commit().catch(console.error);
        setTutorApplications(INITIAL_APPLICATIONS);
      } else {
        const remoteApps = snapshot.docs.map(d => d.data() as TutorApplication);
        setTutorApplications(remoteApps);
      }
    }, err => {
      console.warn('Firestore applications listener warning:', err);
    });
    return () => unsub();
  }, []);

  // 6. Sync Notifications
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), async snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_NOTIFICATIONS.forEach(n => {
          batch.set(doc(db, 'notifications', n.id), n);
        });
        await batch.commit().catch(console.error);
        setNotifications(INITIAL_NOTIFICATIONS);
      } else {
        const remoteNotifs = snapshot.docs.map(d => d.data() as AppNotification);
        setNotifications(remoteNotifs);
      }
    }, err => {
      console.warn('Firestore notifications listener warning:', err);
    });
    return () => unsub();
  }, []);

  // Notification helper
  const addNotification = (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newNotif: AppNotification = {
      ...n,
      id: newId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newId), newNotif).catch(console.error);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    updateDoc(doc(db, 'notifications', id), { read: true }).catch(console.error);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifications.filter(n => !n.read).forEach(n => {
      updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(console.error);
    });
  };

  // Signup
  const signup = (data: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

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
      setDoc(doc(db, 'tutors', newTutorProfileId), newTutorProfile).catch(console.error);
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
    setDoc(doc(db, 'accounts', newId), newAccount).catch(console.error);

    setCurrentUser(newAccount);
    showToast(`Account created successfully! Welcome to LAU StudyLink, ${newAccount.name}.`);
    return { success: true, user: newAccount };
  };

  // User Profile Update
  const updateUserProfile = (updates: { name?: string; avatarUrl?: string; major?: string; campus?: 'Beirut' | 'Byblos' }) => {
    if (!currentUser) return;

    const updatedUser: UserAccount = {
      ...currentUser,
      ...updates,
    };

    setCurrentUser(updatedUser);
    setAccounts(prev => prev.map(a => (a.id === currentUser.id ? updatedUser : a)));

    updateDoc(doc(db, 'accounts', currentUser.id), updates).catch(console.error);

    if (currentUser.tutorProfileId) {
      setTutors(prev =>
        prev.map(t =>
          t.id === currentUser.tutorProfileId
            ? {
                ...t,
                fullName: updates.name || t.fullName,
                avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : t.avatarUrl,
                major: updates.major || t.major,
                campus: updates.campus || t.campus,
              }
            : t
        )
      );
      updateDoc(doc(db, 'tutors', currentUser.tutorProfileId), {
        ...(updates.name ? { fullName: updates.name } : {}),
        ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
        ...(updates.major ? { major: updates.major } : {}),
        ...(updates.campus ? { campus: updates.campus } : {}),
      }).catch(console.error);
    }

    showToast('Your profile has been saved.');
  };

  // Create Booking
  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newId = `book-${Date.now()}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);
    setDoc(doc(db, 'bookings', newId), newBooking).catch(console.error);

    addNotification({
      recipientUserId: bookingData.tutorId,
      title: 'New Session Request Received!',
      message: `${bookingData.studentName} requested a session for ${bookingData.courseCode} on ${bookingData.date} (${bookingData.timeSlot}).`,
      type: 'BOOKING_REQUEST',
      bookingId: newId,
    });

    showToast(`Request sent to ${bookingData.tutorName}! Session pending confirmation.`);
    return { success: true, booking: newBooking };
  };

  // Update Booking Status
  const updateBookingStatus = (bookingId: string, status: BookingStatus, declineReason?: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status, cancellationReason: declineReason } : b))
    );

    updateDoc(doc(db, 'bookings', bookingId), {
      status,
      ...(declineReason ? { cancellationReason: declineReason } : {}),
    }).catch(console.error);

    const target = bookings.find(b => b.id === bookingId);
    if (target) {
      if (status === 'CONFIRMED') {
        addNotification({
          recipientUserId: target.studentId,
          title: 'Session Confirmed!',
          message: `${target.tutorName} has confirmed your peer tutoring session for ${target.courseCode}.`,
          type: 'BOOKING_CONFIRMED',
          bookingId,
        });
        showToast(`Session for ${target.courseCode} confirmed!`);
      } else if (status === 'CANCELLED') {
        addNotification({
          recipientUserId: target.studentId,
          title: 'Session Declined',
          message: `${target.tutorName} was unable to accept your request. Reason: ${declineReason || 'Schedule conflict'}.`,
          type: 'BOOKING_CANCELLED',
          bookingId,
        });
        showToast('Session request declined.');
      } else if (status === 'COMPLETED') {
        addNotification({
          recipientUserId: target.studentId,
          title: 'Session Completed — Leave a Review',
          message: `Your tutoring session with ${target.tutorName} is complete. Rate your experience!`,
          type: 'SESSION_COMPLETED',
          bookingId,
        });
        showToast('Session marked as completed.');
      }
    }
  };

  // Cancel Booking
  const cancelBooking = (bookingId: string, reason?: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED', cancellationReason: reason } : b))
    );

    updateDoc(doc(db, 'bookings', bookingId), {
      status: 'CANCELLED',
      cancellationReason: reason || 'Cancelled by student',
    }).catch(console.error);

    showToast('Session has been cancelled.');
  };

  // Add Review
  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newId = `rev-${Date.now()}`;
    const newRev: Review = {
      ...reviewData,
      id: newId,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews(prev => [newRev, ...prev]);
    setDoc(doc(db, 'reviews', newId), newRev).catch(console.error);

    const tutorToUpdate = tutors.find(t => t.id === reviewData.tutorId);
    if (tutorToUpdate) {
      const existingReviews = reviews.filter(r => r.tutorId === reviewData.tutorId);
      const allRatings = [...existingReviews.map(r => r.rating), reviewData.rating];
      const avg = allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length;
      const updatedTutor = {
        ...tutorToUpdate,
        rating: Math.round(avg * 10) / 10,
        totalReviews: allRatings.length,
      };
      setTutors(prev => prev.map(t => (t.id === reviewData.tutorId ? updatedTutor : t)));
      updateDoc(doc(db, 'tutors', reviewData.tutorId), {
        rating: Math.round(avg * 10) / 10,
        totalReviews: allRatings.length,
      }).catch(console.error);
    }

    showToast('Thank you for your review! Your feedback helps peer tutors improve.');
  };

  // Add Tutor Feedback
  const addTutorFeedback = (bookingId: string, feedback: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, tutorFeedback: feedback } : b))
    );
    updateDoc(doc(db, 'bookings', bookingId), {
      tutorFeedback: feedback,
    }).catch(console.error);

    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      addNotification({
        recipientUserId: b.studentId,
        title: 'Tutor Feedback Received',
        message: `${b.tutorName} provided learning notes on your ${b.courseCode} session.`,
        type: 'TUTOR_FEEDBACK',
        bookingId,
      });
    }
    showToast('Session feedback & study notes saved for the student.');
  };

  // Register Tutor
  const registerTutor = (newTutorData: Omit<TutorProfile, 'id' | 'rating' | 'totalReviews' | 'totalSessionsCompleted'>): TutorProfile => {
    const newId = `tutor-${Date.now()}`;
    const newTutor: TutorProfile = {
      ...newTutorData,
      id: newId,
      rating: 5.0,
      totalReviews: 0,
      totalSessionsCompleted: 0,
      isPeerCertified: true,
    };

    setTutors(prev => [newTutor, ...prev]);
    setDoc(doc(db, 'tutors', newId), newTutor).catch(console.error);

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        role: 'tutor',
        tutorProfileId: newId,
      };
      setCurrentUser(updatedUser);
      setAccounts(prev => prev.map(a => (a.id === currentUser.id ? updatedUser : a)));
      updateDoc(doc(db, 'accounts', currentUser.id), {
        role: 'tutor',
        tutorProfileId: newId,
      }).catch(console.error);
    }

    showToast(`Welcome to the peer tutor team, ${newTutor.fullName}! Your profile is now published.`);
    return newTutor;
  };

  // Update Tutor Profile
  const updateTutorProfile = (tutorId: string, updates: Partial<TutorProfile>) => {
    setTutors(prev => prev.map(t => (t.id === tutorId ? { ...t, ...updates } : t)));
    updateDoc(doc(db, 'tutors', tutorId), updates).catch(console.error);

    if (currentUser && currentUser.tutorProfileId === tutorId) {
      const updatedUser: UserAccount = {
        ...currentUser,
        name: updates.fullName || currentUser.name,
        major: updates.major || currentUser.major,
        campus: (updates.campus === 'Both' ? 'Beirut' : updates.campus) || currentUser.campus,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser.avatarUrl,
      };
      setCurrentUser(updatedUser);
      setAccounts(prev => prev.map(a => (a.id === currentUser.id ? updatedUser : a)));
      updateDoc(doc(db, 'accounts', currentUser.id), {
        name: updatedUser.name,
        major: updatedUser.major,
        campus: updatedUser.campus,
        avatarUrl: updatedUser.avatarUrl,
      }).catch(console.error);
    }

    showToast('Tutor profile & availability updated successfully.');
  };

  // Submit Tutor Application
  const submitTutorApplication = (appData: Omit<TutorApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newId = `app-${Date.now()}`;
    const newApplication: TutorApplication = {
      ...appData,
      id: newId,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    setTutorApplications(prev => [newApplication, ...prev]);
    setDoc(doc(db, 'applications', newId), newApplication).catch(console.error);

    addNotification({
      recipientUserId: 'admin',
      title: 'New Tutor Application Received',
      message: `${appData.applicantName} (${appData.major}) submitted a peer tutor application for review.`,
      type: 'TUTOR_APPLICATION_SUBMITTED',
      applicationId: newId,
    });

    showToast('Application submitted! LAU Academic Administration will review your credentials.');
    return { success: true, application: newApplication };
  };

  // Approve Tutor Application
  const approveTutorApplication = (applicationId: string, adminNotes?: string) => {
    const app = tutorApplications.find(a => a.id === applicationId);
    if (!app) return;

    const reviewedAt = new Date().toISOString();
    setTutorApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              status: 'APPROVED',
              adminNotes,
              adminReviewerName: currentUser?.name || 'Dr. Mona Majdalani',
              reviewedAt,
            }
          : a
      )
    );

    updateDoc(doc(db, 'applications', applicationId), {
      status: 'APPROVED',
      adminNotes: adminNotes || 'Approved for LAU Peer Tutoring Program.',
      adminReviewerName: currentUser?.name || 'Dr. Mona Majdalani',
      reviewedAt,
    }).catch(console.error);

    const newTutorId = `tutor-${app.applicantUserId || 'applicant'}-${Date.now()}`;
    const newTutorProfile: TutorProfile = {
      id: newTutorId,
      fullName: app.applicantName,
      email: app.applicantEmail,
      campus: app.campus,
      school: app.school,
      major: app.major,
      academicYear: app.academicYear,
      bio: app.bio,
      hourlyRate: app.hourlyRate,
      rating: 5.0,
      totalReviews: 0,
      totalSessionsCompleted: 0,
      isPeerCertified: true,
      avatarUrl: app.avatarUrl,
      courses: app.courses.map(c => ({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        gradeAchieved: c.gradeAchieved,
      })),
      availability: app.availability || [],
    };

    setTutors(prev => [newTutorProfile, ...prev.filter(t => t.email !== app.applicantEmail)]);
    setDoc(doc(db, 'tutors', newTutorId), newTutorProfile).catch(console.error);

    setAccounts(prev =>
      prev.map(acc =>
        (app.applicantUserId && acc.id === app.applicantUserId) || acc.email.toLowerCase() === app.applicantEmail.toLowerCase()
          ? { ...acc, role: 'tutor', tutorProfileId: newTutorId }
          : acc
      )
    );
    const matchedAcc = accounts.find(
      acc => (app.applicantUserId && acc.id === app.applicantUserId) || acc.email.toLowerCase() === app.applicantEmail.toLowerCase()
    );
    if (matchedAcc) {
      updateDoc(doc(db, 'accounts', matchedAcc.id), {
        role: 'tutor',
        tutorProfileId: newTutorId,
      }).catch(console.error);
    }

    addNotification({
      recipientUserId: app.applicantUserId || app.applicantEmail,
      title: 'Congratulations! Your Tutor Application is Approved',
      message: `Your application to tutor at LAU has been certified by ${currentUser?.name || 'Academic Administration'}. Welcome to the Peer Tutor network!`,
      type: 'TUTOR_APPLICATION_APPROVED',
      applicationId,
    });

    showToast(`Approved ${app.applicantName}! Their tutor profile is now live in the directory.`);
  };

  // Reject Tutor Application
  const rejectTutorApplication = (applicationId: string, reason?: string) => {
    const app = tutorApplications.find(a => a.id === applicationId);
    if (!app) return;

    const reviewedAt = new Date().toISOString();
    setTutorApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              status: 'REJECTED',
              adminNotes: reason,
              adminReviewerName: currentUser?.name || 'Dr. Mona Majdalani',
              reviewedAt,
            }
          : a
      )
    );

    updateDoc(doc(db, 'applications', applicationId), {
      status: 'REJECTED',
      adminNotes: reason || 'Application declined by academic administration.',
      adminReviewerName: currentUser?.name || 'Dr. Mona Majdalani',
      reviewedAt,
    }).catch(console.error);

    addNotification({
      recipientUserId: app.applicantUserId || app.applicantEmail,
      title: 'Tutor Application Decision',
      message: `Your tutor application was not approved at this time. Feedback: ${reason || 'Prerequisite requirements not met'}.`,
      type: 'TUTOR_APPLICATION_REJECTED',
      applicationId,
    });

    showToast(`Declined application for ${app.applicantName}.`);
  };

  // Reset Demo Data (ADMIN USER ONLY)
  const resetDemoData = async () => {
    if (currentUser?.role !== 'admin') {
      showToast('Restricted: Only administrators can reset demo data.');
      return;
    }

    try {
      showToast('Resetting Firebase database to clean demo baseline...');

      const resetCollection = async (collName: string, items: any[]) => {
        const snap = await getDocs(collection(db, collName));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        items.forEach(item => batch.set(doc(db, collName, item.id), item));
        await batch.commit();
      };

      await Promise.all([
        resetCollection('tutors', INITIAL_TUTORS),
        resetCollection('bookings', INITIAL_BOOKINGS),
        resetCollection('reviews', INITIAL_REVIEWS),
        resetCollection('accounts', INITIAL_ACCOUNTS),
        resetCollection('applications', INITIAL_APPLICATIONS),
        resetCollection('notifications', INITIAL_NOTIFICATIONS),
      ]);

      // Immediate state sync
      setTutors(INITIAL_TUTORS);
      setBookings(INITIAL_BOOKINGS);
      setReviews(INITIAL_REVIEWS);
      setAccounts(INITIAL_ACCOUNTS);
      setTutorApplications(INITIAL_APPLICATIONS);
      setNotifications(INITIAL_NOTIFICATIONS);

      showToast('Firebase database successfully reset to clean demo baseline!');
    } catch (err) {
      console.error('Error resetting Firebase demo data:', err);
      // Fallback local reset
      setAccounts(INITIAL_ACCOUNTS);
      setTutors(INITIAL_TUTORS);
      setBookings(INITIAL_BOOKINGS);
      setReviews(INITIAL_REVIEWS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setTutorApplications(INITIAL_APPLICATIONS);
      showToast('Reset local data cache to clean demo baseline.');
    }
  };

  // Helper getters
  const getTutorById = (tutorId: string) => tutors.find(t => t.id === tutorId);
  const getReviewsForTutor = (tutorId: string) => reviews.filter(r => r.tutorId === tutorId);
  const getBookingsForStudent = (studentId: string) =>
    bookings.filter(b => b.studentId === studentId || (currentUser && b.studentEmail === currentUser.email));
  const getBookingsForTutor = (tutorId: string) => bookings.filter(b => b.tutorId === tutorId);

  const isSlotAlreadyBooked = (tutorId: string, date: string, timeSlot: string) => {
    return bookings.some(
      b =>
        b.tutorId === tutorId &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        (b.status === 'CONFIRMED' || b.status === 'PENDING')
    );
  };

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
        tutorApplications,
        submitTutorApplication,
        approveTutorApplication,
        rejectTutorApplication,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        isFirebaseConnected,
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

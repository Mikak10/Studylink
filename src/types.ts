export type Campus = 'Beirut' | 'Byblos' | 'Both';
export type SessionFormat = 'In-Person' | 'Online' | 'Hybrid';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type School = 'SOE' | 'AKSOB' | 'SAS' | 'SArD';

export interface Course {
  id: string;
  code: string;         // e.g. "MTH201"
  name: string;         // e.g. "Calculus III"
  school: School;
  schoolName: string;   // e.g. "School of Arts & Sciences"
  department: string;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;     // e.g. "14:00 - 15:00"
  format: SessionFormat;
  location?: string;    // e.g. "Beirut Library"
}

export interface Review {
  id: string;
  bookingId: string;
  tutorId: string;
  studentName: string;
  rating: number;       // 1 - 5
  comment: string;
  date: string;
  courseCode: string;
}

export interface TutorCourseCompetency {
  courseId: string;
  courseCode: string;
  courseName: string;
  gradeAchieved: string; // e.g. "A", "A-"
}

export interface TutorProfile {
  id: string;
  fullName: string;
  email: string;
  campus: Campus;
  major: string;
  school: School;
  academicYear: 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  bio: string;
  hourlyRate: number;   // 0 indicates Free / Peer Volunteer
  courses: TutorCourseCompetency[];
  availability: AvailabilitySlot[];
  avatarUrl?: string;
  rating: number;
  totalReviews: number;
  totalSessionsCompleted: number;
  isPeerCertified?: boolean;
}

export interface Booking {
  id: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentMajor?: string;
  courseCode: string;
  courseName: string;
  campus: 'Beirut' | 'Byblos';
  date: string;         // YYYY-MM-DD
  timeSlot: string;     // e.g. "14:00 - 15:00"
  format: SessionFormat;
  locationDetails: string;
  studentNote?: string;
  status: BookingStatus;
  createdAt: string;
  declineReason?: string;
  reviewSubmitted?: boolean;
  tutorFeedback?: string;
  tutorFeedbackDate?: string;
}

export type PersonaId = 'sami' | 'nour' | 'admin' | 'guest' | string;
export type UserRole = 'student' | 'tutor' | 'admin';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TutorApplication {
  id: string;
  applicantUserId?: string;
  applicantName: string;
  applicantEmail: string;
  campus: Campus;
  school: School;
  major: string;
  academicYear: 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  gpa?: string; // e.g. "3.85"
  bio: string;
  hourlyRate: number; // 0 = Volunteer
  courses: TutorCourseCompetency[];
  availability: AvailabilitySlot[];
  status: ApplicationStatus;
  adminReviewerName?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  avatarUrl?: string;
}

export interface DemoPersona {
  id: PersonaId;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin' | 'guest';
  title: string;
  campus: 'Beirut' | 'Byblos';
  major: string;
  avatarUrl?: string;
  tutorProfileId?: string; // Links to Tutor profile
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  campus: 'Beirut' | 'Byblos';
  major: string;
  avatarUrl?: string;
  tutorProfileId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientUserId: string; // e.g. 'sami', 'nour', 'admin', user email, or account username
  title: string;
  message: string;
  type:
    | 'BOOKING_REQUEST'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_CANCELLED'
    | 'SESSION_COMPLETED'
    | 'REVIEW_RECEIVED'
    | 'TUTOR_FEEDBACK'
    | 'TUTOR_APPLICATION_SUBMITTED'
    | 'TUTOR_APPLICATION_APPROVED'
    | 'TUTOR_APPLICATION_REJECTED';
  bookingId?: string;
  applicationId?: string;
  createdAt: string;
  read: boolean;
}

export interface LAUMajorGroup {
  school: School;
  schoolName: string;
  majors: string[];
}

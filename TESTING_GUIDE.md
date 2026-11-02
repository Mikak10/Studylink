# LAU StudentLink — Comprehensive Production Walkthrough & Testing Guide
**Platform:** Lebanese American University (LAU) Peer Tutoring & Academic Platform  
**Target Audience:** Students, Instructors, Evaluators, and Peer Tutors  
**Document Purpose:** A complete, beginner-friendly walkthrough to test every production feature, role-based access control (RBAC), and user scenario.

---

## 🧭 Production Authentication & Separate Account Logins

The application operates with real, separate user authentication. To switch roles or test different user perspectives, sign in using each account's credentials:

| Account Type | Username / LAU Email | Password | Allowed Access & Tabs |
| :--- | :--- | :--- | :--- |
| **Student** | `sami` or `sami.abboud@lau.edu` | `password123` | **Find a Tutor**, **My Sessions**, **Apply as Tutor**. *Strict 403 block on Tutor Dashboard & Admin Portal.* |
| **Peer Tutor** | `nour` or `nour.kanaan@lau.edu` | `password123` | **Find a Tutor**, **My Sessions**, **Tutor Dashboard**. *Can book other tutors; cannot book self. Strict 403 block on Admin Portal.* |
| **Administrator** | `admin` or `mona.majdalani@lau.edu` | `password123` | **Admin Portal**, **Find a Tutor**, **My Sessions**. *Review and approve/reject tutor applications.* |
| **Guest / Visitor** | *Unauthenticated* | *N/A* | **Find a Tutor**. Sign In / Register buttons in top navbar. |

> 💡 **How to Switch Accounts:** Click the **"Sign Out"** button on the top right, then click **"Sign In"** and enter the desired account credentials.

---

## 📋 Scenario 1: Student Experience (Logged in as Sami Al-Ahmad)

**Goal:** Test the student workflow: browsing, filtering, and booking peer tutors.

1. **Sign In as Student:**
   * If not logged in, click **"Sign In"** in the top navigation.
   * Enter Username: `sami`, Password: `password123`. Click **Sign In**.
   * Observe your name **"Sami Al-Ahmad"** and role **"Student"** in the top navbar.
2. **Verify Role-Based Access Control (RBAC):**
   * Notice that the navigation bar contains **only** `Find a Tutor` and `My Sessions`.
   * Neither the `Tutor Dashboard` nor `Admin Portal` is displayed in the navigation.
3. **Search & Filter Courses:**
   * In the search box, type `MTH201` (Calculus III) or `CSC310`.
   * Filter by **Campus** (Beirut / Byblos) or **School** (Arts & Sciences, Engineering, Business).
   * Verified tutors matching the course are displayed.
4. **Inspect a Tutor's Verified Credentials:**
   * Find **Nour Khoury** and click **"Profile"**.
   * View her verified letter grades (`MTH201 - Grade A`), LAU Peer Certified badge, and weekly availability hours.

---

## 📅 Scenario 2: Booking a Tutoring Session (Student View)

**Goal:** Book a 1-on-1 peer tutoring session and verify conflict detection.

1. On **Nour Khoury's** card, click the green **"Book Slot"** button.
2. **Fill out the Booking Form:**
   * **Course:** Select `MTH201 - Calculus III`.
   * **Campus / Meeting Venue:** Select `Beirut` (Meeting location automatically sets to *Riyad Nassar Library Level 3, Beirut*).
   * **Date & Time Slot:** Pick an available slot (e.g., `14:00 - 15:00`).
   * **Study Goal / Note:** Type: *"Need help reviewing triple integrals before next week's exam."*
3. **Confirm the Booking:**
   * Click **"Confirm & Send Request"**.
   * A confirmation toast appears and the notification bell updates.
4. **Double-Booking Guard (Conflict Detection):**
   * Attempt to book the exact same slot on the same day again.
   * The system immediately detects the conflicting slot and blocks the request.

---

## 📂 Scenario 3: Managing Student Bookings ("My Sessions")

**Goal:** Inspect and track scheduled sessions from the student perspective.

1. Click the **"My Sessions"** tab in the navbar.
2. Observe your session with Nour Khoury marked with a yellow **"PENDING"** badge.
3. Click **"Details"** to view session logistics, location, and course notes.
4. If needed, click **"Cancel"** to release the slot.

---

## 🧑‍🏫 Scenario 4: Peer Tutor Experience (Logged in as Nour Khoury)

**Goal:** Test the tutor workflow: accepting sessions, setting weekly availability, and student feedback.

1. **Sign In as Tutor:**
   * Click **"Sign Out"** in the top navigation.
   * Click **"Sign In"** -> Username: `nour`, Password: `password123`. Click **Sign In**.
   * Observe your name **"Nour Khoury"** and role **"Peer Tutor"** in the top navbar.
2. **Access Tutor Dashboard:**
   * Notice that the **"Tutor Dashboard"** tab is now visible in the navigation.
   * Notice that the **"Admin Portal"** remains completely hidden.
3. **Approve Incoming Session Request:**
   * Under **"Pending Booking Requests"**, locate Sami's request.
   * Click **"Accept"** to confirm the booking.
   * The booking moves to **"Upcoming Tutoring Schedule"** with a **CONFIRMED** badge.
4. **Complete Session & Provide Feedback:**
   * Click **"Mark Completed"** on a confirmed session.
   * Add study notes for the student: *"Sami did great on triple integrals. Recommend practicing Chapter 14 problem set 3."*
   * Click **"Save Study Notes"**. The session moves to completed and feedback is saved.
5. **Manage Weekly Availability Slots:**
   * Scroll down to **"Weekly Tutoring Availability Slots"**.
   * Click **"+ Add Slot"** -> Select Day (e.g., Friday), Time (`10:00 - 11:00`), Format (`In-Person`), and Venue (`Nicol Hall Study Room 102`).
   * Click **"Save Slot"**. The slot appears instantly in Nour's schedule and becomes bookable.

---

## 🛡️ Scenario 5: Dual Role (Tutors Can Book Other Tutors, But Cannot Book Self)

**Goal:** Verify that a student tutor can request peer tutoring from others, while strictly prevented from booking themselves.

1. Still signed in as **Nour Khoury (Peer Tutor)**, click **"Find a Tutor"**.
2. **Requesting Tutoring from Another Peer:**
   * Find **Karim Mansour** (Engineering Tutor).
   * Click **"Book Slot"**, select a course, and submit.
   * The booking succeeds! Go to **"My Sessions"** -> Nour's booking with Karim is labeled **`Attending as Student`**.
3. **Self-Booking Guard:**
   * Go back to **"Find a Tutor"** and locate Nour's own card.
   * The card clearly indicates **`You (Tutor)`**.
   * The booking button is disabled with the label **`Cannot Book Self`**.
   * Open Nour's profile: a banner warns that self-booking is prohibited, and the booking action is disabled.

---

## 🛡️ Scenario 6: Academic Administrator Experience (Logged in as Admin)

**Goal:** Test administrator oversight and the tutor application approval workflow.

1. **Sign In as Administrator:**
   * Click **"Sign Out"** in the top navigation.
   * Click **"Sign In"** -> Username: `admin`, Password: `password123`. Click **Sign In**.
   * Observe **"Dr. Mona Majdalani"** with role **"Administrator"** in the top navbar.
2. **Access Admin Portal:**
   * Notice the **"Admin Portal"** tab is now available in the navigation bar with a pending counter.
   * Notice the **"Tutor Dashboard"** is hidden (admin oversees applicants and catalog).
3. **Review Tutor Applications:**
   * Inspect pending applicant cards showing applicant GPA, major, campus, and prerequisite grades.
   * Click **"Review & Approve"** on an applicant.
   * Add administrative notes: *"Approved for LAU Peer Tutoring Program. Exceptional academic record."*
   * Click **"Confirm Department Approval"**.
   * The applicant's status updates to **APPROVED** and they are certified as an official LAU Peer Tutor.

---

## 🔒 Scenario 7: Strict RBAC 403 Access Denial Verification

**Goal:** Verify that unauthorized users are completely blocked from restricted portals.

1. Sign in as **Sami** (Student) or sign out to become a **Guest**.
2. Try navigating to `/` with state set to tutor dashboard or admin portal.
3. The system enforces strict access control:
   * Unauthorized users attempting to view `Admin Portal` receive a **Restricted Administrative Area** 403 screen with zero application data leaked.
   * Unauthorized users attempting to view `Tutor Dashboard` receive a **Peer Tutor Access Only** 403 screen directing them to apply as a tutor or browse the catalog.

---

## 🎯 Verification Checklist

| Feature Area | Key Verification | Status |
| :--- | :--- | :---: |
| **Production Auth** | Separate credential-based sign in for each role (`sami`, `nour`, `admin` / `password123`). | ✅ PASS |
| **No Demo Switchers** | In-page persona switcher dropdown and reset buttons removed. | ✅ PASS |
| **Strict RBAC** | Students only see Student tools; Tutors see Tutor + Student tools; Admins see Admin tools. | ✅ PASS |
| **Self-Booking Guard** | Tutors can book sessions with other peer tutors, but cannot book themselves. | ✅ PASS |
| **Dual Role Separation** | "My Sessions" tab labels "Attending as Student" vs "Teaching as Tutor". | ✅ PASS |
| **Admin Review Portal** | Full review workflow for prerequisite grades, GPAs, and approvals/rejections. | ✅ PASS |
| **Conflict Detection** | Smart double-booking prevention blocks conflicting slots. | ✅ PASS |
| **Brand Identity** | Official LAU `#006751` emerald branding, official school programs, and campus study hubs. | ✅ PASS |

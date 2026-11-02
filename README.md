# LAU StudentLink 🎓
> Peer Tutoring & Academic Platform for Lebanese American University (Beirut & Byblos campuses)

LAU StudentLink connects LAU students with verified high-achieving peer tutors across both Beirut and Byblos campuses. Students can discover qualified peer mentors by department and course code (e.g., MTH201, CSC310, COE312, ACC203), view verified course grades, schedule 1-on-1 tutoring sessions, manage weekly recurring availability slots, and submit post-session feedback.

---

## 🌟 Key Features

- **Tutor Discovery & Filtering:** Search by course code, keyword, campus (Beirut / Byblos), session format (In-Person / Online Teams / Hybrid), and school (SOE, AKSOB, SAS, SArD).
- **Verified LAU Credentials:** View verified course letter grades (A, A-) achieved by peer tutors.
- **Role-Based Workflows:**
  - **Student View:** Browse tutors, request 1-on-1 sessions, track upcoming bookings, and submit ratings and reviews.
  - **Tutor Dashboard:** Manage weekly recurring availability windows, review/accept/decline incoming student requests, and provide post-session study feedback notes.
- **Smart Conflict Prevention:** Automatic detection prevents double-booking tutors during identical time slots.
- **Interactive Multi-Persona Switcher:** Easily toggle between student and tutor demo profiles or create custom student accounts.
- **Profile Customization:** Profile photo uploads (local file or preset avatars), major, campus, and bio updates.
- **Official Brand Design:** Built with LAU emerald branding (`#006751`), custom interlocking vector brand mark, official typography, and responsive modern layout.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context API with LocalStorage persistence

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR_ORGANIZATION_OR_USERNAME>/lau-studentlink.git
   cd lau-studentlink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port indicated in your terminal).

---

## 📁 Project Structure

```
lau-studentlink/
├── public/
│   └── assets/aistudio/       # Brand icons, logo marks, and SVGs
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication and login/signup modals
│   │   ├── booking/           # Session booking modal, list, and review forms
│   │   ├── common/            # BrandLogo, Navbar, Footer, DemoBanner, Calendar
│   │   ├── discovery/         # Tutor directory, search filters, profile modal
│   │   ├── profile/           # User profile and photo upload modal
│   │   └── tutor/             # Tutor dashboard, slot manager, student inspect
│   ├── context/
│   │   └── DataContext.tsx    # State management, data persistence, and CRUD helpers
│   ├── data/
│   │   └── seedData.ts        # Mock seed tutors, LAU courses, and demo personas
│   ├── types.ts               # TypeScript interfaces and data models
│   ├── App.tsx                # Main application layout and modal orchestrator
│   ├── index.css              # Tailwind theme definitions and typography
│   └── main.tsx               # App entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 👥 Classmate Collaboration Guidelines

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit your changes cleanly:**
   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```
3. **Push to GitHub and open a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Code Quality:** Run `npm run lint` and `npm run build` before submitting PRs to verify clean compilation.

---

## 📄 License
Academic Project developed for Lebanese American University (LAU).

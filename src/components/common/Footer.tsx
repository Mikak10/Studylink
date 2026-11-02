import React from 'react';
import { MapPin, BookOpen, Users } from 'lucide-react';
import { BrandLockup } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Project Info */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <BrandLockup reversed size="md" subtitleText="Official Peer Tutoring Network" />
            </div>
            <p className="text-slate-300 text-sm italic mb-2">
              &ldquo;Learn together. Succeed together.&rdquo;
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A collaborative student-to-student peer tutoring platform engineered for Lebanese American University students across Beirut and Byblos campuses.
            </p>
          </div>

          {/* Campuses & Study Hubs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Designated Study Hubs
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-300 font-medium">Beirut Campus:</strong>
                <span className="block text-slate-500">Riyad Nassar Library, Level 3 Commons & Sage Hall Lounge</span>
              </li>
              <li>
                <strong className="text-slate-300 font-medium">Byblos Campus:</strong>
                <span className="block text-slate-500">Student Center Level 2 & Byblos Library Group Pods</span>
              </li>
              <li>
                <strong className="text-slate-300 font-medium">Online Tutoring:</strong>
                <span className="block text-slate-500">Official LAU Microsoft Teams peer rooms</span>
              </li>
            </ul>
          </div>

          {/* Academic Integrity & Ethics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Peer Tutoring Guidelines
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              All peer tutoring activities adhere strictly to the LAU Student Code of Conduct and Academic Integrity rules. Tutors facilitate understanding and problem-solving techniques; they do not complete assignments or exams on behalf of students.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Peer-vetted & verified course grades
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Lebanese American University (LAU) Peer Tutoring Network. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Beirut Campus</span>
            <span>·</span>
            <span>Byblos Campus</span>
            <span>·</span>
            <span>Academic Success Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

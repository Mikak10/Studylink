import React from 'react';
import { Search, MapPin, Users, Award, BookOpen, Sparkles } from 'lucide-react';
import { Course } from '../../types';
import { BrandMark } from '../common/BrandLogo';
import { CourseAutocomplete } from '../common/CourseAutocomplete';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  courses: Course[];
  tutorsCount: number;
  onSelectCourseQuick: (code: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  courses,
  tutorsCount,
  onSelectCourseQuick,
}) => {
  const popularCourses = ['MTH201', 'CSC310', 'ACC203', 'COE312', 'FIN301', 'MEE211', 'BIO201'];

  return (
    <section className="bg-linear-to-b from-emerald-900 via-emerald-950 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-600 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Academic Tag */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-6 shadow-xs backdrop-blur-xs">
          <BrandMark className="w-5 h-4 shrink-0" reversed />
          <span>LAU StudentLink Peer Tutoring · Beirut & Byblos Campuses</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 max-w-3xl mx-auto [text-wrap:balance]">
          Learn together. <span className="text-emerald-400">Succeed together.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Connect with top-performing upperclassmen who have aced your exact LAU courses. Book in-person sessions at campus libraries or meet online on MS Teams.
        </p>

        {/* Search Bar Input with Live LAU Course Autocomplete */}
        <div className="max-w-2xl mx-auto mb-4 relative z-30">
          <CourseAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            variant="hero"
            placeholder="Type course code (e.g. MTH201, CSC310, ACC203) or subject..."
          />
        </div>

        {/* Quick Course Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Popular LAU Courses:
          </span>
          {popularCourses.map(code => {
            const isActive = searchQuery.toLowerCase().includes(code.toLowerCase());
            return (
              <button
                key={code}
                onClick={() => onSelectCourseQuick(isActive ? '' : code)}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-emerald-950/70 hover:bg-emerald-800/80 border-emerald-700/50 text-emerald-200'
                }`}
              >
                {code} {isActive && '✓'}
              </button>
            );
          })}
        </div>

        {/* Key Metrics Strip (Tabular Numerals) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-emerald-800/40 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800/50 flex items-center justify-center text-emerald-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold font-mono tabular-nums text-white">
                {courses.length}+
              </span>
              <span className="block text-xs text-slate-400">LAU Core Courses</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800/50 flex items-center justify-center text-emerald-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold font-mono tabular-nums text-white">
                {tutorsCount}
              </span>
              <span className="block text-xs text-slate-400">Vetted Peer Tutors</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800/50 flex items-center justify-center text-emerald-300 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold font-mono tabular-nums text-white">
                2
              </span>
              <span className="block text-xs text-slate-400">Beirut & Byblos Hubs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800/50 flex items-center justify-center text-emerald-300 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold font-mono tabular-nums text-white">
                4.9 ★
              </span>
              <span className="block text-xs text-slate-400">Avg Peer Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

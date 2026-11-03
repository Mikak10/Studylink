import React, { useState, useMemo } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { TutorProfile, Campus, School, SessionFormat } from '../../types';
import { HeroSection } from './HeroSection';
import { TutorFilterBar } from './TutorFilterBar';
import { TutorCard } from './TutorCard';
import { SearchX, Award } from 'lucide-react';

interface TutorDirectoryProps {
  onViewProfile: (tutor: TutorProfile) => void;
  onRequestBooking: (tutor: TutorProfile) => void;
  onOpenRegisterModal?: () => void;
}

export const TutorDirectory: React.FC<TutorDirectoryProps> = ({
  onViewProfile,
  onRequestBooking,
  onOpenRegisterModal,
}) => {
  const { tutors, courses, currentUser } = useStudyLinkData();

  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState<Campus>('Both');
  const [schoolFilter, setSchoolFilter] = useState<School | 'All'>('All');
  const [formatFilter, setFormatFilter] = useState<SessionFormat | 'All'>('All');
  const [rateFilter, setRateFilter] = useState<'all' | 'free' | 'under15' | 'paid'>('all');

  const handleSelectCourseQuick = (code: string) => {
    setSearchQuery(code);
    setTimeout(() => {
      const el = document.getElementById('available-courses-results');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const isFiltered = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      campusFilter !== 'Both' ||
      schoolFilter !== 'All' ||
      formatFilter !== 'All' ||
      rateFilter !== 'all'
    );
  }, [searchQuery, campusFilter, schoolFilter, formatFilter, rateFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setCampusFilter('Both');
    setSchoolFilter('All');
    setFormatFilter('All');
    setRateFilter('all');
  };

  // Filter logic
  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = tutor.fullName.toLowerCase().includes(query);
        const matchesMajor = tutor.major.toLowerCase().includes(query);
        const matchesCourse = tutor.courses.some(
          c =>
            c.courseCode.toLowerCase().includes(query) ||
            c.courseName.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesMajor && !matchesCourse) {
          return false;
        }
      }

      // 2. Campus Filter
      if (campusFilter !== 'Both') {
        if (tutor.campus !== 'Both' && tutor.campus !== campusFilter) {
          return false;
        }
      }

      // 3. School Filter
      if (schoolFilter !== 'All') {
        if (tutor.school !== schoolFilter) {
          return false;
        }
      }

      // 4. Format Filter
      if (formatFilter !== 'All') {
        const hasMatchingSlot = tutor.availability.some(
          slot => slot.format === formatFilter || slot.format === 'Hybrid'
        );
        if (!hasMatchingSlot) {
          return false;
        }
      }

      // 5. Rate Filter
      if (rateFilter === 'free' && tutor.hourlyRate > 0) {
        return false;
      }
      if (rateFilter === 'under15' && tutor.hourlyRate >= 15) {
        return false;
      }
      if (rateFilter === 'paid' && tutor.hourlyRate === 0) {
        return false;
      }

      return true;
    });
  }, [tutors, searchQuery, campusFilter, schoolFilter, formatFilter, rateFilter]);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        courses={courses}
        tutorsCount={tutors.length}
        onSelectCourseQuick={handleSelectCourseQuick}
      />

      {/* Main Content Area */}
      <main id="available-courses-results" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 scroll-mt-20">
        {/* Section Heading & Subtitle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Explore Available Peer Tutors
            </h2>
            <p className="text-xs text-slate-500">
              Verified LAU students offering academic support for Beirut and Byblos campuses.
            </p>
          </div>
          {currentUser?.role === 'student' && onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="self-start sm:self-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              Apply to Become a Tutor
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <TutorFilterBar
          campusFilter={campusFilter}
          setCampusFilter={setCampusFilter}
          schoolFilter={schoolFilter}
          setSchoolFilter={setSchoolFilter}
          formatFilter={formatFilter}
          setFormatFilter={setFormatFilter}
          rateFilter={rateFilter}
          setRateFilter={setRateFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalFilteredCount={filteredTutors.length}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Tutor Cards Grid */}
        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map(tutor => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onViewProfile={onViewProfile}
                onRequestBooking={onRequestBooking}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No Peer Tutors Found
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We couldn&apos;t find any peer tutors matching your active search and filter criteria. Try broadening your campus, school, or course filter.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

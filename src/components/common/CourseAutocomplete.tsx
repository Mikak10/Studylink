import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, BookOpen, User, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { Course, School } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';

interface CourseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCourse?: (course: Course) => void;
  onTriggerScroll?: () => void;
  placeholder?: string;
  className?: string;
  variant?: 'hero' | 'filter';
  autoFocus?: boolean;
}

const SCHOOL_BADGES: Record<School, { label: string; bg: string; text: string }> = {
  SAS: { label: 'SAS (Arts & Sciences)', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800' },
  SOE: { label: 'SOE (Engineering)', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
  AKSOB: { label: 'AKSOB (Business)', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  SArD: { label: 'SArD (Architecture)', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
};

export const CourseAutocomplete: React.FC<CourseAutocompleteProps> = ({
  value,
  onChange,
  onSelectCourse,
  onTriggerScroll,
  placeholder = 'Search by exact LAU course code (e.g. MTH201) or name...',
  className = '',
  variant = 'hero',
  autoFocus = false,
}) => {
  const { courses, tutors } = useStudyLinkData();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smooth scroll down to available courses results
  const triggerScrollToResults = () => {
    if (onTriggerScroll) {
      onTriggerScroll();
      return;
    }
    setTimeout(() => {
      const el =
        document.getElementById('available-courses-results') ||
        document.getElementById('tutor-directory-results');
      if (el) {
        const navOffset = 72;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 70);
  };

  // Map how many tutors teach each course code
  const tutorCountMap = useMemo(() => {
    const map = new Map<string, number>();
    tutors.forEach(t => {
      t.courses.forEach(c => {
        const code = c.courseCode.toUpperCase().replace(/\s+/g, '');
        map.set(code, (map.get(code) || 0) + 1);
      });
    });
    return map;
  }, [tutors]);

  // Filtered course suggestions
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase().replace(/\s+/g, '');
    if (!query) {
      // If empty and open, show high-demand LAU core courses
      const popularCodes = ['MTH201', 'CSC310', 'ACC203', 'COE312', 'FIN301', 'MEE211', 'BIO201', 'CHM201', 'MTH207'];
      return courses.filter(c => popularCodes.includes(c.code.toUpperCase()));
    }

    return courses
      .filter(course => {
        const cleanCode = course.code.toLowerCase().replace(/\s+/g, '');
        const cleanName = course.name.toLowerCase();
        const cleanDept = course.department.toLowerCase();
        return (
          cleanCode.includes(query) ||
          cleanName.includes(value.trim().toLowerCase()) ||
          cleanDept.includes(value.trim().toLowerCase())
        );
      })
      .sort((a, b) => {
        // Sort courses that have available tutors first, then exact code match
        const aTutors = tutorCountMap.get(a.code.toUpperCase()) || 0;
        const bTutors = tutorCountMap.get(b.code.toUpperCase()) || 0;
        const aCleanCode = a.code.toLowerCase().replace(/\s+/g, '');
        const bCleanCode = b.code.toLowerCase().replace(/\s+/g, '');

        if (aCleanCode.startsWith(query) && !bCleanCode.startsWith(query)) return -1;
        if (!aCleanCode.startsWith(query) && bCleanCode.startsWith(query)) return 1;
        return bTutors - aTutors;
      })
      .slice(0, 8);
  }, [courses, value, tutorCountMap]);

  // Suggested Tutors (if query matches a tutor name)
  const matchedTutors = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (query.length < 2) return [];
    return tutors
      .filter(t => t.fullName.toLowerCase().includes(query) || t.major.toLowerCase().includes(query))
      .slice(0, 3);
  }, [tutors, value]);

  // Total items in dropdown for keyboard navigation
  const totalItemsCount = suggestions.length + matchedTutors.length;

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight on query change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value]);

  const handleSelectCourse = (course: Course) => {
    onChange(course.code);
    if (onSelectCourse) onSelectCourse(course);
    setIsOpen(false);
    inputRef.current?.blur();
    triggerScrollToResults();
  };

  const handleSelectTutor = (tutorName: string) => {
    onChange(tutorName);
    setIsOpen(false);
    inputRef.current?.blur();
    triggerScrollToResults();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
      handleSelectCourse(suggestions[highlightedIndex]);
    } else if (highlightedIndex >= suggestions.length) {
      const tutor = matchedTutors[highlightedIndex - suggestions.length];
      if (tutor) handleSelectTutor(tutor.fullName);
    } else {
      // If user typed a search term and pressed Enter or phone blue arrow
      if (suggestions.length > 0 && value.trim()) {
        const firstMatch = suggestions[0];
        // If exact code match, select it
        if (firstMatch && firstMatch.code.toLowerCase() === value.trim().toLowerCase()) {
          handleSelectCourse(firstMatch);
          return;
        }
      }
      setIsOpen(false);
      inputRef.current?.blur();
      triggerScrollToResults();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < totalItemsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalItemsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleFormSubmit(e as any);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Substring highlighter helper
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <span key={i} className="font-black text-emerald-700 bg-emerald-100/80 px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Form Container with Mobile Keyboard Return/Search Support */}
      <form onSubmit={handleFormSubmit} action="#" role="search" className="relative flex items-center">
        <Search
          className={`absolute left-4 pointer-events-none ${
            isHero ? 'w-5 h-5 text-slate-400' : 'w-4 h-4 text-slate-400'
          }`}
        />

        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          inputMode="search"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`w-full font-medium transition-all focus:outline-none ${
            isHero
              ? 'pl-12 pr-12 py-3.5 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm'
              : 'pl-10 pr-9 py-2 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-600 text-xs'
          }`}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button (if text entered) */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className={`absolute right-3.5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
              isHero ? 'text-xs' : 'text-[11px]'
            }`}
            title="Clear search"
          >
            <X className={isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          </button>
        )}
      </form>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-left">
          {/* Header Banner */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <BookOpen className="w-3.5 h-3.5" />
              {value.trim() ? 'Matching LAU Courses' : 'Popular Core LAU Courses'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              {suggestions.length} {suggestions.length === 1 ? 'course' : 'courses'}
            </span>
          </div>

          {/* Courses List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {suggestions.length > 0 ? (
              suggestions.map((course, idx) => {
                const tutorCount = tutorCountMap.get(course.code.toUpperCase()) || 0;
                const isSelected = value.toUpperCase().trim() === course.code.toUpperCase();
                const isHighlighted = highlightedIndex === idx;
                const badge = SCHOOL_BADGES[course.school];

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleSelectCourse(course)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isHighlighted
                        ? 'bg-emerald-50/90'
                        : isSelected
                        ? 'bg-emerald-50/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-xs font-mono tracking-tight text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70">
                          {highlightMatch(course.code, value)}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text}`}
                        >
                          {course.school}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {highlightMatch(course.name, value)}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {course.department} · {course.schoolName}
                      </div>
                    </div>

                    {/* Tutor Availability Badge */}
                    <div className="shrink-0 text-right">
                      {tutorCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          {tutorCount} {tutorCount === 1 ? 'Tutor' : 'Tutors'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          LAU Catalog
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <strong className="block text-slate-800 font-bold mb-1">
                  No exact LAU course found for "{value}"
                </strong>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Try standard LAU codes like <span className="font-mono text-emerald-700 font-bold">MTH201</span>,{' '}
                  <span className="font-mono text-emerald-700 font-bold">CSC310</span>,{' '}
                  <span className="font-mono text-emerald-700 font-bold">COE312</span>, or{' '}
                  <span className="font-mono text-emerald-700 font-bold">ACC203</span>.
                </p>
              </div>
            )}

            {/* Suggested Tutors Section if tutor name matched */}
            {matchedTutors.length > 0 && (
              <div className="bg-slate-50/70 p-2 border-t border-slate-100">
                <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Matching Peer Tutors
                </span>
                {matchedTutors.map((tutor, tIdx) => {
                  const globalIdx = suggestions.length + tIdx;
                  const isHighlighted = highlightedIndex === globalIdx;

                  return (
                    <button
                      key={tutor.id}
                      type="button"
                      onClick={() => handleSelectTutor(tutor.fullName)}
                      onMouseEnter={() => setHighlightedIndex(globalIdx)}
                      className={`w-full px-3 py-1.5 text-left rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isHighlighted ? 'bg-emerald-100 text-emerald-950' : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-bold">{highlightMatch(tutor.fullName, value)}</span>
                        <span className="text-slate-500 text-[11px]">({tutor.major})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800">
                        {tutor.campus} Campus
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Instruction */}
          <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>
              Press <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">↑</kbd>{' '}
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">↓</kbd> to navigate,{' '}
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">Enter</kbd> to select
            </span>
            <span className="font-bold text-emerald-800">Official LAU Catalog</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Campus, School, SessionFormat } from '../../types';
import { Filter, X, Building, Laptop, DollarSign, BookOpen } from 'lucide-react';
import { CourseAutocomplete } from '../common/CourseAutocomplete';

interface TutorFilterBarProps {
  campusFilter: Campus;
  setCampusFilter: (campus: Campus) => void;
  schoolFilter: School | 'All';
  setSchoolFilter: (school: School | 'All') => void;
  formatFilter: SessionFormat | 'All';
  setFormatFilter: (format: SessionFormat | 'All') => void;
  rateFilter: 'all' | 'free' | 'under15' | 'paid';
  setRateFilter: (rate: 'all' | 'free' | 'under15' | 'paid') => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  totalFilteredCount: number;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export const TutorFilterBar: React.FC<TutorFilterBarProps> = ({
  campusFilter,
  setCampusFilter,
  schoolFilter,
  setSchoolFilter,
  formatFilter,
  setFormatFilter,
  rateFilter,
  setRateFilter,
  searchQuery,
  setSearchQuery,
  totalFilteredCount,
  onClearFilters,
  isFiltered,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3">
      {/* Search with Live Suggestions inside Filter Bar */}
      {setSearchQuery && (
        <div className="w-full">
          <CourseAutocomplete
            value={searchQuery || ''}
            onChange={setSearchQuery}
            variant="filter"
            placeholder="Search by exact LAU course code (e.g. MTH201, CSC310, ACC203)..."
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Section: Filter Dropdowns & Segmented Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Filter By:</span>
          </div>

          {/* Campus Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setCampusFilter('Both')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                campusFilter === 'Both'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Campuses
            </button>
            <button
              onClick={() => setCampusFilter('Beirut')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                campusFilter === 'Beirut'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beirut
            </button>
            <button
              onClick={() => setCampusFilter('Byblos')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                campusFilter === 'Byblos'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Byblos
            </button>
          </div>

          {/* School Selector */}
          <div className="relative">
            <select
              value={schoolFilter}
              onChange={e => setSchoolFilter(e.target.value as School | 'All')}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All">All LAU Schools</option>
              <option value="SOE">Engineering (SOE)</option>
              <option value="AKSOB">Business (AKSOB)</option>
              <option value="SAS">Arts & Sciences (SAS)</option>
              <option value="SArD">Architecture & Design (SArD)</option>
            </select>
          </div>

          {/* Format Selector */}
          <div className="relative">
            <select
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value as SessionFormat | 'All')}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All">All Formats (In-Person / Online)</option>
              <option value="In-Person">In-Person on Campus</option>
              <option value="Online">Online (Microsoft Teams)</option>
              <option value="Hybrid">Hybrid Option</option>
            </select>
          </div>

          {/* Rate Selector */}
          <div className="relative">
            <select
              value={rateFilter}
              onChange={e => setRateFilter(e.target.value as any)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="all">Any Rate</option>
              <option value="free">Volunteer / Free ($0)</option>
              <option value="under15">Under $15/hr</option>
              <option value="paid">Standard Rates ($10 - $20/hr)</option>
            </select>
          </div>
        </div>

        {/* Right Section: Counter and Clear Filters */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium font-mono tabular-nums">
            Showing <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong> tutor{totalFilteredCount === 1 ? '' : 's'}
          </span>

          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

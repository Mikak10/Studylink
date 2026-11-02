import React, { useState } from 'react';
import { Booking } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  title?: string;
  roleContext?: 'student' | 'tutor';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  onSelectBooking,
  title = 'Schedule Calendar',
  roleContext = 'student',
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate days in month & padding for first day of week
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group bookings by date string (YYYY-MM-DD)
  const bookingsByDate = React.useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    });
    return map;
  }, [bookings]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Build grid calendar cells
  const calendarCells = [];

  // Previous month overflow days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString: '',
      bookings: [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    calendarCells.push({
      day,
      isCurrentMonth: true,
      dateString: dateStr,
      isToday: dateStr === todayStr,
      bookings: bookingsByDate.get(dateStr) || [],
    });
  }

  // Next month fill days (to reach 35 or 42 cells)
  const totalCells = Math.ceil(calendarCells.length / 7) * 7;
  const remaining = totalCells - calendarCells.length;
  for (let day = 1; day <= remaining; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString: '',
      bookings: [],
    });
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-300 line-through opacity-70';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <CalendarIcon className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-500">
              Interactive session schedule · Click any slot to view details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/60 text-center text-xs font-bold text-slate-600">
        {daysOfWeek.map((d, idx) => (
          <div
            key={d}
            className={`py-2.5 ${idx === 0 || idx === 6 ? 'text-slate-400' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {calendarCells.map((cell, idx) => {
          const hasBookings = cell.bookings && cell.bookings.length > 0;

          return (
            <div
              key={idx}
              className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/50 text-slate-300 select-none'
                  : cell.isToday
                  ? 'bg-emerald-50/30 font-semibold'
                  : 'bg-white hover:bg-slate-50/60'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs inline-flex items-center justify-center rounded-full w-6 h-6 ${
                    cell.isToday
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-slate-700 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {cell.day}
                </span>

                {hasBookings && (
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1 rounded-full hidden sm:inline">
                    {cell.bookings.length}
                  </span>
                )}
              </div>

              {/* Sessions List in Day Cell */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-24">
                {cell.bookings.map(booking => (
                  <button
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className={`w-full text-left p-1 sm:p-1.5 rounded-md border text-[10px] sm:text-[11px] leading-tight transition-all truncate block cursor-pointer ${getStatusBadge(
                      booking.status
                    )}`}
                    title={`${booking.courseCode} (${booking.timeSlot}) - with ${
                      roleContext === 'tutor' ? booking.studentName : booking.tutorName
                    }`}
                  >
                    <div className="font-bold truncate flex items-center gap-1">
                      <span>{booking.courseCode}</span>
                      <span className="font-normal opacity-75 font-mono text-[9px] sm:text-[10px]">
                        {booking.timeSlot.split(' - ')[0]}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-600 truncate hidden sm:block">
                      {roleContext === 'tutor' ? booking.studentName : booking.tutorName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-800">Status Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Pending Approval
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            Cancelled
          </span>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Total scheduled: <strong className="text-slate-800">{bookings.length}</strong>
        </span>
      </div>
    </div>
  );
};

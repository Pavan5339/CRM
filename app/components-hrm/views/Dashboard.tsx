import React, { useState, useEffect } from 'react';

// Dummy holiday data for the dashboard card and full calendar modal
const holidays = [
  {
    id: '1',
    date: '2026-03-30',
    title: 'Ugadi',
    type: 'Festival Holiday',
    occasion: 'Telugu and Kannada New Year',
    description: 'Celebrated as the traditional new year with prayers, family meals, and festive gatherings.',
  },
  {
    id: '2',
    date: '2026-04-03',
    title: 'Good Friday',
    type: 'Gazetted Holiday',
    occasion: 'Christian observance',
    description: 'A day of reflection and prayer commemorating the crucifixion of Jesus Christ.',
  },
  {
    id: '3',
    date: '2026-04-14',
    title: 'Dr. Ambedkar Jayanti',
    type: 'National Holiday',
    occasion: 'Birth anniversary of Dr. B. R. Ambedkar',
    description: 'Observed to honor Dr. Ambedkar’s contribution to the Constitution and social justice in India.',
  },
  {
    id: '4',
    date: '2026-05-01',
    title: 'Labour Day',
    type: 'National Holiday',
    occasion: 'International Workers’ Day',
    description: 'Recognizes workers, labor rights, and the contributions of people across industries.',
  },
  {
    id: '5',
    date: '2026-08-15',
    title: 'Independence Day',
    type: 'National Holiday',
    occasion: 'Independence of India',
    description: 'Marked with flag hoisting, cultural programs, and remembrance of the freedom movement.',
  },
  {
    id: '6',
    date: '2026-08-28',
    title: 'Onam',
    type: 'Festival Holiday',
    occasion: 'Harvest festival of Kerala',
    description: 'Celebrated with floral decorations, traditional feasts, and community events.',
  },
  {
    id: '7',
    date: '2026-10-19',
    title: 'Diwali',
    type: 'Festival Holiday',
    occasion: 'Festival of Lights',
    description: 'Observed with lamps, sweets, family visits, and prayers symbolizing light over darkness.',
  },
  {
    id: '8',
    date: '2026-12-25',
    title: 'Christmas Day',
    type: 'Gazetted Holiday',
    occasion: 'Christmas celebration',
    description: 'A holiday for church services, community celebrations, and time with family.',
  },
];

const cardHolidays = holidays.slice(0, 3);

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSwipesModalOpen, setIsSwipesModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Escape key handler for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isSwipesModalOpen) setIsSwipesModalOpen(false);
        if (isHolidayModalOpen) setIsHolidayModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSwipesModalOpen, isHolidayModalOpen]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedFullDate = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedShortDate = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const dayName = currentTime.toLocaleDateString('en-GB', { weekday: 'long' });
  
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const timeString = { hours, minutes, seconds };

  // Calendar helper functions
  const getMonthData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date();
    
    const days = [];
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const holiday = holidays.find(h => h.date === dateStr);
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
      days.push({ 
        day: i, 
        date: dateStr,
        isCurrentMonth: true, 
        isWeekend: new Date(year, month, i).getDay() === 0 || new Date(year, month, i).getDay() === 6,
        isToday,
        holiday
      });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    return { days, year, month, monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  };

  const getMonthFromHoliday = (holidayDate) => {
    const [year, month] = holidayDate.split('-').map(Number);
    return new Date(year, month - 1, 1);
  };

  const getHolidayForMonth = (date) => holidays.find((holiday) => {
    const holidayDate = parseDate(holiday.date);
    return holidayDate.getFullYear() === date.getFullYear() && holidayDate.getMonth() === date.getMonth();
  });

  // Find next upcoming holiday, otherwise fall back to the latest holiday month in the list
  const getDefaultMonth = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextHoliday = holidays.find(h => h.date >= todayStr);
    if (nextHoliday) {
      return getMonthFromHoliday(nextHoliday.date);
    }

    const latestHoliday = holidays[holidays.length - 1];
    if (latestHoliday) {
      return getMonthFromHoliday(latestHoliday.date);
    }

    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const [calendarMonth, setCalendarMonth] = useState(() => getDefaultMonth());
  const monthData = getMonthData(calendarMonth);

  const changeCalendarMonth = (offset) => {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    setCalendarMonth(nextMonth);
    setSelectedDate(getHolidayForMonth(nextMonth) || null);
  };

  const goToPrevMonth = () => changeCalendarMonth(-1);
  const goToNextMonth = () => changeCalendarMonth(1);

  const openHolidayModal = () => {
    const defaultMonth = getDefaultMonth();
    setCalendarMonth(defaultMonth);
    setSelectedDate(getHolidayForMonth(defaultMonth) || null);
    setIsHolidayModalOpen(true);
  };

  const handleDateClick = (dayInfo) => {
    if (dayInfo.isCurrentMonth && dayInfo.holiday) {
      setSelectedDate(dayInfo.holiday);
    }
  };

  // Safe date parsing without timezone issues
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getHolidayDateInfo = (dateStr) => {
    const d = parseDate(dateStr);
    return {
      month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      day: d.getDate()
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Welcome Hero Section */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-background mb-1 tracking-tight">Good Afternoon, Alex</h2>
          <p className="text-on-surface-variant text-base">You have no pending approvals for today. Have a productive session!</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Monthly Report
          </button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Attendance Summary Card (Large) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-headline">Attendance Summary</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-full">This Week</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Avg. Work Hours</p>
                  <p className="text-xl font-bold font-headline">8h 42m</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/40 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">On-time Arrival</p>
                  <p className="text-xl font-bold font-headline">98.2%</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 h-32 flex items-end justify-around px-4 w-full border-l border-outline-variant/10">
              {/* Custom Data Visualization Elements */}
              <div className="w-10 bg-primary/20 rounded-t-lg h-[60%] hover:bg-primary transition-colors cursor-pointer relative group">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Mon</span>
              </div>
              <div className="w-10 bg-primary/20 rounded-t-lg h-[85%] hover:bg-primary transition-colors cursor-pointer relative group">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Tue</span>
              </div>
              <div className="w-10 bg-primary/20 rounded-t-lg h-[75%] hover:bg-primary transition-colors cursor-pointer relative group">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Wed</span>
              </div>
              <div className="w-10 bg-primary/20 rounded-t-lg h-[95%] hover:bg-primary transition-colors cursor-pointer relative group">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Thu</span>
              </div>
              <div className="w-10 bg-primary/20 rounded-t-lg h-[70%] hover:bg-primary transition-colors cursor-pointer relative group">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Fri</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Cards (Empty State Placeholder) */}
        <div className="col-span-12 lg:col-span-4 bg-tertiary-container/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center editorial-shadow">
          <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-3xl">auto_awesome</span>
          </div>
          <h3 className="text-base font-bold font-headline mb-1 text-on-surface">Clear Skies!</h3>
          <p className="text-xs text-on-tertiary-container leading-relaxed">No reviews or appraisals are pending your attention right now.</p>
          <button className="mt-6 text-xs font-bold uppercase tracking-widest text-tertiary hover:underline">View History</button>
        </div>

        {/* Upcoming Holidays List */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-headline">Upcoming Holidays</h3>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-xl">more_horiz</button>
          </div>
          <div className="space-y-4">
            {cardHolidays.map((holiday) => {
              const dateInfo = getHolidayDateInfo(holiday.date);
              const weekday = parseDate(holiday.date).toLocaleDateString('en-GB', { weekday: 'short' });
              return (
                <div key={holiday.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">{dateInfo.month}</span>
                    <span className="text-base font-bold text-primary">{dateInfo.day}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">{holiday.title}</p>
                    <p className="text-xs text-on-surface-variant">{weekday} • {holiday.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button 
            onClick={openHolidayModal}
            className="w-full mt-6 py-2 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            Full Calendar
          </button>
        </div>

        {/* Quick Action Cards - 2 Column with Split Left */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Left Column - Split into two stacked cards */}
          <div className="flex flex-col h-full min-h-65">
            {/* Request Leave Card */}
            <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-t-2xl text-on-primary flex flex-col justify-between flex-1 shadow-lg shadow-primary/20 group hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                  <h4 className="text-base font-bold font-headline">Request Leave</h4>
                </div>
                <button className="px-3 py-1.5 bg-surface-container-lowest/90 text-primary rounded-lg text-xs font-bold shadow-sm hover:scale-105 hover:bg-surface-container-lowest transition-all">Apply Now</button>
              </div>
              <p className="text-xs opacity-80 mt-1">Planning a getaway? Submit your leave application in just a few clicks.</p>
            </div>

            {/* Policy Manual Card - Matching the style */}
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200/60 p-6 rounded-b-2xl text-on-surface flex flex-col justify-between flex-1 shadow-sm group hover:shadow-md hover:shadow-slate-500/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-slate-500">menu_book</span>
                  <h4 className="text-base font-bold font-headline text-slate-700">Policy Manual</h4>
                </div>
                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">View</button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Access company policies, HR guidelines, and workplace rules.</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200/60 p-6 rounded-2xl text-on-surface flex flex-col justify-between h-full min-h-65 shadow-sm relative overflow-hidden group">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl"></div>
            </div>
            
            {/* Live indicator */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide">Live</span>
            </div>
            
            <div className="space-y-3 relative z-10">
              {/* Date with clean styling */}
              <div className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                <p className="text-sm font-medium text-slate-600">
                  {formattedFullDate}
                </p>
              </div>
              
              {/* Day and shift info */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500">{dayName}</span>
                <span className="w-px h-3 bg-slate-300"></span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-600 font-mono">1019</span>
                </span>
              </div>
              
              {/* Clock display - more elegant */}
              <div className="mt-3 flex items-baseline gap-0">
                <span className="font-mono text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
                  {timeString.hours}
                </span>
                <span className="font-mono text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight animate-pulse">:</span>
                <span className="font-mono text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
                  {timeString.minutes}
                </span>
                <span className="font-mono text-xl font-medium text-slate-400 ml-1">:{timeString.seconds}</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6 relative z-10">
              <button 
                onClick={() => setIsSwipesModalOpen(true)}
                className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">badge</span>
                View Swipes
              </button>
              <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Section */}
      <footer className="mt-20 flex flex-col md:flex-row justify-between items-center py-8 border-t border-outline-variant/15 gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-xs font-medium text-on-surface-variant">System Status: Optimal</p>
          </div>
          <p className="text-xs text-on-surface-variant hidden md:block">© 2024 Sanctuary HRMS. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <a className="text-xs text-on-surface-variant hover:text-primary font-medium transition-colors" href="#">Privacy Policy</a>
          <a className="text-xs text-on-surface-variant hover:text-primary font-medium transition-colors" href="#">Support Center</a>
        </div>
      </footer>
      
      {isSwipesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-surface w-[calc(100%-2rem)] max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 scale-100 transition-transform">
            <div className="bg-surface-container-lowest px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
              <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                Swipes
              </h3>
              <button 
                onClick={() => setIsSwipesModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 bg-surface">
              <div className="flex flex-wrap gap-x-8 gap-y-4 items-center text-sm mb-6 text-on-surface-variant">
                <div>Date <span className="font-semibold text-on-surface ml-1">{formattedShortDate}</span></div>
                <div>Shift Time <span className="font-semibold text-on-surface ml-1">10:00 to 19:00</span></div>
                <div>Shift Type <span className="font-semibold text-on-surface ml-1">1019</span></div>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-outline-variant/20">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#eaf4fa] text-on-surface-variant font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b border-outline-variant/10">Swipe Time</th>
                      <th className="px-4 py-3 border-b border-outline-variant/10">In/Out</th>
                      <th className="px-4 py-3 border-b border-outline-variant/10">Door/Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/10">
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-on-surface">10:00:03</td>
                      <td className="px-4 py-3 font-semibold text-on-surface">IN</td>
                      <td className="px-4 py-3 text-on-surface-variant">-</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-on-surface opacity-30">--:--:--</td>
                      <td className="px-4 py-3 font-semibold text-on-surface-variant opacity-30">-</td>
                      <td className="px-4 py-3 text-on-surface-variant opacity-30">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Calendar Modal */}
      {isHolidayModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={(e) => e.target === e.currentTarget && setIsHolidayModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="holiday-modal-title"
        >
          <div id="holiday-modal-title" className="sr-only">Holiday Calendar</div>
          <div className="bg-surface w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 scale-100 transition-transform flex flex-col">
            {/* Modal Header */}
            <div className="bg-surface-container-lowest px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 shrink-0">
              <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                Holiday Calendar
              </h3>
              <button 
                onClick={() => setIsHolidayModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row overflow-hidden">
              {/* Calendar Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={goToPrevMonth}
                    className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <h4 className="text-xl font-bold font-headline text-on-surface">{monthData.monthName}</h4>
                  <button 
                    onClick={goToNextMonth}
                    className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-on-surface-variant py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {monthData.days.map((dayInfo, idx) => {
                    if (!dayInfo.isCurrentMonth || !dayInfo.day) {
                      return <div key={idx} className="h-14 rounded-xl" aria-hidden="true"></div>;
                    }

                    const isSelected = selectedDate?.date === dayInfo.date;
                    const baseClasses = 'relative flex h-14 flex-col justify-between rounded-xl px-3 py-2 text-left transition-all';
                    const stateClasses = isSelected
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : dayInfo.holiday
                        ? 'bg-amber-50 text-slate-900 ring-1 ring-amber-200 hover:bg-amber-100'
                        : dayInfo.isWeekend
                          ? 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          : 'bg-transparent text-on-surface hover:bg-surface-container-low';
                    const interactivityClasses = dayInfo.holiday ? 'cursor-pointer' : 'cursor-default';

                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`${baseClasses} ${stateClasses} ${interactivityClasses} ${dayInfo.isToday ? 'ring-1 ring-slate-300' : ''}`}
                        disabled={!dayInfo.holiday}
                        onClick={() => handleDateClick(dayInfo)}
                      >
                        <span className={`relative z-10 block text-base font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {dayInfo.day}
                        </span>
                        {dayInfo.holiday && (
                          <>
                            <span className={`absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`}></span>
                            <span className={`relative z-10 mt-2 inline-flex max-w-full self-start truncate rounded-full px-2 py-1 text-[10px] font-semibold ${isSelected ? 'bg-white/15 text-white' : 'bg-white text-amber-700 shadow-sm'}`}>
                              Holiday
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-surface-container-low ring-1 ring-slate-300"></span>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-900"></span>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
              
              {/* Holiday Detail Panel */}
              <div className="w-full lg:w-72 bg-surface-container-lowest p-6 border-t lg:border-t-0 lg:border-l border-outline-variant/10 shrink-0">
                <h5 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-wide mb-4">
                  Selected Date
                </h5>
                {selectedDate ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex flex-col items-center justify-center border border-outline-variant/20">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                          {parseDate(selectedDate.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold text-on-surface">
                          {parseDate(selectedDate.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{selectedDate.title}</p>
                        <p className="text-xs text-on-surface-variant">
                          {parseDate(selectedDate.date).toLocaleDateString('en-GB', { weekday: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/10">
                      <p className="text-xs text-on-surface-variant mb-1">Occasion</p>
                      <span className="inline-flex px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold border border-outline-variant/20">
                        {selectedDate.occasion}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/10">
                      <p className="text-xs text-on-surface-variant mb-2">Holiday Type</p>
                      <p className="text-sm font-medium text-on-surface">{selectedDate.type}</p>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/10">
                      <p className="text-xs text-on-surface-variant mb-2">About This Holiday</p>
                      <p className="text-sm leading-6 text-on-surface-variant">{selectedDate.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2 opacity-50">event</span>
                    <p className="text-sm text-on-surface-variant">Select a holiday from the calendar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSwipesModalOpen, setIsSwipesModalOpen] = useState(false);

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
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Oct</span>
                <span className="text-base font-bold text-primary">24</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Dussehra Festival</p>
                <p className="text-xs text-on-surface-variant">Tuesday • National Holiday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Nov</span>
                <span className="text-base font-bold text-primary">12</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Diwali Vacation</p>
                <p className="text-xs text-on-surface-variant">Sunday • Festival Holiday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Dec</span>
                <span className="text-base font-bold text-primary">25</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Christmas Day</p>
                <p className="text-xs text-on-surface-variant">Monday • Gazetted Holiday</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors">
            Full Calendar
          </button>
        </div>

        {/* Quick Action Cards / Banner */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl text-on-primary flex flex-col justify-between min-h-[180px] shadow-lg shadow-primary/20">
            <div>
              <h4 className="text-xl font-bold font-headline mb-1">Request Leave</h4>
              <p className="text-xs opacity-80 leading-relaxed">Planning a getaway? Submit your leave application in just a few clicks.</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="material-symbols-outlined text-3xl opacity-40">flight_takeoff</span>
              <button className="px-4 py-2 bg-surface-container-lowest text-primary rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-transform">Apply Now</button>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#f8f9fc] to-[#eef2f6] border border-outline-variant/30 p-6 rounded-2xl text-on-surface flex flex-col justify-between min-h-[180px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-6 right-6 flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
              <span className="relative w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-pink-400"></span>
            </div>
            
            <div className="space-y-1 relative z-10">
              <p className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                {formattedFullDate}
              </p>
              <p className="text-xs text-on-surface-variant opacity-80 flex items-center gap-2">
                {dayName} | <span className="font-mono text-[10px] font-semibold bg-surface-container-high px-2 py-0.5 rounded-sm">1019</span>
              </p>
              <div className="mt-2 font-mono text-3xl tracking-tight font-light text-primary flex items-baseline gap-1">
                {timeString.hours}<span className="animate-pulse opacity-50 relative -top-1">:</span>{timeString.minutes}<span className="text-lg ml-1 text-on-surface-variant opacity-60">:{timeString.seconds}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 relative z-10">
              <button 
                onClick={() => setIsSwipesModalOpen(true)}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 hover:underline"
              >
                View Swipes
              </button>
              <button className="px-4 py-2 bg-[#4c6bf4] hover:bg-[#3f5be0] text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all">
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
    </div>
  );
}

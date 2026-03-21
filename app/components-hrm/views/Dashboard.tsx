import React from 'react';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Welcome Hero Section */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-extrabold font-headline text-on-background mb-2 tracking-tight">Good Afternoon, Alex</h2>
          <p className="text-on-surface-variant text-lg">You have no pending approvals for today. Have a productive session!</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Monthly Report
          </button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Attendance Summary Card (Large) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[1.5rem] p-8 editorial-shadow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold font-headline">Attendance Summary</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-full">This Week</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-6 w-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant font-medium">Avg. Work Hours</p>
                  <p className="text-2xl font-bold font-headline">8h 42m</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-container/40 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant font-medium">On-time Arrival</p>
                  <p className="text-2xl font-bold font-headline">98.2%</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 h-40 flex items-end justify-around px-4 w-full border-l border-outline-variant/10">
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
        <div className="col-span-12 lg:col-span-4 bg-tertiary-container/30 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center editorial-shadow">
          <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-4xl">auto_awesome</span>
          </div>
          <h3 className="text-lg font-bold font-headline mb-2 text-on-surface">Clear Skies!</h3>
          <p className="text-sm text-on-tertiary-container leading-relaxed">No reviews or appraisals are pending your attention right now.</p>
          <button className="mt-6 text-xs font-bold uppercase tracking-widest text-tertiary hover:underline">View History</button>
        </div>

        {/* Upcoming Holidays List */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-[1.5rem] p-8 editorial-shadow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold font-headline">Upcoming Holidays</h3>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_horiz</button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Oct</span>
                <span className="text-lg font-bold text-primary">24</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Dussehra Festival</p>
                <p className="text-xs text-on-surface-variant">Tuesday • National Holiday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Nov</span>
                <span className="text-lg font-bold text-primary">12</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Diwali Vacation</p>
                <p className="text-xs text-on-surface-variant">Sunday • Festival Holiday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/15 group-hover:bg-primary/5 transition-colors">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Dec</span>
                <span className="text-lg font-bold text-primary">25</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Christmas Day</p>
                <p className="text-xs text-on-surface-variant">Monday • Gazetted Holiday</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 py-3 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors">
            Full Calendar
          </button>
        </div>

        {/* Quick Action Cards / Banner */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-[1.5rem] text-on-primary flex flex-col justify-between min-h-[220px] shadow-lg shadow-primary/20">
            <div>
              <h4 className="text-2xl font-bold font-headline mb-2">Request Leave</h4>
              <p className="text-sm opacity-80 leading-relaxed">Planning a getaway? Submit your leave application in just a few clicks.</p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="material-symbols-outlined text-4xl opacity-40">flight_takeoff</span>
              <button className="px-5 py-2 bg-surface-container-lowest text-primary rounded-lg text-sm font-bold shadow-sm hover:scale-105 transition-transform">Apply Now</button>
            </div>
          </div>
          
          <div className="bg-[#2d3335] p-8 rounded-[1.5rem] text-white flex flex-col justify-between min-h-[220px] shadow-lg">
            <div>
              <h4 className="text-2xl font-bold font-headline mb-2">Policy Manual</h4>
              <p className="text-sm opacity-60 leading-relaxed">Updated HR guidelines for 2024 are now available for review.</p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="material-symbols-outlined text-4xl opacity-20">menu_book</span>
              <button className="px-5 py-2 bg-surface/10 text-white border border-white/20 rounded-lg text-sm font-bold hover:bg-surface/20 transition-colors">Read PDF</button>
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
    </div>
  );
}

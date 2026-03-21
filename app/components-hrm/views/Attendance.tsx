import React from 'react';

export default function Attendance() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Bento Grid: Stats and Action */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] editorial-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined p-2 bg-secondary-container text-primary rounded-lg group-hover:bg-on-primary group-hover:text-primary transition-colors">check_circle</span>
              <span className="text-xs font-bold tracking-widest text-on-surface-variant group-hover:text-on-primary/80 uppercase">On-Time</span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-headline font-extrabold text-on-surface group-hover:text-on-primary transition-colors">22</p>
              <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-primary/70 transition-colors">This month</p>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] editorial-shadow flex flex-col justify-between group hover:bg-error transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined p-2 bg-error-container/20 text-error rounded-lg group-hover:bg-on-error group-hover:text-error transition-colors">schedule</span>
              <span className="text-xs font-bold tracking-widest text-on-surface-variant group-hover:text-on-error/80 uppercase">Late-In</span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-headline font-extrabold text-on-surface group-hover:text-on-error transition-colors">03</p>
              <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-error/70 transition-colors">This month</p>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] editorial-shadow flex flex-col justify-between group hover:bg-surface-dim transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined p-2 bg-surface-container text-on-surface-variant rounded-lg group-hover:bg-on-surface group-hover:text-surface-dim transition-colors">block</span>
              <span className="text-xs font-bold tracking-widest text-on-surface-variant group-hover:text-on-surface/80 uppercase">Absent</span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-headline font-extrabold text-on-surface group-hover:text-on-surface transition-colors">01</p>
              <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface/70 transition-colors">This month</p>
            </div>
          </div>
        </div>

        {/* Regularization CTA */}
        <div className="col-span-12 lg:col-span-4 bg-tertiary-container/30 rounded-[1.5rem] p-6 relative overflow-hidden flex flex-col justify-center editorial-shadow">
          <div className="z-10">
            <h3 className="font-headline text-xl font-bold text-on-tertiary-container mb-2">Missed a swipe?</h3>
            <p className="text-sm text-on-tertiary-container/80 mb-6 max-w-[200px]">Submit a regularization request for the current pay period.</p>
            <button className="bg-on-tertiary-container text-tertiary-container px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Regularize Attendance
            </button>
          </div>
          {/* Abstract Design Elements */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-tertiary-container rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-tertiary-container/40 text-6xl">auto_stories</span>
          </div>
        </div>
      </div>

      {/* Asymmetric Layout: History & Calendar */}
      <div className="grid grid-cols-12 gap-8">
        {/* Attendance History Table */}
        <div className="col-span-12 xl:col-span-8">
          <div className="bg-surface-container-lowest rounded-[1.5rem] editorial-shadow overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center">
              <h3 className="font-headline text-xl font-bold">Recent History</h3>
              <div className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:underline">
                View all history <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-bold text-on-surface-variant/70">Date</th>
                    <th className="px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-bold text-on-surface-variant/70">Check-in</th>
                    <th className="px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-bold text-on-surface-variant/70">Check-out</th>
                    <th className="px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-bold text-on-surface-variant/70">Total Hrs</th>
                    <th className="px-8 py-4 text-[10px] tracking-[0.2em] uppercase font-bold text-on-surface-variant/70">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  <tr className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-5 font-body text-sm font-semibold">Oct 24, 2023</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">09:02 AM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">06:15 PM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">9h 13m</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">On-Time</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-5 font-body text-sm font-semibold">Oct 23, 2023</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">09:45 AM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">06:40 PM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">8h 55m</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-error-container/20 text-error rounded-full text-[10px] font-bold uppercase tracking-wider">Late-In</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-5 font-body text-sm font-semibold">Oct 22, 2023</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">08:58 AM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">06:05 PM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">9h 07m</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">On-Time</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-5 font-body text-sm font-semibold">Oct 21, 2023</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">-</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">-</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">0h 00m</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-[10px] font-bold uppercase tracking-wider">Absent</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-5 font-body text-sm font-semibold">Oct 20, 2023</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">09:10 AM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">07:20 PM</td>
                    <td className="px-8 py-5 font-body text-sm text-on-surface-variant">10h 10m</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Overtime</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Calendar Sidebar View */}
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-surface-container-lowest rounded-[1.5rem] editorial-shadow p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-xl font-bold">Tracking</h3>
              <div className="flex gap-2 items-center">
                <button className="p-1 hover:bg-surface-container rounded transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <span className="text-sm font-bold px-2">October</span>
                <button className="p-1 hover:bg-surface-container rounded transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
            
            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-4 text-center mb-8">
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Mo</div>
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Tu</div>
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">We</div>
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Th</div>
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Fr</div>
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Sa</div>
              <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Su</div>
              
              {/* Spacer for start of month */}
              <div></div><div></div><div></div><div></div>
              
              {/* Days */}
              <div className="text-sm font-medium py-2 text-on-surface-variant/30">1</div>
              <div className="text-sm font-medium py-2 text-on-surface-variant/30">2</div>
              <div className="text-sm font-medium py-2 text-on-surface-variant/30">3</div>
              
              <div className="text-sm font-medium py-2 relative">4<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">5<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">6<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">7<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-error rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">8<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2">9</div>
              <div className="text-sm font-medium py-2">10</div>
              
              <div className="text-sm font-medium py-2 relative">11<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">12<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">13<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2">14</div>
              <div className="text-sm font-medium py-2">15</div>
              <div className="text-sm font-medium py-2 relative">16<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              <div className="text-sm font-medium py-2 relative">17<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></div>
              
              <div className="text-sm font-medium py-2 bg-primary text-on-primary rounded-full font-bold">18</div>
              <div className="text-sm font-medium py-2">19</div>
              <div className="text-sm font-medium py-2">20</div>
              <div className="text-sm font-medium py-2">21</div>
              <div className="text-sm font-medium py-2">22</div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-outline-variant/10">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-xs font-medium text-on-surface-variant">On-time (22 days)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="text-xs font-medium text-on-surface-variant">Late arrival (3 days)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-on-surface/20"></span>
                <span className="text-xs font-medium text-on-surface-variant">Weekend / Holiday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

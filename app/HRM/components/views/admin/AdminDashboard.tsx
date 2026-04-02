import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Hero Header */}
      <section className="flex justify-between items-end mb-12 flex-wrap gap-4 w-full">
        <div>
          <h2 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Good Morning, Alex</h2>
          <p className="text-on-surface-variant font-medium text-lg">Your sanctuary for team growth and organizational harmony.</p>
        </div>
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-2xl bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
            <span className="material-symbols-outlined text-3xl">calendar_today</span>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-3xl">wb_sunny</span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Total Employees */}
        <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col justify-between h-48 group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary p-2 bg-primary/5 rounded-lg">person_add</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold font-headline">1,284</h3>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Total Employees</p>
          </div>
        </div>
        
        {/* Pending Leaves */}
        <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col justify-between h-48 group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-error p-2 bg-error/5 rounded-lg">event_busy</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">High</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold font-headline">24</h3>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Leave Requests</p>
          </div>
        </div>
        
        {/* Payroll */}
        <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col justify-between h-48 group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary p-2 bg-primary/5 rounded-lg">account_balance_wallet</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Active</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold font-headline">98%</h3>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Payroll Status</p>
          </div>
        </div>
        
        {/* Open Positions */}
        <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col justify-between h-48 group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary p-2 bg-tertiary/5 rounded-lg">work</span>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">8 New</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold font-headline">14</h3>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Open Positions</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Activity & Actions */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions Banner */}
          <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-[1.5rem] text-on-primary flex flex-col lg:flex-row justify-between items-start lg:items-center relative overflow-hidden gap-6">
            <div className="relative z-10 w-full">
              <h4 className="text-2xl font-bold font-headline mb-2">Empower Your Team</h4>
              <p className="opacity-80 mb-6 max-w-md">Streamline your workflows with our intelligent HR tools designed for modern leadership.</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-surface text-primary px-6 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Add New Employee
                </button>
                <button className="bg-surface/20 backdrop-blur-md text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface/30 active:scale-95 transition-transform flex items-center gap-2 border border-surface/30">
                  <span className="material-symbols-outlined text-lg">payments</span>
                  Run Payroll
                </button>
              </div>
            </div>
            <div className="absolute right-[-20px] top-[-20px] opacity-10 hidden md:block">
              <span className="material-symbols-outlined text-[160px]">rocket_launch</span>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm border border-outline-variant/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h4 className="font-headline text-2xl font-bold text-on-surface">Recent Activity</h4>
              <button className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 hover:bg-surface-container-low rounded-2xl transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined">person_add_alt</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start">
                    <p className="font-bold text-on-surface truncate pr-4">Alex Rivera <span className="font-normal text-on-surface-variant">joined as Senior Frontend Engineer</span></p>
                    <span className="text-xs text-on-surface-variant shrink-0 mt-1 sm:mt-0">2h ago</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1 truncate">Engineering Team • San Francisco HQ</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 hover:bg-surface-container-low rounded-2xl transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start">
                    <p className="font-bold text-on-surface truncate pr-4">Leave Approved <span className="font-normal text-on-surface-variant">for Marcus Chen</span></p>
                    <span className="text-xs text-on-surface-variant shrink-0 mt-1 sm:mt-0">5h ago</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1 truncate">Medical Leave • 5 Days • Starting Oct 12</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 hover:bg-surface-container-low rounded-2xl transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <span className="material-symbols-outlined">update</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start">
                    <p className="font-bold text-on-surface truncate pr-4">System Update <span className="font-normal text-on-surface-variant">v2.4 deployed successfully</span></p>
                    <span className="text-xs text-on-surface-variant shrink-0 mt-1 sm:mt-0">Yesterday</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1 truncate">New analytics modules and performance optimizations enabled.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Distribution & Quick Post */}
        <div className="space-y-8">
          {/* Distribution Chart Card */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col shadow-sm border border-outline-variant/10">
            <h4 className="font-headline text-xl font-bold mb-8 text-on-surface">Departmental Mix</h4>
            <div className="flex-1 flex flex-col space-y-6">
              <div className="space-y-4 pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-on-surface-variant">
                    <span>Engineering</span>
                    <span>42%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-on-surface-variant">
                    <span>Design</span>
                    <span>28%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-[#516bfc] rounded-full transition-all duration-1000 delay-100" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-on-surface-variant">
                    <span>Operations</span>
                    <span>18%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-container rounded-full transition-all duration-1000 delay-200" style={{ width: '18%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-on-surface-variant">
                    <span>Marketing</span>
                    <span>12%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-surface-variant rounded-full transition-all duration-1000 delay-300" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Card: Post Job */}
          <div className="bg-surface-container-low p-8 rounded-[1.5rem] border border-outline-variant/20 border-dashed hover:bg-surface-container transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm mb-4 border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-3xl">post_add</span>
              </div>
              <h4 className="font-headline text-lg font-bold text-on-surface">Need more talent?</h4>
              <p className="text-sm text-on-surface-variant mt-2 mb-6">Create a job posting and reach thousands of candidates instantly.</p>
              <button className="w-full bg-on-surface text-surface py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors active:scale-95">
                Post Job Opening
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Help */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="h-14 w-14 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform hover:shadow-primary/50">
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
      </div>
    </div>
  );
}

import React from 'react';

export default function Leave() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Greeting & Summary Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-primary text-on-primary p-8 rounded-[2rem] flex flex-col justify-between shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80 mb-1">Available Days</p>
            <p className="text-5xl font-extrabold font-headline">24</p>
          </div>
          <div className="mt-8 relative z-10">
            <button className="bg-on-primary text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform">Plan Vacation</button>
          </div>
          {/* Abstract Shape Overlay */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col justify-between editorial-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-secondary-container rounded-2xl">
              <span className="material-symbols-outlined text-on-secondary-container">beach_access</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Annual</span>
          </div>
          <div className="mt-6">
            <p className="text-3xl font-extrabold font-headline text-on-background">12</p>
            <p className="text-sm text-on-surface-variant">Remaining days</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col justify-between editorial-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-tertiary-container rounded-2xl">
              <span className="material-symbols-outlined text-on-tertiary-container">medical_services</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Sick</span>
          </div>
          <div className="mt-6">
            <p className="text-3xl font-extrabold font-headline text-on-background">08</p>
            <p className="text-sm text-on-surface-variant">Remaining days</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col justify-between editorial-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-surface-container rounded-2xl">
              <span className="material-symbols-outlined text-on-surface-variant">event_note</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Casual</span>
          </div>
          <div className="mt-6">
            <p className="text-3xl font-extrabold font-headline text-on-background">04</p>
            <p className="text-sm text-on-surface-variant">Remaining days</p>
          </div>
        </div>
      </section>

      {/* Application Form and Decorative Card */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[2.5rem] p-10 editorial-shadow border border-outline-variant/10">
          <div className="mb-10">
            <h2 className="text-2xl font-bold font-headline text-on-background mb-2">Apply for Leave</h2>
            <p className="text-on-surface-variant text-sm">Please fill in the details for your leave request below.</p>
          </div>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Leave Type</label>
                <select className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium outline-none appearance-none">
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Start Date</label>
                  <input className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface outline-none" type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">End Date</label>
                  <input className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface outline-none" type="date" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Reason for Absence</label>
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40 outline-none resize-none" 
                placeholder="Briefly describe the reason for your leave..." 
                rows={4}
              ></textarea>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-3" 
                type="button"
              >
                <span>Submit Request</span>
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-tertiary-container rounded-[2.5rem] p-8 h-full flex flex-col justify-between relative overflow-hidden editorial-shadow">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold font-headline text-on-tertiary-container leading-tight mb-4">Gateway to Possibilities</h3>
            <p className="text-on-tertiary-container/80 text-sm leading-relaxed">Taking time off isn't just about resting; it's about returning with renewed perspective. Plan your next adventure today.</p>
          </div>
          <div className="mt-12 relative z-10">
            <img 
              alt="Vacation destination" 
              className="rounded-3xl w-full h-48 object-cover shadow-2xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGsyIWS032Ctq2BFBb1xbScezhUS9UXHJq3wJa17imWPVlPCWz826fWJPLyftH3iPFCPM3_zSdOwey-8vI36uw5o9K3jaHkMss4oxL7MK9QuXgFlyo2Cn-eQt1poXbpN7S22oYgpXX-bheYyHhVWTzoWI0jEwD4yM__2UbfDgHxIgJCkqDv4EMxCq_Y2oTqILl_0YT8xPBwaZPDFE8KJ92VEUnIoFrVY-W2_ijuMCQ-xC7GWNAjEJZPj8O9EqM0ZinEI_lGyILgZk"
            />
          </div>
          {/* Abstract Pattern Background */}
          <div className="absolute top-0 right-0 opacity-10">
            <span className="material-symbols-outlined text-[15rem]">flight_takeoff</span>
          </div>
        </div>
      </section>

      {/* Leave History Table */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] p-10 editorial-shadow border border-outline-variant/10 overflow-hidden">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-bold font-headline text-on-background mb-2">Leave History</h2>
            <p className="text-on-surface-variant text-sm">Review your past and upcoming leave applications.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">Download PDF</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-container">
                <th className="pb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Type</th>
                <th className="pb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Duration</th>
                <th className="pb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Dates</th>
                <th className="pb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Status</th>
                <th className="pb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/50">
              <tr className="group hover:bg-surface-container-low/30 transition-colors">
                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-semibold text-on-background">Annual Leave</span>
                  </div>
                </td>
                <td className="py-6 text-sm text-on-surface">5 Days</td>
                <td className="py-6 text-sm text-on-surface-variant">Oct 12 - Oct 17, 2023</td>
                <td className="py-6">
                  <span className="px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">Approved</span>
                </td>
                <td className="py-6">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_horiz</button>
                </td>
              </tr>
              <tr className="group hover:bg-surface-container-low/30 transition-colors">
                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-surface-dim"></div>
                    <span className="font-semibold text-on-background">Casual Leave</span>
                  </div>
                </td>
                <td className="py-6 text-sm text-on-surface">1 Day</td>
                <td className="py-6 text-sm text-on-surface-variant">Sep 28, 2023</td>
                <td className="py-6">
                  <span className="px-4 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">Pending</span>
                </td>
                <td className="py-6">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_horiz</button>
                </td>
              </tr>
              <tr className="group hover:bg-surface-container-low/30 transition-colors">
                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="font-semibold text-on-background">Sick Leave</span>
                  </div>
                </td>
                <td className="py-6 text-sm text-on-surface">2 Days</td>
                <td className="py-6 text-sm text-on-surface-variant">Aug 05 - Aug 06, 2023</td>
                <td className="py-6">
                  <span className="px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">Approved</span>
                </td>
                <td className="py-6">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_horiz</button>
                </td>
              </tr>
              <tr className="group hover:bg-surface-container-low/30 transition-colors">
                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-error"></div>
                    <span className="font-semibold text-on-background">Annual Leave</span>
                  </div>
                </td>
                <td className="py-6 text-sm text-on-surface">3 Days</td>
                <td className="py-6 text-sm text-on-surface-variant">Jul 20 - Jul 22, 2023</td>
                <td className="py-6">
                  <span className="px-4 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold">Rejected</span>
                </td>
                <td className="py-6">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_horiz</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button className="text-primary font-bold text-sm hover:underline">View All History</button>
        </div>
      </section>
    </div>
  );
}

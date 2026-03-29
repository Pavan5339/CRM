import React from 'react';

export default function AddEmployee() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      {/* Breadcrumbs & Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <nav className="flex gap-2 text-[11px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
            <span className="cursor-pointer hover:text-primary transition-colors">Directory</span>
            <span>/</span>
            <span className="text-primary">Add New Employee</span>
          </nav>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">Add New Employee</h2>
          <p className="text-on-surface-variant mt-2 max-w-lg">Enter comprehensive profile details to onboard a new talent into the Lumina sanctuary. Ensure all mandatory fields are accurate for payroll synchronization.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 rounded-xl text-sm font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container transition-colors">Cancel</button>
          <button className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all">Save Employee</button>
        </div>
      </div>

      {/* Form Body */}
      <div className="space-y-12">
        {/* Section: Personal Information */}
        <section className="bg-surface-container-lowest p-10 rounded-[1.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">person</span>
            </div>
            <h3 className="text-xl font-bold font-headline tracking-tight">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
            <div className="md:col-span-8 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Full Name</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="e.g. Alexander Pierce" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Date of Birth</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="date" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Gender</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none cursor-pointer outline-none transition-colors">
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Marital Status</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none cursor-pointer outline-none transition-colors">
                <option>Select Status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Nationality</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="e.g. American" type="text" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Personal Email</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="alex.p@example.com" type="email" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Phone Number</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="+1 (555) 000-0000" type="tel" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Height (cm)</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="180" type="number" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Weight (kg)</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="75" type="number" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Hobby</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="e.g. Photography, Hiking" type="text" />
            </div>
            <div className="md:col-span-12 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Current Address</label>
              <textarea className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm resize-none outline-none transition-colors" placeholder="Street name, City, State, Zip Code" rows={3}></textarea>
            </div>
          </div>
        </section>

        {/* Section: Joining Details */}
        <section className="bg-surface-container-lowest p-10 rounded-[1.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/40 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">work</span>
            </div>
            <h3 className="text-xl font-bold font-headline tracking-tight">Joining Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Date of Joining</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Confirmation Date</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Probation Period</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors appearance-none cursor-pointer">
                <option>3 Months</option>
                <option>6 Months</option>
                <option>None</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Notice Period</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors appearance-none cursor-pointer">
                <option>30 Days</option>
                <option>60 Days</option>
                <option>90 Days</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Designation</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. Senior Product Designer" type="text" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Department</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors appearance-none cursor-pointer">
                <option>Product & Design</option>
                <option>Engineering</option>
                <option>Marketing</option>
                <option>Human Resources</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Division</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. User Experience" type="text" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Reporting Manager</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="Search manager name..." type="text" />
            </div>
          </div>
        </section>

        {/* Section: Identity & Financials */}
        <section className="bg-surface-container-lowest p-10 rounded-[1.5rem] shadow-sm border border-outline-variant/10 overflow-hidden relative">
          {/* Subtle background visual */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <h3 className="text-xl font-bold font-headline tracking-tight">Identity & Financials</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Aadhaar / National ID</label>
                <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm tracking-widest outline-none transition-colors" placeholder="XXXX - XXXX - XXXX" type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Permanent Account Number (PAN)</label>
                <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm tracking-widest outline-none transition-colors" placeholder="ABCDE1234F" type="text" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Bank Account Number</label>
                <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors text-lg tracking-[0.2em]" placeholder="••••••••••••" type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">IFSC Code</label>
                <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm tracking-widest outline-none transition-colors" placeholder="LUMN0001234" type="text" />
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 gap-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-outline">info</span>
            <p className="text-sm text-on-surface-variant">Double-check bank details to ensure timely salary processing for the next cycle.</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-semibold text-on-surface bg-surface-container hover:bg-surface-container-highest transition-colors">Discard Draft</button>
            <button className="flex-1 md:flex-none px-10 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Submit Enrollment</button>
          </div>
        </div>
      </div>
    </div>
  );
}

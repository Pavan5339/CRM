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
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Full Name</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Date of Birth</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="date" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Birthday</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" placeholder="DD MMM" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Blood Group</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none outline-none">
                <option>Select</option><option>A+</option><option>O+</option><option>B+</option><option>AB+</option><option>A-</option><option>O-</option><option>B-</option><option>AB-</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Father's Name</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Marital Status</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none outline-none">
                <option>Single</option><option>Married</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Marriage Date</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="date" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Spouse Name</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Nationality</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Residential Status</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Place of Birth</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Country Of Origin</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Religion</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">International Employee</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none outline-none">
                <option>No</option><option>Yes</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Physically Challenged</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none outline-none">
                <option>No</option><option>Yes</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Is Director</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm appearance-none outline-none">
                <option>No</option><option>Yes</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Personal Email</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="email" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Height (cm)</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="number" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Weight (kg)</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="number" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Identification Mark</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Hobby</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Caste</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
          </div>
        </section>

        {/* Section: Present Address */}
        <section className="bg-surface-container-lowest p-10 rounded-[1.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">home</span>
            </div>
            <h3 className="text-xl font-bold font-headline tracking-tight">Present Address</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Name</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Address</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">City</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">District</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">State</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Country</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Pincode</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Phone1</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="tel" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Phone2</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="tel" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Ext</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Fax</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Mobile no</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="tel" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Email</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm transition-colors outline-none" type="email" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Joined On</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="date" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Confirmation Date</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="date" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Status</label>
              <select className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors appearance-none cursor-pointer">
                <option>Probation</option>
                <option>Confirmed</option>
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Probation Period</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. 180 days" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Notice Period</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. 30 days" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Current Company Experience</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. 1M" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Previous Experience</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. 2Y" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Total Experience</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" placeholder="e.g. 2Y 1M" type="text" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Referred By</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
            </div>
          </div>
        </section>

        {/* Section: Current Position */}
        <section className="bg-surface-container-lowest p-10 rounded-[1.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/40 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-xl font-bold font-headline tracking-tight">Current Position</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Location</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Department</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Division</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Designation</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Reporting To</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Company</label>
              <input className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors" type="text" />
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

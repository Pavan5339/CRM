import React from 'react';

export default function Profile() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section (Bento Style) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden editorial-shadow">
          {/* Subtle Gradient background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <img 
              className="w-40 h-40 rounded-2xl object-cover shadow-xl shadow-on-surface/5 border-4 border-surface-container-lowest" 
              alt="Alex Rivers Large Profile Avatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3ooqjodDgMxcO4uaQOdhoy1obLpnNawjPQ-bdgn-rQMx8LJlq7KBfGLEfV0NmkymWjSeiwlb8VXt5rj9Lyy4Z5NRWICK5kuHULRlJhe4Q37W3PS_Nuxzx-C4us65m2SmK_O0NkojMIXYu0I2u-aiY3j5UWLWgbizwlZtlmXWT11ZZx-80mmEH45ynY32SFYASOQ097pvlFxvNEXvVTeROKq5P96hnL978rolGCxfHoqYpadDqWDJpzWhXTgkJ635E7MTMKcoVhZ4"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-lg shadow-lg">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left z-10">
            <div>
              <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Alex Rivers</h1>
              <p className="text-primary font-semibold text-lg mt-1">Product Designer <span className="text-on-surface-variant font-medium mx-1">•</span> <span className="text-on-surface-variant font-medium">Design Department</span></p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">id_card</span>
                <span className="text-xs font-medium text-on-surface-variant">EMP-2024-089</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-container rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-bold text-on-secondary-container uppercase tracking-wider">Active Now</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4 justify-center md:justify-start">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-low text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-sm">mail</span>
                Email
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-surface-container-low text-on-surface rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-sm">chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar Bento Item */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] flex flex-col justify-center items-center text-center editorial-shadow">
            <span className="text-3xl font-extrabold font-headline text-on-surface">4.8</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Perf Score</span>
          </div>
          <div className="bg-tertiary-container p-6 rounded-[1.5rem] flex flex-col justify-center items-center text-center editorial-shadow">
            <span className="text-3xl font-extrabold font-headline text-on-tertiary-container">24</span>
            <span className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-widest mt-1">Projects</span>
          </div>
          <div className="col-span-2 bg-surface-container-lowest p-6 rounded-[1.5rem] flex items-center gap-4 editorial-shadow">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">work_history</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">2 Years, 4 Months</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Tenure at Lumina HR</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Navigation */}
      <nav className="flex items-center gap-8 border-b border-outline-variant/15 overflow-x-auto no-scrollbar pt-4">
        <button className="pb-4 text-sm font-bold text-primary border-b-2 border-primary whitespace-nowrap">Personal Info</button>
        <button className="pb-4 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">Job Details</button>
        <button className="pb-4 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">Documents</button>
        <button className="pb-4 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">Performance</button>
        <button className="pb-4 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">Skills & Certs</button>
      </nav>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Info Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Info Card */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] editorial-shadow">
            <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">badge</span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Full Name</p>
                <p className="text-sm font-semibold text-on-surface">Alex Rivers</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Date of Birth</p>
                <p className="text-sm font-semibold text-on-surface">May 14, 1994 (29 Years)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Gender</p>
                <p className="text-sm font-semibold text-on-surface">Male</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nationality</p>
                <p className="text-sm font-semibold text-on-surface">British</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Marital Status</p>
                <p className="text-sm font-semibold text-on-surface">Single</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Languages</p>
                <div className="flex gap-2">
                  <span className="text-sm font-semibold text-on-surface">English, German</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-10 border-t border-outline-variant/10">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">alternate_email</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Personal Email</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">alex.rivers@design.co</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">call</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Phone Number</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">+44 (0) 7700 900 123</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">location_on</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Current Address</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">24 Kensington High St, London, W8 4PT, United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] editorial-shadow">
            <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">business_center</span>
              Employment Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Manager</p>
                <div className="flex items-center gap-2">
                  <img 
                    className="w-6 h-6 rounded-full object-cover" 
                    alt="Manager Avatar" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvK3kHht2WRz2_uSfrttEQI7J0Vzy8r0bBmg4UPCHvWTTyEmyeu_3o81RduAL4N7j8vnHnY2TFkO9bgMo5Ms_78LOGhlzhSwCe5t9aUFQq33E5YXYjeFZCTY5QgJ4hrQAv21lgx-ZNSBXgSRKnRn6mywWW4PaTjGe-3bEuNa_NPqnpD6AOT0M5BWQE9WeKOVt1Rje4bQIYLxWApYFgN-OOX13JYJtg95ZP6baO5_oAkcbVd_8t2DOlb_G3YqmW_MXRspofIQJnWho"
                  />
                  <p className="text-sm font-semibold text-on-surface">Sarah Jenkins</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Join Date</p>
                <p className="text-sm font-semibold text-on-surface">Jan 12, 2022</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contract</p>
                <p className="text-sm font-semibold text-on-surface">Full-time</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Location</p>
                <p className="text-sm font-semibold text-on-surface">Remote (UK)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="lg:col-span-4 space-y-8">
          {/* Skills Section */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] editorial-shadow">
            <h3 className="text-lg font-bold font-headline mb-6 flex items-center justify-between">
              Skills
              <button className="material-symbols-outlined text-on-surface-variant text-sm hover:text-primary transition-colors">add</button>
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary text-xs font-bold rounded-full">UI/UX Design</span>
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary text-xs font-bold rounded-full">Figma</span>
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary text-xs font-bold rounded-full">React</span>
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary text-xs font-bold rounded-full">User Research</span>
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary text-xs font-bold rounded-full">Storytelling</span>
              <span className="px-4 py-1.5 bg-surface-container-low text-on-surface-variant text-xs font-medium rounded-full">Adobe Creative Cloud</span>
              <span className="px-4 py-1.5 bg-surface-container-low text-on-surface-variant text-xs font-medium rounded-full">Prototyping</span>
            </div>
            
            <h3 className="text-lg font-bold font-headline mt-10 mb-6">Certifications</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Google UX Professional</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Issued: March 2023</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <span className="material-symbols-outlined">architecture</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Advanced Figma Systems</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Issued: Nov 2022</p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Reports / Team */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] editorial-shadow">
            <h3 className="text-lg font-bold font-headline mb-6">Team Members</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full object-cover" alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKQfvUQguNxSAeyIcAsFfAc3WWN7k8u62fq0J32A2pqXyrbT2n54Q2tDI4ilTTCRhLHTEycWdBEAcivwT3r02czNwnUKYmQf4DChd4VHgtfge9rJET1TjSQl-booakAzQ9rBUclFrbKUnuwBtM7BmMCXFVCcNAhRXdRAe2KhP39ELJ-mnL_IVa_Bw8wAo1h2DHYVLx2aNJ4jMHaIJGPlwLLu90NeIR6CQd9DnsmRLQMc9pqVLY2z4MFY4b-EdafxEqG16Q-3qSnP4" />
                  <p className="text-sm font-medium text-on-surface">Marcus Chen</p>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">Lead Eng</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full object-cover" alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7xBbJCKKqIafC03Dk6DlInTiYxPqOT4wtDQ7Li67OCzbLyWTH76HE-cm0FR8ZRw9uSklxsjg9MRfIUtXK0fhJpwVsUBNakWPK8Brk0DuR8bvehngN6d-18TeJT6xKfRyBV-qp5rnhBd2es5vHuTLlyL3s8pfbv3UVcJ95DvMqjT8svARvqQYxOaF5ob1tvNoPsbgRX-rZV13wG0SXE3ld5F4J_SzmYnp__FKvb1xByZ7bknI23FZFuOE8Ga0s9y1yj-5CJIyAaGc" />
                  <p className="text-sm font-medium text-on-surface">Sofia Ross</p>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">UX Researcher</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full object-cover" alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4USUjmKbo4KpW-ZtFt0NZBpXIuTdihXULSKOFik7QkJHjFmNTg3ckkNbsyJGVOikd1a1zioEgPexsTlxvKKOGMn9LYm37orY8Wy-XjAVHCS6R2mFUigN6IZPqXJDwNaHCq4XJsbV_8yKJ4mfWbwHN7zkn1lfBSYpTgKYlAVEJjvuIYluyq934W-SP3CDuC70qUG7hLSR34CYzyzFvjk3UuMS0rbvYX8ebvHqhTswCCHOJWGUAv_9blFLOtfBmUvgAQjNKI5jwFM" />
                  <p className="text-sm font-medium text-on-surface">David Kim</p>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">Visual Design</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 border border-outline-variant/20 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
              View Org Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function DetailedEmployeeProfile() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      {/* Profile Header Section */}
      <section className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
          <div className="relative">
            <img 
              alt="Sarah Jenkins" 
              className="w-40 h-40 rounded-xl object-cover bg-white shadow-lg" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvlkiLByZj2dumxFhjNy1TBfEu3veHSETiEjWjjpOVrnRYM4o1N3pIp0FowU3VLSSqRCZNBFXfpiT2UOOFsrRSfqFWoGHGJHO8pwr7x-XKlE2UqoJh0NnJ-_HdKWIfd23uuFkkdxqFcyzcl9E258WtrlaTA3HRm70YTz10vwCM3YBEEywRH2AfUuI2R5vU0pWmEx1EeFAGPOJvh7owHn-5ufZk8raHiGPNlVx4Ke--K-UIa6LywHC9YIAaeIZkOwgJvniQaGh3u5s"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-surface shadow-sm" title="Active Status"></div>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Sarah Jenkins</h1>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-secondary/10">Active</span>
            </div>
            <p className="text-lg text-primary font-headline font-semibold">Senior UX Designer <span className="text-on-surface-variant/40 mx-2">|</span> Product Design</p>
            <div className="flex items-center gap-4 text-on-surface-variant text-sm font-medium justify-center md:justify-start">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">id_card</span> EMP-94202
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> London Hub
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-headline font-bold hover:shadow-lg transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit Profile
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-surface-container-lowest text-on-surface px-6 py-3 rounded-lg font-headline font-bold hover:bg-surface-container-low transition-all border border-outline-variant/10 shadow-sm">
            <span className="material-symbols-outlined text-lg">chat</span>
            Message
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-surface-container-lowest text-on-surface rounded-lg hover:bg-surface-container-low border border-outline-variant/10 shadow-sm transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </section>

      {/* Navigation Tabs for High Density Data */}
      <div className="flex gap-8 border-b border-outline-variant/20 mb-8 overflow-x-auto no-scrollbar">
        <button className="pb-4 text-primary font-bold border-b-2 border-primary whitespace-nowrap px-1">Profile Details</button>
        <button className="pb-4 text-on-surface-variant font-medium hover:text-primary transition-colors whitespace-nowrap px-1">Career Path</button>
        <button className="pb-4 text-on-surface-variant font-medium hover:text-primary transition-colors whitespace-nowrap px-1">Documents</button>
        <button className="pb-4 text-on-surface-variant font-medium hover:text-primary transition-colors whitespace-nowrap px-1">Attendance & Leave</button>
        <button className="pb-4 text-on-surface-variant font-medium hover:text-primary transition-colors whitespace-nowrap px-1">Assets</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Data Content */}
        <div className="xl:col-span-8 space-y-8">
          {/* Personal Information */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/5 shadow-[0_2px_12px_rgba(45,51,53,0.03)] hover:shadow-[0_4px_24px_rgba(45,51,53,0.06)] transition-shadow">
            <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
              <h2 className="text-xl font-extrabold font-headline">Personal Information</h2>
              <button className="p-2 hover:bg-primary/5 rounded-full transition-colors text-on-surface-variant hover:text-primary active:scale-95">
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">DOB</p>
                <div className="flex items-center gap-2 group cursor-pointer w-fit">
                  <p className="font-medium">14 Mar 1992</p>
                  <span className="material-symbols-outlined text-sm opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">visibility</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Birthday</p>
                <p className="font-medium">14 March</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Blood Group</p>
                <p className="font-medium">O +ve</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Father&apos;s Name</p>
                <p className="font-medium">David Jenkins</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Marital Status</p>
                <p className="font-medium">Married</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Marriage Date</p>
                <p className="font-medium">20 Jun 2018</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Spouse Name</p>
                <p className="font-medium">James Peterson</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nationality</p>
                <p className="font-medium">British</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Residential Status</p>
                <p className="font-medium">Resident</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Place of Birth</p>
                <p className="font-medium">London</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Country of Origin</p>
                <p className="font-medium">United Kingdom</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Religion</p>
                <p className="font-medium">None</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Int. Employee</p>
                <p className="font-medium border border-outline-variant/20 px-2 py-0.5 rounded text-xs w-fit">No</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Physically Challenged</p>
                <p className="font-medium border border-outline-variant/20 px-2 py-0.5 rounded text-xs w-fit">No</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Is Director</p>
                <p className="font-medium border border-outline-variant/20 px-2 py-0.5 rounded text-xs w-fit">No</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Personal Email</p>
                <p className="font-medium text-primary hover:underline cursor-pointer">sarah.j@gmail.com</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Height</p>
                <p className="font-medium">168 cm</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Weight</p>
                <p className="font-medium">62 kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID Mark</p>
                <p className="font-medium">Mole on right wrist</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Hobby</p>
                <p className="font-medium">Photography, Cycling</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Caste</p>
                <p className="font-medium text-on-surface-variant">-</p>
              </div>
            </div>
          </section>

          {/* Joining Details & Current Position */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Joining Details */}
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/5 shadow-[0_2px_12px_rgba(45,51,53,0.03)] hover:shadow-[0_4px_24px_rgba(45,51,53,0.06)] transition-shadow">
              <div className="flex items-center justify-between mb-8 border-l-4 border-secondary pl-4">
                <h2 className="text-xl font-extrabold font-headline">Joining Details</h2>
                <button className="p-2 hover:bg-secondary/5 rounded-full transition-colors text-on-surface-variant hover:text-secondary active:scale-95">
                  <span className="material-symbols-outlined text-lg">history</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Joined On</p>
                  <p className="font-medium">12 Aug 2020</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Confirmation Date</p>
                  <p className="font-medium">12 Feb 2021</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</p>
                  <p className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-100 text-sm">Confirmed</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Probation Period</p>
                  <p className="font-medium">180 days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Notice Period</p>
                  <p className="font-medium">90 days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Co. Experience</p>
                  <p className="font-medium">3Y 6M</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Prev. Experience</p>
                  <p className="font-medium">4Y 2M</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Experience</p>
                  <p className="font-medium font-bold">7Y 8M</p>
                </div>
                <div className="col-span-2 space-y-1 bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Referred By</p>
                  <p className="font-medium text-primary cursor-pointer hover:underline">Internal Program</p>
                </div>
              </div>
            </section>

            {/* Current Position */}
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/5 shadow-[0_2px_12px_rgba(45,51,53,0.03)] hover:shadow-[0_4px_24px_rgba(45,51,53,0.06)] transition-shadow">
              <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                <h2 className="text-xl font-extrabold font-headline">Current Position</h2>
                <button className="p-2 hover:bg-primary/5 rounded-full transition-colors text-on-surface-variant hover:text-primary active:scale-95">
                  <span className="material-symbols-outlined text-lg">work</span>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Location</p>
                    <p className="font-medium flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary">location_on</span> London Hub</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Department</p>
                    <p className="font-medium px-2 py-0.5 bg-secondary-container text-secondary-dim border border-secondary/10 rounded-md w-fit text-sm">Product Design</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Division</p>
                    <p className="font-medium">UX Research</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Designation</p>
                    <p className="font-medium font-bold text-on-surface">Senior UX Designer</p>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-surface-container">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Reporting To</p>
                  <div className="flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors rounded-xl cursor-pointer border border-transparent hover:border-outline-variant/10">
                    <img 
                      alt="Marcus Thompson" 
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuWEW5pwU3q-c63E-g9dmFA1AmpcQrjP0ohK2I32gptMPuDf_AsKr3pj_z1Oj-JpJuWQpBAkCOHap1J2ocWHhDiQKLWSQJPV95qkb0o22LZLSa1MmI3guB6QATDjMF-llnPeFlWom2wHfSZMXKtZF-CzEeZG4oCmsIuF4NqdOOAd1rdFfVYFAIxhajnRmC8F7TGPVNu5qULR9vQD_-JquEbE63t2535B1OiAuYnPZlNsie1f-THMw4pPy3wpmM6qUDE3UoQ1x8bOg"
                    />
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">Marcus Thompson</p>
                      <p className="text-xs text-on-surface-variant">Design Director</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Company</p>
                  <p className="font-medium text-sm flex items-center gap-1.5 text-on-surface-variant"><span className="material-symbols-outlined text-[16px]">business</span> Sanctuary HRMS UK Ltd</p>
                </div>
              </div>
            </section>
          </div>

          {/* Employee Identity & Bank Details */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/5 shadow-[0_2px_12px_rgba(45,51,53,0.03)] hover:shadow-[0_4px_24px_rgba(45,51,53,0.06)] transition-shadow">
            <div className="flex items-center justify-between mb-8 border-l-4 border-error pl-4">
              <h2 className="text-xl font-extrabold font-headline">Employee Identity & Financials</h2>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline active:opacity-80 transition-opacity flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Add New
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Identity Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 bg-surface-container-low/50 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">AADHAAR / National ID</p>
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl">badge</span>
                    <p className="text-lg font-mono font-bold tracking-[0.2em] text-on-surface">•••• •••• 9422</p>
                  </div>
                </div>
                
                <div className="p-5 bg-surface-container-low/50 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Permanent Account Number (PAN)</p>
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl">credit_card</span>
                    <p className="text-lg font-mono font-bold tracking-[0.2em] text-on-surface">ABCDE1234F</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-6 border border-outline-variant/20 rounded-xl hover:border-primary/20 transition-colors bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <h3 className="font-bold text-lg font-headline">Bank Details for Identification</h3>
                  </div>
                  <button className="text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors" title="Bank Details Info">
                    <span className="material-symbols-outlined text-xl">info</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-lowest">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Account Number</p>
                    <div className="flex items-center justify-between p-3.5 bg-surface-container-low/30 border border-outline-variant/20 rounded-xl group focus-within:ring-2 ring-primary/20 transition-all">
                      <input 
                        type="password" 
                        readOnly 
                        value="123456781032" 
                        className="font-mono font-bold tracking-wider bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full"
                      />
                      <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors active:scale-95 ml-2">
                        <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">IFSC Code / Sort Code</p>
                    <div className="flex items-center p-3.5 bg-surface-container-low/30 border border-outline-variant/20 rounded-xl">
                      <p className="font-mono font-bold text-on-surface tracking-wider">SNCT0000421</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          {/* Summary Stats Card */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/5 shadow-[0_2px_12px_rgba(45,51,53,0.03)] hover:shadow-[0_4px_24px_rgba(45,51,53,0.06)] transition-shadow">
            <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center justify-between">
              Key Performance
              <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors">moving</span>
            </h2>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-on-surface">Performance Score</span>
                  <div className="flex items-center gap-1"><span className="text-lg font-extrabold text-primary">4.9</span><span className="text-xs font-medium text-on-surface-variant">/ 5.0</span></div>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%] rounded-full shadow-[0_0_10px_rgba(49,78,224,0.5)]"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low/80 p-5 rounded-xl border border-white hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Attendance</p>
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">how_to_reg</span>
                  </div>
                  <p className="text-3xl font-extrabold font-headline">98%</p>
                </div>
                
                <div className="bg-surface-container-low/80 p-5 rounded-xl border border-white hover:border-primary/20 transition-colors">
                   <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Projects</p>
                    <span className="material-symbols-outlined text-secondary text-[16px]">folder_special</span>
                  </div>
                  <p className="text-3xl font-extrabold font-headline">24</p>
                </div>
              </div>
            </div>
          </section>

          {/* Skills & Competencies */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/5 shadow-[0_2px_12px_rgba(45,51,53,0.03)] hover:shadow-[0_4px_24px_rgba(45,51,53,0.06)] transition-shadow">
            <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center justify-between">
              Skills & Competencies
              <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors">edit</span>
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2 group">
                <div className="flex justify-between text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  <span>UX Strategy</span>
                  <span className="text-primary">95%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[95%] rounded-full group-hover:bg-primary-dim transition-colors"></div>
                </div>
              </div>
              
              <div className="space-y-2 group">
                <div className="flex justify-between text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  <span>Figma Master</span>
                  <span className="text-primary">100%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[100%] rounded-full group-hover:bg-primary-dim transition-colors"></div>
                </div>
              </div>
              
              <div className="space-y-2 group">
                <div className="flex justify-between text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  <span>Design Systems</span>
                  <span className="text-primary">90%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[90%] rounded-full group-hover:bg-primary-dim transition-colors"></div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-surface-container flex flex-wrap gap-2">
                <span className="bg-secondary-container/50 border border-secondary/10 text-secondary-dim text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-secondary-container transition-colors cursor-default">Leadership</span>
                <span className="bg-secondary-container/50 border border-secondary/10 text-secondary-dim text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-secondary-container transition-colors cursor-default">A/B Testing</span>
                <button className="bg-surface-container-low border border-dashed border-outline-variant/40 text-on-surface-variant text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-surface-container hover:text-primary transition-all flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span> Add
                </button>
              </div>
            </div>
          </section>

          {/* Compensation (Enhanced) */}
          <section className="bg-primary text-on-primary p-8 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/30 transition-all cursor-pointer">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary-dim/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-on-primary/80">Compensation Package</h2>
              <button className="hover:scale-110 transition-transform bg-white/10 p-1.5 rounded-full hover:bg-white/20 active:scale-95">
                <span className="material-symbols-outlined text-[18px]">visibility_off</span>
              </button>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] font-semibold text-on-primary/70 uppercase tracking-widest mb-1">Current Base Salary</p>
                <p className="text-4xl font-extrabold font-headline tracking-tighter">£•••••••</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[16px]">payments</span>
                  </div>
                  <p className="text-xs font-semibold">15% Performance Bonus</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[16px]">health_and_safety</span>
                  </div>
                  <p className="text-xs font-semibold">BUPA Private Healthcare</p>
                </div>
              </div>
              
              <button className="w-full py-3.5 mt-2 bg-on-primary text-primary hover:bg-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-colors shadow-lg active:scale-95 shadow-black/10">
                View Detailed Breakdown
              </button>
            </div>
          </section>

          {/* Quick Action Shortcuts */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 px-2">Quick Actions</h2>
            <button className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 rounded-xl transition-all flex items-center justify-start gap-4 text-left group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">download</span>
              </div>
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-on-surface">Export Personnel File</span>
                <span className="block text-xs font-medium text-on-surface-variant mt-0.5">Download full PDF report</span>
              </div>
            </button>
            
            <button className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/10 hover:border-secondary/30 hover:shadow-md hover:-translate-y-0.5 rounded-xl transition-all flex items-center justify-start gap-4 text-left group">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">clinical_notes</span>
              </div>
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-on-surface">Tax Documents (P60)</span>
                <span className="block text-xs font-medium text-on-surface-variant mt-0.5">Generate compliant docs</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

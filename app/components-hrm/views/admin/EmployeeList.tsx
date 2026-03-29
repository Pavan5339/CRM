import React from 'react';

export default function EmployeeList({ setCurrentTab }: { setCurrentTab?: (tab: string) => void }) {
  return (
    <div className="p-10 pb-12 w-full">
      {/* Editorial Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-3">Employee Directory</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">Manage your global workforce from a single sanctuary. View performance metrics, update profiles, and welcome new members to the Lumina family.</p>
        </div>
        <button 
          onClick={() => setCurrentTab && setCurrentTab('admin-add-employee')}
          className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold ambient-shadow hover:bg-primary-dim active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" data-icon="add">add</span>
          Add New Employee
        </button>
      </section>

      {/* Dynamic Filter Bar */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-surface-container-low/50 rounded-2xl">
        <div className="flex flex-col gap-1.5 px-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Department</label>
          <select className="bg-white border-none rounded-lg text-sm font-medium focus:ring-2 ring-primary/10 py-2.5 outline-none cursor-pointer">
            <option>All Departments</option>
            <option>Product & Design</option>
            <option>Engineering</option>
            <option>Talent & Culture</option>
            <option>Growth & Marketing</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 px-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Status</label>
          <select className="bg-white border-none rounded-lg text-sm font-medium focus:ring-2 ring-primary/10 py-2.5 outline-none cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Remote</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 px-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 ml-1">Role Type</label>
          <select className="bg-white border-none rounded-lg text-sm font-medium focus:ring-2 ring-primary/10 py-2.5 outline-none cursor-pointer">
            <option>All Roles</option>
            <option>Full-time</option>
            <option>Contractor</option>
            <option>Intern</option>
          </select>
        </div>
        <div className="flex items-end px-3 mt-4 lg:mt-0">
          <button className="w-full bg-white text-on-surface-variant font-bold text-sm py-2.5 rounded-lg border border-outline-variant/15 hover:bg-surface-container-high transition-colors">
            Reset All Filters
          </button>
        </div>
      </section>

      {/* Employee Table - Editorial Style */}
      <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden ambient-shadow border border-outline-variant/5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-surface-container">
                <th className="text-left px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">Employee</th>
                <th className="text-left px-6 py-6 text-[11px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">Department</th>
                <th className="text-left px-6 py-6 text-[11px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">Joining Date</th>
                <th className="text-left px-6 py-6 text-[11px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">Status</th>
                <th className="text-right px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {/* Row 1 */}
              <tr className="group hover:bg-surface-container-low/20 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img 
                      alt="Employee Avatar" 
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfYprAfmMDNATnGJJWdJPnYuT3Hb_GHlD9cyMJqWnhdhewG7ZJH-5qI1a-xjdmdmdbJ_G64McfhL_unSEPu1YqlHsXF2FAgDfAfu6KvjpbhCNwHkedx22Umd0rmvPxPr49tqQ4_I6Ky7Czbb-tjRakj1oIXzDAiCvpWux4Tf9nn5tDfTt7uYtViz0i4epRtXXTW60yAz8lvbaDIps0MFj1X1iwlAuor1Pq6tcekgW0OmZ-veZ71jfuaitRIx6LHnnd4kpBhGiO7PI"
                    />
                    <div>
                      <p className="font-bold text-on-surface text-base">Sarah Jenkins</p>
                      <p className="text-xs text-on-surface-variant/70 font-medium cursor-pointer hover:underline">Senior UX Designer</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-secondary-container/50 text-secondary-dim border border-secondary/10 text-[11px] tracking-wide font-bold rounded-full">Product & Design</span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">Oct 12, 2021</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-sm font-semibold text-emerald-700">Active</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-95" title="View Profile">
                      <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors active:scale-95" title="Edit">
                      <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr className="group hover:bg-surface-container-low/20 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img 
                      alt="Employee Avatar" 
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcamE9Snz0mlFB1MTA3mVFevwDSkE_j2CvkCEvS_SkHOgWRL5yIQCXivjXd4bmXNvdfR4VFyfFYEZ7B8TU4VSd9gezNXR00Hm8GZ8EOCSAOGZaYblaqeIv0FgEvkLFb6d-q8qho-AFMslpcbhJ9f4D-3LaJ8OjNk6cxvNDLneVF65VahuRrejgzfNT6wINr-tCgdO2VK8zfbD2cMPvUcOGQKRCzsW2NUE1FDbF76PvwFwZtKQFKDm7ootbG8PM1VkyO5zYABSHLCk"
                    />
                    <div>
                      <p className="font-bold text-on-surface text-base">Marcus Thorne</p>
                      <p className="text-xs text-on-surface-variant/70 font-medium cursor-pointer hover:underline">Lead Developer</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-tertiary-container/30 text-tertiary border border-tertiary/10 text-[11px] tracking-wide font-bold rounded-full">Engineering</span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">Jan 05, 2020</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-sm font-semibold text-emerald-700">Active</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-95" title="View Profile">
                      <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors active:scale-95" title="Edit">
                      <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Row 3 */}
              <tr className="group hover:bg-surface-container-low/20 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img 
                      alt="Employee Avatar" 
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Hc-CmpgzV_CnMLVV9ZZ6NoxA7KJ9Hw5PAnnNldC2E7u8gQs2NINj3SE4V8nYtUOYjFByXiPcWWTWehZeYl7NTZCDFhFuNuAdlpSCozGReVSv2hnIaeZYmQnbawgd2J4sTqyyn9m_nlqaT6uNsAkrH8JMkK2pcvcvLEBlliBSQ0zPwxKEIZuO7ypY66EMes1_vWeWjIAO4S8PSACCHI94BlluzIHtkHmI2GSPsKKwxt-SJr-V2yR4Ln_gSWbb_iaHt4xGDrlZv5M"
                    />
                    <div>
                      <p className="font-bold text-on-surface text-base">Elena Rodriguez</p>
                      <p className="text-xs text-on-surface-variant/70 font-medium cursor-pointer hover:underline">HR Coordinator</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[11px] tracking-wide font-bold rounded-full">Talent & Culture</span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">Mar 22, 2022</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                    <span className="text-sm font-semibold text-amber-700">On Leave</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-95" title="View Profile">
                      <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors active:scale-95" title="Edit">
                      <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Row 4 */}
              <tr className="group hover:bg-surface-container-low/20 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img 
                      alt="Employee Avatar" 
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYdk6HuaDvDQx6PtE6p8t0U6tiZdMTggs9fw-mGXP7kCu7s3WmnoUX1kai-q4BKWOUh5_jYBhX2x0CAIRlLXF2WjVuEfMFREtD1iu07fK-oXRhRuAzc7sRp2oA0j9bC2KhLmWxSUyfkXyXJwmqdgO_3Ty_UdoVfZLdh-8QnMjbNv7YtSxzPg4RjniufVYEznPrOGbaHCiX4dZcnJt5RWTUe0MkisUUychoXF9c8fvT6okfZ20K2qUNoDdrw-H1x7pRRzKPEO43ct8"
                    />
                    <div>
                      <p className="font-bold text-on-surface text-base">Jameson Wu</p>
                      <p className="text-xs text-on-surface-variant/70 font-medium cursor-pointer hover:underline">Marketing Specialist</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-primary-container/20 text-primary border border-primary/10 text-[11px] tracking-wide font-bold rounded-full">Growth</span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">Jul 18, 2023</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-sm font-semibold text-emerald-700">Active</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-95" title="View Profile">
                      <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors active:scale-95" title="Edit">
                      <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-8 py-6 bg-surface-container-low/10 flex flex-col sm:flex-row justify-between items-center border-t border-surface-container gap-4">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Showing 1-4 of 128 employees</p>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors text-on-surface-variant bg-white">
              <span className="material-symbols-outlined text-xl" data-icon="chevron_left">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold ambient-shadow">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low transition-colors text-on-surface-variant font-bold bg-white">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low transition-colors text-on-surface-variant font-bold bg-white">
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors text-on-surface-variant bg-white">
              <span className="material-symbols-outlined text-xl" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Context Card (Asymmetric Layout Element) */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-tertiary-container p-8 rounded-[2rem] flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold font-headline text-on-tertiary-container mb-4">Diversity & Inclusion Metrics</h3>
            <p className="text-on-tertiary-container/80 max-w-md leading-relaxed">Your current workforce representation has increased by 12% in technical roles this quarter. Keep up the momentum with inclusive hiring.</p>
          </div>
          <div className="mt-8 relative z-10 w-fit">
            <button className="bg-on-tertiary-container text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-opacity-90 transition-colors">View Full Report</button>
          </div>
          {/* Abstract Graphic */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
          <div className="absolute right-0 top-0 p-8 opacity-20 pointer-events-none">
            <span className="material-symbols-outlined text-[8rem]" data-icon="diversity_3" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
          </div>
        </div>
        
        <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-center items-center text-center border-2 border-white shadow-sm">
          <span className="material-symbols-outlined text-4xl text-primary mb-4" data-icon="event_note">event_note</span>
          <h3 className="text-xl font-bold font-headline text-on-surface mb-2">Upcoming Anniversaries</h3>
          <p className="text-sm text-on-surface-variant mb-6">3 employees celebrate work anniversaries this week.</p>
          <div className="flex -space-x-2">
            <img 
              alt="Anniversary Employee" 
              className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-surface-container" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfvLYOM3Anh4uWmsupuUenD7WcUDayIaSIU1kczjyeXDt4v5k0_egEyOpy056fBmdGcDkLowUUKE9yNYyG5vmGqQ5xOhnLKF6zy6NZF0D744BVn0LX2T1TbwYcowQ3Mwa1DCky_5jFD-EpViNEDmRHbvUyoTnZcT4j_yWDmcVZOEyUeRMXTuQrX6x9HL-WolNrB3yzzQn8mJI8_YJ5mEtLZM7lSGffkDB7dRQG6vBRiImWoLrG2Zuxwn5xnpGUwF-g6-HO-gru2wo"
            />
            <img 
              alt="Anniversary Employee" 
              className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-surface-container" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMieMmqqA2DcAh7bLFz-O7RMEnT-uyYBfIyX6PSDXlNH5UkijZd0Nys2RVYGWbE070a8O4Ud2MICwY560x6Wf54Oa9WQ0NF8UCiYllTsrJGi7Qokce-9D08157SSelFQCV2pa8JgyoEsc2CZH-i49obl2AXpSYE_nQBU3LTEtK1itv_jlO80MLyEINmfL5ZKQ36kPNdPGsNu_KMgJD0SSRqcQBMihavAGl-DWfzQkxCwRdF8gt3E8nkHNaf4BIZxx616CJU3gFiJo"
            />
            <img 
              alt="Anniversary Employee" 
              className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-surface-container" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIJJMCaiZullkFBBD7dKz-n_LgOHGaTxWUkB4N0d9JjlKmkPdDb9P2oagYeU2AxyRBg2Suu1HXsns5Jvea7xO9mWUapaqxTmALZUFEpZgLFEtMAdm8783-EFbagTwBoadIEUrCiukdnnK9HYJBEGWq_AnzBlvX6iKNOOw75F6ljYAAjVYylrgRIvnbXTCt7ckx-HfAR-oqGzM1iAs9JfrojBfKG7E-uC_WJW7PD6MyDOVCROXykTvbh84Z07sT-6WjJSiXKdKTHas"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

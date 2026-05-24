'use client';

import Link from 'next/link';
import { ShieldCheck, Users, Briefcase, FileText } from 'lucide-react';

const crmModules = [
  {
    id: 'customers',
    title: 'Customers',
    description: 'Manage your customer relationships, track interactions, and build profiles.',
    icon: Users,
    href: '/CRM', // Since /CRM redirects based on role to /CRM/dashboard or /CRM/leads
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    status: 'Active',
    statusClassName: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'leads',
    title: 'Leads Pipeline',
    description: 'Track potential customers from first contact to successful conversion.',
    icon: Briefcase,
    href: '#',
    accent: 'from-slate-400 via-slate-500 to-slate-600',
    status: 'Coming Soon',
    statusClassName: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  {
    id: 'reports',
    title: 'CRM Analytics',
    description: 'View sales performance, conversion rates, and revenue forecasting.',
    icon: FileText,
    href: '#',
    accent: 'from-slate-400 via-slate-500 to-slate-600',
    status: 'Coming Soon',
    statusClassName: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  {
    id: 'campaigns',
    title: 'Marketing Campaigns',
    description: 'Launch and monitor targeted marketing efforts across multiple channels.',
    icon: ShieldCheck,
    href: '#',
    accent: 'from-slate-400 via-slate-500 to-slate-600',
    status: 'Coming Soon',
    statusClassName: 'bg-slate-100 text-slate-500 border-slate-200',
  },
];

function CrmWorkspace() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-[0_14px_28px_rgba(13,148,136,0.24)]">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">CRM Workspace</h1>
              <p className="mt-1 text-base text-slate-600">Select a CRM module to continue</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {crmModules.map((module) => {
            const Icon = module.icon;
            const isActive = module.href !== '#';

            return (
              <Link
                key={module.id}
                href={module.href}
                className={`group relative overflow-hidden rounded-[28px] border p-6 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-slate-200/80 bg-white/80 text-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]'
                    : 'cursor-not-allowed border-slate-200/50 bg-white/40 text-slate-500 backdrop-blur'
                }`}
                onClick={(e) => {
                  if (!isActive) e.preventDefault();
                }}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${module.accent} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                <div className="mb-10 flex items-start justify-between gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${module.accent} text-white shadow-lg ${isActive ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] border ${module.statusClassName}`}
                  >
                    {module.status}
                  </span>
                </div>

                <h3 className={`text-2xl font-bold tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CrmPage() {
  return <CrmWorkspace />;
}

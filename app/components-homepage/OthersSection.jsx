import Link from 'next/link';
import { BriefcaseBusiness, ClipboardList, Files, ShieldCheck } from 'lucide-react';

const otherModules = [
  {
    id: 'auditing',
    title: 'Auditing',
    description: 'Plan audits, track procedures, assign reviewers, and follow execution from kickoff to closure.',
    icon: ClipboardList,
    accent: 'from-fuchsia-500 via-violet-500 to-indigo-600',
    href: '/Auditing/auditing',
  },
  {
    id: 'task-management',
    title: 'Task Management',
    description: 'Coordinate ownership, due dates, and progress across operational workstreams in one place.',
    icon: BriefcaseBusiness,
    accent: 'from-cyan-500 via-sky-500 to-blue-600',
  },
  {
    id: 'hrm',
    title: 'HRM',
    description: 'Human Resource Management workspace for the internal BNC team to manage people operations and workflows.',
    icon: Files,
    accent: 'from-amber-400 via-orange-500 to-rose-500',
    href: '/HRM/hrm',
  },
  {
    id: 'grc',
    title: 'GRC',
    description: 'Centralize governance, risk, and compliance tracking with clear ownership and status visibility.',
    icon: ShieldCheck,
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    href: '/GRC/grc',
  },
];

export function OthersSection({ taskManagerHref = '/login', className = '' }) {
  const modules = otherModules.map((module) => ({
    ...module,
    href: module.id === 'task-management' ? taskManagerHref : module.href,
  }));

  return (
    <section id="others-section" className={`relative px-4 py-16 md:py-20 ${className}`.trim()}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 backdrop-blur">
              Other Modules
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Open the workspace your team needs next
            </h2>
            <p className="mt-3 text-base text-slate-600 md:text-lg">
              Keep the homepage aligned with the existing visual language while exposing adjacent workflows from one entry point.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 px-5 py-4 text-sm text-slate-600 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            Auditing is live now. The remaining modules are staged in the same entry surface.
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <div key={module.id} className="group relative [perspective:1400px]">
                <Link
                  href={module.href}
                  className="relative block h-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-6 text-left text-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.08),0_3px_0_rgba(226,232,240,0.9)] backdrop-blur transition-all duration-400 [transform-style:preserve-3d] hover:-translate-y-1.5 hover:rotate-x-[5deg] hover:rotate-y-[-5deg] hover:shadow-[0_28px_70px_rgba(15,23,42,0.14),0_4px_0_rgba(203,213,225,0.95)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.7),transparent_48%,rgba(148,163,184,0.08)_100%)] opacity-90" />
                  <div className="absolute inset-x-[10px] inset-y-[10px] rounded-[22px] border border-white/50 opacity-80" />
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${module.accent}`} />
                  <div className="absolute inset-x-6 top-3 h-px bg-white/90" />
                  <div className="relative mb-10 flex items-start justify-between gap-4 [transform:translateZ(18px)]">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${module.accent} text-white shadow-[0_14px_28px_rgba(15,23,42,0.20)] ring-1 ring-white/40 transition-transform duration-400 group-hover:scale-[1.03]`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="rounded-full bg-slate-100/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm ring-1 ring-white/70">
                      Open
                    </span>
                  </div>

                  <div className="relative [transform:translateZ(14px)]">
                    <h3 className="text-2xl font-bold tracking-tight">{module.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{module.description}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

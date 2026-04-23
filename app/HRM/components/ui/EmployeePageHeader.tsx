'use client';

import React from 'react';

interface EmployeePageHeaderProps {
  icon: string;
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}

export default function EmployeePageHeader({
  icon,
  title,
  description,
  eyebrow,
  action,
}: EmployeePageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
            {eyebrow}
          </span>
        ) : null}
        <div className={`flex items-start gap-4 ${eyebrow ? 'mt-4' : ''}`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-[0_12px_28px_rgba(139,92,246,0.14)]">
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-headline font-bold tracking-tight text-on-background">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

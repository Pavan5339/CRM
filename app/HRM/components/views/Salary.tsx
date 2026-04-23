'use client';

import React from 'react';
import EmployeePageHeader from '../ui/EmployeePageHeader';

export default function Salary({ employee }: { employee?: any }) {
  const employeeName = employee?.name || 'Employee';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <EmployeePageHeader
        icon="payments"
        title="Salary & Payslips"
        description="Review your compensation details, payroll status, and salary documents in one place."
      />

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-8 editorial-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-background">Payslip module is being prepared</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                We are setting up a cleaner employee payroll experience for {employeeName}. Salary summaries and downloadable payslips will appear here once HR enables this section.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-outline-variant/10 bg-violet-50 p-6 editorial-shadow">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">Coming Next</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>Monthly salary breakdown</li>
            <li>Payslip download history</li>
            <li>LOP and deduction visibility</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

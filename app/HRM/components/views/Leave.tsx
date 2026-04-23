'use client';

import React, { useEffect, useMemo, useState } from 'react';
import EmployeePageHeader from '../ui/EmployeePageHeader';

type LeaveType = {
  id: string;
  name: string;
  monthlyCreditDays: number;
  isPaid: boolean;
};

type LeaveBalance = {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  creditedDays: number;
  carryForwardDays: number;
  usedDays: number;
  availableDays: number;
  lopDays: number;
};

type LeaveHistoryItem = {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  status: string;
  session: string;
  sessionLabel: string;
  reason: string;
  totalDays: number;
  approvedDays: number;
  paidDays: number;
  lopDays: number;
  reviewNote: string;
  rejectionReason: string;
  createdAt: string;
  reviewedAt: string;
};

type LeaveResponse = {
  leaveTypes: LeaveType[];
  balances: LeaveBalance[];
  summary: {
    totalAvailable: number;
    lopDays: number;
    casualAvailable: number;
    sickAvailable: number;
  };
  history: LeaveHistoryItem[];
  year: number;
  setupPending?: boolean;
  error?: string;
};

const SESSION_OPTIONS = [
  { value: 'full_day', label: 'Full Day' },
  { value: 'first_half', label: 'First Half' },
  { value: 'second_half', label: 'Second Half' },
];

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const start = formatter.format(new Date(`${startDate}T00:00:00`));
  const end = formatter.format(new Date(`${endDate}T00:00:00`));
  return startDate === endDate ? start : `${start} - ${end}`;
}

function formatLeaveDays(value: number) {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function getStatusPill(status: string) {
  switch (String(status || '').toLowerCase()) {
    case 'approved':
      return 'bg-secondary-container text-on-secondary-container';
    case 'rejected':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
}

export default function Leave() {
  const [data, setData] = useState<LeaveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    leaveTypeId: '',
    session: 'full_day',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const balancesByType = useMemo(() => {
    const map = new Map<string, LeaveBalance>();
    (data?.balances || []).forEach((balance) => {
      map.set(balance.leaveTypeName, balance);
    });
    return map;
  }, [data]);

  async function loadLeaveData() {
    try {
      setIsLoading(true);
      const response = await fetch('/HRM/api/leaves', { method: 'GET' });
      const result = await response.json();

      if (!response.ok) {
        setData(null);
        setFeedback({ type: 'error', message: result.error || 'Failed to load leave data.' });
        return;
      }

      setData(result);
      setFeedback(null);
      setForm((current) => ({
        ...current,
        leaveTypeId: current.leaveTypeId || result.leaveTypes?.[0]?.id || '',
      }));
    } catch {
      setData(null);
      setFeedback({ type: 'error', message: 'Failed to load leave data.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLeaveData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/HRM/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        setFeedback({ type: 'error', message: result.error || 'Failed to submit leave request.' });
        return;
      }

      setFeedback({ type: 'success', message: result.message || 'Leave request submitted successfully.' });
      setForm((current) => ({
        ...current,
        startDate: '',
        endDate: '',
        reason: '',
      }));
      await loadLeaveData();
    } catch {
      setFeedback({ type: 'error', message: 'Failed to submit leave request.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const kpiItems = [
    {
      label: 'Casual Leave',
      icon: 'event_note',
      shell: 'bg-emerald-50',
      value: balancesByType.get('Casual Leave')?.availableDays ?? data?.summary?.casualAvailable ?? 0,
      helper: 'Available for planned short breaks',
    },
    {
      label: 'Sick Leave',
      icon: 'medical_services',
      shell: 'bg-sky-50',
      value: balancesByType.get('Sick Leave')?.availableDays ?? data?.summary?.sickAvailable ?? 0,
      helper: 'Reserved for health-related leave',
    },
    {
      label: 'LOP',
      icon: 'money_off',
      shell: 'bg-rose-50',
      value: data?.summary?.lopDays ?? 0,
      helper: 'Days marked for payroll deduction',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      <EmployeePageHeader
        icon="event_busy"
        title="Leave Management"
        description="Apply for leave, monitor monthly balances, and review approvals in a cleaner employee workflow."
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/70 bg-violet-50 px-5 py-5 shadow-[0_18px_38px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[25px] text-black">event_available</span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Available Days</p>
          </div>
          <div className="mt-5 text-center">
            <p className="text-3xl font-headline font-bold text-on-background">
              {isLoading ? '--' : formatLeaveDays(data?.summary?.totalAvailable || 0)}
            </p>
            <p className="mt-3 text-[11px] leading-5 text-on-surface-variant">
              Total currently available across your balances
            </p>
          </div>
        </div>

        {kpiItems.map((item) => (
          <div key={item.label} className={`rounded-3xl border border-white/70 ${item.shell} px-5 py-5 shadow-[0_18px_38px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[25px] text-black">{item.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">{item.label}</span>
            </div>
            <div className="mt-5 text-center">
              <p className="text-3xl font-headline font-bold text-on-background">
                {isLoading ? '--' : formatLeaveDays(item.value)}
              </p>
              <p className="mt-3 text-[11px] leading-5 text-on-surface-variant">{item.helper}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-8 editorial-shadow">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <span className="material-symbols-outlined text-[24px]">edit_calendar</span>
            </div>
            <div>
              <h2 className="text-xl font-bold font-headline text-on-background">Apply for Leave</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Choose the leave type, set the date range, and submit a cleaner request. Holidays and weekly offs are excluded automatically.
              </p>
            </div>
          </div>

          {feedback ? (
            <div className={`mb-5 rounded-2xl px-4 py-3 text-sm ${
              feedback.type === 'success' ? 'bg-secondary-container/60 text-on-secondary-container' : 'bg-error-container/60 text-on-error-container'
            }`}>
              {feedback.message}
            </div>
          ) : null}

          {data?.setupPending ? (
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 text-sm text-on-surface-variant">
              Leave schema update is pending. Please apply the latest migration first.
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-6 rounded-2xl bg-surface-container-low px-5 py-5">
                  <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Leave Type</label>
                    <select
                      value={form.leaveTypeId}
                      onChange={(event) => setForm((current) => ({ ...current, leaveTypeId: event.target.value }))}
                      className="w-full appearance-none rounded-xl border border-outline-variant/10 bg-white py-3 px-4 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {(data?.leaveTypes || []).map((leaveType) => (
                        <option key={leaveType.id} value={leaveType.id}>{leaveType.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Session</label>
                    <select
                      value={form.session}
                      onChange={(event) => setForm((current) => ({ ...current, session: event.target.value }))}
                      className="w-full appearance-none rounded-xl border border-outline-variant/10 bg-white py-3 px-4 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {SESSION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-dashed border-outline-variant/20 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Balance Snapshot</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-on-surface-variant">Casual Leave</span>
                        <span className="font-semibold text-on-surface">{formatLeaveDays(data?.summary?.casualAvailable ?? 0)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-on-surface-variant">Sick Leave</span>
                        <span className="font-semibold text-on-surface">{formatLeaveDays(data?.summary?.sickAvailable ?? 0)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-on-surface-variant">LOP</span>
                        <span className="font-semibold text-on-surface">{formatLeaveDays(data?.summary?.lopDays ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Start Date</label>
                      <input
                        className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-low py-3 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                        type="date"
                        value={form.startDate}
                        onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">End Date</label>
                      <input
                        className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-low py-3 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                        type="date"
                        value={form.endDate}
                        onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reason for Leave</label>
                    <textarea
                      className="w-full resize-none rounded-xl border border-outline-variant/10 bg-surface-container-low py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Briefly describe the reason for your leave..."
                      rows={6}
                      value={form.reason}
                      onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      className="flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70"
                      type="submit"
                      disabled={isSubmitting || !form.leaveTypeId}
                    >
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-tertiary-container p-8 editorial-shadow">
          <div className="relative z-10">
            <h3 className="text-xl font-bold font-headline leading-tight text-on-tertiary-container">Leave Policy Snapshot</h3>
            <p className="mt-2 text-sm leading-6 text-on-tertiary-container/80">
              Casual Leave accrues by 0.5 day per month and Sick Leave accrues by 1 day per month. Approved excess days move into LOP for payroll.
            </p>
          </div>

          <div className="relative z-10 mt-14 space-y-3">
            {(data?.leaveTypes || []).map((leaveType) => (
              <div key={leaveType.id} className="rounded-2xl bg-on-tertiary-container/10 px-4 py-3">
                <p className="text-sm font-semibold text-on-tertiary-container">{leaveType.name}</p>
                <p className="text-xs text-on-tertiary-container/80">
                  Monthly credit: {formatLeaveDays(leaveType.monthlyCreditDays)} day(s){leaveType.isPaid ? ' - Paid Leave' : ' - Unpaid'}
                </p>
              </div>
            ))}
          </div>

          <div className="absolute top-0 right-0 opacity-10">
            <span className="material-symbols-outlined text-[12rem]">event_available</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-8 editorial-shadow">
        <div className="mb-6">
          <h2 className="text-xl font-bold font-headline text-on-background">Leave History</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Review your submitted leave requests, approval status, and paid versus LOP outcome in a more structured table.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-surface-container-low/70">
              <tr>
                <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Type</th>
                <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Duration</th>
                <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Dates</th>
                <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Status</th>
                <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Paid / LOP</th>
                <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/50">
              {!isLoading && (data?.history || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    No leave requests have been submitted yet.
                  </td>
                </tr>
              ) : null}

              {(data?.history || []).map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-surface-container-low/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-semibold text-on-background">{item.leaveTypeName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">{formatLeaveDays(item.totalDays)} day(s) - {item.sessionLabel}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{formatDateRange(item.startDate, item.endDate)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusPill(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">
                    {formatLeaveDays(item.paidDays)} paid / {formatLeaveDays(item.lopDays)} LOP
                  </td>
                  <td className="max-w-[280px] px-5 py-4 text-sm text-on-surface-variant">
                    <p className="line-clamp-2">{item.reason}</p>
                    {item.reviewNote ? <p className="mt-1 text-[11px] text-primary">HR note: {item.reviewNote}</p> : null}
                    {item.rejectionReason && item.status === 'rejected' ? (
                      <p className="mt-1 text-[11px] text-error">Reason: {item.rejectionReason}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

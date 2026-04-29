'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHrmFeedback } from '../../ui/HrmFeedback';
import { DetailPanelSkeleton, LoadingPanel, TableRowsSkeleton } from '../../ui/Skeleton';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'directory', label: 'Employee Salary Directory', icon: 'groups' },
  { id: 'policy', label: 'Payroll Policy', icon: 'policy' },
  { id: 'calculator', label: 'Employee Salary Calculator', icon: 'calculate' },
  { id: 'ledger', label: 'Payroll Ledger', icon: 'receipt_long' },
];

function formatCurrency(value: any) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function statusTone(status?: string | null) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (normalized === 'payment_pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (normalized === 'generated') return 'bg-sky-50 text-sky-700 border-sky-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function lifecycleTone(status?: string | null) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active') return 'bg-emerald-50 text-emerald-700';
  if (normalized === 'separated') return 'bg-rose-50 text-rose-700';
  return 'bg-violet-50 text-violet-700';
}

async function downloadSnapshotPdf(snapshot: any, fileName: string) {
  const [{ pdf }, module] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../payroll/PayrollPdfDocument'),
  ]);
  const PayrollPdfDocument = module.default;
  const blob = await pdf(<PayrollPdfDocument snapshot={snapshot} />).toBlob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(blobUrl);
}

function getInitials(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'E';
}

function KpiCard({ label, value, helper }: { label: string; value: React.ReactNode; helper: string }) {
  return (
    <div className="rounded-[1.6rem] border border-outline-variant/10 bg-white px-5 py-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{label}</p>
      <p className="mt-3 text-2xl font-headline font-bold text-on-background">{value}</p>
      <p className="mt-2 text-xs text-on-surface-variant">{helper}</p>
    </div>
  );
}

function LabelValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline-variant/10 py-3 last:border-b-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
      <div className="mt-1 text-sm font-medium text-on-surface">{value}</div>
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-outline-variant/15 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-slate-400 ${props.className || ''}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-outline-variant/15 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-slate-400 ${props.className || ''}`}
    />
  );
}

function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function ToggleChip({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex w-fit items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
        checked
          ? 'border-violet-300 bg-violet-200 text-violet-950'
          : 'border-outline-variant/15 bg-white text-on-surface'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-slate-900"
      />
      {label}
    </label>
  );
}

function SoftTag({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'emerald' | 'sky' | 'violet';
}) {
  const toneClass = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  }[tone];

  return (
    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

export default function PayoutsPayroll() {
  const { showFeedback: showHrmFeedback } = useHrmFeedback();
  const now = new Date();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [directory, setDirectory] = useState<any[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [runs, setRuns] = useState<any[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [directoryDetailOpen, setDirectoryDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewYear, setPreviewYear] = useState(String(now.getFullYear()));
  const [previewMonth, setPreviewMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedCalculatorEmployeeId, setSelectedCalculatorEmployeeId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemDetail, setItemDetail] = useState<any>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState({
    pfEnabled: false,
    pfValue: '0',
    tdsEnabled: false,
    tdsMode: 'percent',
    tdsValue: '0',
    retentionEnabled: false,
    notes: '',
  });
  const [revisionForm, setRevisionForm] = useState({
    effectiveFrom: new Date().toISOString().slice(0, 10),
    revisionType: 'percent',
    revisionValue: '',
    reason: '',
  });
  const [retentionForm, setRetentionForm] = useState({
    startMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    endMonth: '',
    monthlyAmount: '',
    status: 'active',
    notes: '',
  });
  const [releaseForm, setReleaseForm] = useState({
    releaseMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    amount: '',
    linkedScheduleId: '',
    notes: '',
  });

  const showFeedback = useCallback((type: 'success' | 'error', text: string) => {
    showHrmFeedback({
      type,
      title: type === 'success' ? 'Updated' : 'Action Required',
      message: text,
    });
  }, [showHrmFeedback]);

  const loadDirectory = useCallback(async (selectedId?: string | null) => {
    try {
      setDirectoryLoading(true);
      const response = await fetch('/HRM/api/admin/payroll/profiles', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load payroll directory');
      }

      setDirectory(result.employees || []);
      const nextId = selectedId ?? result.employees?.[0]?.id ?? null;
      if (nextId) {
        setSelectedEmployeeId((current) => current || nextId);
        setSelectedCalculatorEmployeeId((current) => current || nextId);
      }
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to load payroll directory');
    } finally {
      setDirectoryLoading(false);
    }
  }, [showFeedback]);

  const loadDetail = useCallback(async (employeeId: string) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/HRM/api/admin/payroll/profiles?employeeId=${employeeId}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load payroll employee');
      }

      setDetail(result);
      setProfileForm({
        pfEnabled: Boolean(result.profile?.pf_enabled),
        pfValue: String(result.profile?.pf_value ?? 0),
        tdsEnabled: Boolean(result.profile?.tds_enabled),
        tdsMode: result.profile?.tds_mode || 'percent',
        tdsValue: String(result.profile?.tds_value ?? 0),
        retentionEnabled: Boolean(result.profile?.retention_enabled),
        notes: result.profile?.notes || '',
      });
      setReleaseForm((current) => ({
        ...current,
        linkedScheduleId: result.retentionSchedules?.[0]?.id || '',
      }));
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to load payroll employee');
    } finally {
      setDetailLoading(false);
    }
  }, [showFeedback]);

  const loadRuns = useCallback(async () => {
    try {
      setRunsLoading(true);
      const response = await fetch('/HRM/api/admin/payroll/runs', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load payroll ledger');
      }
      setRuns(result.runs || []);
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to load payroll ledger');
    } finally {
      setRunsLoading(false);
    }
  }, [showFeedback]);

  const loadItem = useCallback(async (itemId: string) => {
    try {
      setItemLoading(true);
      const response = await fetch(`/HRM/api/admin/payroll/items/${itemId}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load payroll item');
      }
      setItemDetail(result);
      setSelectedItemId(itemId);
      setActiveSection('ledger');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to load payroll item');
    } finally {
      setItemLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    loadDirectory();
    loadRuns();
  }, [loadDirectory, loadRuns]);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadDetail(selectedEmployeeId);
    }
  }, [loadDetail, selectedEmployeeId]);

  const summary = useMemo(() => {
    return {
      employees: directory.length,
      enabledPf: directory.filter((employee) => employee.deduction_flags?.pf).length,
      enabledTds: directory.filter((employee) => employee.deduction_flags?.tds).length,
      enabledRetention: directory.filter((employee) => employee.deduction_flags?.retention).length,
      totalCurrentPayout: directory.reduce((sum, employee) => sum + Number(employee.estimated_in_hand_salary || 0), 0),
    };
  }, [directory]);

  const selectedPreviewRow = useMemo(() => {
    return previewData?.rows?.find((row: any) => row.employeeId === selectedCalculatorEmployeeId) || null;
  }, [previewData, selectedCalculatorEmployeeId]);

  const dashboardStats = useMemo(() => {
    const allItems = runs.flatMap((run) => run.items || []);
    const paidItems = allItems.filter((item) => item.payment_status === 'paid');
    const pendingItems = allItems.filter((item) => item.payment_status === 'payment_pending');
    const generatedItems = allItems.filter((item) => item.payment_status === 'generated');

    const companyMap = new Map<string, { company: string; employees: number; net: number }>();
    for (const employee of directory) {
      const company = employee.company || 'No Company';
      const current = companyMap.get(company) || { company, employees: 0, net: 0 };
      current.employees += 1;
      current.net += Number(employee.estimated_in_hand_salary || 0);
      companyMap.set(company, current);
    }

    const companyRows = [...companyMap.values()]
      .sort((left, right) => right.net - left.net)
      .slice(0, 5);

    const runRows = runs.slice(0, 6).map((run) => ({
      id: run.id,
      label: formatMonthLabel(run.year, run.month),
      net: Number(run.total_net || 0),
      gross: Number(run.total_gross || 0),
      employees: (run.items || []).length,
    }));

    const highestNet = Math.max(...runRows.map((row) => row.net), 0);

    return {
      paidEmployees: paidItems.length,
      paymentPending: pendingItems.length,
      generatedItems: generatedItems.length,
      latestMonthNet: runRows[0]?.net || 0,
      companyRows,
      runRows,
      highestNet,
    };
  }, [directory, runs]);

  const activeSectionIndex = useMemo(
    () => Math.max(SECTIONS.findIndex((section) => section.id === activeSection), 0),
    [activeSection]
  );

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      setSubmitting(true);
      const response = await fetch('/HRM/api/admin/payroll/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          ...profileForm,
          pfValue: Number(profileForm.pfValue || 0),
          tdsMode: profileForm.tdsMode,
          tdsValue: Number(profileForm.tdsValue || 0),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save payroll profile');
      }

      setDetail(result);
      await loadDirectory(selectedEmployeeId);
      showFeedback('success', 'Payroll profile updated successfully.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to save payroll profile');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevisionCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      setSubmitting(true);
      const response = await fetch('/HRM/api/admin/payroll/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          ...revisionForm,
          revisionValue: Number(revisionForm.revisionValue || 0),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create revision');
      }

      await loadDetail(selectedEmployeeId);
      await loadDirectory(selectedEmployeeId);
      setRevisionForm((current) => ({ ...current, revisionValue: '', reason: '' }));
      showFeedback('success', 'Salary revision saved successfully.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to create revision');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetentionCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      setSubmitting(true);
      const response = await fetch('/HRM/api/admin/payroll/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          ...retentionForm,
          monthlyAmount: Number(retentionForm.monthlyAmount || 0),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save retention schedule');
      }

      await loadDetail(selectedEmployeeId);
      await loadDirectory(selectedEmployeeId);
      setRetentionForm((current) => ({ ...current, monthlyAmount: '', notes: '' }));
      showFeedback('success', 'Retention schedule created successfully.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to save retention schedule');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReleaseCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      setSubmitting(true);
      const response = await fetch('/HRM/api/admin/payroll/retention/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          ...releaseForm,
          amount: Number(releaseForm.amount || 0),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save retention release');
      }

      await loadDetail(selectedEmployeeId);
      setReleaseForm((current) => ({ ...current, amount: '', notes: '' }));
      showFeedback('success', 'Retention release created successfully.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to save retention release');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePreview() {
    try {
      setPreviewLoading(true);
      const response = await fetch('/HRM/api/admin/payroll/runs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(previewYear),
          month: Number(previewMonth),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to preview payroll');
      }
      setPreviewData(result);
      if (!selectedCalculatorEmployeeId && result.rows?.[0]?.employeeId) {
        setSelectedCalculatorEmployeeId(result.rows[0].employeeId);
      }
      showFeedback('success', 'Employee salary calculator has been refreshed.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to preview payroll');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleGenerate() {
    try {
      setSubmitting(true);
      const response = await fetch('/HRM/api/admin/payroll/runs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(previewYear),
          month: Number(previewMonth),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate payroll');
      }

      setPreviewData(result.preview);
      await loadRuns();
      setActiveSection('ledger');
      showFeedback('success', 'Payroll generated successfully and saved in the ledger.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to generate payroll');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGeneratePayslip(itemId: string) {
    try {
      setSubmitting(true);
      const response = await fetch(`/HRM/api/admin/payroll/items/${itemId}/payslip`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate payslip');
      }

      setItemDetail(result);
      setSelectedItemId(itemId);
      await loadRuns();
      showFeedback('success', 'Payslip generated successfully.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to generate payslip');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkPaid(itemId: string) {
    try {
      setSubmitting(true);
      const response = await fetch(`/HRM/api/admin/payroll/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark payroll paid');
      }

      setItemDetail(result);
      setSelectedItemId(itemId);
      await loadRuns();
      showFeedback('success', 'Payroll item marked as paid and released to the employee portal.');
    } catch (error: any) {
      showFeedback('error', error.message || 'Failed to mark payroll paid');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1540px] space-y-6 px-7 py-7 pb-10">
      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">HR Payroll Desk</p>
          <h1 className="mt-2 text-4xl font-headline font-extrabold tracking-tight text-on-background">
            Payouts & Payroll
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Review payroll settings, calculate monthly salary, generate payslips, and track monthly payment release in one place.
          </p>
        </div>

        <section className="overflow-x-auto pb-1">
          <div className="relative inline-grid min-w-[1120px] grid-cols-5 gap-2 rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(244,246,250,0.98)_100%)] p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.06)] backdrop-blur">
            <div
              className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem-2rem)/5)] rounded-full bg-[linear-gradient(135deg,rgba(245,238,255,1)_0%,rgba(224,210,255,1)_55%,rgba(208,186,255,1)_100%)] shadow-[0_10px_22px_rgba(167,139,250,0.24)] ring-1 ring-white/70 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(calc(${activeSectionIndex} * (100% + 0.5rem)))` }}
            />
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`relative z-10 inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isActive ? 'text-violet-950' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </section>

      {activeSection === 'dashboard' ? (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Employees"
              value={summary.employees}
              helper="Total employees available in payroll"
            />
            <KpiCard
              label="PF Enabled"
              value={summary.enabledPf}
              helper="Employees currently using PF deduction"
            />
            <KpiCard
              label="Retention"
              value={summary.enabledRetention}
              helper="Employees with active retention setup"
            />
            <KpiCard
              label="Est. In Hand"
              value={formatCurrency(summary.totalCurrentPayout)}
              helper="Current estimated in-hand total"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
              <div className="border-b border-outline-variant/10 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Payroll Analytics</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Month-wise payroll movement across the latest generated runs.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-outline-variant/10 bg-white px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Paid Items</p>
                    <p className="mt-3 text-3xl font-headline font-bold text-on-background">{dashboardStats.paidEmployees}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Released to employees</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-outline-variant/10 bg-white px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Pending</p>
                    <p className="mt-3 text-3xl font-headline font-bold text-on-background">{dashboardStats.paymentPending}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Waiting for payment</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-outline-variant/10 bg-white px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Generated</p>
                    <p className="mt-3 text-3xl font-headline font-bold text-on-background">{dashboardStats.generatedItems}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Generated but not paid</p>
                  </div>
                </div>

                {dashboardStats.runRows.length ? (
                  <div className="space-y-4">
                    <div className="grid h-[260px] grid-cols-6 items-end gap-4">
                      {dashboardStats.runRows.map((row) => {
                        const heightPercent = dashboardStats.highestNet > 0 ? Math.max((row.net / dashboardStats.highestNet) * 100, 12) : 12;
                        return (
                          <div key={row.id} className="flex h-full flex-col items-center justify-end gap-3">
                            <div className="w-full rounded-[1.2rem] bg-slate-100 px-3 py-3 text-center text-[11px] font-bold text-on-surface-variant">
                              {row.employees} emp
                            </div>
                            <div className="relative flex w-full flex-1 items-end rounded-[1.35rem] bg-slate-100/70 p-2">
                              <div
                                className="w-full rounded-[1rem] bg-[linear-gradient(180deg,#0f172a_0%,#2563eb_100%)] shadow-[0_12px_24px_rgba(37,99,235,0.22)]"
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-on-surface">{row.label}</p>
                              <p className="mt-1 text-[11px] text-on-surface-variant">{formatCurrency(row.net)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-outline-variant/10 pt-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Latest Payroll Net</p>
                        <p className="mt-2 text-2xl font-headline font-bold text-on-background">
                          {formatCurrency(dashboardStats.latestMonthNet)}
                        </p>
                      </div>
                      <div className="text-right text-sm text-on-surface-variant">
                        <p>Latest run is based on payroll ledger totals.</p>
                        <p className="mt-1">It updates when payroll is generated or marked paid.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant/25 px-5 py-12 text-center text-sm text-on-surface-variant">
                    Generate payroll runs to unlock analytics here.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
                <div className="border-b border-outline-variant/10 pb-5">
                  <h3 className="text-lg font-bold text-on-surface">Company Distribution</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Estimated in-hand payout grouped by payroll company.
                  </p>
                </div>
                <div className="mt-5">
                  {dashboardStats.companyRows.length ? (
                    dashboardStats.companyRows.map((row) => (
                      <div key={row.company} className="border-b border-outline-variant/10 py-4 last:border-b-0">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-on-surface">{row.company}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">{row.employees} employees</p>
                          </div>
                          <p className="text-sm font-bold text-emerald-700">{formatCurrency(row.net)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-on-surface-variant">No company analytics available yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
                <div className="border-b border-outline-variant/10 pb-5">
                  <h3 className="text-lg font-bold text-on-surface">Quick Module Access</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Open the exact payroll area you want to work on next.
                  </p>
                </div>
                <div className="mt-5 grid gap-3">
                  {[
                    ['Employee Salary Directory', 'Review employee payroll profile and deduction setup', 'directory'],
                    ['Payroll Policy', 'Read the calculation rules and visibility policy', 'policy'],
                    ['Employee Salary Calculator', 'Preview monthly salary before generating payroll', 'calculator'],
                    ['Payroll Ledger', 'Track payroll generation, payments, and payslips', 'ledger'],
                  ].map(([title, helper, section]) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setActiveSection(section)}
                      className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-outline-variant/10 bg-white px-5 py-4 text-left transition-colors hover:bg-surface-container-low"
                    >
                      <div>
                        <p className="text-sm font-bold text-on-surface">{title}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{helper}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === 'directory' ? (
        <section className="space-y-6">
          {!directoryDetailOpen ? (
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200/80 px-6 py-5">
              <h2 className="text-xl font-bold text-on-surface">Employee Salary Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                Full payroll master list with employee photo, deduction status, salary, and last revision.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px]">
                <thead className="border-b border-slate-200/80 bg-[#f8fbff]">
                  <tr>
                    {['Employee ID', 'Profile', 'Join Date', 'Status', 'Company', 'Salary', 'PF', 'TDS', 'Retention', 'Est. In Hand', 'Last Increment'].map((label) => (
                      <th
                        key={label}
                        className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {directoryLoading ? (
                    <tr>
                      <td className="px-0 py-0" colSpan={11}>
                        <TableRowsSkeleton rows={6} columns={11} />
                      </td>
                    </tr>
                  ) : directory.length === 0 ? (
                    <tr>
                      <td className="px-5 py-12 text-center text-sm text-slate-500" colSpan={11}>
                        No employees are available for payroll.
                      </td>
                    </tr>
                  ) : (
                    directory.map((employee) => (
                      <tr
                        key={employee.id}
                        onClick={() => {
                          setSelectedEmployeeId(employee.id);
                          setDirectoryDetailOpen(true);
                        }}
                        className="cursor-pointer transition-colors hover:bg-[#f8fbff]"
                      >
                        <td className="px-5 py-4 text-sm font-semibold tracking-[0.02em] text-[#7f98bd]">{employee.employee_id}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {employee.profile_picture_url ? (
                              <Image
                                src={employee.profile_picture_url}
                                alt={employee.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                                {getInitials(employee.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-semibold text-slate-900">{employee.name}</p>
                              <p className="truncate text-sm text-[#8a9abc]">{employee.email || employee.designation_title || 'Employee'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">{formatDate(employee.date_of_joining)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${lifecycleTone(employee.resolved_employment_lifecycle_status)}`}>
                              {String(employee.resolved_employment_lifecycle_status || 'active').replace('_', ' ')}
                            </span>
                            {(employee.resolved_current_stage || 'none') !== 'none' ? (
                              <SoftTag tone="violet">
                                {String(employee.resolved_current_stage).replace('_', ' ')}
                              </SoftTag>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">{employee.company || '--'}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(employee.salary)}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{employee.deduction_flags?.pf ? <SoftTag tone="sky">Enabled</SoftTag> : '--'}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{employee.deduction_flags?.tds ? <SoftTag tone="sky">Enabled</SoftTag> : '--'}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{employee.deduction_flags?.retention ? <SoftTag tone="sky">Enabled</SoftTag> : '--'}</td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-700">{formatCurrency(employee.estimated_in_hand_salary)}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {employee.latest_revision
                            ? `${formatDate(employee.latest_revision.effective_from)} · ${formatCurrency(employee.latest_revision.new_salary)}`
                            : '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          ) : null}

          {directoryDetailOpen && detail?.employee ? (
            <section className="rounded-[2rem] bg-slate-100 px-6 py-6">
              <div className="flex flex-col gap-5 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-4">
                  {detail.employee.profile_picture_url ? (
                    <Image
                      src={detail.employee.profile_picture_url}
                      alt={detail.employee.name}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700">
                      {getInitials(detail.employee.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Payroll Profile</p>
                    <h3 className="mt-1 text-2xl font-headline font-bold text-on-background">{detail.employee.name}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {detail.employee.employee_id} · {detail.employee.designation_title || 'Employee'} · {detail.employee.company || '--'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDirectoryDetailOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#faf5ff_0%,#efe7ff_100%)] px-4 py-2.5 text-sm font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.14)]"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <form onSubmit={handleProfileSave} className="space-y-4 border-t border-outline-variant/10 pt-5">
                    <h4 className="text-lg font-bold text-on-surface">Payroll Settings</h4>
                    <FormRow label="Employee PF Enabled">
                      <ToggleChip
                        checked={profileForm.pfEnabled}
                        onChange={(checked) => setProfileForm((current) => ({ ...current, pfEnabled: checked }))}
                        label="PF deduction active"
                      />
                    </FormRow>
                    <FormRow label="Employee PF Fixed Amount">
                      <TextInput
                        type="number"
                        step="0.01"
                        value={profileForm.pfValue}
                        onChange={(event) => setProfileForm((current) => ({ ...current, pfValue: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="TDS Enabled">
                      <ToggleChip
                        checked={profileForm.tdsEnabled}
                        onChange={(checked) => setProfileForm((current) => ({ ...current, tdsEnabled: checked }))}
                        label="TDS deduction active"
                      />
                    </FormRow>
                    <FormRow label="TDS Rule">
                      <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                        <SelectInput
                          value={profileForm.tdsMode}
                          onChange={(event) => setProfileForm((current) => ({ ...current, tdsMode: event.target.value }))}
                        >
                          <option value="percent">Percent</option>
                          <option value="fixed">Fixed</option>
                        </SelectInput>
                        <TextInput
                          type="number"
                          step="0.01"
                          value={profileForm.tdsValue}
                          onChange={(event) => setProfileForm((current) => ({ ...current, tdsValue: event.target.value }))}
                        />
                      </div>
                    </FormRow>
                    <p className="text-xs text-on-surface-variant">
                      PF is a fixed amount applied to employee and employer sides. TDS can now be configured as a percent or fixed deduction and is applied once from the employee side.
                    </p>
                    <FormRow label="Retention Enabled">
                      <ToggleChip
                        checked={profileForm.retentionEnabled}
                        onChange={(checked) => setProfileForm((current) => ({ ...current, retentionEnabled: checked }))}
                        label="Retention deduction active"
                      />
                    </FormRow>
                    <FormRow label="Notes">
                      <TextInput
                        value={profileForm.notes}
                        onChange={(event) => setProfileForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                    </FormRow>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-5 py-2.5 text-sm font-bold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]"
                      >
                        {submitting ? 'Saving...' : 'Save Payroll Settings'}
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleRevisionCreate} className="space-y-4 border-t border-outline-variant/10 pt-5">
                    <h4 className="text-lg font-bold text-on-surface">Salary Revision</h4>
                    <FormRow label="Effective Date">
                      <TextInput
                        type="date"
                        value={revisionForm.effectiveFrom}
                        onChange={(event) => setRevisionForm((current) => ({ ...current, effectiveFrom: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="Revision Type">
                      <SelectInput
                        value={revisionForm.revisionType}
                        onChange={(event) => setRevisionForm((current) => ({ ...current, revisionType: event.target.value }))}
                      >
                        <option value="percent">Percent</option>
                        <option value="amount">Amount</option>
                      </SelectInput>
                    </FormRow>
                    <FormRow label="Revision Value">
                      <TextInput
                        type="number"
                        step="0.01"
                        value={revisionForm.revisionValue}
                        onChange={(event) => setRevisionForm((current) => ({ ...current, revisionValue: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="Reason">
                      <TextInput
                        value={revisionForm.reason}
                        onChange={(event) => setRevisionForm((current) => ({ ...current, reason: event.target.value }))}
                      />
                    </FormRow>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-5 py-2.5 text-sm font-bold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]"
                      >
                        Add Revision
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleRetentionCreate} className="space-y-4 border-t border-outline-variant/10 pt-5">
                    <h4 className="text-lg font-bold text-on-surface">Retention Schedule</h4>
                    <FormRow label="Start Month">
                      <TextInput
                        type="month"
                        value={retentionForm.startMonth}
                        onChange={(event) => setRetentionForm((current) => ({ ...current, startMonth: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="End Month">
                      <TextInput
                        type="month"
                        value={retentionForm.endMonth}
                        onChange={(event) => setRetentionForm((current) => ({ ...current, endMonth: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="Monthly Amount">
                      <TextInput
                        type="number"
                        step="0.01"
                        value={retentionForm.monthlyAmount}
                        onChange={(event) => setRetentionForm((current) => ({ ...current, monthlyAmount: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="Status">
                      <SelectInput
                        value={retentionForm.status}
                        onChange={(event) => setRetentionForm((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="released">Released</option>
                      </SelectInput>
                    </FormRow>
                    <FormRow label="Notes">
                      <TextInput
                        value={retentionForm.notes}
                        onChange={(event) => setRetentionForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                    </FormRow>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-5 py-2.5 text-sm font-bold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]"
                      >
                        Save Retention Schedule
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleReleaseCreate} className="space-y-4 border-t border-outline-variant/10 pt-5">
                    <h4 className="text-lg font-bold text-on-surface">Retention Release</h4>
                    <FormRow label="Release Month">
                      <TextInput
                        type="month"
                        value={releaseForm.releaseMonth}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, releaseMonth: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="Amount">
                      <TextInput
                        type="number"
                        step="0.01"
                        value={releaseForm.amount}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, amount: event.target.value }))}
                      />
                    </FormRow>
                    <FormRow label="Linked Schedule">
                      <SelectInput
                        value={releaseForm.linkedScheduleId}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, linkedScheduleId: event.target.value }))}
                      >
                        <option value="">No linked schedule</option>
                        {(detail.retentionSchedules || []).map((schedule: any) => (
                          <option key={schedule.id} value={schedule.id}>
                            {formatDate(schedule.start_month)} · {formatCurrency(schedule.monthly_amount)}
                          </option>
                        ))}
                      </SelectInput>
                    </FormRow>
                    <FormRow label="Notes">
                      <TextInput
                        value={releaseForm.notes}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                    </FormRow>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-5 py-2.5 text-sm font-bold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]"
                      >
                        Save Retention Release
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[1.4rem] border-2 border-violet-300 bg-white px-5 py-5">
                    <h4 className="text-lg font-bold text-on-surface">Recent Salary Revisions</h4>
                    <div className="mt-4">
                      {(detail.revisions || []).length ? (
                        (detail.revisions || []).slice(0, 6).map((revision: any) => (
                          <LabelValue
                            key={revision.id}
                            label={formatDate(revision.effective_from)}
                            value={
                              <div className="flex items-center justify-between gap-4">
                                <span>{revision.reason || 'Salary revision'}</span>
                                <span className="font-bold text-emerald-700">{formatCurrency(revision.new_salary)}</span>
                              </div>
                            }
                          />
                        ))
                      ) : (
                        <p className="text-sm text-on-surface-variant">No salary revision history yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border-2 border-violet-300 bg-white px-5 py-5">
                    <h4 className="text-lg font-bold text-on-surface">Retention Schedules</h4>
                    <div className="mt-4">
                      {(detail.retentionSchedules || []).length ? (
                        (detail.retentionSchedules || []).map((schedule: any) => (
                          <LabelValue
                            key={schedule.id}
                            label={`${formatDate(schedule.start_month)}${schedule.end_month ? ` to ${formatDate(schedule.end_month)}` : ''}`}
                            value={
                              <div className="flex items-center justify-between gap-4">
                                <span>{schedule.status}</span>
                                <span className="font-bold text-on-surface">{formatCurrency(schedule.monthly_amount)}</span>
                              </div>
                            }
                          />
                        ))
                      ) : (
                        <p className="text-sm text-on-surface-variant">No retention schedules yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border-2 border-violet-300 bg-white px-5 py-5">
                    <h4 className="text-lg font-bold text-on-surface">Retention Releases</h4>
                    <div className="mt-4">
                      {(detail.retentionReleases || []).length ? (
                        (detail.retentionReleases || []).map((release: any) => (
                          <LabelValue
                            key={release.id}
                            label={formatDate(release.release_month)}
                            value={
                              <div className="flex items-center justify-between gap-4">
                                <span>{release.notes || 'Manual release'}</span>
                                <span className="font-bold text-emerald-700">{formatCurrency(release.amount)}</span>
                              </div>
                            }
                          />
                        ))
                      ) : (
                        <p className="text-sm text-on-surface-variant">No retention releases yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      {activeSection === 'policy' ? (
        <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
          <div className="border-b border-outline-variant/10 pb-5">
            <h2 className="text-xl font-bold text-on-surface">Payroll Policy</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Practical payroll rules used by this module for calculation, visibility, and release.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-outline-variant/10 bg-white">
            <div className="grid grid-cols-[220px_minmax(0,1fr)] border-b border-outline-variant/10 bg-surface-container-low/40 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              <div>Rule</div>
              <div>How It Works</div>
            </div>
            {[
              ['PF', 'PF uses one fixed amount. The same fixed amount is applied on employee side and employer side, and both are included in payroll deductions.'],
              ['TDS', 'TDS is deducted only once from the employee side and HR can configure it either as a percent value or as one fixed amount.'],
              ['Retention', 'Retention deducts a fixed monthly amount from salary while the schedule is active. HR can later release the retained amount through a separate retention release entry.'],
              ['LOP', 'One LOP day is deducted using monthly salary divided by total calendar days in that payroll month.'],
              ['Join / Exit', 'If an employee joins or exits in the middle of a month, salary is prorated using active calendar days inside the payroll month.'],
              ['Payslip Visibility', 'Employee can view salary month and payslip only after HR marks that payroll item as paid.'],
            ].map(([title, body]) => (
              <div key={title} className="grid grid-cols-[220px_minmax(0,1fr)] border-b border-outline-variant/10 px-5 py-5 last:border-b-0">
                <div className="text-sm font-bold text-on-surface">{title}</div>
                <div className="text-sm leading-7 text-on-surface-variant">{body}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeSection === 'calculator' ? (
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Employee Salary Calculator</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Preview full month salary math before creating the payroll run.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Year</p>
                  <TextInput
                    type="number"
                    value={previewYear}
                    onChange={(event) => setPreviewYear(event.target.value)}
                    className="w-[130px]"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Month</p>
                  <TextInput
                    type="month"
                    value={`${previewYear}-${previewMonth}`}
                    onChange={(event) => {
                      const [nextYear, nextMonth] = event.target.value.split('-');
                      setPreviewYear(nextYear);
                      setPreviewMonth(nextMonth);
                    }}
                    className="w-[180px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  className="rounded-full bg-[linear-gradient(180deg,#faf5ff_0%,#efe7ff_100%)] px-5 py-3 text-sm font-bold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.14)]"
                >
                  {previewLoading ? 'Calculating...' : 'Run Preview'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={submitting}
                  className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-5 py-3 text-sm font-bold text-violet-950 shadow-[0_12px_24px_rgba(167,139,250,0.18)]"
                >
                  {submitting ? 'Generating...' : 'Generate Payroll'}
                </button>
              </div>
            </div>
          </div>

          {previewData ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <KpiCard label="Employees" value={previewData.summary.totalEmployees} helper="Included in this preview" />
                <KpiCard label="Gross" value={formatCurrency(previewData.summary.totalGross)} helper="Total prorated salary" />
                <KpiCard label="Net" value={formatCurrency(previewData.summary.totalNet)} helper="Expected payout after deductions" />
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="border-b border-slate-200/80 px-6 py-5">
                  <h3 className="text-lg font-bold text-on-surface">
                    {formatMonthLabel(Number(previewYear), Number(previewMonth))}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Select any employee row to inspect the salary breakdown below.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1460px]">
                    <thead className="border-b border-slate-200/80 bg-[#f8fbff]">
                      <tr>
                        {['Employee ID', 'Name', 'Company', 'Active Days', 'LOP Days', 'Prorated Salary', 'LOP Deduction', 'Employee PF', 'Employer PF', 'Total PF', 'Employee TDS', 'Total TDS', 'Retention', 'Release', 'Net Salary'].map((label) => (
                          <th key={label} className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70">
                      {previewData.rows.map((row: any) => (
                        <tr
                          key={row.employeeId}
                          onClick={() => setSelectedCalculatorEmployeeId(row.employeeId)}
                          className={`cursor-pointer transition-colors hover:bg-[#f8fbff] ${
                            selectedCalculatorEmployeeId === row.employeeId ? 'bg-sky-50/80' : ''
                          }`}
                        >
                          <td className="px-5 py-4 text-sm font-semibold tracking-[0.02em] text-[#7f98bd]">{row.employeeCode}</td>
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-semibold text-slate-900">{row.employeeName}</p>
                              <p className="truncate text-sm text-[#8a9abc]">{row.currentStage || 'Salary preview'}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700">{row.company || '--'}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{row.activeDays}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{row.lopDays}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(row.proratedSalary)}</td>
                          <td className="px-5 py-4 text-sm text-rose-700">{formatCurrency(row.lopDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.pfEmployeeDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.pfEmployerDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.totalPfDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.tdsEmployeeDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.totalTdsDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.retentionDeduction)}</td>
                          <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(row.retentionReleaseAmount)}</td>
                          <td className="px-5 py-4 text-sm font-bold text-emerald-700">{formatCurrency(row.netSalary)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPreviewRow ? (
                <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
                  <div className="border-b border-outline-variant/10 pb-5">
                    <h3 className="text-lg font-bold text-on-surface">Selected Employee Calculation Detail</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {selectedPreviewRow.employeeName} · {selectedPreviewRow.employeeCode}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-outline-variant/10 bg-white p-5">
                      <h4 className="text-base font-bold text-on-surface">Calculation Inputs</h4>
                      <div className="mt-4">
                        <LabelValue label="Company" value={selectedPreviewRow.company || '--'} />
                        <LabelValue label="Active Period" value={`${formatDate(selectedPreviewRow.activeStart)} to ${formatDate(selectedPreviewRow.activeEnd)}`} />
                        <LabelValue label="Active Days" value={selectedPreviewRow.activeDays} />
                        <LabelValue label="LOP Days" value={selectedPreviewRow.lopDays} />
                        <LabelValue label="Salary Snapshot" value={formatCurrency(selectedPreviewRow.salarySnapshot)} />
                        <LabelValue label="Current Stage" value={selectedPreviewRow.currentStage || 'none'} />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-outline-variant/10 bg-white p-5">
                      <h4 className="text-base font-bold text-on-surface">Calculation Result</h4>
                      <div className="mt-4">
                        <LabelValue label="Prorated Salary" value={formatCurrency(selectedPreviewRow.proratedSalary)} />
                        <LabelValue label="LOP Deduction" value={formatCurrency(selectedPreviewRow.lopDeduction)} />
                        <LabelValue label="Employee PF" value={formatCurrency(selectedPreviewRow.pfEmployeeDeduction)} />
                        <LabelValue label="Employer PF" value={formatCurrency(selectedPreviewRow.pfEmployerDeduction)} />
                        <LabelValue label="Total PF" value={formatCurrency(selectedPreviewRow.totalPfDeduction)} />
                        <LabelValue label="Employee TDS" value={formatCurrency(selectedPreviewRow.tdsEmployeeDeduction)} />
                        <LabelValue label="Total TDS" value={formatCurrency(selectedPreviewRow.totalTdsDeduction)} />
                        <LabelValue label="Retention" value={formatCurrency(selectedPreviewRow.retentionDeduction)} />
                        <LabelValue label="Retention Release" value={formatCurrency(selectedPreviewRow.retentionReleaseAmount)} />
                        <LabelValue label="Net Salary" value={<span className="font-bold text-emerald-700">{formatCurrency(selectedPreviewRow.netSalary)}</span>} />
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      {activeSection === 'ledger' ? (
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
            <div className="border-b border-outline-variant/10 px-6 py-5">
              <h2 className="text-xl font-bold text-on-surface">Payroll Ledger</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Generated payroll runs, payment tracking, and payslip actions.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {runsLoading ? (
                <LoadingPanel
                  title="Loading payroll ledger"
                  message="Payroll runs, item totals, and payment status are being prepared."
                />
              ) : runs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-outline-variant/25 px-5 py-12 text-center text-sm text-on-surface-variant">
                  No payroll run is available yet.
                </div>
              ) : (
                runs.map((run) => (
                  <div key={run.id} className="rounded-[1.75rem] border border-outline-variant/10 bg-white p-5">
                    <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface">{formatMonthLabel(run.year, run.month)}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          Gross {formatCurrency(run.total_gross)} · Deductions {formatCurrency(run.total_deductions)} · Net {formatCurrency(run.total_net)}
                        </p>
                      </div>
                      <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(run.status)}`}>
                        {String(run.status || 'draft').replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[1180px]">
                        <thead className="border-b border-slate-200/80 bg-[#f8fbff]">
                          <tr>
                            {['Employee ID', 'Name', 'Company', 'Gross', 'Deductions', 'Net', 'Status', 'Actions'].map((label) => (
                              <th key={label} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70">
                          {(run.items || []).map((item: any) => (
                            <tr key={item.id} className="transition-colors hover:bg-[#f8fbff]">
                              <td className="px-4 py-4 text-sm font-semibold tracking-[0.02em] text-[#7f98bd]">{item.employee?.employee_id || '--'}</td>
                              <td className="px-4 py-4 text-sm font-semibold text-slate-900">{item.employee?.name || 'Employee'}</td>
                              <td className="px-4 py-4 text-sm text-slate-700">{item.employee?.company || '--'}</td>
                              <td className="px-4 py-4 text-sm text-slate-700">{formatCurrency(item.prorated_salary)}</td>
                              <td className="px-4 py-4 text-sm text-slate-700">{formatCurrency(item.total_deductions)}</td>
                              <td className="px-4 py-4 text-sm font-bold text-emerald-700">{formatCurrency(item.net_salary)}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(item.payment_status)}`}>
                                  {String(item.payment_status || 'draft').replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => loadItem(item.id)}
                                    className="rounded-full bg-[linear-gradient(180deg,#faf5ff_0%,#efe7ff_100%)] px-3 py-1.5 text-xs font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.14)]"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleGeneratePayslip(item.id)}
                                    className="rounded-full bg-[linear-gradient(180deg,#faf5ff_0%,#efe7ff_100%)] px-3 py-1.5 text-xs font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.14)]"
                                  >
                                    Generate Payslip
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkPaid(item.id)}
                                    className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-3 py-1.5 text-xs font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]"
                                  >
                                    Mark Paid
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedItemId && itemDetail ? (
            <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-6 py-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Payroll Item Detail</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {itemDetail.item?.employee?.name || 'Employee'} · {formatMonthLabel(
                      itemDetail.item?.payroll_run?.year || Number(previewYear),
                      itemDetail.item?.payroll_run?.month || Number(previewMonth)
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {itemDetail.payslip?.snapshot_json ? (
                    <button
                      type="button"
                      onClick={() =>
                        downloadSnapshotPdf(
                          itemDetail.payslip.snapshot_json,
                          `${itemDetail.payslip.payslip_number || 'payslip'}.pdf`
                        )
                      }
                      className="rounded-full bg-[linear-gradient(180deg,#faf5ff_0%,#efe7ff_100%)] px-4 py-2 text-sm font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.14)]"
                    >
                      Download PDF
                    </button>
                  ) : null}
                  {itemDetail.item?.payment_status !== 'paid' ? (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(selectedItemId)}
                      className="rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-4 py-2 text-sm font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]"
                    >
                      Mark Paid
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.5rem] border border-outline-variant/10 bg-white p-5">
                    <h4 className="text-base font-bold text-on-surface">Breakdown</h4>
                    {itemLoading ? (
                    <div className="mt-4">
                      <DetailPanelSkeleton />
                    </div>
                    ) : (
                    <div className="mt-4">
                      <LabelValue label="Salary Snapshot" value={formatCurrency(itemDetail.item.salary_snapshot)} />
                      <LabelValue label="Prorated Salary" value={formatCurrency(itemDetail.item.prorated_salary)} />
                      <LabelValue label="LOP Days" value={itemDetail.item.lop_days} />
                      <LabelValue label="LOP Deduction" value={formatCurrency(itemDetail.item.lop_deduction)} />
                      <LabelValue label="Employee PF" value={formatCurrency(itemDetail.item.pf_employee_deduction)} />
                      <LabelValue label="Employer PF" value={formatCurrency(itemDetail.item.pf_employer_deduction)} />
                      <LabelValue label="Total PF" value={formatCurrency(itemDetail.item.total_pf_deduction)} />
                      <LabelValue label="Employee TDS" value={formatCurrency(itemDetail.item.tds_employee_deduction ?? itemDetail.item.tds_deduction)} />
                      <LabelValue label="Total TDS" value={formatCurrency(itemDetail.item.total_tds_deduction ?? itemDetail.item.tds_deduction)} />
                      <LabelValue label="Retention" value={formatCurrency(itemDetail.item.retention_deduction)} />
                      <LabelValue label="Retention Release" value={formatCurrency(itemDetail.item.retention_release_amount)} />
                      <LabelValue label="Net Salary" value={<span className="font-bold text-emerald-700">{formatCurrency(itemDetail.item.net_salary)}</span>} />
                    </div>
                  )}
                </div>

                  <div className="rounded-[1.5rem] border border-outline-variant/10 bg-white p-4">
                    <h4 className="text-base font-bold text-on-surface">Payslip Preview</h4>
                    {itemLoading ? (
                    <div className="mt-4">
                      <LoadingPanel
                        title="Loading payslip"
                        message="The selected payroll item snapshot is being prepared for preview."
                        className="px-5 py-10"
                      />
                    </div>
                    ) : itemDetail.payslip?.html_snapshot ? (
                    <iframe
                      title="Payslip Preview"
                      className="mt-4 h-[720px] w-full rounded-2xl border border-outline-variant/10 bg-white"
                      srcDoc={itemDetail.payslip.html_snapshot}
                    />
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-outline-variant/25 px-5 py-10 text-center text-sm text-on-surface-variant">
                      Payslip has not been generated yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

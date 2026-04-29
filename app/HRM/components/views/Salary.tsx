'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EmployeePageHeader from '../ui/EmployeePageHeader';
import { useHrmFeedback } from '../ui/HrmFeedback';
import HrmEmptyState from '../ui/HrmEmptyState';
import { DetailPanelSkeleton, MetricCardSkeleton, TableRowsSkeleton } from '../ui/Skeleton';

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

function formatMonth(year: number, month: number) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getPayrollNotes(item: any) {
  return (
    item?.calculation_snapshot?.notes ||
    item?.calculation_snapshot?.policy?.notes ||
    item?.calculation_snapshot?.effectiveRevision?.notes ||
    '--'
  );
}

async function downloadSnapshotPdf(snapshot: any, fileName: string) {
  const [{ pdf }, module] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./payroll/PayrollPdfDocument'),
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

function SummaryCard({ label, value, helper }: { label: string; value: React.ReactNode; helper: string }) {
  return (
    <div className="rounded-[1.75rem] border border-outline-variant/10 bg-surface-container-lowest p-6 editorial-shadow">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      <p className="mt-3 text-2xl font-headline font-bold text-on-background">{value}</p>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{helper}</p>
    </div>
  );
}

export default function Salary({ employee }: { employee?: any }) {
  const { showFeedback } = useHrmFeedback();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const employeeName = employee?.name || 'Employee';

  const loadMonth = useCallback(async (year: number, month: number) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/HRM/api/employee/payroll/${year}/${month}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load payroll month');
      }
      setSelectedMonth(result.item);
    } catch (error: any) {
      showFeedback({ type: 'error', title: 'Payroll Month Not Loaded', message: error.message || 'Failed to load payroll month' });
    } finally {
      setDetailLoading(false);
    }
  }, [showFeedback]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/HRM/api/employee/payroll', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load payroll history');
      }

      setItems(result.items || []);
      if (result.items?.length) {
        await loadMonth(result.items[0].payroll_run.year, result.items[0].payroll_run.month);
      } else {
        setSelectedMonth(null);
      }
    } catch (error: any) {
      showFeedback({ type: 'error', title: 'Payroll History Not Loaded', message: error.message || 'Failed to load payroll history' });
    } finally {
      setLoading(false);
    }
  }, [loadMonth, showFeedback]);

  useEffect(() => {
    async function boot() {
      await loadHistory();
    }

    boot();
  }, [loadHistory]);

  const latestRevision = useMemo(() => {
    return selectedMonth?.calculation_snapshot?.effectiveRevision || items[0]?.calculation_snapshot?.effectiveRevision || null;
  }, [items, selectedMonth]);

  const latestSnapshot = selectedMonth?.calculation_snapshot || items[0]?.calculation_snapshot || null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <EmployeePageHeader
        icon="payments"
        title="Salary & Payslips"
        description="Review your paid salary history, deduction breakdowns, and frozen monthly payslips."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {loading ? (
          <MetricCardSkeleton count={3} />
        ) : (
          <>
            <SummaryCard
              label="Current Salary"
              value={formatCurrency(employee?.salary)}
              helper={`Current salary master for ${employeeName}. Final paid amount can differ by month due to LOP, deductions, and releases.`}
            />
            <SummaryCard
              label="Latest Increment"
              value={latestRevision ? formatCurrency(latestRevision.new_salary) : 'No revision yet'}
              helper={latestRevision ? `Effective from ${formatDate(latestRevision.effective_from)}` : 'Your latest approved increment will appear here after payroll is processed.'}
            />
            <SummaryCard
              label="Latest Paid Month"
              value={items[0] ? formatMonth(items[0].payroll_run.year, items[0].payroll_run.month) : 'No payroll yet'}
              helper={items[0] ? `Net salary ${formatCurrency(items[0].net_salary)}` : 'This section becomes visible after HR marks a payroll month as paid.'}
            />
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant/10 px-6 py-5">
            <h2 className="text-xl font-headline font-bold text-on-background">Paid Salary History</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Only months marked paid by HR are visible here.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-fixed">
              <thead className="border-b border-outline-variant/10 bg-surface-container-low/40">
                <tr>
                  <th className="w-[22%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Month</th>
                  <th className="w-[13%] px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Gross</th>
                  <th className="w-[14%] px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Deductions</th>
                  <th className="w-[13%] px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Net</th>
                  <th className="w-[22%] px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Notes</th>
                  <th className="w-[16%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-0 py-0">
                      <TableRowsSkeleton rows={5} columns={6} />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6">
                      <HrmEmptyState
                        compact
                        icon="payments"
                        title="No paid salary history yet"
                        message="Paid payroll months will appear here once HR completes payroll and marks a month as paid."
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => loadMonth(item.payroll_run.year, item.payroll_run.month)}
                      className={`cursor-pointer transition-colors hover:bg-surface-container-low/30 ${
                        selectedMonth?.id === item.id ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-on-surface">{formatMonth(item.payroll_run.year, item.payroll_run.month)}</p>
                        <p className="text-xs text-on-surface-variant">Paid {formatDate(item.paid_at)}</p>
                      </td>
                      <td className="px-3 py-4 text-sm text-on-surface">{formatCurrency(item.prorated_salary)}</td>
                      <td className="px-3 py-4 text-sm text-on-surface">{formatCurrency(item.total_deductions)}</td>
                      <td className="px-3 py-4 text-sm font-bold text-emerald-700">{formatCurrency(item.net_salary)}</td>
                      <td className="px-3 py-4 text-sm text-on-surface">
                        <div className="max-w-[220px] overflow-x-auto whitespace-nowrap scrollbar-thin">
                          {getPayrollNotes(item)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface">
                        {item.payslip ? item.payslip.payslip_number : 'Generated'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-on-background">Month Breakdown</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Frozen values from the payroll month that HR marked as paid.
              </p>
            </div>
            {selectedMonth?.payslip?.snapshot_json ? (
              <button
                type="button"
                onClick={() => downloadSnapshotPdf(
                  selectedMonth.payslip.snapshot_json,
                  `${selectedMonth.payslip.payslip_number || 'payslip'}.pdf`
                )}
                className="rounded-full border border-outline-variant/15 px-4 py-2 text-sm font-semibold text-on-surface"
              >
                Download PDF
              </button>
            ) : null}
          </div>

          {detailLoading ? (
            <div className="mt-6">
              <DetailPanelSkeleton />
            </div>
          ) : selectedMonth ? (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Month" value={formatMonth(selectedMonth.payroll_run.year, selectedMonth.payroll_run.month)} helper="Paid payroll month visible to you." />
                <SummaryCard label="Net Salary" value={formatCurrency(selectedMonth.net_salary)} helper="Final released amount after deductions and releases." />
              </div>

              <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                <div className="rounded-2xl border border-outline-variant/10 bg-white px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Breakdown</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4"><span>Salary Snapshot</span><span className="font-semibold">{formatCurrency(selectedMonth.salary_snapshot)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Prorated Salary</span><span className="font-semibold">{formatCurrency(selectedMonth.prorated_salary)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>LOP Deduction</span><span className="font-semibold">{formatCurrency(selectedMonth.lop_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Employee PF</span><span className="font-semibold">{formatCurrency(selectedMonth.pf_employee_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Employer PF</span><span className="font-semibold">{formatCurrency(selectedMonth.pf_employer_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Total PF</span><span className="font-semibold">{formatCurrency(selectedMonth.total_pf_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Employee TDS</span><span className="font-semibold">{formatCurrency(selectedMonth.tds_employee_deduction ?? selectedMonth.tds_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Total TDS</span><span className="font-semibold">{formatCurrency(selectedMonth.total_tds_deduction ?? selectedMonth.tds_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Retention</span><span className="font-semibold">{formatCurrency(selectedMonth.retention_deduction)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Retention Release</span><span className="font-semibold">{formatCurrency(selectedMonth.retention_release_amount)}</span></div>
                    <div className="flex items-center justify-between gap-4 border-t border-outline-variant/10 pt-3"><span>Total Deductions</span><span className="font-semibold">{formatCurrency(selectedMonth.total_deductions)}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-outline-variant/10 bg-white px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Snapshot Notes</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4"><span>Active Days</span><span className="font-semibold">{latestSnapshot?.meta?.activeDays ?? selectedMonth.active_days}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>LOP Days</span><span className="font-semibold">{latestSnapshot?.meta?.lopDays ?? selectedMonth.lop_days}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Payment Status</span><span className="font-semibold">Paid</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Paid At</span><span className="font-semibold">{formatDate(selectedMonth.paid_at)}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Payslip No.</span><span className="font-semibold">{selectedMonth.payslip?.payslip_number || '--'}</span></div>
                    <div className="flex items-center justify-between gap-4"><span>Generated At</span><span className="font-semibold">{formatDate(selectedMonth.payslip?.generated_at)}</span></div>
                    <div className="border-t border-outline-variant/10 pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Notes</p>
                      <div className="mt-2 overflow-x-auto whitespace-nowrap text-sm text-on-surface scrollbar-thin">
                        {getPayrollNotes(selectedMonth)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedMonth.payslip?.html_snapshot ? (
                <div className="rounded-[1.75rem] border border-outline-variant/10 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Payslip Preview</p>
                  <iframe
                    title="Employee Payslip"
                    className="mt-4 h-[720px] w-full rounded-2xl border border-outline-variant/10 bg-white"
                    srcDoc={selectedMonth.payslip.html_snapshot}
                  />
                </div>
              ) : (
                <HrmEmptyState
                  icon="description"
                  title="Payslip preview not ready yet"
                  message="The payslip preview will appear here once a generated snapshot is available for the selected paid month."
                />
              )}
            </div>
          ) : (
            <div className="mt-6">
              <HrmEmptyState
                icon="calendar_month"
                title="Select a paid month"
                message="Choose a paid salary month from the history table to review the detailed breakdown and frozen payslip snapshot."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

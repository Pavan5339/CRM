import { adminClient } from '@/utils/supabase/admin';
import { deriveEmploymentFields, formatEmploymentValue } from '@/utils/hrm-employment';
import { calculateLeaveDays, getEmployeeLeaveContext } from '@/utils/leave';

const PAYROLL_PROFILE_SELECT = `
  id,
  employee_id,
  pf_enabled,
  pf_mode,
  pf_value,
  tds_enabled,
  tds_mode,
  tds_value,
  retention_enabled,
  notes,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const PAYROLL_EMPLOYEE_SELECT = `
  id,
  employee_id,
  name,
  email,
  company,
  salary,
  date_of_joining,
  bank_name,
  bank_account_number,
  bank_account_holder_name,
  bank_ifsc,
  pan_number,
  profile_picture_url,
  designation:hrm_designations (id, title),
  department:hrm_departments (id, name),
  employment_lifecycle_status,
  current_stage,
  employee_status,
  separated_at
`;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function compareEmployeeCodeLike(leftValue, rightValue) {
  const left = String(leftValue || '').trim();
  const right = String(rightValue || '').trim();

  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;

  return left.localeCompare(right, 'en', {
    numeric: true,
    sensitivity: 'base',
  });
}

function compareEmployeesByCode(left, right) {
  return compareEmployeeCodeLike(left?.employee_id, right?.employee_id);
}

export function roundCurrency(value) {
  return Math.round((toNumber(value, 0) + Number.EPSILON) * 100) / 100;
}

export function roundDays(value) {
  return Math.round((toNumber(value, 0) + Number.EPSILON) * 100) / 100;
}

function padMonth(value) {
  return String(value).padStart(2, '0');
}

export function buildMonthKey(year, month) {
  return `${year}-${padMonth(month)}`;
}

function toDateOnly(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function dateFromParts(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

function dateFromDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map((part) => Number(part));
  if (!year || !month || !day) return null;
  return dateFromParts(year, month, day);
}

function formatDateOnly(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthBounds(year, month) {
  const start = dateFromParts(year, month, 1);
  const end = dateFromParts(year, month + 1, 0);
  const daysInMonth = end.getUTCDate();

  return {
    startDate: formatDateOnly(start),
    endDate: formatDateOnly(end),
    daysInMonth,
    monthKey: buildMonthKey(year, month),
  };
}

function countInclusiveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = dateFromDateOnly(startDate);
  const end = dateFromDateOnly(endDate);
  if (!start || !end || end < start) return 0;
  const milliseconds = end.getTime() - start.getTime();
  return Math.floor(milliseconds / 86400000) + 1;
}

export function getActivePeriodForMonth(employee, year, month) {
  const { startDate, endDate } = getMonthBounds(year, month);
  const monthStart = dateFromDateOnly(startDate);
  const monthEnd = dateFromDateOnly(endDate);
  const joinDate = dateFromDateOnly(toDateOnly(employee?.date_of_joining)) || monthStart;
  const separationDate = dateFromDateOnly(toDateOnly(employee?.separated_at));

  let activeStart = joinDate > monthStart ? joinDate : monthStart;
  let activeEnd = monthEnd;

  if (separationDate && separationDate < activeEnd) {
    activeEnd = separationDate;
  }

  if (activeEnd < activeStart) {
    return {
      activeStart: null,
      activeEnd: null,
      activeDays: 0,
    };
  }

  return {
    activeStart: formatDateOnly(activeStart),
    activeEnd: formatDateOnly(activeEnd),
    activeDays: countInclusiveDays(formatDateOnly(activeStart), formatDateOnly(activeEnd)),
  };
}

function buildEmployeeDisplayFields(employee) {
  const employment = deriveEmploymentFields(employee);

  return {
    ...employee,
    resolved_employment_lifecycle_status:
      employee?.employment_lifecycle_status ?? employment.employmentLifecycleStatus,
    resolved_current_stage: employee?.current_stage ?? employment.currentStage,
    resolved_employee_status: employment.legacyEmployeeStatus,
    designation_title: employee?.designation?.title || '',
    department_name: employee?.department?.name || '',
  };
}

export async function ensurePayrollProfile(employeeId, actorUserId = null) {
  const { data: existing, error } = await adminClient
    .from('hrm_payroll_profiles')
    .select(PAYROLL_PROFILE_SELECT)
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to load payroll profile');
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await adminClient
    .from('hrm_payroll_profiles')
    .insert({
      employee_id: employeeId,
      pf_enabled: false,
      pf_mode: 'fixed',
      pf_value: 0,
      tds_enabled: false,
      tds_mode: 'percent',
      tds_value: 0,
      retention_enabled: false,
      created_by: actorUserId,
      updated_by: actorUserId,
    })
    .select(PAYROLL_PROFILE_SELECT)
    .single();

  if (createError || !created) {
    throw new Error(createError?.message || 'Failed to create payroll profile');
  }

  return created;
}

export async function listPayrollDirectory() {
  const [employeeResult, profileResult, revisionsResult, schedulesResult] = await Promise.all([
    adminClient
      .from('hrm_employees')
      .select(PAYROLL_EMPLOYEE_SELECT)
      .order('employee_id', { ascending: true }),
    adminClient
      .from('hrm_payroll_profiles')
      .select(PAYROLL_PROFILE_SELECT),
    adminClient
      .from('hrm_salary_revisions')
      .select('employee_id, effective_from, new_salary, revision_type, revision_value, created_at')
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false }),
    adminClient
      .from('hrm_retention_schedules')
      .select('employee_id, status, monthly_amount, start_month, end_month')
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false }),
  ]);

  if (employeeResult.error) {
    throw new Error(employeeResult.error.message || 'Failed to load employees for payroll');
  }
  if (profileResult.error) {
    throw new Error(profileResult.error.message || 'Failed to load payroll profiles');
  }
  if (revisionsResult.error) {
    throw new Error(revisionsResult.error.message || 'Failed to load salary revisions');
  }
  if (schedulesResult.error) {
    throw new Error(schedulesResult.error.message || 'Failed to load retention schedules');
  }

  const profileMap = new Map((profileResult.data || []).map((profile) => [profile.employee_id, profile]));
  const latestRevisionMap = new Map();
  for (const revision of revisionsResult.data || []) {
    if (!latestRevisionMap.has(revision.employee_id)) {
      latestRevisionMap.set(revision.employee_id, revision);
    }
  }

  const retentionMap = new Map();
  for (const schedule of schedulesResult.data || []) {
    if (!retentionMap.has(schedule.employee_id)) {
      retentionMap.set(schedule.employee_id, schedule);
    }
  }

  return (employeeResult.data || [])
    .map((employee) => {
      const enriched = buildEmployeeDisplayFields(employee);
      const profile = profileMap.get(employee.id) || null;
      const latestRevision = latestRevisionMap.get(employee.id) || null;
      const retention = retentionMap.get(employee.id) || null;
      const salary = roundCurrency(employee.salary);
      const pfEstimate =
        profile?.pf_enabled
          ? roundCurrency(toNumber(profile.pf_value, 0) * 2)
          : 0;
      const tdsEstimate = calculatePolicyAmount({
        enabled: Boolean(profile?.tds_enabled),
        mode: profile?.tds_mode || 'percent',
        value: profile?.tds_value,
        amountBase: salary,
        ratio: 1,
      });
      const retentionEstimate =
        profile?.retention_enabled && retention?.status === 'active'
          ? roundCurrency(retention.monthly_amount)
          : 0;

      return {
        ...enriched,
        payroll_profile: profile,
        latest_revision: latestRevision,
        retention_schedule: retention,
        estimated_in_hand_salary: roundCurrency(salary - pfEstimate - tdsEstimate - retentionEstimate),
        deduction_flags: {
          pf: Boolean(profile?.pf_enabled),
          tds: Boolean(profile?.tds_enabled),
          retention: Boolean(profile?.retention_enabled && retention?.status === 'active'),
        },
      };
    })
    .sort(compareEmployeesByCode);
}

export async function getPayrollProfileDetail(employeeId, actorUserId = null) {
  const profile = await ensurePayrollProfile(employeeId, actorUserId);

  const [employeeResult, revisionsResult, schedulesResult, releasesResult] = await Promise.all([
    adminClient
      .from('hrm_employees')
      .select(PAYROLL_EMPLOYEE_SELECT)
      .eq('id', employeeId)
      .maybeSingle(),
    adminClient
      .from('hrm_salary_revisions')
      .select('*')
      .eq('employee_id', employeeId)
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false }),
    adminClient
      .from('hrm_retention_schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .order('start_month', { ascending: false })
      .order('created_at', { ascending: false }),
    adminClient
      .from('hrm_retention_releases')
      .select('*')
      .eq('employee_id', employeeId)
      .order('release_month', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  if (employeeResult.error || !employeeResult.data) {
    throw new Error(employeeResult.error?.message || 'Employee not found for payroll');
  }
  if (revisionsResult.error) {
    throw new Error(revisionsResult.error.message || 'Failed to load salary revisions');
  }
  if (schedulesResult.error) {
    throw new Error(schedulesResult.error.message || 'Failed to load retention schedules');
  }
  if (releasesResult.error) {
    throw new Error(releasesResult.error.message || 'Failed to load retention releases');
  }

  return {
    employee: buildEmployeeDisplayFields(employeeResult.data),
    profile,
    revisions: revisionsResult.data || [],
    retentionSchedules: schedulesResult.data || [],
    retentionReleases: releasesResult.data || [],
  };
}

function buildEffectiveSalaryMap(revisions = [], monthEndDate) {
  const map = new Map();
  const monthEnd = monthEndDate || '9999-12-31';

  for (const revision of revisions) {
    if (revision.effective_from > monthEnd) {
      continue;
    }

    const existing = map.get(revision.employee_id);
    if (!existing) {
      map.set(revision.employee_id, revision);
    }
  }

  return map;
}

function getCurrentRetentionSchedule(schedules = [], monthKey) {
  const monthDate = `${monthKey}-01`;
  return schedules.find((schedule) => {
    if (schedule.status !== 'active') return false;
    if (schedule.start_month && toDateOnly(schedule.start_month) > monthDate) return false;
    if (schedule.end_month && toDateOnly(schedule.end_month) < monthDate) return false;
    return true;
  }) || null;
}

function calculatePolicyAmount({ enabled, mode, value, amountBase, ratio }) {
  if (!enabled) return 0;
  if (mode === 'fixed') {
    return roundCurrency(toNumber(value, 0) * ratio);
  }

  return roundCurrency((amountBase * toNumber(value, 0)) / 100);
}

function buildEmployeeSnapshot(employee) {
  return {
    id: employee.id,
    employee_id: employee.employee_id,
    name: employee.name,
    email: employee.email,
    company: employee.company || '',
    designation_title: employee.designation_title || '',
    department_name: employee.department_name || '',
    bank_name: employee.bank_name || '',
    bank_account_number: employee.bank_account_number || '',
    bank_account_holder_name: employee.bank_account_holder_name || '',
    bank_ifsc: employee.bank_ifsc || '',
    pan_number: employee.pan_number || '',
    date_of_joining: employee.date_of_joining || null,
    lifecycle_status: employee.resolved_employment_lifecycle_status,
    current_stage: employee.resolved_current_stage,
  };
}

function formatCurrencyDisplay(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(toNumber(value, 0));
}

export function buildPayslipHtml(snapshot = {}) {
  const employee = snapshot.employee || {};
  const deductions = snapshot.deductions || {};
  const meta = snapshot.meta || {};
  const earnings = snapshot.earnings || {};
  const totals = snapshot.totals || {};

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payslip ${snapshot.payslipNumber || ''}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; background: #f8fafc; margin: 0; padding: 24px; }
      .sheet { max-width: 920px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; }
      .header { padding: 28px 32px; background: linear-gradient(135deg, #0f172a, #1d4ed8); color: white; }
      .header h1 { margin: 0 0 6px; font-size: 28px; }
      .header p { margin: 0; opacity: 0.86; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 24px 32px; }
      .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; background: #fff; }
      .card h2 { margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
      .row { display: flex; justify-content: space-between; gap: 16px; margin-top: 10px; }
      .row:first-of-type { margin-top: 0; }
      .label { color: #475569; }
      .value { font-weight: 700; text-align: right; }
      .totals { padding: 0 32px 32px; }
      .totals .card { background: #eff6ff; border-color: #bfdbfe; }
      .footer { padding: 0 32px 32px; color: #64748b; font-size: 12px; }
      @media print {
        body { background: white; padding: 0; }
        .sheet { border: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <h1>${employee.company || 'Company'} Payslip</h1>
        <p>${meta.monthLabel || ''} | Payslip No. ${snapshot.payslipNumber || ''}</p>
      </div>
      <div class="grid">
        <div class="card">
          <h2>Employee</h2>
          <div class="row"><span class="label">Employee ID</span><span class="value">${employee.employee_id || '--'}</span></div>
          <div class="row"><span class="label">Employee Name</span><span class="value">${employee.name || '--'}</span></div>
          <div class="row"><span class="label">Designation</span><span class="value">${employee.designation_title || '--'}</span></div>
          <div class="row"><span class="label">Date of Joining</span><span class="value">${employee.date_of_joining || '--'}</span></div>
          <div class="row"><span class="label">Bank</span><span class="value">${employee.bank_name || '--'}</span></div>
        </div>
        <div class="card">
          <h2>Payroll Summary</h2>
          <div class="row"><span class="label">Base Salary</span><span class="value">${formatCurrencyDisplay(earnings.salarySnapshot)}</span></div>
          <div class="row"><span class="label">Prorated Salary</span><span class="value">${formatCurrencyDisplay(earnings.proratedSalary)}</span></div>
          <div class="row"><span class="label">Active Days</span><span class="value">${meta.activeDays || 0}</span></div>
          <div class="row"><span class="label">LOP Days</span><span class="value">${meta.lopDays || 0}</span></div>
          <div class="row"><span class="label">Payment Status</span><span class="value">${formatEmploymentValue(meta.paymentStatus || '')}</span></div>
        </div>
        <div class="card">
          <h2>Deductions</h2>
          <div class="row"><span class="label">LOP</span><span class="value">${formatCurrencyDisplay(deductions.lopDeduction)}</span></div>
          <div class="row"><span class="label">Employee PF</span><span class="value">${formatCurrencyDisplay(deductions.pfEmployeeDeduction)}</span></div>
          <div class="row"><span class="label">Employer PF</span><span class="value">${formatCurrencyDisplay(deductions.pfEmployerDeduction)}</span></div>
          <div class="row"><span class="label">Total PF</span><span class="value">${formatCurrencyDisplay(deductions.totalPfDeduction)}</span></div>
          <div class="row"><span class="label">Employee TDS</span><span class="value">${formatCurrencyDisplay(deductions.tdsEmployeeDeduction)}</span></div>
          <div class="row"><span class="label">Total TDS</span><span class="value">${formatCurrencyDisplay(deductions.totalTdsDeduction)}</span></div>
          <div class="row"><span class="label">Retention</span><span class="value">${formatCurrencyDisplay(deductions.retentionDeduction)}</span></div>
          <div class="row"><span class="label">Total Deductions</span><span class="value">${formatCurrencyDisplay(totals.totalDeductions)}</span></div>
        </div>
        <div class="card">
          <h2>Release Details</h2>
          <div class="row"><span class="label">Retention Release</span><span class="value">${formatCurrencyDisplay(deductions.retentionReleaseAmount)}</span></div>
          <div class="row"><span class="label">Generated At</span><span class="value">${meta.generatedAt || '--'}</span></div>
          <div class="row"><span class="label">Department</span><span class="value">${employee.department_name || '--'}</span></div>
          <div class="row"><span class="label">PAN</span><span class="value">${employee.pan_number || '--'}</span></div>
        </div>
      </div>
      <div class="totals">
        <div class="card">
          <div class="row"><span class="label">Net Salary</span><span class="value">${formatCurrencyDisplay(totals.netSalary)}</span></div>
        </div>
      </div>
      <div class="footer">
        This is a system-generated payslip based on the frozen payroll snapshot for ${meta.monthLabel || 'the selected month'}.
      </div>
    </div>
  </body>
</html>
`.trim();
}

export function buildPayslipSnapshot({ payrollItem, employee, run, payslipNumber, generatedAt }) {
  const snapshot = payrollItem?.calculation_snapshot || {};

  return {
    payslipNumber,
    meta: {
      month: run.month,
      year: run.year,
      monthLabel: `${new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(dateFromParts(run.year, run.month, 1))} ${run.year}`,
      paymentStatus: payrollItem.payment_status,
      activeDays: payrollItem.active_days,
      lopDays: payrollItem.lop_days,
      generatedAt,
    },
    employee: snapshot.employee || buildEmployeeSnapshot(employee),
    earnings: {
      salarySnapshot: payrollItem.salary_snapshot,
      proratedSalary: payrollItem.prorated_salary,
    },
    deductions: {
      lopDeduction: payrollItem.lop_deduction,
      pfEmployeeDeduction: payrollItem.pf_employee_deduction,
      pfEmployerDeduction: payrollItem.pf_employer_deduction ?? 0,
      totalPfDeduction: payrollItem.total_pf_deduction ?? payrollItem.pf_employee_deduction ?? 0,
      tdsEmployeeDeduction: payrollItem.tds_employee_deduction ?? payrollItem.tds_deduction ?? 0,
      tdsEmployerDeduction: payrollItem.tds_employer_deduction ?? 0,
      totalTdsDeduction: payrollItem.total_tds_deduction ?? payrollItem.tds_deduction ?? 0,
      retentionDeduction: payrollItem.retention_deduction,
      retentionReleaseAmount: payrollItem.retention_release_amount,
    },
    totals: {
      totalDeductions: payrollItem.total_deductions,
      netSalary: payrollItem.net_salary,
    },
  };
}

export async function backfillHistoricalPayrollLopEntries() {
  const { data: pendingRequests, error } = await adminClient
    .from('hrm_leave_requests')
    .select('id, employee_id, start_date, end_date, paid_days, lop_days, applied_session, session, status')
    .eq('status', 'approved')
    .gt('lop_days', 0)
    .order('start_date', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to load leave requests for payroll LOP backfill');
  }

  for (const request of pendingRequests || []) {
    try {
      const [{ data: existingEntries, error: entryError }, { data: issueRows, error: issueError }] = await Promise.all([
        adminClient
          .from('hrm_payroll_lop_entries')
          .select('id')
          .eq('leave_request_id', request.id)
          .limit(1),
        adminClient
          .from('hrm_payroll_lop_backfill_issues')
          .select('id')
          .eq('leave_request_id', request.id)
          .limit(1),
      ]);

      if (entryError) {
        throw new Error(entryError.message || 'Failed to inspect payroll LOP entries');
      }
      if (issueError) {
        throw new Error(issueError.message || 'Failed to inspect payroll LOP backfill issues');
      }

      if ((existingEntries || []).length || (issueRows || []).length) {
        continue;
      }

      const startMonth = String(request.start_date || '').slice(0, 7);
      const endMonth = String(request.end_date || '').slice(0, 7);

      if (!startMonth || !endMonth || startMonth !== endMonth) {
        await adminClient.from('hrm_payroll_lop_backfill_issues').insert({
          employee_id: request.employee_id,
          leave_request_id: request.id,
          issue_type: 'cross_month_request',
          notes: 'Historical leave request spans multiple months and requires manual review.',
        });
        continue;
      }

      const employee = await getEmployeeLeaveContext(request.employee_id);
      const calculation = await calculateLeaveDays({
        startDate: request.start_date,
        endDate: request.end_date,
        session: request.applied_session || request.session || 'full_day',
        employeeSchedule: employee.workingSchedule,
      });

      await syncPayrollLopEntriesForLeaveApproval({
        employeeId: request.employee_id,
        leaveRequestId: request.id,
        workingDates: calculation.workingDates,
        session: request.applied_session || request.session || 'full_day',
        paidDays: request.paid_days,
        lopDays: request.lop_days,
        source: 'backfill',
      });
    } catch (error) {
      await adminClient.from('hrm_payroll_lop_backfill_issues').upsert({
        employee_id: request.employee_id,
        leave_request_id: request.id,
        issue_type: 'missing_schedule',
        notes: String(error?.message || 'Historical LOP backfill requires manual review.'),
      }, {
        onConflict: 'leave_request_id,issue_type',
      });
    }
  }
}

export function allocateLopDates({ workingDates = [], session = 'full_day', lopDays = 0 }) {
  const nextEntries = [];
  let remaining = roundDays(lopDays);

  if (remaining <= 0) {
    return nextEntries;
  }

  if (session !== 'full_day') {
    const lastDate = workingDates[workingDates.length - 1];
    if (lastDate) {
      nextEntries.push({
        attendance_date: lastDate,
        day_fraction: remaining >= 0.5 ? 0.5 : remaining,
      });
    }
    return nextEntries;
  }

  for (let index = workingDates.length - 1; index >= 0 && remaining > 0; index -= 1) {
    const fraction = remaining >= 1 ? 1 : 0.5;
    nextEntries.unshift({
      attendance_date: workingDates[index],
      day_fraction: fraction,
    });
    remaining = roundDays(remaining - fraction);
  }

  return nextEntries;
}

export async function syncPayrollLopEntriesForLeaveApproval({
  employeeId,
  leaveRequestId,
  workingDates,
  session,
  paidDays,
  lopDays,
  source = 'leave_request',
}) {
  const allocation = allocateLopDates({
    workingDates,
    session,
    lopDays,
  });

  const { error: deleteError } = await adminClient
    .from('hrm_payroll_lop_entries')
    .delete()
    .eq('leave_request_id', leaveRequestId);

  if (deleteError) {
    throw new Error(deleteError.message || 'Failed to refresh payroll LOP entries');
  }

  if (!allocation.length) {
    return [];
  }

  const rows = allocation.map((entry, index) => ({
    employee_id: employeeId,
    leave_request_id: leaveRequestId,
    attendance_date: entry.attendance_date,
    day_fraction: entry.day_fraction,
    source,
    notes:
      index === 0 && roundDays(paidDays) > 0
        ? `Paid leave applied first (${roundDays(paidDays)}), remaining days converted to LOP.`
        : 'Generated from approved leave request for payroll.',
  }));

  const { data, error } = await adminClient
    .from('hrm_payroll_lop_entries')
    .insert(rows)
    .select('*');

  if (error) {
    throw new Error(error.message || 'Failed to create payroll LOP entries');
  }

  return data || [];
}

async function loadPayrollReferenceData(year, month) {
  const { startDate, endDate, monthKey, daysInMonth } = getMonthBounds(year, month);
  await backfillHistoricalPayrollLopEntries();

  const [employeesResult, profilesResult, revisionsResult, schedulesResult, releasesResult, lopResult] = await Promise.all([
    adminClient
      .from('hrm_employees')
      .select(PAYROLL_EMPLOYEE_SELECT)
      .order('employee_id', { ascending: true }),
    adminClient
      .from('hrm_payroll_profiles')
      .select(PAYROLL_PROFILE_SELECT),
    adminClient
      .from('hrm_salary_revisions')
      .select('*')
      .lte('effective_from', endDate)
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false }),
    adminClient
      .from('hrm_retention_schedules')
      .select('*')
      .lte('start_month', `${monthKey}-31`)
      .order('start_month', { ascending: false }),
    adminClient
      .from('hrm_retention_releases')
      .select('*')
      .eq('release_month', startDate),
    adminClient
      .from('hrm_payroll_lop_entries')
      .select('*')
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate),
  ]);

  if (employeesResult.error) throw new Error(employeesResult.error.message || 'Failed to load payroll employees');
  if (profilesResult.error) throw new Error(profilesResult.error.message || 'Failed to load payroll profiles');
  if (revisionsResult.error) throw new Error(revisionsResult.error.message || 'Failed to load payroll revisions');
  if (schedulesResult.error) throw new Error(schedulesResult.error.message || 'Failed to load retention schedules');
  if (releasesResult.error) throw new Error(releasesResult.error.message || 'Failed to load retention releases');
  if (lopResult.error) throw new Error(lopResult.error.message || 'Failed to load payroll LOP entries');

  const employees = (employeesResult.data || [])
    .map(buildEmployeeDisplayFields)
    .sort(compareEmployeesByCode);
  const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.employee_id, profile]));
  const effectiveSalaryMap = buildEffectiveSalaryMap(revisionsResult.data || [], endDate);

  const scheduleMap = new Map();
  for (const schedule of schedulesResult.data || []) {
    const current = scheduleMap.get(schedule.employee_id) || [];
    current.push(schedule);
    scheduleMap.set(schedule.employee_id, current);
  }

  const releaseMap = new Map();
  for (const release of releasesResult.data || []) {
    const total = toNumber(releaseMap.get(release.employee_id), 0) + toNumber(release.amount, 0);
    releaseMap.set(release.employee_id, roundCurrency(total));
  }

  const lopMap = new Map();
  for (const lopEntry of lopResult.data || []) {
    const total = toNumber(lopMap.get(lopEntry.employee_id), 0) + toNumber(lopEntry.day_fraction, 0);
    lopMap.set(lopEntry.employee_id, roundDays(total));
  }

  return {
    employees,
    profileMap,
    effectiveSalaryMap,
    scheduleMap,
    releaseMap,
    lopMap,
    bounds: { startDate, endDate, monthKey, daysInMonth },
  };
}

function isEmployeeEligibleForPayroll(employee, year, month) {
  const employment = deriveEmploymentFields(employee);
  const lifecycle = employee?.employment_lifecycle_status ?? employment.employmentLifecycleStatus;
  const currentStage = employee?.current_stage ?? employment.currentStage;
  const { activeDays } = getActivePeriodForMonth(employee, year, month);

  if (activeDays <= 0) {
    return false;
  }

  if (lifecycle === 'active') {
    return true;
  }

  if (currentStage === 'probation') {
    return true;
  }

  return lifecycle === 'separated';
}

export function calculateEmployeePayroll({
  employee,
  profile,
  effectiveRevision,
  retentionSchedules = [],
  retentionReleaseAmount = 0,
  lopDays = 0,
  year,
  month,
  daysInMonth,
}) {
  const { activeStart, activeEnd, activeDays } = getActivePeriodForMonth(employee, year, month);
  const salarySnapshot = roundCurrency(
    effectiveRevision?.new_salary !== undefined && effectiveRevision?.new_salary !== null
      ? effectiveRevision.new_salary
      : employee.salary
  );

  const ratio = activeDays > 0 && daysInMonth > 0 ? activeDays / daysInMonth : 0;
  const proratedSalary = roundCurrency(salarySnapshot * ratio);
  const normalizedLopDays = roundDays(lopDays);
  const lopDeduction = roundCurrency(daysInMonth > 0 ? (salarySnapshot / daysInMonth) * normalizedLopDays : 0);
  const activeRetention = profile?.retention_enabled
    ? getCurrentRetentionSchedule(retentionSchedules, buildMonthKey(year, month))
    : null;
  const pfEmployeeDeduction = profile?.pf_enabled ? roundCurrency(toNumber(profile.pf_value, 0) * ratio) : 0;
  const pfEmployerDeduction = profile?.pf_enabled ? roundCurrency(toNumber(profile.pf_value, 0) * ratio) : 0;
  const totalPfDeduction = roundCurrency(pfEmployeeDeduction + pfEmployerDeduction);
  const tdsEmployeeDeduction = calculatePolicyAmount({
    enabled: Boolean(profile?.tds_enabled),
    mode: profile?.tds_mode || 'percent',
    value: profile?.tds_value,
    amountBase: proratedSalary,
    ratio,
  });
  const tdsEmployerDeduction = 0;
  const totalTdsDeduction = roundCurrency(tdsEmployeeDeduction);
  const retentionDeduction = activeRetention ? roundCurrency(toNumber(activeRetention.monthly_amount, 0) * ratio) : 0;
  const totalDeductions = roundCurrency(
    lopDeduction + totalPfDeduction + totalTdsDeduction + retentionDeduction
  );
  const netSalary = roundCurrency(proratedSalary - totalDeductions + toNumber(retentionReleaseAmount, 0));

  return {
    employeeId: employee.id,
    employeeCode: employee.employee_id,
    employeeName: employee.name,
    company: employee.company || '',
    joinDate: employee.date_of_joining,
    lifecycleStatus: employee.resolved_employment_lifecycle_status,
    currentStage: employee.resolved_current_stage,
    salarySnapshot,
    daysInMonth,
    activeStart,
    activeEnd,
    activeDays,
    lopDays: normalizedLopDays,
    lopDeduction,
    pfEmployeeDeduction,
    pfEmployerDeduction,
    totalPfDeduction,
    tdsEmployeeDeduction,
    tdsEmployerDeduction,
    totalTdsDeduction,
    retentionDeduction,
    retentionReleaseAmount: roundCurrency(retentionReleaseAmount),
    totalDeductions,
    netSalary,
    proratedSalary,
    paymentStatus: 'draft',
    effectiveRevision,
    profile: profile || null,
    retentionSchedule: activeRetention,
    employeeSnapshot: buildEmployeeSnapshot({
      ...employee,
      company: employee.company || '',
    }),
  };
}

export async function previewPayrollRun({ year, month, employeeId = null }) {
  const reference = await loadPayrollReferenceData(year, month);
  const rows = [];

  for (const employee of reference.employees) {
    if (employeeId && employee.id !== employeeId) {
      continue;
    }

    if (!isEmployeeEligibleForPayroll(employee, year, month)) {
      continue;
    }

    const profile = reference.profileMap.get(employee.id) || (await ensurePayrollProfile(employee.id));
    const effectiveRevision = reference.effectiveSalaryMap.get(employee.id) || null;
    const retentionSchedules = reference.scheduleMap.get(employee.id) || [];
    const retentionReleaseAmount = reference.releaseMap.get(employee.id) || 0;
    const lopDays = reference.lopMap.get(employee.id) || 0;

    rows.push(
      calculateEmployeePayroll({
        employee,
        profile,
        effectiveRevision,
        retentionSchedules,
        retentionReleaseAmount,
        lopDays,
        year,
        month,
        daysInMonth: reference.bounds.daysInMonth,
      })
    );
  }

  return {
    rows: rows.sort((left, right) => compareEmployeeCodeLike(left.employeeCode, right.employeeCode)),
    month: month,
    year,
    monthKey: reference.bounds.monthKey,
    summary: {
      totalEmployees: rows.length,
      totalGross: roundCurrency(rows.reduce((sum, row) => sum + row.proratedSalary, 0)),
      totalDeductions: roundCurrency(rows.reduce((sum, row) => sum + row.totalDeductions, 0)),
      totalNet: roundCurrency(rows.reduce((sum, row) => sum + row.netSalary, 0)),
    },
  };
}

async function ensurePayrollRun(year, month, actorUserId) {
  const { data: existing, error } = await adminClient
    .from('hrm_payroll_runs')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to load payroll run');
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await adminClient
    .from('hrm_payroll_runs')
    .insert({
      year,
      month,
      status: 'draft',
      processed_by: actorUserId,
    })
    .select('*')
    .single();

  if (createError || !created) {
    throw new Error(createError?.message || 'Failed to create payroll run');
  }

  return created;
}

async function updatePayrollRunTotals(runId) {
  const { data: items, error } = await adminClient
    .from('hrm_payroll_items')
    .select('id, prorated_salary, total_deductions, net_salary, payment_status')
    .eq('payroll_run_id', runId);

  if (error) {
    throw new Error(error.message || 'Failed to load payroll items');
  }

  const allItems = items || [];
  const nextStatus = allItems.length === 0
    ? 'draft'
    : allItems.every((item) => item.payment_status === 'paid')
      ? 'paid'
      : allItems.some((item) => ['payment_pending', 'paid'].includes(item.payment_status))
        ? 'payment_pending'
        : 'generated';

  const totalGross = roundCurrency(allItems.reduce((sum, item) => sum + toNumber(item.prorated_salary, 0), 0));
  const totalDeductions = roundCurrency(allItems.reduce((sum, item) => sum + toNumber(item.total_deductions, 0), 0));
  const totalNet = roundCurrency(allItems.reduce((sum, item) => sum + toNumber(item.net_salary, 0), 0));

  const { data: updated, error: updateError } = await adminClient
    .from('hrm_payroll_runs')
    .update({
      status: nextStatus,
      total_gross: totalGross,
      total_deductions: totalDeductions,
      total_net: totalNet,
      updated_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .select('*')
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || 'Failed to update payroll run totals');
  }

  return updated;
}

export async function generatePayrollRun({ year, month, actorUserId }) {
  const preview = await previewPayrollRun({ year, month });
  const run = await ensurePayrollRun(year, month, actorUserId);

  const { data: existingItems, error: existingError } = await adminClient
    .from('hrm_payroll_items')
    .select('*')
    .eq('payroll_run_id', run.id);

  if (existingError) {
    throw new Error(existingError.message || 'Failed to load existing payroll items');
  }

  const existingMap = new Map((existingItems || []).map((item) => [item.employee_id, item]));

  for (const row of preview.rows) {
    const existing = existingMap.get(row.employeeId);
    const paymentStatus = existing?.payment_status === 'paid'
      ? 'paid'
      : existing?.payment_status === 'payment_pending'
        ? 'payment_pending'
        : 'generated';

    const payload = {
      payroll_run_id: run.id,
      employee_id: row.employeeId,
      salary_snapshot: row.salarySnapshot,
      days_in_month: row.daysInMonth,
      active_days: row.activeDays,
      prorated_salary: row.proratedSalary,
      lop_days: row.lopDays,
      lop_deduction: row.lopDeduction,
      pf_employee_deduction: row.pfEmployeeDeduction,
      pf_employer_deduction: row.pfEmployerDeduction,
      total_pf_deduction: row.totalPfDeduction,
      tds_employee_deduction: row.tdsEmployeeDeduction,
      tds_employer_deduction: row.tdsEmployerDeduction,
      total_tds_deduction: row.totalTdsDeduction,
      tds_deduction: row.totalTdsDeduction,
      retention_deduction: row.retentionDeduction,
      retention_release_amount: row.retentionReleaseAmount,
      total_deductions: row.totalDeductions,
      net_salary: row.netSalary,
      payment_status: paymentStatus,
      paid_at: paymentStatus === 'paid' ? existing?.paid_at || new Date().toISOString() : null,
      calculation_snapshot: {
        employee: row.employeeSnapshot,
        meta: {
          year,
          month,
          daysInMonth: row.daysInMonth,
          activeStart: row.activeStart,
          activeEnd: row.activeEnd,
          activeDays: row.activeDays,
          lopDays: row.lopDays,
        },
        policy: {
          pfEnabled: Boolean(row.profile?.pf_enabled),
          pfMode: 'fixed',
          pfValue: toNumber(row.profile?.pf_value, 0),
          tdsEnabled: Boolean(row.profile?.tds_enabled),
          tdsMode: row.profile?.tds_mode || 'percent',
          tdsValue: toNumber(row.profile?.tds_value, 0),
          retentionEnabled: Boolean(row.profile?.retention_enabled),
          retentionMonthlyAmount: toNumber(row.retentionSchedule?.monthly_amount, 0),
        },
        effectiveRevision: row.effectiveRevision,
        earnings: {
          salarySnapshot: row.salarySnapshot,
          proratedSalary: row.proratedSalary,
        },
        deductions: {
          lopDeduction: row.lopDeduction,
          pfEmployeeDeduction: row.pfEmployeeDeduction,
          pfEmployerDeduction: row.pfEmployerDeduction,
          totalPfDeduction: row.totalPfDeduction,
          tdsEmployeeDeduction: row.tdsEmployeeDeduction,
          tdsEmployerDeduction: row.tdsEmployerDeduction,
          totalTdsDeduction: row.totalTdsDeduction,
          retentionDeduction: row.retentionDeduction,
          retentionReleaseAmount: row.retentionReleaseAmount,
        },
        totals: {
          totalDeductions: row.totalDeductions,
          netSalary: row.netSalary,
        },
      },
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error: updateError } = await adminClient
        .from('hrm_payroll_items')
        .update(payload)
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update payroll item');
      }
      continue;
    }

    const { error: insertError } = await adminClient
      .from('hrm_payroll_items')
      .insert(payload);

    if (insertError) {
      throw new Error(insertError.message || 'Failed to create payroll item');
    }
  }

  const refreshedRun = await updatePayrollRunTotals(run.id);

  return {
    run: refreshedRun,
    preview,
  };
}

export async function listPayrollRuns({ year = null, month = null }) {
  let query = adminClient
    .from('hrm_payroll_runs')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (year) {
    query = query.eq('year', year);
  }
  if (month) {
    query = query.eq('month', month);
  }

  const { data: runs, error } = await query;
  if (error) {
    throw new Error(error.message || 'Failed to load payroll runs');
  }

  const runIds = (runs || []).map((run) => run.id);
  if (!runIds.length) {
    return [];
  }

  const { data: items, error: itemsError } = await adminClient
    .from('hrm_payroll_items')
    .select(`
      id,
      payroll_run_id,
      employee_id,
      payment_status,
      net_salary,
      total_deductions,
      prorated_salary,
      employee:hrm_employees (
        id,
        employee_id,
        name,
        company
      )
    `)
    .in('payroll_run_id', runIds)
    .order('updated_at', { ascending: false });

  if (itemsError) {
    throw new Error(itemsError.message || 'Failed to load payroll run items');
  }

  const groupedItems = new Map();
  for (const item of items || []) {
    const current = groupedItems.get(item.payroll_run_id) || [];
    current.push(item);
    groupedItems.set(item.payroll_run_id, current);
  }

  return (runs || []).map((run) => ({
    ...run,
    items: (groupedItems.get(run.id) || []).sort((left, right) =>
      compareEmployeeCodeLike(left.employee?.employee_id, right.employee?.employee_id)
    ),
  }));
}

export async function getPayrollItemById(itemId) {
  const { data: item, error } = await adminClient
    .from('hrm_payroll_items')
    .select(`
      *,
      payroll_run:hrm_payroll_runs (*)
    `)
    .eq('id', itemId)
    .maybeSingle();

  if (error || !item) {
    throw new Error(error?.message || 'Payroll item not found');
  }

  const { data: employee, error: employeeError } = await adminClient
    .from('hrm_employees')
    .select(PAYROLL_EMPLOYEE_SELECT)
    .eq('id', item.employee_id)
    .maybeSingle();

  if (employeeError || !employee) {
    throw new Error(employeeError?.message || 'Payroll employee not found');
  }

  return {
    ...item,
    employee: buildEmployeeDisplayFields(employee),
  };
}

export async function updatePayrollItemStatus({ itemId, paymentStatus }) {
  const allowed = new Set(['generated', 'payment_pending', 'paid']);
  if (!allowed.has(paymentStatus)) {
    throw new Error('Unsupported payroll item status update');
  }

  const item = await getPayrollItemById(itemId);
  const { data: updated, error } = await adminClient
    .from('hrm_payroll_items')
    .update({
      payment_status: paymentStatus,
      paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select('*')
    .single();

  if (error || !updated) {
    throw new Error(error?.message || 'Failed to update payroll item');
  }

  await updatePayrollRunTotals(item.payroll_run_id);
  return updated;
}

export async function generatePayslipForItem({ itemId, actorUserId }) {
  const item = await getPayrollItemById(itemId);

  const { data: existingPayslips, error: payslipError } = await adminClient
    .from('hrm_payslips')
    .select('id, version')
    .eq('payroll_item_id', itemId)
    .order('version', { ascending: false })
    .limit(1);

  if (payslipError) {
    throw new Error(payslipError.message || 'Failed to load payslip versions');
  }

  const version = (existingPayslips?.[0]?.version || 0) + 1;
  const generatedAt = new Date().toISOString();
  const payslipNumber = `PS-${item.payroll_run.year}${padMonth(item.payroll_run.month)}-${item.employee.employee_id}-${version}`;
  const snapshot = buildPayslipSnapshot({
    payrollItem: item,
    employee: item.employee,
    run: item.payroll_run,
    payslipNumber,
    generatedAt,
  });
  const html = buildPayslipHtml(snapshot);

  const { data: created, error } = await adminClient
    .from('hrm_payslips')
    .insert({
      payroll_item_id: itemId,
      employee_id: item.employee_id,
      year: item.payroll_run.year,
      month: item.payroll_run.month,
      payslip_number: payslipNumber,
      html_snapshot: html,
      snapshot_json: snapshot,
      generated_by: actorUserId,
      generated_at: generatedAt,
      version,
    })
    .select('*')
    .single();

  if (error || !created) {
    throw new Error(error?.message || 'Failed to generate payslip');
  }

  if (item.payment_status === 'generated') {
    await updatePayrollItemStatus({ itemId, paymentStatus: 'payment_pending' });
  }

  return created;
}

export async function getLatestPayslipForItem(itemId) {
  const { data, error } = await adminClient
    .from('hrm_payslips')
    .select('*')
    .eq('payroll_item_id', itemId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to load payslip');
  }

  return data || null;
}

export async function listEmployeePaidPayroll(employeeId) {
  const { data: items, error } = await adminClient
    .from('hrm_payroll_items')
    .select(`
      *,
      payroll_run:hrm_payroll_runs (*)
    `)
    .eq('employee_id', employeeId)
    .eq('payment_status', 'paid');

  if (error) {
    throw new Error(error.message || 'Failed to load employee payroll history');
  }

  const itemIds = (items || []).map((item) => item.id);
  let payslips = [];

  if (itemIds.length) {
    const payslipResult = await adminClient
      .from('hrm_payslips')
      .select('*')
      .in('payroll_item_id', itemIds)
      .order('version', { ascending: false });

    if (payslipResult.error) {
      throw new Error(payslipResult.error.message || 'Failed to load employee payslips');
    }

    payslips = payslipResult.data || [];
  }

  const latestPayslipMap = new Map();
  for (const payslip of payslips) {
    if (!latestPayslipMap.has(payslip.payroll_item_id)) {
      latestPayslipMap.set(payslip.payroll_item_id, payslip);
    }
  }

  return (items || [])
    .map((item) => ({
      ...item,
      payslip: latestPayslipMap.get(item.id) || null,
    }))
    .sort((left, right) => {
      const leftYear = Number(left.payroll_run?.year || 0);
      const rightYear = Number(right.payroll_run?.year || 0);
      if (leftYear !== rightYear) {
        return rightYear - leftYear;
      }
      return Number(right.payroll_run?.month || 0) - Number(left.payroll_run?.month || 0);
    });
}

export async function getEmployeePaidPayrollMonth(employeeId, year, month) {
  const { data: run, error: runError } = await adminClient
    .from('hrm_payroll_runs')
    .select('id, year, month, status')
    .eq('year', year)
    .eq('month', month)
    .maybeSingle();

  if (runError || !run?.id) {
    throw new Error(runError?.message || 'Payroll run not found');
  }

  const { data: item, error } = await adminClient
    .from('hrm_payroll_items')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('payroll_run_id', run.id)
    .eq('payment_status', 'paid')
    .maybeSingle();

  if (error || !item) {
    throw new Error(error?.message || 'Paid payroll month not found');
  }

  const payslip = await getLatestPayslipForItem(item.id);
  return {
    ...item,
    payroll_run: run,
    payslip,
  };
}

create table if not exists public.hrm_payroll_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  payroll_company_override text,
  pf_enabled boolean not null default false,
  pf_mode text not null default 'percent'
    check (pf_mode = any (array['percent', 'fixed'])),
  pf_value numeric(12,2) not null default 10,
  pf_employer_enabled boolean not null default false,
  pf_employer_mode text not null default 'percent'
    check (pf_employer_mode = any (array['percent', 'fixed'])),
  pf_employer_value numeric(12,2) not null default 10,
  tds_enabled boolean not null default false,
  tds_value numeric(12,2) not null default 0,
  retention_enabled boolean not null default false,
  notes text,
  created_by uuid references public.hrm_profiles(id) on delete set null,
  updated_by uuid references public.hrm_profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint hrm_payroll_profiles_employee_unique unique (employee_id)
);

create index if not exists hrm_payroll_profiles_employee_idx
  on public.hrm_payroll_profiles (employee_id);

create table if not exists public.hrm_salary_revisions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  effective_from date not null,
  previous_salary numeric(12,2) not null default 0,
  revision_type text not null
    check (revision_type = any (array['amount', 'percent'])),
  revision_value numeric(12,2) not null default 0,
  new_salary numeric(12,2) not null default 0,
  reason text,
  created_by uuid references public.hrm_profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_salary_revisions_employee_effective_idx
  on public.hrm_salary_revisions (employee_id, effective_from desc, created_at desc);

create table if not exists public.hrm_retention_schedules (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  start_month date not null,
  end_month date,
  monthly_amount numeric(12,2) not null default 0,
  status text not null default 'active'
    check (status = any (array['active', 'paused', 'completed', 'released'])),
  total_retained numeric(12,2) not null default 0,
  total_released numeric(12,2) not null default 0,
  notes text,
  created_by uuid references public.hrm_profiles(id) on delete set null,
  updated_by uuid references public.hrm_profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_retention_schedules_employee_month_idx
  on public.hrm_retention_schedules (employee_id, start_month, end_month);

create table if not exists public.hrm_retention_releases (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  linked_schedule_id uuid references public.hrm_retention_schedules(id) on delete set null,
  release_month date not null,
  amount numeric(12,2) not null default 0,
  notes text,
  created_by uuid references public.hrm_profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_retention_releases_employee_month_idx
  on public.hrm_retention_releases (employee_id, release_month);

create table if not exists public.hrm_payroll_runs (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month integer not null check (month between 1 and 12),
  status text not null default 'draft'
    check (status = any (array['draft', 'generated', 'payment_pending', 'paid'])),
  processed_by uuid references public.hrm_profiles(id) on delete set null,
  total_gross numeric(14,2) not null default 0,
  total_deductions numeric(14,2) not null default 0,
  total_net numeric(14,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint hrm_payroll_runs_year_month_unique unique (year, month)
);

create index if not exists hrm_payroll_runs_status_idx
  on public.hrm_payroll_runs (status, year desc, month desc);

create table if not exists public.hrm_payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references public.hrm_payroll_runs(id) on delete cascade,
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  salary_snapshot numeric(12,2) not null default 0,
  days_in_month integer not null default 0,
  active_days numeric(8,2) not null default 0,
  prorated_salary numeric(12,2) not null default 0,
  lop_days numeric(8,2) not null default 0,
  lop_deduction numeric(12,2) not null default 0,
  pf_employee_deduction numeric(12,2) not null default 0,
  pf_employer_contribution numeric(12,2) not null default 0,
  tds_deduction numeric(12,2) not null default 0,
  retention_deduction numeric(12,2) not null default 0,
  retention_release_amount numeric(12,2) not null default 0,
  total_deductions numeric(12,2) not null default 0,
  net_salary numeric(12,2) not null default 0,
  payment_status text not null default 'draft'
    check (payment_status = any (array['draft', 'generated', 'payment_pending', 'paid'])),
  paid_at timestamptz,
  calculation_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint hrm_payroll_items_run_employee_unique unique (payroll_run_id, employee_id)
);

create index if not exists hrm_payroll_items_employee_run_idx
  on public.hrm_payroll_items (employee_id, payroll_run_id);

create index if not exists hrm_payroll_items_payment_status_idx
  on public.hrm_payroll_items (payment_status, updated_at desc);

create table if not exists public.hrm_payslips (
  id uuid primary key default gen_random_uuid(),
  payroll_item_id uuid not null references public.hrm_payroll_items(id) on delete cascade,
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  payslip_number text not null,
  html_snapshot text not null default '',
  snapshot_json jsonb not null default '{}'::jsonb,
  generated_by uuid references public.hrm_profiles(id) on delete set null,
  generated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create unique index if not exists hrm_payslips_item_version_unique
  on public.hrm_payslips (payroll_item_id, version);

create unique index if not exists hrm_payslips_number_unique
  on public.hrm_payslips (payslip_number);

create index if not exists hrm_payslips_employee_month_idx
  on public.hrm_payslips (employee_id, year desc, month desc, generated_at desc);

create table if not exists public.hrm_payroll_lop_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  attendance_date date not null,
  leave_request_id uuid references public.hrm_leave_requests(id) on delete set null,
  day_fraction numeric(4,2) not null default 1
    check (day_fraction in (0.5, 1.0)),
  source text not null default 'leave_request'
    check (source = any (array['leave_request', 'manual_adjustment', 'backfill', 'attendance'])),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists hrm_payroll_lop_entries_unique_idx
  on public.hrm_payroll_lop_entries (
    employee_id,
    attendance_date,
    coalesce(leave_request_id, '00000000-0000-0000-0000-000000000000'::uuid),
    source
  );

create index if not exists hrm_payroll_lop_entries_employee_date_idx
  on public.hrm_payroll_lop_entries (employee_id, attendance_date desc);

create table if not exists public.hrm_payroll_lop_backfill_issues (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  leave_request_id uuid not null references public.hrm_leave_requests(id) on delete cascade,
  issue_type text not null
    check (issue_type = any (array['cross_month_request', 'missing_schedule', 'unsupported_session'])),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint hrm_payroll_lop_backfill_issue_unique unique (leave_request_id, issue_type)
);

create index if not exists hrm_payroll_lop_backfill_employee_idx
  on public.hrm_payroll_lop_backfill_issues (employee_id, created_at desc);

insert into public.hrm_payroll_profiles (
  employee_id,
  pf_enabled,
  pf_mode,
  pf_value,
  pf_employer_enabled,
  pf_employer_mode,
  pf_employer_value,
  tds_enabled,
  tds_value,
  retention_enabled
)
select
  e.id,
  false,
  'percent',
  10,
  false,
  'percent',
  10,
  false,
  0,
  false
from public.hrm_employees e
where not exists (
  select 1
  from public.hrm_payroll_profiles p
  where p.employee_id = e.id
);

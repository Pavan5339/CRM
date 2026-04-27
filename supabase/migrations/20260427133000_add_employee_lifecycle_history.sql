alter table public.hrm_employees
  add column if not exists probation_started_at timestamptz,
  add column if not exists probation_ends_at date,
  add column if not exists notice_started_at timestamptz,
  add column if not exists notice_ends_at date,
  add column if not exists last_working_day date,
  add column if not exists termination_reason_code text;

create table if not exists public.hrm_employee_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  event_type text not null,
  source text not null default 'system',
  effective_at timestamptz,
  old_lifecycle_status text,
  new_lifecycle_status text,
  old_stage text,
  new_stage text,
  reason_code text,
  reason_text text,
  date_of_joining date,
  probation_period_days integer,
  probation_started_at timestamptz,
  probation_ends_at date,
  notice_period_days integer,
  notice_started_at timestamptz,
  notice_ends_at date,
  terminated_at timestamptz,
  last_working_day date,
  access_disabled_at timestamptz,
  active_service_days integer,
  notice_served_days integer,
  snapshot jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_by uuid references public.hrm_profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_employee_lifecycle_events_employee_idx
  on public.hrm_employee_lifecycle_events (employee_id, created_at desc);

create index if not exists hrm_employee_lifecycle_events_effective_idx
  on public.hrm_employee_lifecycle_events (effective_at desc);

create index if not exists hrm_employee_lifecycle_events_type_idx
  on public.hrm_employee_lifecycle_events (event_type, created_at desc);

alter table public.hrm_employee_lifecycle_events
  drop constraint if exists hrm_employee_lifecycle_events_event_type_check;

alter table public.hrm_employee_lifecycle_events
  add constraint hrm_employee_lifecycle_events_event_type_check
  check (
    event_type = any (
      array[
        'employee_created',
        'employee_updated',
        'lifecycle_status_changed',
        'stage_changed',
        'probation_started',
        'probation_completed',
        'notice_period_started',
        'notice_period_completed',
        'marked_inactive',
        'reactivated',
        'terminated',
        'lifecycle_details_updated'
      ]
    )
  );

alter table public.hrm_employee_lifecycle_events
  drop constraint if exists hrm_employee_lifecycle_events_source_check;

alter table public.hrm_employee_lifecycle_events
  add constraint hrm_employee_lifecycle_events_source_check
  check (source = any (array['system', 'hr_admin', 'employee']));

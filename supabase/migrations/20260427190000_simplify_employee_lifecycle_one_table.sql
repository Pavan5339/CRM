do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hrm_employees'
      and column_name = 'terminated_at'
  ) then
    execute 'alter table public.hrm_employees rename column terminated_at to separated_at';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hrm_employees'
      and column_name = 'termination_reason'
  ) then
    execute 'alter table public.hrm_employees rename column termination_reason to separation_reason';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hrm_employees'
      and column_name = 'termination_reason_code'
  ) then
    execute 'alter table public.hrm_employees rename column termination_reason_code to separation_reason_code';
  end if;
end
$$;

drop table if exists public.hrm_employee_lifecycle_events;

alter table public.hrm_employees
  add column if not exists probation_started_at timestamptz,
  add column if not exists probation_ends_at date,
  add column if not exists notice_started_at timestamptz,
  add column if not exists notice_ends_at date,
  add column if not exists separated_at timestamptz,
  add column if not exists separation_reason text,
  add column if not exists separation_reason_code text,
  add column if not exists access_disabled_at timestamptz;

update public.hrm_employees
set employment_lifecycle_status = 'separated'
where coalesce(employment_lifecycle_status, '') = 'terminated';

update public.hrm_employees
set employee_status = 'separated'
where coalesce(employee_status, '') = 'terminated';

update public.hrm_employees
set probation_period_days = 180
where probation_period_days is distinct from 180;

update public.hrm_employees
set
  current_stage = 'probation',
  probation_started_at = date_of_joining::timestamptz,
  probation_ends_at = (date_of_joining + interval '180 days')::date
where date_of_joining is not null
  and coalesce(employment_lifecycle_status, 'active') in ('active', 'inactive')
  and coalesce(current_stage, 'none') = 'none';

update public.hrm_employees
set
  probation_started_at = date_of_joining::timestamptz,
  probation_ends_at = (date_of_joining + interval '180 days')::date
where current_stage = 'probation'
  and date_of_joining is not null;

update public.hrm_employees
set notice_ends_at = (notice_started_at::date + make_interval(days => greatest(coalesce(notice_period_days, 0) - 1, 0)))::date
where current_stage = 'notice_period'
  and notice_started_at is not null
  and notice_period_days is not null
  and notice_ends_at is null;

update public.hrm_employees
set current_stage = 'none'
where coalesce(employment_lifecycle_status, 'active') = 'separated';

alter table public.hrm_employees
  alter column probation_period_days set default 180;

alter table public.hrm_employees
  drop constraint if exists hrm_employees_employment_lifecycle_status_check;

alter table public.hrm_employees
  add constraint hrm_employees_employment_lifecycle_status_check
  check (
    employment_lifecycle_status = any (array['active', 'inactive', 'separated'])
  );

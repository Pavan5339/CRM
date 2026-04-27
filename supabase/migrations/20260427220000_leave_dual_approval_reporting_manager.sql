alter table if exists public.hrm_leave_requests
  add column if not exists reporting_manager_id uuid references public.hrm_employees(id) on delete set null,
  add column if not exists reporting_manager_name_snapshot text,
  add column if not exists reviewed_by_role text,
  add column if not exists reviewed_by_name text;

update public.hrm_leave_requests as requests
set
  reporting_manager_id = employees.reporting_manager_id,
  reporting_manager_name_snapshot = managers.name
from public.hrm_employees as employees
left join public.hrm_employees as managers
  on managers.id = employees.reporting_manager_id
where requests.employee_id = employees.id
  and (
    requests.reporting_manager_id is null
    or coalesce(requests.reporting_manager_name_snapshot, '') = ''
  );

update public.hrm_leave_requests
set reviewed_by_role = 'hr_admin'
where reviewed_at is not null
  and coalesce(reviewed_by_role, '') = '';

alter table if exists public.hrm_leave_requests
  drop constraint if exists hrm_leave_requests_reviewed_by_role_check;

alter table if exists public.hrm_leave_requests
  add constraint hrm_leave_requests_reviewed_by_role_check
  check (
    reviewed_by_role is null
    or reviewed_by_role in ('hr_admin', 'reporting_manager')
  );

create index if not exists hrm_leave_requests_reporting_manager_status_idx
  on public.hrm_leave_requests (reporting_manager_id, status, created_at desc);

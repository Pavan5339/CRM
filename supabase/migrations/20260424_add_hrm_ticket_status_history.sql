create table if not exists public.hrm_ticket_status_history (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.hrm_tickets(id) on delete cascade,
  cycle_no integer not null check (cycle_no > 0),
  step_no integer not null check (step_no > 0),
  step_key text not null check (step_key in ('ticket_raised', 'open', 'in_progress', 'waiting_on_requester', 'resolved', 'closed', 'reopened')),
  acted_by_auth_user_id uuid not null,
  acted_by_employee_id uuid references public.hrm_employees(id) on delete set null,
  acted_by_role text not null check (acted_by_role in ('employee', 'hr_admin', 'super_admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_ticket_status_history_ticket_idx
  on public.hrm_ticket_status_history(ticket_id, step_no asc);

create index if not exists hrm_ticket_status_history_cycle_idx
  on public.hrm_ticket_status_history(ticket_id, cycle_no asc, step_no asc);

create unique index if not exists hrm_ticket_status_history_ticket_step_idx
  on public.hrm_ticket_status_history(ticket_id, step_no);

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'hrm_tickets'
      and constraint_name = 'hrm_tickets_status_check'
  ) then
    alter table public.hrm_tickets drop constraint hrm_tickets_status_check;
  end if;
end $$;

alter table public.hrm_tickets
  add constraint hrm_tickets_status_check
  check (status in ('ticket_raised', 'open', 'in_progress', 'waiting_on_requester', 'resolved', 'closed'));

update public.hrm_tickets
set status = 'open',
    updated_at = timezone('utc', now())
where status = 'reopened';

insert into public.hrm_ticket_status_history (
  ticket_id,
  cycle_no,
  step_no,
  step_key,
  acted_by_auth_user_id,
  acted_by_employee_id,
  acted_by_role,
  created_at
)
select
  t.id,
  1,
  1,
  'ticket_raised',
  t.requester_auth_user_id,
  t.requester_employee_id,
  t.requester_role,
  t.created_at
from public.hrm_tickets t
where not exists (
  select 1
  from public.hrm_ticket_status_history h
  where h.ticket_id = t.id
);

insert into public.hrm_ticket_status_history (
  ticket_id,
  cycle_no,
  step_no,
  step_key,
  acted_by_auth_user_id,
  acted_by_employee_id,
  acted_by_role,
  created_at
)
select
  t.id,
  1,
  2,
  t.status,
  coalesce(t.owner_auth_user_id, t.requester_auth_user_id),
  t.owner_employee_id,
  t.owner_role,
  coalesce(t.updated_at, t.created_at)
from public.hrm_tickets t
where t.status <> 'ticket_raised'
  and not exists (
    select 1
    from public.hrm_ticket_status_history h
    where h.ticket_id = t.id
      and h.step_no = 2
  );

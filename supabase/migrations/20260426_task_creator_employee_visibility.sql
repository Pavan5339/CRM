alter table public.tasks
  add column if not exists created_by_employee_id uuid;

alter table public.tasks
  drop constraint if exists tasks_created_by_employee_id_fkey;

alter table public.tasks
  add constraint tasks_created_by_employee_id_fkey
  foreign key (created_by_employee_id)
  references public.hrm_employees(id)
  on delete set null;

create index if not exists idx_tasks_created_by_employee_id
  on public.tasks(created_by_employee_id);

create table if not exists public.task_assignment_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null
    constraint task_assignment_activity_task_id_fkey
      references public.tasks(id) on delete cascade,
  subtask_id uuid null
    constraint task_assignment_activity_subtask_id_fkey
      references public.task_subtasks(id) on delete set null,
  entity_type text not null
    constraint task_assignment_activity_entity_type_check
      check (entity_type in ('task', 'subtask')),
  action text not null
    constraint task_assignment_activity_action_check
      check (action in ('assigned', 'reassigned', 'unassigned')),
  assigned_by_actor_type text not null
    constraint task_assignment_activity_actor_type_check
      check (assigned_by_actor_type in ('admin', 'employee')),
  assigned_by_admin_user_id uuid null
    constraint task_assignment_activity_assigned_by_admin_user_id_fkey
      references public.profiles(id) on delete set null,
  assigned_by_employee_id uuid null
    constraint task_assignment_activity_assigned_by_employee_id_fkey
      references public.employees(id) on delete set null,
  from_employee_id uuid null
    constraint task_assignment_activity_from_employee_id_fkey
      references public.employees(id) on delete set null,
  to_employee_id uuid null
    constraint task_assignment_activity_to_employee_id_fkey
      references public.employees(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint task_assignment_activity_entity_subtask_check
    check (
      (entity_type = 'task' and subtask_id is null)
      or (entity_type = 'subtask' and subtask_id is not null)
    ),
  constraint task_assignment_activity_actor_identity_check
    check (
      (assigned_by_actor_type = 'admin' and assigned_by_admin_user_id is not null and assigned_by_employee_id is null)
      or (assigned_by_actor_type = 'employee' and assigned_by_employee_id is not null and assigned_by_admin_user_id is null)
    )
);

create index if not exists idx_task_assignment_activity_task_created_at
  on public.task_assignment_activity(task_id, created_at desc);

create index if not exists idx_task_assignment_activity_subtask_created_at
  on public.task_assignment_activity(subtask_id, created_at desc);

create or replace function public._apply_employee_task_status_delta(
  p_employee_id uuid,
  p_old_status text,
  p_new_status text
)
returns void
language sql
as $$
  update public.hrm_employees
  set
    pending_tasks = greatest(
      0,
      coalesce(pending_tasks, 0)
      + case when p_new_status = 'pending' then 1 else 0 end
      - case when p_old_status = 'pending' then 1 else 0 end
    ),
    in_progress_tasks = greatest(
      0,
      coalesce(in_progress_tasks, 0)
      + case when p_new_status = 'in_progress' then 1 else 0 end
      - case when p_old_status = 'in_progress' then 1 else 0 end
    ),
    completed_tasks = greatest(
      0,
      coalesce(completed_tasks, 0)
      + case when p_new_status = 'completed' then 1 else 0 end
      - case when p_old_status = 'completed' then 1 else 0 end
    ),
    updated_at = now()
  where id = p_employee_id;
$$;

create or replace function public.handle_task_status_counter_delta()
returns trigger
language plpgsql
as $$
begin
  if old.status is not distinct from new.status then
    return null;
  end if;

  update public.hrm_employees e
  set
    pending_tasks = greatest(
      0,
      coalesce(e.pending_tasks, 0)
      + case when new.status = 'pending' then a.cnt else 0 end
      - case when old.status = 'pending' then a.cnt else 0 end
    ),
    in_progress_tasks = greatest(
      0,
      coalesce(e.in_progress_tasks, 0)
      + case when new.status = 'in_progress' then a.cnt else 0 end
      - case when old.status = 'in_progress' then a.cnt else 0 end
    ),
    completed_tasks = greatest(
      0,
      coalesce(e.completed_tasks, 0)
      + case when new.status = 'completed' then a.cnt else 0 end
      - case when old.status = 'completed' then a.cnt else 0 end
    ),
    updated_at = now()
  from (
    select employee_id, count(*)::int as cnt
    from public.task_assignments
    where task_id = new.id
    group by employee_id
  ) a
  where e.id = a.employee_id;

  return null;
end;
$$;

update public.hrm_employees e
set
  pending_tasks = coalesce(src.pending_tasks, 0),
  in_progress_tasks = coalesce(src.in_progress_tasks, 0),
  completed_tasks = coalesce(src.completed_tasks, 0),
  updated_at = now()
from (
  select
    e2.id as employee_id,
    count(*) filter (where t.status = 'pending')::int as pending_tasks,
    count(*) filter (where t.status = 'in_progress')::int as in_progress_tasks,
    count(*) filter (where t.status = 'completed')::int as completed_tasks
  from public.hrm_employees e2
  left join public.task_assignments ta on ta.employee_id = e2.id
  left join public.tasks t on t.id = ta.task_id
  group by e2.id
) src
where e.id = src.employee_id;

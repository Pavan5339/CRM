create or replace function public.chat_current_actor_key()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid;
  employee_uuid uuid;
begin
  uid := auth.uid();

  if uid is null then
    return null;
  end if;

  if exists (
    select 1
    from public.hrm_profiles p
    where p.id = uid and p.role = 'admin'
  ) then
    return 'admin:' || uid::text;
  end if;

  select e.id into employee_uuid
  from public.hrm_employees e
  where e.auth_user_id = uid
  limit 1;

  if employee_uuid is not null then
    return 'employee:' || employee_uuid::text;
  end if;

  return null;
end;
$$;

create or replace function public.enqueue_due_task_emails()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int := 0;
begin
  with due_candidates as (
    select
      t.id as task_id,
      t.task_name,
      coalesce(t.description, '') as task_description,
      coalesce(t.priority, 'medium') as priority,
      t.due_date,
      e.id as employee_id,
      coalesce(e.name, 'Employee') as employee_name,
      lower(e.email) as recipient_email,
      concat(
        'task_due:',
        t.id::text,
        ':',
        e.id::text,
        ':',
        extract(epoch from t.due_date)::bigint::text
      ) as dedupe_key
    from public.tasks t
    join public.task_assignments ta on ta.task_id = t.id
    join public.hrm_employees e on e.id = ta.employee_id
    where t.due_date is not null
      and t.due_date <= timezone('utc'::text, now())
      and t.status <> 'completed'
      and coalesce(e.email, '') <> ''
  ),
  inserted as (
    insert into public.email_outbox (
      event_type,
      recipient_email,
      payload,
      dedupe_key
    )
    select
      'task_due',
      due_candidates.recipient_email,
      jsonb_build_object(
        'task_id', due_candidates.task_id,
        'task_name', due_candidates.task_name,
        'task_description', due_candidates.task_description,
        'priority', due_candidates.priority,
        'due_date', due_candidates.due_date,
        'employee_id', due_candidates.employee_id,
        'employee_name', due_candidates.employee_name
      ),
      due_candidates.dedupe_key
    from due_candidates
    on conflict (dedupe_key) do nothing
    returning 1
  )
  select count(*)::int into v_inserted from inserted;

  return coalesce(v_inserted, 0);
end;
$$;

create or replace function public.enqueue_task_assignment_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task record;
  v_employee record;
  v_due_epoch bigint;
begin
  select
    t.id,
    t.task_name,
    t.description,
    t.priority,
    t.due_date
  into v_task
  from public.tasks t
  where t.id = new.task_id;

  select
    e.id,
    e.name,
    e.email
  into v_employee
  from public.hrm_employees e
  where e.id = new.employee_id;

  if v_task.id is null or v_employee.id is null or coalesce(v_employee.email, '') = '' then
    return new;
  end if;

  v_due_epoch := case
    when v_task.due_date is null then 0
    else extract(epoch from v_task.due_date)::bigint
  end;

  insert into public.email_outbox (
    event_type,
    recipient_email,
    payload,
    dedupe_key
  )
  values (
    'task_assigned',
    lower(v_employee.email),
    jsonb_build_object(
      'task_id', v_task.id,
      'task_name', v_task.task_name,
      'task_description', coalesce(v_task.description, ''),
      'priority', coalesce(v_task.priority, 'medium'),
      'due_date', v_task.due_date,
      'employee_id', v_employee.id,
      'employee_name', coalesce(v_employee.name, 'Employee')
    ),
    concat(
      'task_assigned:',
      v_task.id::text,
      ':',
      v_employee.id::text,
      ':',
      coalesce(extract(epoch from new.assigned_at)::bigint, 0)::text,
      ':',
      v_due_epoch::text
    )
  )
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

create or replace function public.handle_task_delete_counter_delta()
returns trigger
language plpgsql
as $$
begin
  update public.hrm_employees e
  set
    pending_tasks = greatest(
      0,
      coalesce(e.pending_tasks, 0)
      - case when old.status = 'pending' then a.cnt else 0 end
    ),
    in_progress_tasks = greatest(
      0,
      coalesce(e.in_progress_tasks, 0)
      - case when old.status = 'in_progress' then a.cnt else 0 end
    ),
    completed_tasks = greatest(
      0,
      coalesce(e.completed_tasks, 0)
      - case when old.status = 'completed' then a.cnt else 0 end
    ),
    updated_at = now()
  from (
    select employee_id, count(*)::int as cnt
    from public.task_assignments
    where task_id = old.id
    group by employee_id
  ) a
  where e.id = a.employee_id;

  return old;
end;
$$;

create or replace function public.process_repeating_tasks()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_processed int := 0;
  v_task record;
  v_new_anchor timestamptz;
begin
  for v_task in
    select t.id, t.frequency, t.last_cycle_reset, t.task_name, t.description, t.priority, t.due_date
    from public.tasks t
    where t.frequency is not null
      and (
        (t.frequency = 'weekly' and t.last_cycle_reset + interval '1 week' <= timezone('utc'::text, now())) or
        (t.frequency = 'monthly' and t.last_cycle_reset + interval '1 month' <= timezone('utc'::text, now())) or
        (t.frequency = 'yearly' and t.last_cycle_reset + interval '1 year' <= timezone('utc'::text, now()))
      )
  loop
    v_new_anchor := v_task.last_cycle_reset;

    if v_task.frequency = 'weekly' then
      while v_new_anchor + interval '1 week' <= timezone('utc'::text, now()) loop
        v_new_anchor := v_new_anchor + interval '1 week';
      end loop;
    elsif v_task.frequency = 'monthly' then
      while v_new_anchor + interval '1 month' <= timezone('utc'::text, now()) loop
        v_new_anchor := v_new_anchor + interval '1 month';
      end loop;
    elsif v_task.frequency = 'yearly' then
      while v_new_anchor + interval '1 year' <= timezone('utc'::text, now()) loop
        v_new_anchor := v_new_anchor + interval '1 year';
      end loop;
    end if;

    if v_new_anchor > v_task.last_cycle_reset then
      update public.tasks
      set last_cycle_reset = v_new_anchor,
          progress_percentage = 0,
          status = 'pending',
          updated_at = timezone('utc'::text, now())
      where id = v_task.id;

      update public.task_subtasks
      set is_completed = false,
          updated_at = timezone('utc'::text, now())
      where task_id = v_task.id;

      insert into public.email_outbox (
        event_type, recipient_email, payload, dedupe_key
      )
      select
        'task_repeat_assigned',
        lower(e.email),
        jsonb_build_object(
          'task_id', v_task.id,
          'task_name', v_task.task_name,
          'task_description', coalesce(v_task.description, ''),
          'priority', coalesce(v_task.priority, 'medium'),
          'due_date', v_task.due_date,
          'employee_id', e.id,
          'employee_name', coalesce(e.name, 'Employee')
        ),
        concat('task_repeat:', v_task.id::text, ':', e.id::text, ':', extract(epoch from v_new_anchor)::bigint::text)
      from public.task_assignments ta
      join public.hrm_employees e on e.id = ta.employee_id
      where ta.task_id = v_task.id and coalesce(e.email, '') <> ''
      on conflict (dedupe_key) do nothing;

      v_processed := v_processed + 1;
    end if;
  end loop;

  return v_processed;
end;
$$;

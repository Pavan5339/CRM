-- Add frequency and last_cycle_reset columns to tasks table
alter table public.tasks 
add column if not exists frequency text check (frequency in ('weekly', 'monthly', 'yearly')),
add column if not exists last_cycle_reset timestamptz;

-- Set existing last_cycle_reset to their created_at
update public.tasks 
set last_cycle_reset = created_at 
where last_cycle_reset is null;

-- Update email_outbox check constraint to support task_repeat_assigned
DO $$ 
DECLARE
    CONSTRAINT_NAME text;
BEGIN
    SELECT conname INTO CONSTRAINT_NAME
    FROM pg_constraint 
    WHERE conrelid = 'public.email_outbox'::regclass AND contype = 'c' 
    AND pg_get_constraintdef(oid) ILIKE '%event_type%';

    IF CONSTRAINT_NAME IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.email_outbox DROP CONSTRAINT ' || CONSTRAINT_NAME;
    END IF;
    
    ALTER TABLE public.email_outbox ADD CONSTRAINT email_outbox_event_type_check 
    CHECK (event_type IN ('employee_created', 'task_assigned', 'task_due', 'task_repeat_assigned'));
END $$;

-- Create function to process repeating tasks
create or replace function public.process_repeating_tasks()
returns int
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
      -- Update task
      update public.tasks
      set last_cycle_reset = v_new_anchor,
          progress_percentage = 0,
          status = 'pending',
          updated_at = timezone('utc'::text, now())
      where id = v_task.id;

      -- Reset subtasks
      update public.task_subtasks
      set is_completed = false,
          updated_at = timezone('utc'::text, now())
      where task_id = v_task.id;

      -- Enqueue assignment emails
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
      join public.employees e on e.id = ta.employee_id
      where ta.task_id = v_task.id and coalesce(e.email, '') <> ''
      on conflict (dedupe_key) do nothing;

      v_processed := v_processed + 1;
    end if;
  end loop;

  return v_processed;
end;
$$;

-- Schedule the job to run hourly using pg_cron
do $$
begin
  if exists (select 1 from cron.job where jobname = 'process_repeating_tasks_hourly') then
    perform cron.unschedule('process_repeating_tasks_hourly');
  end if;
end
$$;

select cron.schedule(
  'process_repeating_tasks_hourly',
  '0 * * * *',
  $$ select public.process_repeating_tasks(); $$
);

alter table public.auditing_pdpl_gantt_tasks
add column if not exists is_done boolean not null default false,
add column if not exists done_marked_on date,
add column if not exists done_marked_by uuid;

create or replace function public.auditing_pdpl_sync_gantt_done_fields()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.is_done, false) = false then
    new.done_marked_on = null;
    new.done_marked_by = null;
  elsif new.done_marked_on is null then
    new.done_marked_on = current_date;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auditing_pdpl_gantt_tasks_done_fields on public.auditing_pdpl_gantt_tasks;
create trigger trg_auditing_pdpl_gantt_tasks_done_fields
before insert or update of is_done, done_marked_on, done_marked_by on public.auditing_pdpl_gantt_tasks
for each row
execute function public.auditing_pdpl_sync_gantt_done_fields();

create index if not exists auditing_pdpl_gantt_tasks_done_idx
  on public.auditing_pdpl_gantt_tasks(project_id, is_done, done_marked_on desc);

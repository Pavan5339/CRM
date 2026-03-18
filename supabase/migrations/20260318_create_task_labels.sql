create table if not exists public.task_labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.task_labels (name)
select distinct trim(label)
from public.tasks
where trim(coalesce(label, '')) <> ''
on conflict (name) do nothing;

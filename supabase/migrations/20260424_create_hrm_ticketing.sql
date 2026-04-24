create sequence if not exists public.hrm_ticket_no_seq;

create or replace function public.generate_hrm_ticket_no()
returns text
language plpgsql
as $$
declare
  next_ticket_no bigint;
begin
  next_ticket_no := nextval('public.hrm_ticket_no_seq');
  return 'TKT-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' || lpad(next_ticket_no::text, 6, '0');
end;
$$;

create or replace function public.set_hrm_ticketing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.assign_hrm_ticket_no()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_no is null or btrim(new.ticket_no) = '' then
    new.ticket_no := public.generate_hrm_ticket_no();
  end if;
  return new;
end;
$$;

create table if not exists public.hrm_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_no text not null unique,
  subject text not null,
  description text not null,
  category text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting_on_requester', 'resolved', 'closed', 'reopened')),
  requester_auth_user_id uuid not null,
  requester_employee_id uuid references public.hrm_employees(id) on delete set null,
  requester_role text not null check (requester_role in ('employee', 'hr_admin', 'super_admin')),
  owner_auth_user_id uuid not null,
  owner_employee_id uuid references public.hrm_employees(id) on delete set null,
  owner_role text not null check (owner_role in ('employee', 'hr_admin', 'super_admin')),
  raised_for_auth_user_id uuid,
  raised_for_employee_id uuid references public.hrm_employees(id) on delete set null,
  raised_for_role text check (raised_for_role in ('employee', 'hr_admin', 'super_admin')),
  resolved_at timestamptz,
  closed_at timestamptz,
  last_activity_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hrm_ticket_participants (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.hrm_tickets(id) on delete cascade,
  participant_type text not null check (participant_type in ('owner', 'cc')),
  participant_auth_user_id uuid not null,
  participant_employee_id uuid references public.hrm_employees(id) on delete cascade,
  participant_role text not null check (participant_role in ('employee', 'hr_admin', 'super_admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hrm_ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.hrm_tickets(id) on delete cascade,
  author_auth_user_id uuid not null,
  author_employee_id uuid references public.hrm_employees(id) on delete set null,
  author_role text not null check (author_role in ('employee', 'hr_admin', 'super_admin')),
  comment_body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hrm_ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.hrm_tickets(id) on delete cascade,
  comment_id uuid references public.hrm_ticket_comments(id) on delete cascade,
  uploaded_by_auth_user_id uuid not null,
  uploaded_by_employee_id uuid references public.hrm_employees(id) on delete set null,
  file_name text not null,
  file_path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_tickets_requester_idx
  on public.hrm_tickets(requester_auth_user_id, created_at desc);

create index if not exists hrm_tickets_owner_status_idx
  on public.hrm_tickets(owner_auth_user_id, status, updated_at desc);

create index if not exists hrm_tickets_status_updated_idx
  on public.hrm_tickets(status, updated_at desc);

create index if not exists hrm_tickets_last_activity_idx
  on public.hrm_tickets(last_activity_at desc);

create index if not exists hrm_ticket_participants_ticket_idx
  on public.hrm_ticket_participants(ticket_id);

create index if not exists hrm_ticket_participants_auth_idx
  on public.hrm_ticket_participants(participant_auth_user_id);

create unique index if not exists hrm_ticket_participants_unique_idx
  on public.hrm_ticket_participants(ticket_id, participant_auth_user_id, participant_type);

create index if not exists hrm_ticket_comments_ticket_created_idx
  on public.hrm_ticket_comments(ticket_id, created_at asc);

create index if not exists hrm_ticket_attachments_ticket_idx
  on public.hrm_ticket_attachments(ticket_id);

create index if not exists hrm_ticket_attachments_comment_idx
  on public.hrm_ticket_attachments(comment_id);

drop trigger if exists trg_hrm_tickets_assign_no on public.hrm_tickets;
create trigger trg_hrm_tickets_assign_no
before insert on public.hrm_tickets
for each row
execute function public.assign_hrm_ticket_no();

drop trigger if exists trg_hrm_tickets_updated_at on public.hrm_tickets;
create trigger trg_hrm_tickets_updated_at
before update on public.hrm_tickets
for each row
execute function public.set_hrm_ticketing_updated_at();

drop trigger if exists trg_hrm_ticket_comments_updated_at on public.hrm_ticket_comments;
create trigger trg_hrm_ticket_comments_updated_at
before update on public.hrm_ticket_comments
for each row
execute function public.set_hrm_ticketing_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select
  'hrm-ticket-files',
  'hrm-ticket-files',
  true,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
where not exists (
  select 1
  from storage.buckets
  where id = 'hrm-ticket-files'
);

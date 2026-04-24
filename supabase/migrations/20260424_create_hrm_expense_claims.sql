create sequence if not exists public.hrm_expense_claim_no_seq;

create or replace function public.generate_hrm_expense_claim_no()
returns text
language plpgsql
as $$
declare
  next_claim_no bigint;
begin
  next_claim_no := nextval('public.hrm_expense_claim_no_seq');
  return 'EXP-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' || lpad(next_claim_no::text, 6, '0');
end;
$$;

create or replace function public.set_hrm_expense_claim_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.assign_hrm_expense_claim_no()
returns trigger
language plpgsql
as $$
begin
  if new.claim_no is null or btrim(new.claim_no) = '' then
    new.claim_no := public.generate_hrm_expense_claim_no();
  end if;
  return new;
end;
$$;

create table if not exists public.hrm_expense_claims (
  id uuid primary key default gen_random_uuid(),
  claim_no text not null unique,
  employee_auth_user_id uuid not null,
  employee_id uuid not null references public.hrm_employees(id) on delete cascade,
  employee_name_snapshot text not null,
  employee_code_snapshot text,
  reporting_manager_name_snapshot text,
  reviewer_auth_user_id uuid not null,
  reviewer_employee_id uuid references public.hrm_employees(id) on delete set null,
  reviewer_role text not null check (reviewer_role in ('employee', 'hr_admin')),
  reviewer_name_snapshot text not null,
  title text not null,
  purpose text not null,
  currency text not null default 'INR',
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  status text not null default 'submitted' check (status in ('submitted', 'needs_changes', 'approved', 'rejected')),
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hrm_expense_claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.hrm_expense_claims(id) on delete cascade,
  expense_date date not null,
  category text not null,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  vendor_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hrm_expense_claim_attachments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.hrm_expense_claims(id) on delete cascade,
  claim_item_id uuid references public.hrm_expense_claim_items(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text,
  file_size bigint,
  uploaded_by_auth_user_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hrm_expense_claim_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.hrm_expense_claims(id) on delete cascade,
  reviewer_auth_user_id uuid not null,
  reviewer_role text not null check (reviewer_role in ('employee', 'hr_admin')),
  action text not null check (action in ('submitted', 'needs_changes', 'resubmitted', 'approved', 'rejected')),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hrm_expense_claims_employee_idx
  on public.hrm_expense_claims(employee_auth_user_id, status, submitted_at desc);

create index if not exists hrm_expense_claims_reviewer_idx
  on public.hrm_expense_claims(reviewer_auth_user_id, status, updated_at desc);

create index if not exists hrm_expense_claims_status_idx
  on public.hrm_expense_claims(status, updated_at desc);

create index if not exists hrm_expense_claim_items_claim_idx
  on public.hrm_expense_claim_items(claim_id, expense_date asc);

create index if not exists hrm_expense_claim_attachments_claim_idx
  on public.hrm_expense_claim_attachments(claim_id);

create index if not exists hrm_expense_claim_attachments_item_idx
  on public.hrm_expense_claim_attachments(claim_item_id);

create index if not exists hrm_expense_claim_reviews_claim_idx
  on public.hrm_expense_claim_reviews(claim_id, created_at desc);

drop trigger if exists trg_hrm_expense_claims_assign_no on public.hrm_expense_claims;
create trigger trg_hrm_expense_claims_assign_no
before insert on public.hrm_expense_claims
for each row
execute function public.assign_hrm_expense_claim_no();

drop trigger if exists trg_hrm_expense_claims_updated_at on public.hrm_expense_claims;
create trigger trg_hrm_expense_claims_updated_at
before update on public.hrm_expense_claims
for each row
execute function public.set_hrm_expense_claim_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select
  'hrm-expense-files',
  'hrm-expense-files',
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
  where id = 'hrm-expense-files'
);

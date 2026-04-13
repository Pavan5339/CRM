alter table if exists public.hrm_employees
  drop constraint if exists employees_created_by_fkey,
  drop constraint if exists hrm_employees_created_by_fkey;

alter table if exists public.hrm_employees
  add constraint hrm_employees_created_by_fkey
  foreign key (created_by)
  references auth.users(id)
  on delete set null;

alter table if exists public.hrm_employees
  add column if not exists gender text;

update public.hrm_employees
set gender = case
  when lower(trim(gender)) in ('male', 'female', 'others') then lower(trim(gender))
  else null
end
where gender is not null;

alter table if exists public.hrm_employees
  drop constraint if exists hrm_employees_gender_check;

alter table if exists public.hrm_employees
  add constraint hrm_employees_gender_check
  check (gender is null or gender = any (array['male', 'female', 'others']));

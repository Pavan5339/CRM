alter table if exists public.hrm_employees
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_number text;

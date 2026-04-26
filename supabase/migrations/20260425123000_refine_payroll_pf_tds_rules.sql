alter table if exists public.hrm_payroll_profiles
  add column if not exists tds_enabled boolean not null default false,
  add column if not exists tds_value numeric(12,2) not null default 0;

alter table if exists public.hrm_payroll_items
  add column if not exists tds_employee_deduction numeric(12,2) not null default 0,
  add column if not exists tds_employer_deduction numeric(12,2) not null default 0,
  add column if not exists total_tds_deduction numeric(12,2) not null default 0;

update public.hrm_payroll_items
set
  tds_employee_deduction = case
    when coalesce(tds_employee_deduction, 0) = 0 then coalesce(tds_deduction, 0)
    else tds_employee_deduction
  end,
  tds_employer_deduction = case
    when coalesce(tds_employer_deduction, 0) = 0 then coalesce(tds_deduction, 0)
    else tds_employer_deduction
  end,
  total_tds_deduction = case
    when coalesce(total_tds_deduction, 0) = 0 then coalesce(tds_deduction, 0) * 2
    else total_tds_deduction
  end;

alter table if exists public.hrm_payroll_profiles
  drop column if exists payroll_company_override,
  drop column if exists pf_employer_enabled,
  drop column if exists pf_employer_mode,
  drop column if exists pf_employer_value;

alter table if exists public.hrm_payroll_items
  drop column if exists pf_employer_contribution;

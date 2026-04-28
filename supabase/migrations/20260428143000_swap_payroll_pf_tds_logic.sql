do $$
declare
  has_tds_mode boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hrm_payroll_profiles'
      and column_name = 'tds_mode'
  ) into has_tds_mode;

  if not has_tds_mode then
    alter table public.hrm_payroll_profiles
      add column tds_mode text not null default 'percent'
        check (tds_mode = any (array['percent', 'fixed']));

    update public.hrm_payroll_profiles
    set
      pf_enabled = coalesce(tds_enabled, false),
      pf_mode = 'fixed',
      pf_value = coalesce(tds_value, 0),
      tds_enabled = coalesce(pf_enabled, false),
      tds_mode = coalesce(pf_mode, 'percent'),
      tds_value = coalesce(pf_value, 0),
      updated_at = timezone('utc', now());
  end if;
end
$$;

do $$
declare
  has_pf_employer_deduction boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hrm_payroll_items'
      and column_name = 'pf_employer_deduction'
  ) into has_pf_employer_deduction;

  if not has_pf_employer_deduction then
    alter table public.hrm_payroll_items
      add column pf_employer_deduction numeric(12,2) not null default 0,
      add column total_pf_deduction numeric(12,2) not null default 0;

    update public.hrm_payroll_items
    set
      pf_employee_deduction = coalesce(tds_employee_deduction, tds_deduction, 0),
      pf_employer_deduction = coalesce(tds_employer_deduction, tds_deduction, 0),
      total_pf_deduction = coalesce(total_tds_deduction, coalesce(tds_deduction, 0) * 2),
      tds_employee_deduction = coalesce(pf_employee_deduction, 0),
      tds_employer_deduction = 0,
      total_tds_deduction = coalesce(pf_employee_deduction, 0),
      tds_deduction = coalesce(pf_employee_deduction, 0),
      updated_at = timezone('utc', now());
  end if;
end
$$;


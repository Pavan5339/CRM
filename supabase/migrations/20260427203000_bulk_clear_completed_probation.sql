update public.hrm_employees
set current_stage = 'none'
where current_stage = 'probation'
  and date_of_joining is not null
  and (date_of_joining + interval '180 days')::date < current_date
  and coalesce(employment_lifecycle_status, 'active') in ('active', 'inactive');

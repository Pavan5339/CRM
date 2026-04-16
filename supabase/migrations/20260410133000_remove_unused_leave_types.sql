with leave_types_to_remove as (
  select id
  from public.hrm_leave_types
  where name in ('Annual Leave', 'Maternity/Paternity')
)
delete from public.hrm_leave_balances
where leave_type_id in (select id from leave_types_to_remove);

with leave_types_to_remove as (
  select id
  from public.hrm_leave_types
  where name in ('Annual Leave', 'Maternity/Paternity')
)
delete from public.hrm_leave_types
where id in (select id from leave_types_to_remove);

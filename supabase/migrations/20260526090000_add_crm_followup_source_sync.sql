alter table public.crm_followups
  add column if not exists source_project_ref text,
  add column if not exists source_table text,
  add column if not exists source_row_id text,
  add column if not exists source_payload jsonb not null default '{}'::jsonb,
  add column if not exists last_synced_at timestamp with time zone;

alter table public.crm_leads
  add column if not exists source_project_ref text,
  add column if not exists source_table text,
  add column if not exists source_row_id text,
  add column if not exists source_payload jsonb not null default '{}'::jsonb,
  add column if not exists last_synced_at timestamp with time zone;

create unique index if not exists crm_followups_source_identity_idx
  on public.crm_followups (source_project_ref, source_table, source_row_id);

create unique index if not exists crm_leads_source_identity_idx
  on public.crm_leads (source_project_ref, source_table, source_row_id);

create index if not exists crm_followups_last_synced_at_idx
  on public.crm_followups (last_synced_at);

create index if not exists crm_leads_last_synced_at_idx
  on public.crm_leads (last_synced_at);

-- ============================================================
-- Cron Jobs Restore Script
-- Generated from: jhcofiavruoctvaouagu (old project)
-- Run this on your NEW Supabase project via SQL Editor
-- ============================================================
-- IMPORTANT: Make sure pg_cron and pg_net extensions are enabled
--            before running this script.
-- ============================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- Job 1: Cleanup expired employee sessions (every 15 minutes)
-- ============================================================
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '*/15 * * * *',
  $$select public.cleanup_expired_employee_sessions();$$
);

-- ============================================================
-- Job 2: Email dispatcher via Edge Function (every minute)
-- NOTE: Update vault secrets on the new project first!
--       Required secrets: project_url, dispatcher_shared_secret,
--       brevo_api_key, brevo_from_email, brevo_from_name, app_base_url
-- ============================================================
SELECT cron.schedule(
  'email-dispatcher',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/email-dispatcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'dispatcher_shared_secret')
    ),
    body := jsonb_build_object(
      'source', 'pg_cron',
      'timestamp', timezone('utc'::text, now()),
      'email_notifications_enabled', true,
      'brevo_api_key', (select decrypted_secret from vault.decrypted_secrets where name = 'brevo_api_key'),
      'brevo_from_email', (select decrypted_secret from vault.decrypted_secrets where name = 'brevo_from_email'),
      'brevo_from_name', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'brevo_from_name'), 'TaskFlow'),
      'app_base_url', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'app_base_url'), '')
    ),
    timeout_milliseconds := 10000
  );
  $$
);

-- ============================================================
-- Job 3: Process repeating tasks (every hour)
-- ============================================================
SELECT cron.schedule(
  'process-repeating-tasks',
  '0 * * * *',
  $$ select public.process_repeating_tasks(); $$
);

-- ============================================================
-- Job 4: Import CRM followups from source Supabase project
-- NOTE: Update vault secrets on the new project first!
--       Required secrets: project_url, sync_shared_secret
--       Required Edge Function secrets:
--       SOURCE_SUPABASE_URL, SOURCE_SUPABASE_SERVICE_ROLE_KEY,
--       SOURCE_PROJECT_REF, SYNC_SHARED_SECRET
-- ============================================================
SELECT cron.schedule(
  'sync-followups',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/sync-followups',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'sync_shared_secret')
    ),
    body := jsonb_build_object(
      'source', 'pg_cron',
      'timestamp', timezone('utc'::text, now())
    ),
    timeout_milliseconds := 30000
  );
  $$
);

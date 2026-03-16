do $$
begin
  if exists (select 1 from cron.job where jobname = 'dispatch_email_outbox_every_minute') then
    perform cron.unschedule('dispatch_email_outbox_every_minute');
  end if;
end
$$;

select cron.schedule(
  'dispatch_email_outbox_every_minute',
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

select jobid, jobname, schedule, active from cron.job order by jobid;

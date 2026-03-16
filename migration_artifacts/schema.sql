--
-- PostgreSQL database dump
--

\restrict NOOiWNevxR7IeytP7enj6ZjiRh90ccv5ybzpUq4CKDDk4lPi2tWLVrU61MtY6Py

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- public already exists in the target Supabase project
-- CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

-- COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: _apply_employee_task_status_delta(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._apply_employee_task_status_delta(p_employee_id uuid, p_old_status text, p_new_status text) RETURNS void
    LANGUAGE sql
    AS $$
  update public.employees
  set
    pending_tasks = greatest(
      0,
      coalesce(pending_tasks, 0)
      + case when p_new_status = 'pending' then 1 else 0 end
      - case when p_old_status = 'pending' then 1 else 0 end
    ),
    in_progress_tasks = greatest(
      0,
      coalesce(in_progress_tasks, 0)
      + case when p_new_status = 'in_progress' then 1 else 0 end
      - case when p_old_status = 'in_progress' then 1 else 0 end
    ),
    completed_tasks = greatest(
      0,
      coalesce(completed_tasks, 0)
      + case when p_new_status = 'completed' then 1 else 0 end
      - case when p_old_status = 'completed' then 1 else 0 end
    ),
    updated_at = now()
  where id = p_employee_id;
$$;


--
-- Name: chat_current_actor_key(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.chat_current_actor_key() RETURNS text
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  uid uuid;
  employee_uuid uuid;
begin
  uid := auth.uid();

  if uid is null then
    return null;
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id = uid and p.role = 'admin'
  ) then
    return 'admin:' || uid::text;
  end if;

  select e.id into employee_uuid
  from public.employees e
  where e.auth_user_id = uid
  limit 1;

  if employee_uuid is not null then
    return 'employee:' || employee_uuid::text;
  end if;

  return null;
end;
$$;


--
-- Name: chat_touch_thread_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.chat_touch_thread_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: chat_update_thread_last_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.chat_update_thread_last_message() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update public.chat_threads
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.thread_id;

  return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: email_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_outbox (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    recipient_email text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    scheduled_for timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    last_error text,
    sent_at timestamp with time zone,
    locked_at timestamp with time zone,
    dedupe_key text NOT NULL,
    provider_message_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT email_outbox_event_type_check CHECK ((event_type = ANY (ARRAY['employee_created'::text, 'task_assigned'::text, 'task_due'::text]))),
    CONSTRAINT email_outbox_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text])))
);


--
-- Name: claim_email_outbox_jobs(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_email_outbox_jobs(p_limit integer DEFAULT 25) RETURNS SETOF public.email_outbox
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  return query
  with candidates as (
    select eo.id
    from public.email_outbox eo
    where eo.status = 'pending'
      and eo.scheduled_for <= timezone('utc'::text, now())
      and (eo.locked_at is null or eo.locked_at < timezone('utc'::text, now()) - interval '10 minutes')
    order by eo.scheduled_for asc, eo.created_at asc
    for update skip locked
    limit greatest(p_limit, 1)
  ),
  claimed as (
    update public.email_outbox eo
    set
      status = 'processing',
      locked_at = timezone('utc'::text, now()),
      attempt_count = eo.attempt_count + 1
    where eo.id in (select c.id from candidates c)
    returning eo.*
  )
  select * from claimed;
end;
$$;


--
-- Name: cleanup_expired_employee_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_employee_sessions() RETURNS void
    LANGUAGE sql
    AS $$
  delete from public.employee_sessions
  where expires_at <= now();
$$;


--
-- Name: enqueue_due_task_emails(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enqueue_due_task_emails() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_inserted int := 0;
begin
  with due_candidates as (
    select
      t.id as task_id,
      t.task_name,
      coalesce(t.description, '') as task_description,
      coalesce(t.priority, 'medium') as priority,
      t.due_date,
      e.id as employee_id,
      coalesce(e.name, 'Employee') as employee_name,
      lower(e.email) as recipient_email,
      concat(
        'task_due:',
        t.id::text,
        ':',
        e.id::text,
        ':',
        extract(epoch from t.due_date)::bigint::text
      ) as dedupe_key
    from public.tasks t
    join public.task_assignments ta on ta.task_id = t.id
    join public.employees e on e.id = ta.employee_id
    where t.due_date is not null
      and t.due_date <= timezone('utc'::text, now())
      and t.status <> 'completed'
      and coalesce(e.email, '') <> ''
  ),
  inserted as (
    insert into public.email_outbox (
      event_type,
      recipient_email,
      payload,
      dedupe_key
    )
    select
      'task_due',
      due_candidates.recipient_email,
      jsonb_build_object(
        'task_id', due_candidates.task_id,
        'task_name', due_candidates.task_name,
        'task_description', due_candidates.task_description,
        'priority', due_candidates.priority,
        'due_date', due_candidates.due_date,
        'employee_id', due_candidates.employee_id,
        'employee_name', due_candidates.employee_name
      ),
      due_candidates.dedupe_key
    from due_candidates
    on conflict (dedupe_key) do nothing
    returning 1
  )
  select count(*)::int into v_inserted from inserted;

  return coalesce(v_inserted, 0);
end;
$$;


--
-- Name: enqueue_task_assignment_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enqueue_task_assignment_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_task record;
  v_employee record;
  v_due_epoch bigint;
begin
  select
    t.id,
    t.task_name,
    t.description,
    t.priority,
    t.due_date
  into v_task
  from public.tasks t
  where t.id = new.task_id;

  select
    e.id,
    e.name,
    e.email
  into v_employee
  from public.employees e
  where e.id = new.employee_id;

  if v_task.id is null or v_employee.id is null or coalesce(v_employee.email, '') = '' then
    return new;
  end if;

  v_due_epoch := case
    when v_task.due_date is null then 0
    else extract(epoch from v_task.due_date)::bigint
  end;

  insert into public.email_outbox (
    event_type,
    recipient_email,
    payload,
    dedupe_key
  )
  values (
    'task_assigned',
    lower(v_employee.email),
    jsonb_build_object(
      'task_id', v_task.id,
      'task_name', v_task.task_name,
      'task_description', coalesce(v_task.description, ''),
      'priority', coalesce(v_task.priority, 'medium'),
      'due_date', v_task.due_date,
      'employee_id', v_employee.id,
      'employee_name', coalesce(v_employee.name, 'Employee')
    ),
    concat(
      'task_assigned:',
      v_task.id::text,
      ':',
      v_employee.id::text,
      ':',
      coalesce(extract(epoch from new.assigned_at)::bigint, 0)::text,
      ':',
      v_due_epoch::text
    )
  )
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;


--
-- Name: handle_task_assignment_counter_delta(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_task_assignment_counter_delta() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_old_status text;
  v_new_status text;
begin
  if tg_op = 'INSERT' then
    select status into v_new_status
    from public.tasks
    where id = new.task_id;

    perform public._apply_employee_task_status_delta(new.employee_id, null, v_new_status);
    return null;
  end if;

  if tg_op = 'DELETE' then
    select status into v_old_status
    from public.tasks
    where id = old.task_id;

    perform public._apply_employee_task_status_delta(old.employee_id, v_old_status, null);
    return null;
  end if;

  if old.employee_id is distinct from new.employee_id
     or old.task_id is distinct from new.task_id then
    select status into v_old_status
    from public.tasks
    where id = old.task_id;

    select status into v_new_status
    from public.tasks
    where id = new.task_id;

    perform public._apply_employee_task_status_delta(old.employee_id, v_old_status, null);
    perform public._apply_employee_task_status_delta(new.employee_id, null, v_new_status);
  end if;

  return null;
end;
$$;


--
-- Name: handle_task_comments_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_task_comments_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: handle_task_delete_counter_delta(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_task_delete_counter_delta() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  update public.employees e
  set
    pending_tasks = greatest(
      0,
      coalesce(e.pending_tasks, 0)
      - case when old.status = 'pending' then a.cnt else 0 end
    ),
    in_progress_tasks = greatest(
      0,
      coalesce(e.in_progress_tasks, 0)
      - case when old.status = 'in_progress' then a.cnt else 0 end
    ),
    completed_tasks = greatest(
      0,
      coalesce(e.completed_tasks, 0)
      - case when old.status = 'completed' then a.cnt else 0 end
    ),
    updated_at = now()
  from (
    select employee_id, count(*)::int as cnt
    from public.task_assignments
    where task_id = old.id
    group by employee_id
  ) a
  where e.id = a.employee_id;

  return old;
end;
$$;


--
-- Name: handle_task_status_counter_delta(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_task_status_counter_delta() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if old.status is not distinct from new.status then
    return null;
  end if;

  update public.employees e
  set
    pending_tasks = greatest(
      0,
      coalesce(e.pending_tasks, 0)
      + case when new.status = 'pending' then a.cnt else 0 end
      - case when old.status = 'pending' then a.cnt else 0 end
    ),
    in_progress_tasks = greatest(
      0,
      coalesce(e.in_progress_tasks, 0)
      + case when new.status = 'in_progress' then a.cnt else 0 end
      - case when old.status = 'in_progress' then a.cnt else 0 end
    ),
    completed_tasks = greatest(
      0,
      coalesce(e.completed_tasks, 0)
      + case when new.status = 'completed' then a.cnt else 0 end
      - case when old.status = 'completed' then a.cnt else 0 end
    ),
    updated_at = now()
  from (
    select employee_id, count(*)::int as cnt
    from public.task_assignments
    where task_id = new.id
    group by employee_id
  ) a
  where e.id = a.employee_id;

  return null;
end;
$$;


--
-- Name: handle_task_subtasks_status_sync(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_task_subtasks_status_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_task_id uuid;
  v_total_subtasks int;
  v_completed_subtasks int;
  v_next_status text;
begin
  if tg_op = 'UPDATE'
     and new.task_id is not distinct from old.task_id
     and new.is_completed is not distinct from old.is_completed then
    return null;
  end if;

  v_task_id := coalesce(new.task_id, old.task_id);

  if v_task_id is null then
    return null;
  end if;

  select
    count(*)::int,
    count(*) filter (where is_completed = true)::int
  into v_total_subtasks, v_completed_subtasks
  from public.task_subtasks
  where task_id = v_task_id;

  -- Preserve existing behavior: if no subtasks exist, do not force status.
  if v_total_subtasks <= 0 then
    return null;
  end if;

  if v_completed_subtasks = v_total_subtasks then
    v_next_status := 'completed';
  else
    v_next_status := 'in_progress';
  end if;

  update public.tasks
  set
    status = v_next_status,
    updated_at = now()
  where id = v_task_id
    and status is distinct from v_next_status;

  return null;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    SET row_security TO 'off'
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;


--
-- Name: mark_email_outbox_failure(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_email_outbox_failure(p_id uuid, p_error text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update public.email_outbox
  set
    status = case
      when attempt_count >= 4 then 'failed'
      else 'pending'
    end,
    scheduled_for = case
      when attempt_count >= 4 then timezone('utc'::text, now())
      when attempt_count = 1 then timezone('utc'::text, now()) + interval '2 minutes'
      when attempt_count = 2 then timezone('utc'::text, now()) + interval '10 minutes'
      else timezone('utc'::text, now()) + interval '30 minutes'
    end,
    last_error = left(coalesce(p_error, 'Unknown provider error'), 1200),
    locked_at = null
  where id = p_id;
end;
$$;


--
-- Name: mark_email_outbox_success(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_email_outbox_success(p_id uuid, p_provider_message_id text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update public.email_outbox
  set
    status = 'sent',
    sent_at = timezone('utc'::text, now()),
    last_error = null,
    locked_at = null,
    provider_message_id = p_provider_message_id,
    payload = case
      when event_type = 'employee_created' then payload - 'temp_password'
      else payload
    end
  where id = p_id;
end;
$$;


--
-- Name: set_email_outbox_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_email_outbox_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_id uuid NOT NULL,
    sender_key text NOT NULL,
    sender_name text NOT NULL,
    sender_avatar_url text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT chat_messages_content_check CHECK ((length(btrim(content)) > 0))
);


--
-- Name: chat_thread_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_thread_members (
    thread_id uuid NOT NULL,
    member_key text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    last_read_at timestamp with time zone
);


--
-- Name: chat_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_type text DEFAULT 'dm'::text NOT NULL,
    participant_a_key text NOT NULL,
    participant_b_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_message_at timestamp with time zone,
    CONSTRAINT chat_threads_dm_pair_order CHECK ((participant_a_key < participant_b_key)),
    CONSTRAINT chat_threads_thread_type_check CHECK ((thread_type = 'dm'::text))
);


--
-- Name: employee_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id text NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    email text,
    role text NOT NULL,
    password_hash text NOT NULL,
    profile_picture_url text,
    pending_tasks integer DEFAULT 0,
    in_progress_tasks integer DEFAULT 0,
    completed_tasks integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    must_change_password boolean DEFAULT false NOT NULL,
    password_set_at timestamp with time zone,
    auth_user_id uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'employee'::text NOT NULL,
    full_name text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'employee'::text])))
);


--
-- Name: task_assignment_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_assignment_activity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    subtask_id uuid,
    entity_type text NOT NULL,
    action text NOT NULL,
    assigned_by_actor_type text NOT NULL,
    assigned_by_admin_user_id uuid,
    assigned_by_employee_id uuid,
    from_employee_id uuid,
    to_employee_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT task_assignment_activity_action_check CHECK ((action = ANY (ARRAY['assigned'::text, 'reassigned'::text, 'unassigned'::text]))),
    CONSTRAINT task_assignment_activity_actor_identity_check CHECK ((((assigned_by_actor_type = 'admin'::text) AND (assigned_by_admin_user_id IS NOT NULL) AND (assigned_by_employee_id IS NULL)) OR ((assigned_by_actor_type = 'employee'::text) AND (assigned_by_employee_id IS NOT NULL) AND (assigned_by_admin_user_id IS NULL)))),
    CONSTRAINT task_assignment_activity_actor_type_check CHECK ((assigned_by_actor_type = ANY (ARRAY['admin'::text, 'employee'::text]))),
    CONSTRAINT task_assignment_activity_entity_subtask_check CHECK ((((entity_type = 'task'::text) AND (subtask_id IS NULL)) OR ((entity_type = 'subtask'::text) AND (subtask_id IS NOT NULL)))),
    CONSTRAINT task_assignment_activity_entity_type_check CHECK ((entity_type = ANY (ARRAY['task'::text, 'subtask'::text])))
);


--
-- Name: task_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    employee_id uuid,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


--
-- Name: task_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    file_path text
);


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    author_type text NOT NULL,
    author_name text NOT NULL,
    author_avatar_url text,
    employee_id uuid,
    profile_id uuid,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT task_comments_author_type_check CHECK ((author_type = ANY (ARRAY['admin'::text, 'employee'::text]))),
    CONSTRAINT task_comments_comment_text_not_blank CHECK ((length(btrim(comment_text)) > 0))
);


--
-- Name: task_subtasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_subtasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    title text NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    assigned_employee_id uuid
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_name text NOT NULL,
    description text,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'pending'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    due_date timestamp with time zone,
    progress_percentage integer DEFAULT 0 NOT NULL,
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT tasks_progress_percentage_range CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text,
    rollback text[]
);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_thread_members chat_thread_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_thread_members
    ADD CONSTRAINT chat_thread_members_pkey PRIMARY KEY (thread_id, member_key);


--
-- Name: chat_threads chat_threads_dm_pair_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_dm_pair_unique UNIQUE (thread_type, participant_a_key, participant_b_key);


--
-- Name: chat_threads chat_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_pkey PRIMARY KEY (id);


--
-- Name: email_outbox email_outbox_dedupe_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_outbox
    ADD CONSTRAINT email_outbox_dedupe_key_key UNIQUE (dedupe_key);


--
-- Name: email_outbox email_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_outbox
    ADD CONSTRAINT email_outbox_pkey PRIMARY KEY (id);


--
-- Name: employee_sessions employee_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_sessions
    ADD CONSTRAINT employee_sessions_pkey PRIMARY KEY (id);


--
-- Name: employee_sessions employee_sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_sessions
    ADD CONSTRAINT employee_sessions_token_key UNIQUE (token);


--
-- Name: employees employees_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_id_key UNIQUE (employee_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_username_key UNIQUE (username);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: task_assignment_activity task_assignment_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_pkey PRIMARY KEY (id);


--
-- Name: task_assignments task_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_pkey PRIMARY KEY (id);


--
-- Name: task_assignments task_assignments_task_id_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_task_id_employee_id_key UNIQUE (task_id, employee_id);


--
-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: task_subtasks task_subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_subtasks
    ADD CONSTRAINT task_subtasks_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: idx_chat_messages_thread_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_thread_created ON public.chat_messages USING btree (thread_id, created_at DESC);


--
-- Name: idx_chat_thread_members_member_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_thread_members_member_key ON public.chat_thread_members USING btree (member_key);


--
-- Name: idx_chat_threads_last_message_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_threads_last_message_at ON public.chat_threads USING btree (last_message_at DESC NULLS LAST, updated_at DESC);


--
-- Name: idx_email_outbox_event_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_outbox_event_status ON public.email_outbox USING btree (event_type, status);


--
-- Name: idx_email_outbox_locked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_outbox_locked_at ON public.email_outbox USING btree (locked_at);


--
-- Name: idx_email_outbox_status_schedule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_outbox_status_schedule ON public.email_outbox USING btree (status, scheduled_for);


--
-- Name: idx_employee_sessions_employee_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_sessions_employee_expires ON public.employee_sessions USING btree (employee_id, expires_at DESC);


--
-- Name: idx_employee_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_sessions_expires_at ON public.employee_sessions USING btree (expires_at);


--
-- Name: idx_employees_auth_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_employees_auth_user_id ON public.employees USING btree (auth_user_id) WHERE (auth_user_id IS NOT NULL);


--
-- Name: idx_task_assignment_activity_subtask_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_assignment_activity_subtask_created_at ON public.task_assignment_activity USING btree (subtask_id, created_at DESC);


--
-- Name: idx_task_assignment_activity_task_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_assignment_activity_task_created_at ON public.task_assignment_activity USING btree (task_id, created_at DESC);


--
-- Name: idx_task_assignments_employee_assigned_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_assignments_employee_assigned_at ON public.task_assignments USING btree (employee_id, assigned_at DESC);


--
-- Name: idx_task_assignments_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_assignments_task_id ON public.task_assignments USING btree (task_id);


--
-- Name: idx_task_attachments_task_uploaded; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_attachments_task_uploaded ON public.task_attachments USING btree (task_id, uploaded_at DESC);


--
-- Name: idx_task_comments_task_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_comments_task_created ON public.task_comments USING btree (task_id, created_at);


--
-- Name: idx_task_subtasks_assigned_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_subtasks_assigned_employee_id ON public.task_subtasks USING btree (assigned_employee_id);


--
-- Name: idx_task_subtasks_task_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_subtasks_task_created ON public.task_subtasks USING btree (task_id, created_at);


--
-- Name: idx_tasks_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- Name: idx_tasks_status_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_status_created_at ON public.tasks USING btree (status, created_at DESC);


--
-- Name: chat_messages trg_chat_messages_thread_last_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_chat_messages_thread_last_message AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.chat_update_thread_last_message();


--
-- Name: chat_threads trg_chat_threads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_chat_threads_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.chat_touch_thread_updated_at();


--
-- Name: email_outbox trg_email_outbox_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_email_outbox_updated_at BEFORE UPDATE ON public.email_outbox FOR EACH ROW EXECUTE FUNCTION public.set_email_outbox_updated_at();


--
-- Name: task_assignments trg_task_assignment_counter_delta; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_task_assignment_counter_delta AFTER INSERT OR DELETE OR UPDATE ON public.task_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_task_assignment_counter_delta();


--
-- Name: task_assignments trg_task_assignment_email_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_task_assignment_email_outbox AFTER INSERT ON public.task_assignments FOR EACH ROW EXECUTE FUNCTION public.enqueue_task_assignment_email();


--
-- Name: task_comments trg_task_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.handle_task_comments_updated_at();


--
-- Name: tasks trg_task_delete_counter_delta; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_task_delete_counter_delta BEFORE DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_task_delete_counter_delta();


--
-- Name: tasks trg_task_status_counter_delta; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_task_status_counter_delta AFTER UPDATE OF status ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_task_status_counter_delta();


--
-- Name: task_subtasks trg_task_subtasks_status_sync; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_task_subtasks_status_sync AFTER INSERT OR DELETE OR UPDATE ON public.task_subtasks FOR EACH ROW EXECUTE FUNCTION public.handle_task_subtasks_status_sync();


--
-- Name: employees update_employees_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_messages chat_messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE;


--
-- Name: chat_thread_members chat_thread_members_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_thread_members
    ADD CONSTRAINT chat_thread_members_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE;


--
-- Name: employee_sessions employee_sessions_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_sessions
    ADD CONSTRAINT employee_sessions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees employees_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: task_assignment_activity task_assignment_activity_assigned_by_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_assigned_by_admin_user_id_fkey FOREIGN KEY (assigned_by_admin_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: task_assignment_activity task_assignment_activity_assigned_by_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_assigned_by_employee_id_fkey FOREIGN KEY (assigned_by_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: task_assignment_activity task_assignment_activity_from_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_from_employee_id_fkey FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: task_assignment_activity task_assignment_activity_subtask_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_subtask_id_fkey FOREIGN KEY (subtask_id) REFERENCES public.task_subtasks(id) ON DELETE SET NULL;


--
-- Name: task_assignment_activity task_assignment_activity_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_assignment_activity task_assignment_activity_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignment_activity
    ADD CONSTRAINT task_assignment_activity_to_employee_id_fkey FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: task_assignments task_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: task_assignments task_assignments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_attachments task_attachments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: task_comments task_comments_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_subtasks task_subtasks_assigned_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_subtasks
    ADD CONSTRAINT task_subtasks_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: task_subtasks task_subtasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_subtasks
    ADD CONSTRAINT task_subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: task_comments Admin can delete task comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can delete task comments" ON public.task_comments FOR DELETE USING (public.is_admin());


--
-- Name: task_subtasks Admin can delete task subtasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can delete task subtasks" ON public.task_subtasks FOR DELETE USING (public.is_admin());


--
-- Name: tasks Admin can delete tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can delete tasks" ON public.tasks FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: task_comments Admin can insert task comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert task comments" ON public.task_comments FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: task_subtasks Admin can insert task subtasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert task subtasks" ON public.task_subtasks FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: tasks Admin can insert tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert tasks" ON public.tasks FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: task_attachments Admin can manage attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage attachments" ON public.task_attachments USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: task_assignments Admin can manage task assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage task assignments" ON public.task_assignments USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: task_comments Admin can update task comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update task comments" ON public.task_comments FOR UPDATE USING (public.is_admin());


--
-- Name: task_subtasks Admin can update task subtasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update task subtasks" ON public.task_subtasks FOR UPDATE USING (public.is_admin());


--
-- Name: tasks Admin can update tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update tasks" ON public.tasks FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: profiles Admins can update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());


--
-- Name: employees Allow authenticated users to delete employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to delete employees" ON public.employees FOR DELETE TO authenticated USING (true);


--
-- Name: employees Allow authenticated users to insert employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: employees Allow authenticated users to read employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to read employees" ON public.employees FOR SELECT TO authenticated USING (true);


--
-- Name: employees Allow authenticated users to update employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to update employees" ON public.employees FOR UPDATE TO authenticated USING (true);


--
-- Name: task_attachments Anyone can view attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view attachments" ON public.task_attachments FOR SELECT USING (true);


--
-- Name: task_assignments Anyone can view task assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view task assignments" ON public.task_assignments FOR SELECT USING (true);


--
-- Name: task_comments Anyone can view task comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view task comments" ON public.task_comments FOR SELECT USING (true);


--
-- Name: task_subtasks Anyone can view task subtasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view task subtasks" ON public.task_subtasks FOR SELECT USING (true);


--
-- Name: tasks Anyone can view tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK (((auth.uid() = id) AND (role = ( SELECT p.role
   FROM public.profiles p
  WHERE (p.id = auth.uid())))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages chat_messages_insert_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_messages_insert_self ON public.chat_messages FOR INSERT WITH CHECK (((sender_key = public.chat_current_actor_key()) AND (EXISTS ( SELECT 1
   FROM public.chat_thread_members tm
  WHERE ((tm.thread_id = chat_messages.thread_id) AND (tm.member_key = public.chat_current_actor_key()))))));


--
-- Name: chat_messages chat_messages_select_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_messages_select_members ON public.chat_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chat_thread_members tm
  WHERE ((tm.thread_id = chat_messages.thread_id) AND (tm.member_key = public.chat_current_actor_key())))));


--
-- Name: chat_thread_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_thread_members ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_thread_members chat_thread_members_select_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_thread_members_select_self ON public.chat_thread_members FOR SELECT USING ((member_key = public.chat_current_actor_key()));


--
-- Name: chat_thread_members chat_thread_members_update_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_thread_members_update_self ON public.chat_thread_members FOR UPDATE USING ((member_key = public.chat_current_actor_key())) WITH CHECK ((member_key = public.chat_current_actor_key()));


--
-- Name: chat_threads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_threads chat_threads_select_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_threads_select_members ON public.chat_threads FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chat_thread_members tm
  WHERE ((tm.thread_id = chat_threads.id) AND (tm.member_key = public.chat_current_actor_key())))));


--
-- Name: employee_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: task_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: task_attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: task_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: task_subtasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict NOOiWNevxR7IeytP7enj6ZjiRh90ccv5ybzpUq4CKDDk4lPi2tWLVrU61MtY6Py

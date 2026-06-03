import { createClient } from 'npm:@supabase/supabase-js@2';

type ImportMode = 'metadata' | 'preview' | 'import';
type SourceRow = Record<string, unknown>;

type SourceTableName =
  | 'registration_partner_profiles'
  | 'partner_ai_profiles'
  | 'partner_onboarding_progress'
  | 'service_enquiry_form'
  | 'cta_form_requests'
  | 'voice_requirements';

type SourceTableConfig = {
  name: SourceTableName;
  label: string;
  sourceType: string;
  primaryKey: string;
  orderBy: string[];
  description: string;
  targetTables: string[];
  requiredColumns: string[];
  defaultColumns: string[];
  columns: Array<{ name: string; type: string; nullable: boolean }>;
};

type TableRequest = {
  name: SourceTableName;
  limit: number;
  offset: number;
  columns: string[];
};

const CURRENT_SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const CURRENT_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SOURCE_SUPABASE_URL = Deno.env.get('SOURCE_SUPABASE_URL') ?? '';
const SOURCE_SERVICE_ROLE_KEY = Deno.env.get('SOURCE_SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SOURCE_PROJECT_REF = Deno.env.get('SOURCE_PROJECT_REF') ?? getProjectRef(SOURCE_SUPABASE_URL);
const SYNC_SHARED_SECRET = Deno.env.get('SYNC_SHARED_SECRET') ?? '';
const DEFAULT_ASSIGNEE_ID = Deno.env.get('SYNC_DEFAULT_ASSIGNEE_ID') ?? 'u1';
const MAX_SOURCE_LIMIT = 500;
const DEFAULT_SOURCE_LIMIT = clampLimit(Number(Deno.env.get('SYNC_SOURCE_LIMIT') ?? '25'));

const SOURCE_TABLES: SourceTableConfig[] = [
  {
    name: 'registration_partner_profiles',
    label: 'Partner registrations',
    sourceType: 'Partner Registration',
    primaryKey: 'id',
    orderBy: ['updated_at', 'registered_at', 'created_at', 'id'],
    description: 'Partner account records with contact, status, location, and agreement details.',
    targetTables: ['crm_leads', 'crm_followups'],
    requiredColumns: ['id'],
    defaultColumns: ['first_name', 'last_name', 'email', 'phone', 'country', 'city', 'status', 'notes', 'registered_at', 'agreement_signed'],
    columns: [
      { name: 'id', type: 'uuid', nullable: false },
      { name: 'first_name', type: 'text', nullable: false },
      { name: 'last_name', type: 'text', nullable: false },
      { name: 'email', type: 'text', nullable: false },
      { name: 'phone', type: 'text', nullable: true },
      { name: 'country_code', type: 'text', nullable: true },
      { name: 'country', type: 'text', nullable: true },
      { name: 'city', type: 'text', nullable: true },
      { name: 'status', type: 'text', nullable: false },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'registered_at', type: 'timestamptz', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
      { name: 'agreement_signed', type: 'boolean', nullable: false },
      { name: 'agreement_signed_name', type: 'text', nullable: true },
      { name: 'agreement_signed_at', type: 'timestamptz', nullable: true },
    ],
  },
  {
    name: 'partner_ai_profiles',
    label: 'Partner AI profiles',
    sourceType: 'AI Profile',
    primaryKey: 'id',
    orderBy: ['updated_at', 'created_at', 'id'],
    description: 'AI-collected profile data, services, industries, experience, and organisation information.',
    targetTables: ['crm_leads', 'crm_followups'],
    requiredColumns: ['id'],
    defaultColumns: ['partner_id', 'partner_email', 'partner_type', 'services', 'industries', 'experience_years', 'organisation_name', 'bio', 'created_at'],
    columns: [
      { name: 'id', type: 'bigint', nullable: false },
      { name: 'partner_id', type: 'uuid', nullable: true },
      { name: 'partner_email', type: 'text', nullable: false },
      { name: 'partner_type', type: 'text', nullable: true },
      { name: 'services', type: 'text', nullable: true },
      { name: 'industries', type: 'text', nullable: true },
      { name: 'experience_industries', type: 'text', nullable: true },
      { name: 'experience_years', type: 'text', nullable: true },
      { name: 'organisation_name', type: 'text', nullable: true },
      { name: 'bio', type: 'text', nullable: true },
      { name: 'experience_details', type: 'jsonb', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
    ],
  },
  {
    name: 'partner_onboarding_progress',
    label: 'Partner onboarding progress',
    sourceType: 'Partner Onboarding',
    primaryKey: 'partner_id',
    orderBy: ['updated_at', 'ai_last_activity_at', 'created_at', 'partner_id'],
    description: 'Current onboarding step, reminders, agreement progress, and AI onboarding timestamps.',
    targetTables: ['crm_leads', 'crm_followups'],
    requiredColumns: ['partner_id'],
    defaultColumns: ['partner_id', 'partner_email', 'ai_current_step', 'ai_started_at', 'ai_last_activity_at', 'ai_completed_at', 'agreement_required', 'agreement_completed_at', 'last_reminder_stage'],
    columns: [
      { name: 'partner_id', type: 'uuid', nullable: false },
      { name: 'partner_email', type: 'text', nullable: true },
      { name: 'ai_current_step', type: 'smallint', nullable: false },
      { name: 'ai_started_at', type: 'timestamptz', nullable: true },
      { name: 'ai_last_activity_at', type: 'timestamptz', nullable: true },
      { name: 'ai_completed_at', type: 'timestamptz', nullable: true },
      { name: 'agreement_required', type: 'boolean', nullable: false },
      { name: 'agreement_completed_at', type: 'timestamptz', nullable: true },
      { name: 'last_reminder_stage', type: 'smallint', nullable: false },
      { name: 'last_reminder_sent_at', type: 'timestamptz', nullable: true },
      { name: 'reminders_stopped_at', type: 'timestamptz', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
    ],
  },
  {
    name: 'service_enquiry_form',
    label: 'Service enquiry forms',
    sourceType: 'Service Enquiry',
    primaryKey: 'id',
    orderBy: ['created_at', 'id'],
    description: 'Website service enquiries with contact details, service, country, and message.',
    targetTables: ['crm_leads', 'crm_followups'],
    requiredColumns: ['id'],
    defaultColumns: ['partner_id', 'country_label', 'service', 'form_type', 'full_name', 'email', 'phone', 'company', 'message', 'created_at'],
    columns: [
      { name: 'id', type: 'bigint', nullable: false },
      { name: 'partner_id', type: 'uuid', nullable: true },
      { name: 'country', type: 'text', nullable: true },
      { name: 'country_label', type: 'text', nullable: true },
      { name: 'service', type: 'text', nullable: true },
      { name: 'form_type', type: 'text', nullable: true },
      { name: 'full_name', type: 'text', nullable: true },
      { name: 'email', type: 'text', nullable: true },
      { name: 'phone', type: 'text', nullable: true },
      { name: 'company', type: 'text', nullable: true },
      { name: 'message', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false },
    ],
  },
  {
    name: 'cta_form_requests',
    label: 'CTA expert requests',
    sourceType: 'Expert Request',
    primaryKey: 'id',
    orderBy: ['created_at', 'id'],
    description: 'Talk-to-expert CTA submissions with requirement, framework, contact, and partner references.',
    targetTables: ['crm_leads', 'crm_followups'],
    requiredColumns: ['id'],
    defaultColumns: ['partner_id', 'partner_email', 'full_name', 'company', 'email', 'mobile', 'requirement', 'framework', 'source', 'created_at'],
    columns: [
      { name: 'id', type: 'bigint', nullable: false },
      { name: 'partner_id', type: 'uuid', nullable: true },
      { name: 'partner_email', type: 'text', nullable: true },
      { name: 'full_name', type: 'text', nullable: false },
      { name: 'company', type: 'text', nullable: true },
      { name: 'email', type: 'text', nullable: false },
      { name: 'mobile', type: 'text', nullable: false },
      { name: 'requirement', type: 'text', nullable: false },
      { name: 'framework', type: 'text', nullable: true },
      { name: 'source', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false },
    ],
  },
  {
    name: 'voice_requirements',
    label: 'Voice requirements',
    sourceType: 'Voice Requirement',
    primaryKey: 'id',
    orderBy: ['created_at', 'id'],
    description: 'Voice-submitted requirements with transcript, audio metadata, recipient, and source.',
    targetTables: ['crm_leads', 'crm_followups'],
    requiredColumns: ['id'],
    defaultColumns: ['partner_id', 'partner_email', 'requirement_text', 'recipient_email', 'source', 'created_at', 'audio_path', 'audio_mime_type', 'audio_size_bytes'],
    columns: [
      { name: 'id', type: 'bigint', nullable: false },
      { name: 'partner_id', type: 'uuid', nullable: true },
      { name: 'partner_email', type: 'text', nullable: false },
      { name: 'requirement_text', type: 'text', nullable: false },
      { name: 'recipient_email', type: 'text', nullable: false },
      { name: 'source', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'audio_bucket', type: 'text', nullable: true },
      { name: 'audio_path', type: 'text', nullable: true },
      { name: 'audio_mime_type', type: 'text', nullable: true },
      { name: 'audio_size_bytes', type: 'bigint', nullable: true },
    ],
  },
];

const SOURCE_TABLE_MAP = new Map(SOURCE_TABLES.map((source) => [source.name, source]));
const LEGACY_TABLE_ALIASES = new Map<string, SourceTableName>([
  ['service_enquiries', 'service_enquiry_form'],
]);

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getProjectRef(url: string) {
  try {
    return new URL(url).hostname.split('.')[0] || 'source';
  } catch {
    return 'source';
  }
}

function clampLimit(value: unknown) {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return 25;
  return Math.min(Math.max(Math.trunc(numericValue), 1), MAX_SOURCE_LIMIT);
}

function clampOffset(value: unknown) {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(Math.trunc(numericValue), 0);
}

function resolveTableName(value: unknown): SourceTableName | null {
  if (typeof value !== 'string') return null;
  const aliased = LEGACY_TABLE_ALIASES.get(value) ?? value;
  return SOURCE_TABLE_MAP.has(aliased as SourceTableName) ? (aliased as SourceTableName) : null;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeColumns(config: SourceTableConfig, requestedColumns: unknown) {
  const available = new Set(config.columns.map((column) => column.name));
  const requested = Array.isArray(requestedColumns)
    ? requestedColumns.filter((column): column is string => typeof column === 'string' && available.has(column))
    : config.defaultColumns;

  return unique([...config.requiredColumns, ...(requested.length ? requested : config.defaultColumns)]);
}

async function readRequestBody(req: Request) {
  if (!req.body) return {};
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function normalizeMode(body: Record<string, unknown>): ImportMode {
  return body.mode === 'metadata' || body.mode === 'preview' || body.mode === 'import' ? body.mode : 'import';
}

function normalizeTableRequests(body: Record<string, unknown>) {
  const globalLimit = body.limit === undefined ? DEFAULT_SOURCE_LIMIT : clampLimit(body.limit);
  const globalOffset = clampOffset(body.offset);
  const requestedTables = Array.isArray(body.tables) ? body.tables : [];

  if (!requestedTables.length) {
    return SOURCE_TABLES.map((config) => ({
      name: config.name,
      limit: globalLimit,
      offset: globalOffset,
      columns: normalizeColumns(config, undefined),
    }));
  }

  const normalized: TableRequest[] = [];
  for (const item of requestedTables) {
    const tableName = resolveTableName(typeof item === 'string' ? item : (item as Record<string, unknown>)?.name);
    if (!tableName) continue;
    const config = SOURCE_TABLE_MAP.get(tableName)!;
    const raw = typeof item === 'string' ? {} : (item as Record<string, unknown>);
    normalized.push({
      name: tableName,
      limit: raw.limit === undefined ? globalLimit : clampLimit(raw.limit),
      offset: raw.offset === undefined ? globalOffset : clampOffset(raw.offset),
      columns: normalizeColumns(config, raw.columns),
    });
  }

  return normalized.length ? normalized : SOURCE_TABLES.map((config) => ({
    name: config.name,
    limit: globalLimit,
    offset: globalOffset,
    columns: normalizeColumns(config, undefined),
  }));
}

function text(row: SourceRow, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  }
  return fallback;
}

function dateOnly(value: unknown) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function sourceCreatedAt(row: SourceRow) {
  return row.created_at ?? row.registered_at ?? row.updated_at ?? row.ai_last_activity_at ?? null;
}

function fullName(row: SourceRow) {
  const explicit = text(row, ['full_name', 'contact_name', 'customer_name', 'name', 'client_name', 'person_name']);
  if (explicit) return explicit;
  const first = text(row, ['first_name']);
  const last = text(row, ['last_name']);
  return `${first} ${last}`.trim();
}

function compactPayload(row: SourceRow, columns: string[]) {
  const payload: SourceRow = {};
  for (const column of columns) {
    if (Object.prototype.hasOwnProperty.call(row, column)) {
      payload[column] = row[column];
    }
  }
  return payload;
}

function truncate(value: string, maxLength = 120) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function titleFor(config: SourceTableConfig, row: SourceRow) {
  if (config.name === 'partner_onboarding_progress') {
    const step = text(row, ['ai_current_step'], '0');
    return `Partner onboarding step ${step}: ${text(row, ['partner_email'], 'unknown partner')}`;
  }

  const subject = text(row, ['service', 'requirement', 'requirement_text', 'message', 'bio', 'services', 'partner_type', 'status']);
  const contact = fullName(row) || text(row, ['email', 'partner_email'], 'unknown contact');
  return subject ? truncate(subject) : `New ${config.sourceType} from ${contact}`;
}

function notesFor(row: SourceRow, columns: string[]) {
  const lines = columns
    .filter((column) => !['id', 'partner_id'].includes(column))
    .map((column) => {
      const value = row[column];
      if (value === null || value === undefined || value === '') return '';
      return `${column}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`;
    })
    .filter(Boolean);
  return lines.slice(0, 8).join('\n');
}

function priorityFor(config: SourceTableConfig, row: SourceRow) {
  if (config.name === 'cta_form_requests' || config.name === 'voice_requirements' || config.name === 'service_enquiry_form') return 'High';
  if (config.name === 'partner_onboarding_progress' && !row.ai_completed_at) return 'Medium';
  return 'Medium';
}

function leadPayload(row: SourceRow, config: SourceTableConfig, sourceRowId: string, payload: SourceRow) {
  const contact = fullName(row) || text(row, ['email', 'partner_email'], 'Unknown contact');
  const company = text(row, ['company', 'organisation_name', 'organization', 'organisation', 'business_name'], contact);
  const createdDate = dateOnly(sourceCreatedAt(row));

  return {
    company,
    contact,
    value: text(row, ['value', 'budget', 'estimated_value'], ''),
    status: 'New',
    assignee_id: DEFAULT_ASSIGNEE_ID,
    date: createdDate,
    priority: priorityFor(config, row),
    source: config.sourceType,
    source_project_ref: SOURCE_PROJECT_REF,
    source_table: config.name,
    source_row_id: sourceRowId,
    source_payload: payload,
    last_synced_at: new Date().toISOString(),
  };
}

function followupPayload(row: SourceRow, config: SourceTableConfig, sourceRowId: string, leadId: string | null, payload: SourceRow, columns: string[]) {
  const dueDate = dateOnly(row.due_date ?? row.followup_date ?? sourceCreatedAt(row));

  return {
    lead_id: leadId,
    type: config.sourceType,
    title: titleFor(config, row),
    priority: priorityFor(config, row),
    due_date: dueDate,
    due_time: text(row, ['due_time', 'followup_time'], '-'),
    status: 'New',
    assignee_id: text(row, ['assignee_id', 'assigned_to'], DEFAULT_ASSIGNEE_ID),
    notes: notesFor(row, columns),
    source_project_ref: SOURCE_PROJECT_REF,
    source_table: config.name,
    source_row_id: sourceRowId,
    source_payload: payload,
    last_synced_at: new Date().toISOString(),
  };
}

async function countRows(source: ReturnType<typeof createClient>, table: SourceTableName) {
  const { count, error } = await source.from(table).select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

async function queryRows(source: ReturnType<typeof createClient>, request: TableRequest) {
  const config = SOURCE_TABLE_MAP.get(request.name)!;
  const selectColumns = unique([...request.columns, ...config.requiredColumns]);
  const rangeEnd = request.offset + request.limit - 1;
  let lastError: Error | null = null;

  for (const column of config.orderBy) {
    try {
      const { data, error } = await source
        .from(request.name)
        .select(selectColumns.join(','))
        .order(column, { ascending: false })
        .range(request.offset, rangeEnd);

      if (error) {
        lastError = new Error(error.message);
        continue;
      }

      return data ?? [];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Failed to fetch source rows');
    }
  }

  if (lastError) throw lastError;
  return [];
}

async function latestImported(current: ReturnType<typeof createClient>, limit = 20) {
  const sourceTables = SOURCE_TABLES.map((table) => table.name);
  const { data: followups } = await current
    .from('crm_followups')
    .select('id,title,type,status,priority,due_date,source_table,source_row_id,last_synced_at,source_payload')
    .in('source_table', sourceTables)
    .order('last_synced_at', { ascending: false })
    .limit(limit);

  const { data: leads } = await current
    .from('crm_leads')
    .select('id,company,contact,status,priority,source,source_table,source_row_id,last_synced_at,source_payload')
    .in('source_table', sourceTables)
    .order('last_synced_at', { ascending: false })
    .limit(limit);

  return { followups: followups ?? [], leads: leads ?? [] };
}

Deno.serve(async (req) => {
  if (!CURRENT_SUPABASE_URL || !CURRENT_SERVICE_ROLE_KEY) {
    return jsonResponse(500, { error: 'Missing current Supabase service configuration' });
  }

  if (!SOURCE_SUPABASE_URL || !SOURCE_SERVICE_ROLE_KEY || !SOURCE_PROJECT_REF) {
    return jsonResponse(500, { error: 'Missing source Supabase sync configuration' });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const expected = `Bearer ${SYNC_SHARED_SECRET.trim()}`;
  if (!SYNC_SHARED_SECRET.trim() || authHeader !== expected) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const body = await readRequestBody(req);
  const mode = normalizeMode(body as Record<string, unknown>);
  const tableRequests = normalizeTableRequests(body as Record<string, unknown>);

  const current = createClient(CURRENT_SUPABASE_URL, CURRENT_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const source = createClient(SOURCE_SUPABASE_URL, SOURCE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (mode === 'metadata') {
    const counts: Record<string, number> = {};
    for (const config of SOURCE_TABLES) {
      try {
        counts[config.name] = await countRows(source, config.name);
      } catch {
        counts[config.name] = 0;
      }
    }

    return jsonResponse(200, {
      success: true,
      sourceProjectRef: SOURCE_PROJECT_REF,
      targetProjectRef: getProjectRef(CURRENT_SUPABASE_URL),
      tables: SOURCE_TABLES.map((config) => ({
        ...config,
        rowCount: counts[config.name] ?? 0,
      })),
      latestImported: await latestImported(current),
    });
  }

  if (mode === 'preview') {
    const previews: Record<string, unknown> = {};
    const errors: Array<{ table: string; error: string }> = [];

    for (const request of tableRequests) {
      try {
        const rows = await queryRows(source, request);
        previews[request.name] = {
          rows,
          limit: request.limit,
          offset: request.offset,
          nextOffset: request.offset + rows.length,
          columns: request.columns,
        };
      } catch (error) {
        errors.push({ table: request.name, error: error instanceof Error ? error.message : 'Failed to preview rows' });
      }
    }

    return jsonResponse(errors.length ? 207 : 200, {
      success: errors.length === 0,
      previews,
      errors,
      latestImported: await latestImported(current),
    });
  }

  const summary = {
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ table: SourceTableName; id?: string; error: string }>,
    tables: {} as Record<string, { fetched: number; imported: number; skipped: number; offset: number; nextOffset: number; columns: string[]; rows: SourceRow[] }>,
  };

  for (const request of tableRequests) {
    const config = SOURCE_TABLE_MAP.get(request.name)!;
    let rows: SourceRow[] = [];
    summary.tables[request.name] = {
      fetched: 0,
      imported: 0,
      skipped: 0,
      offset: request.offset,
      nextOffset: request.offset,
      columns: request.columns,
      rows: [],
    };

    try {
      rows = (await queryRows(source, request)) as SourceRow[];
      summary.tables[request.name].fetched = rows.length;
      summary.tables[request.name].nextOffset = request.offset + rows.length;
    } catch (error) {
      summary.errors.push({ table: request.name, error: error instanceof Error ? error.message : 'Failed to fetch source rows' });
      continue;
    }

    for (const row of rows) {
      const rowId = text(row, [config.primaryKey]);
      if (!rowId) {
        summary.skipped += 1;
        summary.tables[request.name].skipped += 1;
        summary.errors.push({ table: request.name, error: `Skipped source row without ${config.primaryKey}` });
        continue;
      }

      try {
        const selectedPayload = compactPayload(row, request.columns);
        const lead = leadPayload(row, config, rowId, selectedPayload);
        const { data: leadRow, error: leadError } = await current
          .from('crm_leads')
          .upsert(lead, { onConflict: 'source_project_ref,source_table,source_row_id' })
          .select('id')
          .single();

        if (leadError) throw leadError;

        const followup = followupPayload(row, config, rowId, leadRow?.id ?? null, selectedPayload, request.columns);
        const { data: existingFollowup, error: existingFollowupError } = await current
          .from('crm_followups')
          .select('id')
          .eq('source_project_ref', SOURCE_PROJECT_REF)
          .eq('source_table', config.name)
          .eq('source_row_id', rowId)
          .maybeSingle();

        if (existingFollowupError) throw existingFollowupError;

        const { status: _status, assignee_id: _assigneeId, notes: _notes, ...sourceDerivedFollowup } = followup;
        const followupWrite = existingFollowup?.id
          ? current.from('crm_followups').update(sourceDerivedFollowup).eq('id', existingFollowup.id)
          : current.from('crm_followups').insert(followup);
        const { error: followupError } = await followupWrite;
        if (followupError) throw followupError;

        summary.imported += 1;
        summary.tables[request.name].imported += 1;
        summary.tables[request.name].rows.push(selectedPayload);
      } catch (error) {
        summary.errors.push({
          table: request.name,
          id: rowId,
          error: error instanceof Error ? error.message : 'Failed to import row',
        });
      }
    }
  }

  return jsonResponse(summary.errors.length ? 207 : 200, {
    success: summary.errors.length === 0,
    sourceProjectRef: SOURCE_PROJECT_REF,
    targetProjectRef: getProjectRef(CURRENT_SUPABASE_URL),
    ...summary,
    latestImported: await latestImported(current),
  });
});

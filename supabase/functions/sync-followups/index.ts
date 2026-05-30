import { createClient } from 'npm:@supabase/supabase-js@2';

type SourceTable = 'service_enquiries' | 'voice_requirements';
type SourceRow = Record<string, unknown>;

const CURRENT_SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const CURRENT_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SOURCE_SUPABASE_URL = Deno.env.get('SOURCE_SUPABASE_URL') ?? '';
const SOURCE_SERVICE_ROLE_KEY = Deno.env.get('SOURCE_SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SOURCE_PROJECT_REF = Deno.env.get('SOURCE_PROJECT_REF') ?? getProjectRef(SOURCE_SUPABASE_URL);
const SYNC_SHARED_SECRET = Deno.env.get('SYNC_SHARED_SECRET') ?? '';
const DEFAULT_ASSIGNEE_ID = Deno.env.get('SYNC_DEFAULT_ASSIGNEE_ID') ?? 'u1';
const MAX_SOURCE_LIMIT = 500;
const DEFAULT_SOURCE_LIMIT = clampLimit(Number(Deno.env.get('SYNC_SOURCE_LIMIT') ?? '500'));

const SOURCE_TABLES: Array<{ table: SourceTable; type: string }> = [
  { table: 'service_enquiries', type: 'Service Enquiry' },
  { table: 'voice_requirements', type: 'Voice Requirement' },
];

const SOURCE_TABLE_MAP = new Map(SOURCE_TABLES.map((source) => [source.table, source]));

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
  if (!Number.isFinite(numericValue)) return 500;
  return Math.min(Math.max(Math.trunc(numericValue), 1), MAX_SOURCE_LIMIT);
}

async function readSyncOptions(req: Request) {
  if (!req.body) {
    return { tables: SOURCE_TABLES, limit: DEFAULT_SOURCE_LIMIT };
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const requestedTables = Array.isArray(body.tables)
    ? body.tables.filter((table): table is SourceTable => SOURCE_TABLE_MAP.has(table as SourceTable))
    : [];
  const tables = requestedTables.length
    ? requestedTables.map((table) => SOURCE_TABLE_MAP.get(table)!)
    : SOURCE_TABLES;

  return {
    tables,
    limit: body.limit === undefined ? DEFAULT_SOURCE_LIMIT : clampLimit(body.limit),
  };
}

function text(row: SourceRow, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function dateOnly(value: unknown) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function sourceId(row: SourceRow) {
  return text(row, ['id', 'uuid', 'enquiry_id', 'requirement_id', 'request_id', 'submission_id']);
}

function sourceCreatedAt(row: SourceRow) {
  return row.created_at ?? row.inserted_at ?? row.submitted_at ?? row.createdAt ?? null;
}

function leadPayload(row: SourceRow, sourceTable: SourceTable, sourceRowId: string) {
  const contact = text(row, ['contact_name', 'customer_name', 'name', 'full_name', 'client_name', 'person_name'], 'Unknown contact');
  const company = text(row, ['company', 'company_name', 'organization', 'organisation', 'business_name'], contact);
  const source = sourceTable === 'service_enquiries' ? 'Service Enquiry' : 'Voice Requirement';
  const createdDate = dateOnly(sourceCreatedAt(row));

  return {
    company,
    contact,
    value: text(row, ['value', 'budget', 'estimated_value'], ''),
    status: 'New',
    assignee_id: DEFAULT_ASSIGNEE_ID,
    date: createdDate,
    priority: 'High',
    source,
    source_project_ref: SOURCE_PROJECT_REF,
    source_table: sourceTable,
    source_row_id: sourceRowId,
    source_payload: row,
    last_synced_at: new Date().toISOString(),
  };
}

function followupPayload(row: SourceRow, sourceTable: SourceTable, sourceType: string, sourceRowId: string, leadId: string | null) {
  const contact = text(row, ['contact_name', 'customer_name', 'name', 'full_name', 'client_name', 'person_name'], 'Unknown contact');
  const company = text(row, ['company', 'company_name', 'organization', 'organisation', 'business_name']);
  const subject = text(row, ['subject', 'title', 'service', 'requirement', 'message', 'description']);
  const title = subject || `New ${sourceType} from ${company || contact}`;
  const dueDate = dateOnly(row.due_date ?? row.followup_date ?? row.created_at ?? row.submitted_at);
  const notes = text(row, ['notes', 'message', 'description', 'details', 'requirement_details', 'service_details']);

  return {
    lead_id: leadId,
    type: sourceType,
    title,
    priority: text(row, ['priority'], 'High'),
    due_date: dueDate,
    due_time: text(row, ['due_time', 'followup_time'], '-'),
    status: 'New',
    assignee_id: text(row, ['assignee_id', 'assigned_to'], DEFAULT_ASSIGNEE_ID),
    notes,
    source_project_ref: SOURCE_PROJECT_REF,
    source_table: sourceTable,
    source_row_id: sourceRowId,
    source_payload: row,
    last_synced_at: new Date().toISOString(),
  };
}

async function fetchRows(source: ReturnType<typeof createClient>, table: SourceTable, limit: number) {
  const orderCandidates = ['updated_at', 'created_at', 'submitted_at', 'id'];
  for (const column of orderCandidates) {
    const { data, error } = await source
      .from(table)
      .select('*')
      .order(column, { ascending: false })
      .limit(limit);

    if (!error) return data ?? [];
  }

  const { data, error } = await source.from(table).select('*').limit(limit);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
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

  const current = createClient(CURRENT_SUPABASE_URL, CURRENT_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const source = createClient(SOURCE_SUPABASE_URL, SOURCE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const options = await readSyncOptions(req);

  const summary = {
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ table: SourceTable; id?: string; error: string }>,
    tables: {} as Record<SourceTable, number>,
    limit: options.limit,
  };

  for (const { table, type } of options.tables) {
    let rows: SourceRow[] = [];
    try {
      rows = (await fetchRows(source, table, options.limit)) as SourceRow[];
      summary.tables[table] = rows.length;
    } catch (error) {
      summary.errors.push({ table, error: error instanceof Error ? error.message : 'Failed to fetch source rows' });
      continue;
    }

    for (const row of rows) {
      const rowId = sourceId(row);
      if (!rowId) {
        summary.skipped += 1;
        summary.errors.push({ table, error: 'Skipped source row without a usable id' });
        continue;
      }

      try {
        const lead = leadPayload(row, table, rowId);
        const { data: leadRow, error: leadError } = await current
          .from('crm_leads')
          .upsert(lead, { onConflict: 'source_project_ref,source_table,source_row_id' })
          .select('id')
          .single();

        if (leadError) throw leadError;

        const followup = followupPayload(row, table, type, rowId, leadRow?.id ?? null);
        const { data: existingFollowup, error: existingFollowupError } = await current
          .from('crm_followups')
          .select('id')
          .eq('source_project_ref', SOURCE_PROJECT_REF)
          .eq('source_table', table)
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
      } catch (error) {
        summary.errors.push({
          table,
          id: rowId,
          error: error instanceof Error ? error.message : 'Failed to import row',
        });
      }
    }
  }

  return jsonResponse(summary.errors.length ? 207 : 200, {
    success: summary.errors.length === 0,
    ...summary,
  });
});

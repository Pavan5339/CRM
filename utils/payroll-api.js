import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { hasLinkedEmployeeAccess, resolveAuthenticatedUserContext } from '@/utils/auth/context';

export async function requireHrPayrollAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const authContext = await resolveAuthenticatedUserContext(supabase, user);
  if (!authContext?.isHrAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase, user, authContext };
}

export async function requireEmployeePayrollAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const authContext = await resolveAuthenticatedUserContext(supabase, user);
  if (!hasLinkedEmployeeAccess(authContext)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase, user, authContext };
}

export function parseIntegerParam(value) {
  const numeric = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(numeric) ? numeric : null;
}

export function jsonErrorResponse(error, fallbackMessage) {
  const message = String(error?.message || '').trim() || fallbackMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}

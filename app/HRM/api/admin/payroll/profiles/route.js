import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';
import { ensurePayrollProfile, getPayrollProfileDetail, listPayrollDirectory } from '@/utils/payroll';
import { jsonErrorResponse, requireHrPayrollAccess } from '@/utils/payroll-api';

function cleanText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function parseBoolean(value) {
  return Boolean(value);
}

function parseNumeric(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export async function GET(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (employeeId) {
      const detail = await getPayrollProfileDetail(employeeId, auth.authContext.userId);
      return NextResponse.json(detail, { status: 200 });
    }

    const directory = await listPayrollDirectory();
    return NextResponse.json({ employees: directory }, { status: 200 });
  } catch (error) {
    console.error('Error fetching payroll profiles:', error);
    return jsonErrorResponse(error, 'Failed to load payroll profiles');
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const body = await request.json();
    const employeeId = cleanText(body.employeeId);

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee id is required.' }, { status: 400 });
    }

    await ensurePayrollProfile(employeeId, auth.authContext.userId);

    const { data: updated, error } = await adminClient
      .from('hrm_payroll_profiles')
      .update({
        pf_enabled: parseBoolean(body.pfEnabled),
        pf_mode: 'fixed',
        pf_value: parseNumeric(body.pfValue, 0),
        tds_enabled: parseBoolean(body.tdsEnabled),
        tds_mode: body.tdsMode === 'fixed' ? 'fixed' : 'percent',
        tds_value: parseNumeric(body.tdsValue, 0),
        retention_enabled: parseBoolean(body.retentionEnabled),
        notes: cleanText(body.notes),
        updated_by: auth.authContext.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', employeeId)
      .select('*')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || 'Failed to update payroll profile' }, { status: 500 });
    }

    const detail = await getPayrollProfileDetail(employeeId, auth.authContext.userId);
    return NextResponse.json(detail, { status: 200 });
  } catch (error) {
    console.error('Error updating payroll profile:', error);
    return jsonErrorResponse(error, 'Failed to update payroll profile');
  }
}

import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';
import { getPayrollProfileDetail } from '@/utils/payroll';
import { jsonErrorResponse, requireHrPayrollAccess } from '@/utils/payroll-api';

function cleanText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function parseNumeric(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const employeeId = cleanText(searchParams.get('employeeId'));

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee id is required.' }, { status: 400 });
    }

    const detail = await getPayrollProfileDetail(employeeId, auth.authContext.userId);
    return NextResponse.json(
      {
        schedules: detail.retentionSchedules,
        releases: detail.retentionReleases,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error loading retention data:', error);
    return jsonErrorResponse(error, 'Failed to load retention data');
  }
}

export async function POST(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const body = await request.json();
    const employeeId = cleanText(body.employeeId);
    const startMonth = cleanText(body.startMonth);
    const endMonth = cleanText(body.endMonth);
    const monthlyAmount = parseNumeric(body.monthlyAmount);
    const status = ['active', 'paused', 'completed', 'released'].includes(body.status)
      ? body.status
      : 'active';
    const notes = cleanText(body.notes);

    if (!employeeId || !startMonth || monthlyAmount === null) {
      return NextResponse.json(
        { error: 'Employee id, start month, and monthly amount are required.' },
        { status: 400 }
      );
    }

    const { error } = await adminClient
      .from('hrm_retention_schedules')
      .insert({
        employee_id: employeeId,
        start_month: `${startMonth}-01`,
        end_month: endMonth ? `${endMonth}-01` : null,
        monthly_amount: monthlyAmount,
        status,
        notes,
        created_by: auth.authContext.userId,
        updated_by: auth.authContext.userId,
      });

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to create retention schedule' }, { status: 500 });
    }

    const detail = await getPayrollProfileDetail(employeeId, auth.authContext.userId);
    return NextResponse.json(
      {
        schedules: detail.retentionSchedules,
        releases: detail.retentionReleases,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating retention schedule:', error);
    return jsonErrorResponse(error, 'Failed to create retention schedule');
  }
}

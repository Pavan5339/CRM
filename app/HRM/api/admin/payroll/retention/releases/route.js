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

export async function POST(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const body = await request.json();
    const employeeId = cleanText(body.employeeId);
    const releaseMonth = cleanText(body.releaseMonth);
    const amount = parseNumeric(body.amount);
    const linkedScheduleId = cleanText(body.linkedScheduleId);
    const notes = cleanText(body.notes);

    if (!employeeId || !releaseMonth || amount === null) {
      return NextResponse.json(
        { error: 'Employee id, release month, and amount are required.' },
        { status: 400 }
      );
    }

    const { error } = await adminClient
      .from('hrm_retention_releases')
      .insert({
        employee_id: employeeId,
        linked_schedule_id: linkedScheduleId,
        release_month: `${releaseMonth}-01`,
        amount,
        notes,
        created_by: auth.authContext.userId,
      });

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to create retention release' }, { status: 500 });
    }

    if (linkedScheduleId) {
      const { data: schedule } = await adminClient
        .from('hrm_retention_schedules')
        .select('id, total_released')
        .eq('id', linkedScheduleId)
        .maybeSingle();

      if (schedule?.id) {
        await adminClient
          .from('hrm_retention_schedules')
          .update({
            total_released: Number(schedule.total_released || 0) + amount,
            updated_by: auth.authContext.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', linkedScheduleId);
      }
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
    console.error('Error creating retention release:', error);
    return jsonErrorResponse(error, 'Failed to create retention release');
  }
}

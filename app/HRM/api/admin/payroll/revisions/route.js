import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';
import { getPayrollProfileDetail, roundCurrency } from '@/utils/payroll';
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
    return NextResponse.json({ revisions: detail.revisions }, { status: 200 });
  } catch (error) {
    console.error('Error loading salary revisions:', error);
    return jsonErrorResponse(error, 'Failed to load salary revisions');
  }
}

export async function POST(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const body = await request.json();
    const employeeId = cleanText(body.employeeId);
    const effectiveFrom = cleanText(body.effectiveFrom);
    const revisionType = body.revisionType === 'amount' ? 'amount' : 'percent';
    const revisionValue = parseNumeric(body.revisionValue);
    const reason = cleanText(body.reason);

    if (!employeeId || !effectiveFrom || revisionValue === null) {
      return NextResponse.json(
        { error: 'Employee id, effective date, and revision value are required.' },
        { status: 400 }
      );
    }

    const { data: employee, error: employeeError } = await adminClient
      .from('hrm_employees')
      .select('id, salary')
      .eq('id', employeeId)
      .maybeSingle();

    if (employeeError || !employee) {
      return NextResponse.json({ error: employeeError?.message || 'Employee not found' }, { status: 404 });
    }

    const previousSalary = roundCurrency(employee.salary);
    const newSalary = roundCurrency(
      revisionType === 'amount'
        ? previousSalary + revisionValue
        : previousSalary + (previousSalary * revisionValue) / 100
    );

    const { error: insertError } = await adminClient
      .from('hrm_salary_revisions')
      .insert({
        employee_id: employeeId,
        effective_from: effectiveFrom,
        previous_salary: previousSalary,
        revision_type: revisionType,
        revision_value: revisionValue,
        new_salary: newSalary,
        reason,
        created_by: auth.authContext.userId,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message || 'Failed to create revision' }, { status: 500 });
    }

    const { error: employeeUpdateError } = await adminClient
      .from('hrm_employees')
      .update({ salary: newSalary })
      .eq('id', employeeId);

    if (employeeUpdateError) {
      return NextResponse.json(
        { error: employeeUpdateError.message || 'Failed to sync employee salary' },
        { status: 500 }
      );
    }

    const detail = await getPayrollProfileDetail(employeeId, auth.authContext.userId);
    return NextResponse.json(
      {
        revisions: detail.revisions,
        employee: detail.employee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating salary revision:', error);
    return jsonErrorResponse(error, 'Failed to create salary revision');
  }
}

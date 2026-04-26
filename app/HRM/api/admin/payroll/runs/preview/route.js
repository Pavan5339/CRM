import { NextResponse } from 'next/server';
import { previewPayrollRun } from '@/utils/payroll';
import { jsonErrorResponse, requireHrPayrollAccess } from '@/utils/payroll-api';

export async function POST(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const body = await request.json();
    const year = Number.parseInt(String(body.year || ''), 10);
    const month = Number.parseInt(String(body.month || ''), 10);
    const employeeId = String(body.employeeId || '').trim() || null;

    if (!Number.isFinite(year) || !Number.isFinite(month)) {
      return NextResponse.json({ error: 'Valid year and month are required.' }, { status: 400 });
    }

    const preview = await previewPayrollRun({ year, month, employeeId });
    return NextResponse.json(preview, { status: 200 });
  } catch (error) {
    console.error('Error previewing payroll run:', error);
    return jsonErrorResponse(error, 'Failed to preview payroll');
  }
}

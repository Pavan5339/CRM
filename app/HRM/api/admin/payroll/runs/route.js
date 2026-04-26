import { NextResponse } from 'next/server';
import { listPayrollRuns } from '@/utils/payroll';
import { jsonErrorResponse, parseIntegerParam, requireHrPayrollAccess } from '@/utils/payroll-api';

export async function GET(request) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const year = parseIntegerParam(searchParams.get('year'));
    const month = parseIntegerParam(searchParams.get('month'));

    const runs = await listPayrollRuns({ year, month });
    return NextResponse.json({ runs }, { status: 200 });
  } catch (error) {
    console.error('Error loading payroll runs:', error);
    return jsonErrorResponse(error, 'Failed to load payroll runs');
  }
}

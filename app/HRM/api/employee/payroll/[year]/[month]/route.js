import { NextResponse } from 'next/server';
import { getEmployeePaidPayrollMonth } from '@/utils/payroll';
import { jsonErrorResponse, requireEmployeePayrollAccess } from '@/utils/payroll-api';

async function readParams(params) {
  return typeof params?.then === 'function' ? params : Promise.resolve(params);
}

export async function GET(request, context) {
  try {
    const auth = await requireEmployeePayrollAccess();
    if (auth.error) return auth.error;

    const { year, month } = await readParams(context.params);
    const parsedYear = Number.parseInt(String(year || ''), 10);
    const parsedMonth = Number.parseInt(String(month || ''), 10);

    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth)) {
      return NextResponse.json({ error: 'Valid year and month are required.' }, { status: 400 });
    }

    const item = await getEmployeePaidPayrollMonth(auth.authContext.employee.id, parsedYear, parsedMonth);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error('Error loading employee payroll month:', error);
    return jsonErrorResponse(error, 'Failed to load payroll month');
  }
}

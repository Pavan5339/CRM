import { NextResponse } from 'next/server';
import { listEmployeePaidPayroll } from '@/utils/payroll';
import { jsonErrorResponse, requireEmployeePayrollAccess } from '@/utils/payroll-api';

export async function GET() {
  try {
    const auth = await requireEmployeePayrollAccess();
    if (auth.error) return auth.error;

    const items = await listEmployeePaidPayroll(auth.authContext.employee.id);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Error loading employee payroll history:', error);
    return jsonErrorResponse(error, 'Failed to load payroll history');
  }
}

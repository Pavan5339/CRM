import { NextResponse } from 'next/server';
import { generatePayslipForItem, getLatestPayslipForItem, getPayrollItemById, updatePayrollItemStatus } from '@/utils/payroll';
import { jsonErrorResponse, requireHrPayrollAccess } from '@/utils/payroll-api';

async function readParams(params) {
  return typeof params?.then === 'function' ? params : Promise.resolve(params);
}

export async function PATCH(request, context) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const { id } = await readParams(context.params);
    if (!id) {
      return NextResponse.json({ error: 'Payroll item id is required.' }, { status: 400 });
    }

    const body = await request.json();
    const paymentStatus = String(body.paymentStatus || '').trim();
    await updatePayrollItemStatus({ itemId: id, paymentStatus });
    let payslip = await getLatestPayslipForItem(id);

    if (paymentStatus === 'paid' && !payslip) {
      payslip = await generatePayslipForItem({
        itemId: id,
        actorUserId: auth.authContext.userId,
      });
    }

    const item = await getPayrollItemById(id);

    return NextResponse.json({ item, payslip }, { status: 200 });
  } catch (error) {
    console.error('Error updating payroll item:', error);
    return jsonErrorResponse(error, 'Failed to update payroll item');
  }
}

export async function GET(request, context) {
  try {
    const auth = await requireHrPayrollAccess();
    if (auth.error) return auth.error;

    const { id } = await readParams(context.params);
    if (!id) {
      return NextResponse.json({ error: 'Payroll item id is required.' }, { status: 400 });
    }

    const item = await getPayrollItemById(id);
    const payslip = await getLatestPayslipForItem(id);
    return NextResponse.json({ item, payslip }, { status: 200 });
  } catch (error) {
    console.error('Error loading payroll item:', error);
    return jsonErrorResponse(error, 'Failed to load payroll item');
  }
}

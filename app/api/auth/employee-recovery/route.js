import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { adminClient } from '@/utils/supabase/admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const newPassword = String(body?.newPassword ?? '');

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: employee, error: employeeError } = await adminClient
      .from('employees')
      .select('id, email, name, auth_user_id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (employeeError) {
      return NextResponse.json({ error: employeeError.message }, { status: 500 });
    }

    if (!employee) {
      return NextResponse.json({ error: 'Employee account not found' }, { status: 404 });
    }

    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata || {}),
        full_name: employee.name || user.user_metadata?.full_name || '',
        employee_uuid: employee.id,
        role: 'employee',
      },
    });

    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 500 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await adminClient
      .from('employees')
      .update({
        password_hash: passwordHash,
        must_change_password: false,
        password_set_at: new Date().toISOString(),
      })
      .eq('id', employee.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can continue to your dashboard.',
    });
  } catch (error) {
    console.error('Error finalizing employee recovery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

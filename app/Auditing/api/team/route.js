import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { adminClient } from '@/utils/supabase/admin';
import { isHrAdminRole } from '@/utils/auth/roles';

function getModuleAccessRecord(employee) {
  if (!employee?.module_access) return null;
  return Array.isArray(employee.module_access)
    ? employee.module_access[0] || null
    : employee.module_access;
}

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [{ data: profile }, { data: currentEmployee }] = await Promise.all([
      supabase
        .from('hrm_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle(),
      adminClient
        .from('hrm_employees')
        .select(`
          id,
          module_access:hrm_module_access!module_access_employee_id_fkey (
            auditing
          )
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle(),
    ]);

    const isAdmin = isHrAdminRole(profile?.role);
    const hasAuditingAccess = Boolean(getModuleAccessRecord(currentEmployee)?.auditing);

    if (!isAdmin && !hasAuditingAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: employees, error } = await adminClient
      .from('hrm_employees')
      .select(`
        id,
        employee_id,
        name,
        email,
        role,
        profile_picture_url,
        designation:hrm_designations (
          title
        ),
        employment_lifecycle_status,
        current_stage,
        module_access:hrm_module_access!module_access_employee_id_fkey (
          auditing
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to load auditing members.' }, { status: 500 });
    }

    const members = (employees || [])
      .filter((employee) => Boolean(getModuleAccessRecord(employee)?.auditing))
      .map((employee) => ({
        id: employee.id,
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        role: employee.role || employee.designation?.title || 'Employee',
        designation: employee.designation?.title || '',
        status: employee.employment_lifecycle_status || 'active',
        stage: employee.current_stage || 'none',
        profilePictureUrl: employee.profile_picture_url || null,
        initials: getInitials(employee.name),
      }));

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /Auditing/api/team:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

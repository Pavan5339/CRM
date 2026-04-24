import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resolveAuthenticatedUserContext } from '@/utils/auth/context';
import { loadOrganizationChartData } from '@/utils/hrm-organization-chart';

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

    const authContext = await resolveAuthenticatedUserContext(supabase, user);

    if (!authContext?.isHrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chart = await loadOrganizationChartData();
    return NextResponse.json(chart);
  } catch (error) {
    console.error('Error loading organization chart:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load organization chart' },
      { status: 500 }
    );
  }
}

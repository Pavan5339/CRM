import { NextResponse } from 'next/server';
import { loadPdplDashboard, requirePdplActor } from '@/utils/auditing-pdpl';

export async function GET(_request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const dashboard = await loadPdplDashboard(id, auth.actor);
    return NextResponse.json({ dashboard }, { status: 200 });
  } catch (error) {
    console.error('Error loading PDPL dashboard:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to load PDPL dashboard' }, { status: 500 });
  }
}

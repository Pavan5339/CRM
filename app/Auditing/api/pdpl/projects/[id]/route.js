import { NextResponse } from 'next/server';
import {
  deletePdplProject,
  isMissingPdplSchemaError,
  loadPdplProject,
  requirePdplActor,
  updatePdplProject,
} from '@/utils/auditing-pdpl';

export async function GET(_request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const project = await loadPdplProject(id, auth.actor);
    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('Error loading PDPL project:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (isMissingPdplSchemaError(error)) {
      return NextResponse.json(
        { error: 'PDPL audit database setup is pending. Apply the latest migration first.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to load PDPL project' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { id } = await params;
    await updatePdplProject(id, body, auth.actor);
    const project = await loadPdplProject(id, auth.actor);
    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('Error updating PDPL project:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update PDPL project' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id } = await params;
    await deletePdplProject(id, auth.actor);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting PDPL project:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to delete PDPL project' }, { status: 500 });
  }
}

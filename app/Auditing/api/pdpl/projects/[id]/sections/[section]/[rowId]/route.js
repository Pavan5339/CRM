import { NextResponse } from 'next/server';
import {
  deletePdplSectionRow,
  PDPL_SECTIONS,
  requirePdplActor,
  updatePdplSectionRow,
} from '@/utils/auditing-pdpl';

function assertSection(section) {
  if (!PDPL_SECTIONS.includes(section)) {
    throw new Error('Unsupported PDPL section.');
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id, section, rowId } = await params;
    assertSection(section);
    const body = await request.json();
    await updatePdplSectionRow(id, section, rowId, body, auth.actor);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating PDPL row:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update PDPL row' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id, section, rowId } = await params;
    assertSection(section);
    await deletePdplSectionRow(id, section, rowId, auth.actor);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting PDPL row:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to delete PDPL row' }, { status: 500 });
  }
}

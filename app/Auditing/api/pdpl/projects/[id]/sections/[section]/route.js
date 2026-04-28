import { NextResponse } from 'next/server';
import {
  assertPdplProjectAccess,
  createPdplSectionRow,
  loadPdplSectionRows,
  PDPL_SECTIONS,
  replacePdplSectionRows,
  requirePdplActor,
} from '@/utils/auditing-pdpl';

function assertSection(section) {
  if (!PDPL_SECTIONS.includes(section)) {
    throw new Error('Unsupported PDPL section.');
  }
}

export async function GET(_request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id, section } = await params;
    assertSection(section);
    await assertPdplProjectAccess(id, auth.actor);
    const rows = await loadPdplSectionRows(id, section);
    return NextResponse.json({ rows }, { status: 200 });
  } catch (error) {
    console.error('Error loading PDPL section rows:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to load PDPL section rows' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id, section } = await params;
    assertSection(section);
    const body = await request.json();
    const rowId = await createPdplSectionRow(id, section, body, auth.actor);
    return NextResponse.json({ rowId }, { status: 201 });
  } catch (error) {
    console.error('Error creating PDPL section row:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create PDPL section row' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id, section } = await params;
    assertSection(section);
    const body = await request.json();
    await replacePdplSectionRows(id, section, body.rows, auth.actor);
    const rows = await loadPdplSectionRows(id, section);
    return NextResponse.json({ rows }, { status: 200 });
  } catch (error) {
    console.error('Error replacing PDPL section rows:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to replace PDPL section rows' }, { status: 500 });
  }
}

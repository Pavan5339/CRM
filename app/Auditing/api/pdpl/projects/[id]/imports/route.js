import { NextResponse } from 'next/server';
import {
  createPdplImportLog,
  PDPL_SECTIONS,
  replacePdplSectionRows,
  requirePdplActor,
} from '@/utils/auditing-pdpl';

export async function POST(request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const sections = body.sections && typeof body.sections === 'object' ? body.sections : {};

    for (const section of PDPL_SECTIONS) {
      if (section in sections) {
        await replacePdplSectionRows(id, section, sections[section], auth.actor);
      }
    }

    await createPdplImportLog(
      id,
      {
        sourceFileName: body.sourceFileName,
        sheetMapping: body.sheetMapping,
        importSummary: body.importSummary,
      },
      auth.actor
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error importing PDPL workbook data:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to import PDPL workbook data' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { deletePdplDocumentAttachment, requirePdplActor } from '@/utils/auditing-pdpl';

export async function DELETE(_request, { params }) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { id, documentId, attachmentId } = await params;
    await deletePdplDocumentAttachment(id, documentId, attachmentId, auth.actor);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting PDPL document attachment:', error);
    if (String(error.message || '').includes('do not have access')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to delete PDPL document attachment' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import {
  buildPdplProjectCardData,
  createPdplProject,
  isMissingPdplSchemaError,
  listPdplAuditingMembers,
  listVisiblePdplProjects,
  requirePdplActor,
} from '@/utils/auditing-pdpl';

function createEmptyResponse(actor = null) {
  return {
    setupPending: true,
    actor,
    directoryMembers: [],
    projects: [],
  };
}

export async function GET() {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const { actor } = auth;
    let visibleProjects;
    try {
      visibleProjects = await listVisiblePdplProjects(actor);
    } catch (error) {
      if (isMissingPdplSchemaError(error)) {
        return NextResponse.json(createEmptyResponse(actor), { status: 200 });
      }
      throw error;
    }

    const [projects, directoryMembers] = await Promise.all([
      buildPdplProjectCardData(visibleProjects),
      listPdplAuditingMembers(),
    ]);

    return NextResponse.json(
      {
        setupPending: false,
        actor,
        directoryMembers,
        projects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error loading PDPL projects:', error);
    return NextResponse.json({ error: error.message || 'Failed to load PDPL projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requirePdplActor();
    if (auth.error) return auth.error;

    const body = await request.json();
    const projectId = await createPdplProject(body, auth.actor);

    return NextResponse.json({ projectId }, { status: 201 });
  } catch (error) {
    console.error('Error creating PDPL project:', error);
    if (isMissingPdplSchemaError(error)) {
      return NextResponse.json(
        { error: 'PDPL audit database setup is pending. Apply the latest migration first.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to create PDPL project' }, { status: 500 });
  }
}

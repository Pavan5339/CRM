import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  buildTicketFlowCycles,
  canActorUpdateTicket,
  canActorViewTicket,
  ensureActorInTicketDirectory,
  formatTicketPriorityLabel,
  formatTicketStatusLabel,
  getCurrentCycleNumber,
  getTicketAvailableActions,
  getTicketCurrentStepNumber,
  getTicketNextAllowedStep,
  groupByKey,
  insertTicketHistoryEntry,
  isMissingTicketSchemaError,
  listTicketPeople,
  loadTicketParticipants,
  loadTicketStatusHistory,
  mapTicketHistoryRows,
  normalizeTicketStatus,
  requireTicketActor,
  resolveTicketPerson,
  withAttachmentUrls,
} from '@/utils/tickets';

async function loadTicketBundle(ticketId) {
  const [ticketResult, participantsByTicketId, commentsResult, attachmentsResult, historyByTicketId] = await Promise.all([
    adminClient.from('hrm_tickets').select('*').eq('id', ticketId).maybeSingle(),
    loadTicketParticipants([ticketId]),
    adminClient.from('hrm_ticket_comments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
    adminClient.from('hrm_ticket_attachments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
    loadTicketStatusHistory([ticketId]),
  ]);

  if (ticketResult.error) throw ticketResult.error;
  if (commentsResult.error) throw commentsResult.error;
  if (attachmentsResult.error) throw attachmentsResult.error;

  return {
    ticket: ticketResult.data || null,
    participants: participantsByTicketId[ticketId] || [],
    comments: commentsResult.data || [],
    attachments: attachmentsResult.data || [],
    history: historyByTicketId[ticketId] || [],
  };
}

function buildTicketDetail(ticket, participants, comments, attachments, history, actor, byAuthUserId) {
  const requester = resolveTicketPerson(byAuthUserId, ticket.requester_auth_user_id);
  const owner = resolveTicketPerson(byAuthUserId, ticket.owner_auth_user_id);
  const raisedFor = resolveTicketPerson(byAuthUserId, ticket.raised_for_auth_user_id);
  const ccPeople = participants
    .filter((participant) => participant.participant_type === 'cc')
    .map((participant) => resolveTicketPerson(byAuthUserId, participant.participant_auth_user_id))
    .filter(Boolean);
  const mappedAttachments = withAttachmentUrls(attachments);
  const attachmentsByCommentId = groupByKey(mappedAttachments.filter((item) => item.commentId), 'commentId');
  const mappedHistory = mapTicketHistoryRows(history, byAuthUserId);

  return {
    id: ticket.id,
    ticketNo: ticket.ticket_no,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    priorityLabel: formatTicketPriorityLabel(ticket.priority),
    status: ticket.status,
    statusLabel: formatTicketStatusLabel(ticket.status),
    requester,
    owner,
    raisedFor,
    ccPeople,
    lastActivityAt: ticket.last_activity_at,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    resolvedAt: ticket.resolved_at,
    closedAt: ticket.closed_at,
    permissions: getTicketAvailableActions(ticket, actor, participants),
    attachments: mappedAttachments.filter((item) => !item.commentId),
    comments: comments.map((comment) => ({
      id: comment.id,
      body: comment.comment_body,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: resolveTicketPerson(byAuthUserId, comment.author_auth_user_id),
      attachments: attachmentsByCommentId[comment.id] || [],
    })),
    statusHistory: mappedHistory,
    flowCycles: buildTicketFlowCycles(history),
    nextAllowedStep: getTicketNextAllowedStep(ticket, actor),
    currentStepNumber: getTicketCurrentStepNumber(history),
  };
}

function buildUpdatePayload(ticket, body, actor, owner, history) {
  const nextPayload = {};
  const nextStatus = typeof body.status === 'string' ? normalizeTicketStatus(body.status) : '';
  const nextPriority = typeof body.priority === 'string' ? String(body.priority).trim().toLowerCase() : '';
  const nextCategory = typeof body.category === 'string' ? String(body.category).trim().toLowerCase() : '';

  if (nextStatus) {
    if (!TICKET_STATUSES.includes(nextStatus)) {
      throw new Error('Ticket status is invalid.');
    }
    if (!canActorUpdateTicket(ticket, actor)) {
      throw new Error('You are not allowed to change the ticket status.');
    }

    const expectedNextStep = getTicketNextAllowedStep(ticket, actor);
    if (!expectedNextStep || nextStatus !== expectedNextStep) {
      throw new Error(`Next allowed status is ${formatTicketStatusLabel(expectedNextStep || ticket.status)}.`);
    }

    const now = new Date().toISOString();
    nextPayload.status = nextStatus;
    nextPayload.last_activity_at = now;

    if (nextStatus === 'resolved') {
      nextPayload.resolved_at = now;
    }
    if (nextStatus === 'closed') {
      nextPayload.closed_at = now;
      if (!ticket.resolved_at) {
        nextPayload.resolved_at = now;
      }
    }
    if (!['resolved', 'closed'].includes(nextStatus)) {
      nextPayload.closed_at = null;
    }

    return {
      ticketUpdate: nextPayload,
      historyEntry: {
        cycleNo: getCurrentCycleNumber(history),
        stepNo: getTicketCurrentStepNumber(history) + 1,
        stepKey: nextStatus,
        createdAt: now,
      },
    };
  }

  if (nextPriority) {
    if (!actor.isAdmin) {
      throw new Error('Only admins can change ticket priority.');
    }
    if (!TICKET_PRIORITIES.includes(nextPriority)) {
      throw new Error('Ticket priority is invalid.');
    }
    nextPayload.priority = nextPriority;
  }

  if (nextCategory) {
    if (!actor.isAdmin) {
      throw new Error('Only admins can change ticket category.');
    }
    if (!TICKET_CATEGORIES.includes(nextCategory)) {
      throw new Error('Ticket category is invalid.');
    }
    nextPayload.category = nextCategory;
  }

  if (owner) {
    if (!actor.isAdmin) {
      throw new Error('Only admins can reassign tickets.');
    }
    nextPayload.owner_auth_user_id = owner.authUserId;
    nextPayload.owner_employee_id = owner.employeeId || null;
    nextPayload.owner_role = owner.role;
  }

  if (Object.keys(nextPayload).length === 0) {
    throw new Error('No valid ticket changes were provided.');
  }

  nextPayload.last_activity_at = new Date().toISOString();
  return { ticketUpdate: nextPayload, historyEntry: null };
}

export async function GET(_request, context) {
  try {
    const auth = await requireTicketActor();
    if (auth.error) return auth.error;

    const { actor } = auth;
    const resolvedParams = await context?.params;
    const ticketId = typeof resolvedParams?.id === 'string' ? resolvedParams.id.trim() : '';
    if (!ticketId) {
      return NextResponse.json({ error: 'Invalid ticket id.' }, { status: 400 });
    }

    const directory = ensureActorInTicketDirectory(await listTicketPeople(), actor);
    const { ticket, participants, comments, attachments, history } = await loadTicketBundle(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    if (!canActorViewTicket(ticket, actor, participants)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      {
        ticket: buildTicketDetail(ticket, participants, comments, attachments, history, actor, directory.byAuthUserId),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error loading ticket detail:', error);
    if (isMissingTicketSchemaError(error)) {
      return NextResponse.json({ error: 'Ticket database setup is pending. Apply the latest migration first.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message || 'Failed to load ticket detail' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const auth = await requireTicketActor();
    if (auth.error) return auth.error;

    const { actor } = auth;
    const resolvedParams = await context?.params;
    const ticketId = typeof resolvedParams?.id === 'string' ? resolvedParams.id.trim() : '';
    if (!ticketId) {
      return NextResponse.json({ error: 'Invalid ticket id.' }, { status: 400 });
    }

    const body = await request.json();
    const directory = ensureActorInTicketDirectory(await listTicketPeople(), actor);
    const { ticket, participants, history } = await loadTicketBundle(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    if (!canActorViewTicket(ticket, actor, participants)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ownerAuthUserId = typeof body.ownerAuthUserId === 'string' ? body.ownerAuthUserId.trim() : '';
    const owner = ownerAuthUserId ? directory.byAuthUserId.get(ownerAuthUserId) : null;
    if (ownerAuthUserId && !owner) {
      return NextResponse.json({ error: 'Selected owner is invalid.' }, { status: 400 });
    }

    let updatePlan;
    try {
      updatePlan = buildUpdatePayload(ticket, body, actor, owner, history);
    } catch (error) {
      return NextResponse.json({ error: error.message || 'Invalid ticket update.' }, { status: 400 });
    }

    const { data: updatedTicket, error: updateError } = await adminClient
      .from('hrm_tickets')
      .update(updatePlan.ticketUpdate)
      .eq('id', ticketId)
      .select('*')
      .single();

    if (updateError || !updatedTicket) {
      return NextResponse.json({ error: updateError?.message || 'Failed to update ticket.' }, { status: 500 });
    }

    if (updatePlan.historyEntry) {
      await insertTicketHistoryEntry({
        ticketId,
        actor,
        ...updatePlan.historyEntry,
      });
    }

    if (owner) {
      await adminClient.from('hrm_ticket_participants').delete().eq('ticket_id', ticketId).eq('participant_type', 'owner');
      const { error: participantError } = await adminClient.from('hrm_ticket_participants').insert({
        ticket_id: ticketId,
        participant_type: 'owner',
        participant_auth_user_id: owner.authUserId,
        participant_employee_id: owner.employeeId || null,
        participant_role: owner.role,
      });
      if (participantError) {
        return NextResponse.json({ error: participantError.message || 'Ticket owner changed, but participant sync failed.' }, { status: 500 });
      }
    }

    return NextResponse.json({ ticket: updatedTicket }, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    if (isMissingTicketSchemaError(error)) {
      return NextResponse.json({ error: 'Ticket database setup is pending. Apply the latest migration first.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update ticket' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';
import {
  canActorReviewExpenseClaim,
  isMissingExpenseSchemaError,
  requireExpenseActor,
} from '@/utils/expenses';

export async function PATCH(request, context) {
  try {
    const auth = await requireExpenseActor();
    if (auth.error) return auth.error;

    const resolvedParams = await context?.params;
    const claimId = typeof resolvedParams?.id === 'string' ? resolvedParams.id.trim() : '';
    if (!claimId) {
      return NextResponse.json({ error: 'Invalid claim id.' }, { status: 400 });
    }

    const { actor } = auth;
    const body = await request.json();
    const action = typeof body.action === 'string' ? body.action.trim().toLowerCase() : '';
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!['approved', 'rejected', 'needs_changes'].includes(action)) {
      return NextResponse.json({ error: 'Review action is invalid.' }, { status: 400 });
    }

    if ((action === 'rejected' || action === 'needs_changes') && !note) {
      return NextResponse.json({ error: 'A review note is required for this action.' }, { status: 400 });
    }

    const { data: claim, error: claimError } = await adminClient
      .from('hrm_expense_claims')
      .select('*')
      .eq('id', claimId)
      .maybeSingle();

    if (claimError) throw claimError;
    if (!claim) {
      return NextResponse.json({ error: 'Expense claim not found.' }, { status: 404 });
    }

    if (!canActorReviewExpenseClaim(claim, actor)) {
      return NextResponse.json({ error: 'You are not allowed to review this claim.' }, { status: 403 });
    }

    const reviewedAt = new Date().toISOString();
    const { error: updateError } = await adminClient
      .from('hrm_expense_claims')
      .update({
        status: action,
        reviewed_at: reviewedAt,
        review_note: note || null,
      })
      .eq('id', claimId);

    if (updateError) throw updateError;

    const { error: reviewError } = await adminClient.from('hrm_expense_claim_reviews').insert({
      claim_id: claimId,
      reviewer_auth_user_id: actor.authUserId,
      reviewer_role: actor.role,
      action,
      note: note || null,
      created_at: reviewedAt,
    });

    if (reviewError) throw reviewError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error reviewing expense claim:', error);
    if (isMissingExpenseSchemaError(error)) {
      return NextResponse.json(
        { error: 'Expense claim database setup is pending. Apply the latest migration first.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to review expense claim' }, { status: 500 });
  }
}

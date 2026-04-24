import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CURRENCIES,
  calculateExpenseTotal,
  enrichExpenseClaimSummary,
  extractExpenseFileMap,
  getReportingManagerSummary,
  isMissingExpenseSchemaError,
  listExpensePeople,
  listExpenseReviewers,
  mapExpenseClaimSummary,
  parseExpenseItems,
  parseExpenseMultipart,
  requireExpenseActor,
  uploadExpenseFiles,
  validateExpenseClaimPayload,
} from '@/utils/expenses';

function createEmptyResponse(actor) {
  return {
    setupPending: true,
    actor,
    reviewerOptions: [],
    reportingManager: null,
    currencies: EXPENSE_CURRENCIES,
    categories: EXPENSE_CATEGORIES,
    pendingClaims: [],
    needsChangesClaims: [],
    historyClaims: [],
  };
}

export async function GET() {
  try {
    const auth = await requireExpenseActor();
    if (auth.error) return auth.error;

    const { actor } = auth;
    if (!actor.canCreateClaims) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let claimsResult;
    try {
      claimsResult = await adminClient
        .from('hrm_expense_claims')
        .select('*')
        .eq('employee_auth_user_id', actor.authUserId)
        .order('updated_at', { ascending: false });
    } catch (error) {
      if (isMissingExpenseSchemaError(error)) {
        return NextResponse.json(createEmptyResponse(actor), { status: 200 });
      }
      throw error;
    }

    if (claimsResult.error) {
      if (isMissingExpenseSchemaError(claimsResult.error)) {
        return NextResponse.json(createEmptyResponse(actor), { status: 200 });
      }
      throw claimsResult.error;
    }

    const [directory, reviewerOptions, reportingManager] = await Promise.all([
      listExpensePeople(),
      listExpenseReviewers(actor.authUserId),
      getReportingManagerSummary(actor.employeeId),
    ]);

    const rows = claimsResult.data || [];
    const pendingClaims = [];
    const needsChangesClaims = [];
    const historyClaims = [];

    rows.forEach((claim) => {
      const mapped = enrichExpenseClaimSummary(mapExpenseClaimSummary(claim), directory);
      if (claim.status === 'submitted') {
        pendingClaims.push(mapped);
      } else if (claim.status === 'needs_changes') {
        needsChangesClaims.push(mapped);
      } else {
        historyClaims.push(mapped);
      }
    });

    return NextResponse.json(
      {
        setupPending: false,
        actor,
        reviewerOptions,
        reportingManager,
        currencies: EXPENSE_CURRENCIES,
        categories: EXPENSE_CATEGORIES,
        pendingClaims,
        needsChangesClaims,
        historyClaims,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error loading expense claims:', error);
    return NextResponse.json({ error: error.message || 'Failed to load expense claims' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireExpenseActor();
    if (auth.error) return auth.error;

    const { actor } = auth;
    if (!actor.canCreateClaims) {
      return NextResponse.json({ error: 'Only employees can submit expense claims.' }, { status: 403 });
    }

    const formData = await request.formData();
    const payload = parseExpenseMultipart(formData);
    const title = String(payload.title || '').trim();
    const purpose = String(payload.purpose || '').trim();
    const currency = String(payload.currency || 'INR').trim().toUpperCase();
    const reviewerAuthUserId = String(payload.reviewerAuthUserId || '').trim();
    const items = parseExpenseItems(payload.items);
    const reviewerOptions = await listExpenseReviewers(actor.authUserId);

    let reviewer;
    try {
      reviewer = validateExpenseClaimPayload({
        title,
        purpose,
        currency,
        reviewerAuthUserId,
        items,
        reviewerOptions,
      });
    } catch (error) {
      return NextResponse.json({ error: error.message || 'Invalid claim payload.' }, { status: 400 });
    }

    const reportingManager = await getReportingManagerSummary(actor.employeeId);
    const claimId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();
    const totalAmount = calculateExpenseTotal(items);
    const fileMap = extractExpenseFileMap(formData);
    const itemRows = items.map((item) => ({
      id: crypto.randomUUID(),
      claim_id: claimId,
      expense_date: item.expenseDate,
      category: item.category,
      description: item.description,
      amount: Number(item.amount.toFixed(2)),
      vendor_name: item.vendorName || null,
      clientId: item.clientId,
    }));

    const claimPayload = {
      id: claimId,
      employee_auth_user_id: actor.authUserId,
      employee_id: actor.employeeId,
      employee_name_snapshot: actor.name,
      employee_code_snapshot: actor.employeeCode || null,
      reporting_manager_name_snapshot: reportingManager?.name || null,
      reviewer_auth_user_id: reviewer.authUserId,
      reviewer_employee_id: reviewer.employeeId || null,
      reviewer_role: reviewer.role,
      reviewer_name_snapshot: reviewer.name,
      title,
      purpose,
      currency,
      total_amount: totalAmount,
      status: 'submitted',
      submitted_at: submittedAt,
      review_note: null,
    };

    const { error: claimError } = await adminClient.from('hrm_expense_claims').insert(claimPayload);
    if (claimError) throw claimError;

    const { error: itemError } = await adminClient.from('hrm_expense_claim_items').insert(
      itemRows.map(({ clientId, ...row }) => row)
    );

    if (itemError) {
      await adminClient.from('hrm_expense_claims').delete().eq('id', claimId);
      throw itemError;
    }

    const uploadedAttachments = [];

    try {
      for (const itemRow of itemRows) {
        const files = fileMap.get(itemRow.clientId) || [];
        if (!files.length) continue;

        const attachments = await uploadExpenseFiles({
          claimId,
          itemId: itemRow.id,
          files,
          actor,
        });
        uploadedAttachments.push(...attachments);
      }
    } catch (error) {
      await adminClient.from('hrm_expense_claim_items').delete().eq('claim_id', claimId);
      await adminClient.from('hrm_expense_claims').delete().eq('id', claimId);
      throw error;
    }

    if (uploadedAttachments.length > 0) {
      const { error: attachmentError } = await adminClient
        .from('hrm_expense_claim_attachments')
        .insert(uploadedAttachments);

      if (attachmentError) {
        const uploadedPaths = uploadedAttachments.map((attachment) => attachment.file_path);
        if (uploadedPaths.length > 0) {
          await adminClient.storage.from('hrm-expense-files').remove(uploadedPaths);
        }
        await adminClient.from('hrm_expense_claim_items').delete().eq('claim_id', claimId);
        await adminClient.from('hrm_expense_claims').delete().eq('id', claimId);
        throw attachmentError;
      }
    }

    const { error: reviewError } = await adminClient.from('hrm_expense_claim_reviews').insert({
      claim_id: claimId,
      reviewer_auth_user_id: actor.authUserId,
      reviewer_role: actor.role,
      action: 'submitted',
      note: purpose,
      created_at: submittedAt,
    });

    if (reviewError) {
      throw reviewError;
    }

    return NextResponse.json({ claimId }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense claim:', error);
    if (isMissingExpenseSchemaError(error)) {
      return NextResponse.json(
        { error: 'Expense claim database setup is pending. Apply the latest migration first.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to create expense claim' }, { status: 500 });
  }
}

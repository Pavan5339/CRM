export type ExpenseClaimStatus = 'submitted' | 'needs_changes' | 'approved' | 'rejected';
export type ExpenseReviewAction = 'submitted' | 'needs_changes' | 'resubmitted' | 'approved' | 'rejected';
export type ExpenseViewSection = 'claim' | 'my-claims' | 'history' | 'review';

export interface ExpensePerson {
  authUserId: string;
  employeeId?: string | null;
  role: 'employee' | 'hr_admin';
  name: string;
  email: string;
  employeeCode?: string;
  avatarUrl?: string;
}

export interface ExpenseClaimSummary {
  id: string;
  claimNo: string;
  title: string;
  purpose: string;
  currency: string;
  totalAmount: number;
  status: ExpenseClaimStatus;
  statusLabel: string;
  submittedAt: string;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string;
  reviewer: ExpensePerson;
  employee: ExpensePerson;
  reportingManager?: ExpensePerson | null;
  reportingManagerName?: string;
}

export interface ExpenseClaimItem {
  id: string;
  expenseDate: string;
  category: string;
  categoryLabel: string;
  description: string;
  amount: number;
  vendorName?: string;
  createdAt: string;
}

export interface ExpenseClaimAttachment {
  id: string;
  claimId: string;
  claimItemId?: string | null;
  fileName: string;
  filePath: string;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  url: string;
}

export interface ExpenseClaimReview {
  id: string;
  action: ExpenseReviewAction;
  actionLabel: string;
  note: string;
  createdAt: string;
  reviewer: ExpensePerson;
}

export interface ExpenseClaimDetail extends ExpenseClaimSummary {
  items: ExpenseClaimItem[];
  attachments: ExpenseClaimAttachment[];
  reviews: ExpenseClaimReview[];
  canEdit: boolean;
  canReview: boolean;
  canResubmit: boolean;
}

export interface ExpenseListResponse {
  setupPending?: boolean;
  actor: ExpensePerson & { canCreateClaims: boolean; isAdmin: boolean };
  reviewerOptions: ExpensePerson[];
  reportingManager: ExpensePerson | null;
  currencies: string[];
  categories: string[];
  pendingClaims: ExpenseClaimSummary[];
  needsChangesClaims: ExpenseClaimSummary[];
  historyClaims: ExpenseClaimSummary[];
}

export interface ExpenseReviewInboxResponse {
  setupPending?: boolean;
  actor: ExpensePerson & { canCreateClaims: boolean; isAdmin: boolean };
  pendingReview: ExpenseClaimSummary[];
  reviewedHistory: ExpenseClaimSummary[];
}

export function formatExpenseMoney(amount: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

export function formatExpenseDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatExpenseDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatExpenseRelativeTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatExpenseDate(value);
}

export function formatExpenseFileSize(size?: number | null) {
  if (!size || size <= 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getExpenseInitials(person?: ExpensePerson | null) {
  const value = String(person?.name || person?.email || '').trim();
  if (!value) return 'EX';

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

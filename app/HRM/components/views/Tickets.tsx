'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import EmployeePageHeader from '../ui/EmployeePageHeader';
import { useHrmFeedback } from '../ui/HrmFeedback';
import HrmEmptyState from '../ui/HrmEmptyState';
import { LoadingPanel } from '../ui/Skeleton';
import type {
  TicketAttachment,
  TicketDetail,
  TicketFlowNode,
  TicketListResponse,
  TicketPerson,
  TicketSection,
  TicketSummary,
} from './ticketShared';
import {
  filterTicketCollection,
  formatFileSize,
  formatRelativeTicketTime,
  formatTicketDateTime,
  formatTicketPipelineLabel,
  getTicketInitials,
  getTicketPipelineActiveIndex,
  TICKET_PIPELINE_STEPS,
} from './ticketShared';

const INITIAL_VISIBLE_COUNT = 8;
const FLOW_ACTION_STEPS = ['open', 'in_progress', 'waiting_on_requester', 'resolved', 'closed'] as const;

const CATEGORY_OPTIONS = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'documents', label: 'Documents' },
  { value: 'profile_update', label: 'Profile Update' },
  { value: 'system_access', label: 'System Access' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const SECTION_CONFIG: Array<{ key: TicketSection; label: string; icon: string }> = [
  { key: 'raise', label: 'Raise Ticket', icon: 'add_circle' },
  { key: 'my', label: 'My Tickets', icon: 'inbox' },
  { key: 'assigned', label: 'Assigned To Me', icon: 'assignment_ind' },
  { key: 'closed', label: 'Resolved / Closed', icon: 'inventory_2' },
];

function personLabel(person?: TicketPerson | null) {
  if (!person) return '-';
  return [person.name, person.employeeCode ? `(${person.employeeCode})` : ''].filter(Boolean).join(' ');
}

function AvatarNode({ person, size = 'md' }: { person?: TicketPerson | null; size?: 'sm' | 'md' }) {
  const dimensionClass = size === 'sm' ? 'h-10 w-10 text-[10px]' : 'h-12 w-12 text-xs';

  if (person?.avatarUrl) {
    return (
      <Image
        src={person.avatarUrl}
        alt={person.name || 'User'}
        className={`${dimensionClass} rounded-full border border-white/80 object-cover shadow-sm`}
        width={size === 'sm' ? 40 : 48}
        height={size === 'sm' ? 40 : 48}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`flex ${dimensionClass} items-center justify-center rounded-full border border-white/80 bg-violet-100 font-bold tracking-[0.12em] text-violet-700 shadow-sm`}
    >
      {getTicketInitials(person)}
    </div>
  );
}

function FlowNode({ node }: { node: TicketFlowNode }) {
  return (
    <div className="flex min-w-[108px] flex-col items-center text-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${
          node.completed
            ? node.key === 'reopened'
              ? 'border-violet-500 bg-violet-500 text-white shadow-[0_10px_20px_rgba(139,92,246,0.25)]'
              : 'border-violet-300 bg-violet-200 text-violet-900'
            : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant'
        }`}
      >
        {node.completed ? node.stepNo : <span className="material-symbols-outlined text-[18px]">radio_button_unchecked</span>}
      </div>
      <p className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${node.completed ? 'text-slate-900' : 'text-on-surface-variant'}`}>
        {node.label}
      </p>
      <p className="mt-1 text-[10px] text-on-surface-variant">{node.createdAt ? formatTicketDateTime(node.createdAt) : '—'}</p>
    </div>
  );
}

function StatusPipeline({ detail }: { detail: TicketDetail }) {
  return (
    <div className="space-y-4">
      {detail.flowCycles.map((cycle) => (
        <div key={cycle.cycleNo} className="overflow-x-auto no-scrollbar">
          <div className="flex min-w-[720px] items-start gap-0 px-1 py-1">
            {cycle.nodes.map((node, index) => (
              <React.Fragment key={`${cycle.cycleNo}-${node.key}-${node.stepNo || index}`}>
                <FlowNode node={node} />
                {index < cycle.nodes.length - 1 ? (
                  <div className="mt-5 h-[2px] min-w-[24px] flex-1 rounded-full bg-surface-container">
                    <div className={`h-full rounded-full transition-all ${node.completed ? 'w-full bg-violet-400' : 'w-0 bg-transparent'}`} />
                  </div>
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompactStatusPipeline({ status }: { status?: string | null }) {
  const activeIndex = getTicketPipelineActiveIndex(status);
  const compactSteps = TICKET_PIPELINE_STEPS.filter((step) => step !== 'reopened');

  return (
    <div className="flex items-center gap-1.5">
      {compactSteps.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const connectorActive = index < activeIndex;

        return (
          <React.Fragment key={step}>
            <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isCompleted ? 'bg-violet-400' : 'bg-slate-200'}`} />
            {index < compactSteps.length - 1 ? (
              <span className={`h-[2px] w-4 rounded-full ${connectorActive ? 'bg-violet-300' : 'bg-slate-200'}`} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StatusActionRow({
  detail,
  isSaving,
  onAdvance,
  onReopen,
}: {
  detail: TicketDetail;
  isSaving: boolean;
  onAdvance: (status: string) => void;
  onReopen: () => void;
}) {
  const activeCycle = detail.flowCycles[detail.flowCycles.length - 1];
  const completedKeys = new Set(
    (activeCycle?.nodes || []).filter((node) => node.completed).map((node) => node.key)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {FLOW_ACTION_STEPS.map((step) => {
          const completed = completedKeys.has(step);
          const isNext = detail.nextAllowedStep === step;
          const disabled = !completed && !isNext;

          return (
            <button
              key={step}
              type="button"
              disabled={disabled || isSaving}
              onClick={() => onAdvance(step)}
              className={`inline-flex items-center gap-2 rounded-2xl border font-semibold transition ${
                completed
                  ? 'border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[13px] text-emerald-700'
                  : isNext
                    ? 'scale-[1.06] border-violet-300 bg-[linear-gradient(180deg,#faf5ff_0%,#efe7ff_100%)] px-4 py-2.5 text-[14px] text-violet-900 shadow-[0_14px_24px_rgba(139,92,246,0.16),0_4px_0_rgba(196,181,253,0.9)] ring-1 ring-white/80 hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-[0_18px_28px_rgba(139,92,246,0.2),0_5px_0_rgba(196,181,253,0.95)]'
                    : 'border-outline-variant/20 bg-surface-container-low px-3.5 py-2 text-[13px] text-on-surface-variant opacity-70'
              } disabled:cursor-not-allowed`}
            >
              <span className={`material-symbols-outlined ${isNext ? 'text-[18px]' : 'text-[16px]'}`}>
                {completed ? 'check_circle' : isNext ? 'circle' : 'radio_button_unchecked'}
              </span>
              {formatTicketPipelineLabel(step)}
            </button>
          );
        })}
      </div>

      {detail.permissions.canReopen ? (
        <button
          type="button"
          disabled={isSaving}
          onClick={onReopen}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          Reopen Ticket
        </button>
      ) : null}
    </div>
  );
}

function TicketCard({
  ticket,
  onSelect,
  showCompactFlow = true,
}: {
  ticket: TicketSummary;
  onSelect: () => void;
  showCompactFlow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full max-w-[1080px] overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest px-5 py-4 text-left transition-all hover:border-violet-100 hover:bg-surface-container-lowest"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700 shadow-sm">{ticket.statusLabel}</span>
        <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-on-surface-variant">{ticket.priorityLabel}</span>
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{ticket.ticketNo}</p>
        <h3 className="mt-2 line-clamp-2 text-base font-headline font-bold text-on-surface">{ticket.subject}</h3>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-on-surface-variant">{ticket.description}</p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
          {ticket.category.replace(/_/g, ' ')}
        </span>
        {showCompactFlow ? <CompactStatusPipeline status={ticket.status} /> : null}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-xs text-on-surface-variant">
        <div className="grid grid-cols-3 gap-3">
          <p>
            <span className="font-semibold text-on-surface">Requester:</span> {personLabel(ticket.requester)}
          </p>
          <p>
            <span className="font-semibold text-on-surface">Raised To:</span> {personLabel(ticket.owner)}
          </p>
          <p>
            <span className="font-semibold text-on-surface">Updated:</span> {formatRelativeTicketTime(ticket.lastActivityAt)}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-end rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700">
          View Details
          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
        </span>
      </div>
    </button>
  );
}

function AttachmentList({ attachments }: { attachments: TicketAttachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-2xl border border-outline-variant/10 bg-surface-container-low px-4 py-3 text-sm transition-colors hover:border-violet-100 hover:bg-violet-50"
        >
          <span className="min-w-0 pr-4">
            <span className="block truncate font-semibold text-on-surface">{attachment.fileName}</span>
            <span className="block text-xs text-on-surface-variant">
              {[formatFileSize(attachment.fileSize), formatTicketDateTime(attachment.createdAt)].filter(Boolean).join(' • ')}
            </span>
          </span>
          <span className="material-symbols-outlined text-violet-700">open_in_new</span>
        </a>
      ))}
    </div>
  );
}

function FileDropzone({
  files,
  onFilesChange,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const inputId = 'ticket-files-input';
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex h-full min-h-[300px] flex-col justify-between space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const droppedFiles = Array.from(event.dataTransfer.files || []).filter((file) => file.size > 0);
          if (droppedFiles.length) {
            onFilesChange(droppedFiles);
          }
        }}
        className={`flex min-h-[220px] flex-1 cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border-2 border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? 'border-violet-300 bg-violet-50'
            : 'border-outline-variant/20 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,1)_100%)] hover:border-violet-200 hover:bg-violet-50/50'
        }`}
      >
        <span className="material-symbols-outlined text-[34px] text-violet-600">upload</span>
        <p className="mt-4 text-xl font-bold text-slate-900">Drag & drop your files here</p>
        <p className="mt-1 text-sm text-slate-500">or click to browse</p>
        <span className="mt-4 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-500">
          PDF • TXT • DOC • DOCX • PNG • JPG
        </span>
      </label>

      <input
        id={inputId}
        type="file"
        multiple
        onChange={(event) => onFilesChange(Array.from(event.target.files || []))}
        className="hidden"
      />

      {files.length ? (
        <div className="space-y-2 rounded-2xl border border-outline-variant/10 bg-surface-container-low px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Selected Files</p>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2 text-sm">
                <span className="min-w-0 truncate font-medium text-on-surface">{file.name}</span>
                <span className="shrink-0 text-xs text-on-surface-variant">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Tickets({ variant = 'employee' }: { variant?: 'employee' | 'admin' }) {
  const { showFeedback } = useHrmFeedback();
  const [activeSection, setActiveSection] = useState<TicketSection>('raise');
  const [data, setData] = useState<TicketListResponse | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({
    my: INITIAL_VISIBLE_COUNT,
    assigned: INITIAL_VISIBLE_COUNT,
    closed: INITIAL_VISIBLE_COUNT,
  });
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('attendance');
  const [priority, setPriority] = useState('medium');
  const [raisedForAuthUserId, setRaisedForAuthUserId] = useState('');
  const [ownerAuthUserId, setOwnerAuthUserId] = useState('');
  const [selectedCc, setSelectedCc] = useState<string[]>([]);
  const [ccSearch, setCcSearch] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const loadTickets = async (keepCurrentSelection = true) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/HRM/api/tickets', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to load tickets.');

      setData(result);
      setRaisedForAuthUserId((current) => current || result.actor?.authUserId || '');
      setOwnerAuthUserId((current) => current || result.actor?.authUserId || '');

      if (!keepCurrentSelection) {
        setSelectedTicketId('');
        setDetail(null);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketDetail = async (ticketId: string, allowRetry = true) => {
    if (!ticketId) {
      setDetail(null);
      return;
    }

    try {
      const response = await fetch(`/HRM/api/tickets/${ticketId}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const result = await response.json();
      if (response.status === 401 && allowRetry) {
        await loadTicketDetail(ticketId, false);
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Failed to load ticket detail.');
      setDetail(result.ticket || null);
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Ticket Detail Not Loaded', message: requestError instanceof Error ? requestError.message : 'Failed to load ticket detail.' });
    }
  };

  useEffect(() => {
    loadTickets(false);
  }, []);

  const myTickets = useMemo(
    () => filterTicketCollection(data?.myTickets || [], search, statusFilter, categoryFilter),
    [categoryFilter, data?.myTickets, search, statusFilter]
  );
  const assignedTickets = useMemo(() => {
    const base = data?.actor?.isAdmin ? data?.adminOpenTickets || [] : data?.assignedTickets || [];
    return filterTicketCollection(base, search, statusFilter, categoryFilter);
  }, [categoryFilter, data?.actor?.isAdmin, data?.adminOpenTickets, data?.assignedTickets, search, statusFilter]);
  const closedTickets = useMemo(
    () => filterTicketCollection(data?.closedTickets || [], search, statusFilter, categoryFilter),
    [categoryFilter, data?.closedTickets, search, statusFilter]
  );

  const activeCollection = useMemo(() => {
    switch (activeSection) {
      case 'my':
        return myTickets;
      case 'assigned':
        return assignedTickets;
      case 'closed':
        return closedTickets;
      default:
        return [];
    }
  }, [activeSection, assignedTickets, closedTickets, myTickets]);

  useEffect(() => {
    if (activeSection === 'raise' || activeCollection.length === 0) {
      setSelectedTicketId('');
      setDetail(null);
      return;
    }

    if (selectedTicketId && !activeCollection.some((ticket) => ticket.id === selectedTicketId)) {
      setSelectedTicketId('');
      setDetail(null);
    }
  }, [activeCollection, activeSection, selectedTicketId]);

  const visiblePeople = data?.people || [];
  const preferredOwner =
    visiblePeople.find((person) => person.role === 'hr_admin') ||
    visiblePeople.find((person) => person.role === 'super_admin') ||
    null;
  const ccOptions = visiblePeople
    .filter((person) => person.authUserId !== ownerAuthUserId)
    .filter((person) => {
      const searchValue = ccSearch.trim().toLowerCase();
      if (!searchValue) return true;
      const haystack = [person.name, person.email, person.employeeCode, person.role].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchValue);
    });
  const currentVisibleCount = visibleCounts[activeSection] || INITIAL_VISIBLE_COUNT;
  const visibleTickets = activeCollection.slice(0, currentVisibleCount);
  const isDetailViewOpen = activeSection !== 'raise' && Boolean(selectedTicketId && detail);

  const closeDetailView = () => {
    setSelectedTicketId('');
    setDetail(null);
    setShowCloseConfirm(false);
  };

  const resetCreateForm = () => {
    setSubject('');
    setDescription('');
    setCategory('attendance');
    setPriority('medium');
    setRaisedForAuthUserId(data?.actor?.authUserId || '');
    setOwnerAuthUserId(preferredOwner?.authUserId || data?.actor?.authUserId || '');
    setSelectedCc([]);
    setCcSearch('');
    setNewFiles([]);
  };

  useEffect(() => {
    if (!visiblePeople.length) return;
    if (ownerAuthUserId) return;
    if (preferredOwner?.authUserId) {
      setOwnerAuthUserId(preferredOwner.authUserId);
      return;
    }
    if (data?.actor?.authUserId) {
      setOwnerAuthUserId(data.actor.authUserId);
    }
  }, [data?.actor?.authUserId, ownerAuthUserId, preferredOwner?.authUserId, visiblePeople.length]);

  const handleCreateTicket = async () => {
    if (!subject.trim()) {
      showFeedback({ type: 'warning', title: 'Subject Required', message: 'Subject is required.' });
      return;
    }
    if (!description.trim()) {
      showFeedback({ type: 'warning', title: 'Description Required', message: 'Description is required.' });
      return;
    }
    if (!ownerAuthUserId) {
      showFeedback({ type: 'warning', title: 'Owner Required', message: 'Select one owner.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload = new FormData();
      payload.append(
        'payload',
        JSON.stringify({
          subject,
          description,
          category,
          priority,
          raisedForAuthUserId: raisedForAuthUserId || data?.actor?.authUserId || '',
          ownerAuthUserId,
          ccAuthUserIds: selectedCc,
        })
      );
      newFiles.forEach((file) => payload.append('files', file));

      const response = await fetch('/HRM/api/tickets', {
        method: 'POST',
        credentials: 'include',
        body: payload,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create ticket.');

      resetCreateForm();
      await loadTickets(false);
      setActiveSection('my');
      showFeedback({ type: 'success', title: 'Ticket Created', message: 'Ticket created successfully.' });
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Ticket Not Created', message: requestError instanceof Error ? requestError.message : 'Failed to create ticket.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!detail?.id) return;
    if (status === 'closed') {
      setShowCloseConfirm(true);
      return;
    }
    try {
      setIsSaving(true);
      const response = await fetch(`/HRM/api/tickets/${detail.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update ticket.');
      await loadTickets(true);
      await loadTicketDetail(detail.id);
      showFeedback({ type: 'success', title: 'Ticket Updated', message: 'Ticket status updated successfully.' });
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Ticket Not Updated', message: requestError instanceof Error ? requestError.message : 'Failed to update ticket.' });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmPermanentClose = async () => {
    if (!detail?.id) return;
    try {
      setIsSaving(true);
      const response = await fetch(`/HRM/api/tickets/${detail.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update ticket.');
      setShowCloseConfirm(false);
      await loadTickets(true);
      await loadTicketDetail(detail.id);
      showFeedback({ type: 'success', title: 'Ticket Closed', message: 'Ticket closed successfully.' });
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Ticket Not Updated', message: requestError instanceof Error ? requestError.message : 'Failed to update ticket.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminMetaUpdate = async (field: 'priority' | 'category' | 'ownerAuthUserId', value: string) => {
    if (!detail?.id) return;
    try {
      setIsSaving(true);
      const response = await fetch(`/HRM/api/tickets/${detail.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update ticket.');
      await loadTickets(true);
      await loadTicketDetail(detail.id);
      showFeedback({ type: 'success', title: 'Ticket Updated', message: 'Ticket details updated successfully.' });
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Ticket Not Updated', message: requestError instanceof Error ? requestError.message : 'Failed to update ticket.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!detail?.id) return;
    if (!commentBody.trim() && commentFiles.length === 0) {
      showFeedback({ type: 'warning', title: 'Comment Required', message: 'Add a message or attach at least one file.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload = new FormData();
      payload.append('payload', JSON.stringify({ commentBody }));
      commentFiles.forEach((file) => payload.append('files', file));

      const response = await fetch(`/HRM/api/tickets/${detail.id}/comments`, {
        method: 'POST',
        credentials: 'include',
        body: payload,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add comment.');

      setCommentBody('');
      setCommentFiles([]);
      await loadTickets(true);
      await loadTicketDetail(detail.id);
      showFeedback({ type: 'success', title: 'Comment Added', message: 'Your ticket comment was added successfully.' });
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Comment Not Added', message: requestError instanceof Error ? requestError.message : 'Failed to add comment.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReopen = async () => {
    if (!detail?.id) return;
    try {
      setIsSaving(true);
      const response = await fetch(`/HRM/api/tickets/${detail.id}/reopen`, { method: 'POST', credentials: 'include' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to reopen ticket.');
      await loadTickets(true);
      await loadTicketDetail(detail.id);
      setActiveSection('assigned');
      showFeedback({ type: 'success', title: 'Ticket Reopened', message: 'Ticket reopened successfully.' });
    } catch (requestError) {
      showFeedback({ type: 'error', title: 'Ticket Not Reopened', message: requestError instanceof Error ? requestError.message : 'Failed to reopen ticket.' });
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = variant === 'admin' ? 'Ticket Inbox' : 'HRM Tickets';
  const pageDescription =
    variant === 'admin'
      ? 'Review HR tickets, assign responsibility, and keep replies and attachments together in one shared workspace.'
      : 'Raise HR issues, follow their progress, and keep all replies, attachments, and closure updates in one place.';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <EmployeePageHeader icon="support_agent" title={pageTitle} description={pageDescription} />

      <section className="overflow-x-auto">
        <div
          ref={sectionRef}
          className="relative inline-grid min-w-[560px] grid-cols-4 items-center overflow-hidden rounded-[1.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(246,244,255,0.96)_100%)] p-1.5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <div
            className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/4)] rounded-[0.95rem] bg-[linear-gradient(135deg,rgba(245,238,255,1)_0%,rgba(224,210,255,1)_55%,rgba(208,186,255,1)_100%)] shadow-[0_10px_22px_rgba(167,139,250,0.24)] ring-1 ring-white/70 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(calc(${SECTION_CONFIG.findIndex((section) => section.key === activeSection)} * 100%))` }}
          />
          {SECTION_CONFIG.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-[0.9rem] px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  isActive ? 'text-violet-950' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{section.icon}</span>
                <span className="whitespace-nowrap">{section.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <LoadingPanel
          title="Loading tickets"
          message="We are preparing the latest ticket queues, filters, and conversation history."
        />
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div>
      ) : data?.setupPending ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
          Ticket database setup is pending. Apply the latest ticket migration first.
        </div>
      ) : activeSection === 'raise' ? (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6 editorial-shadow">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Subject</label>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Short issue title"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Priority</label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Raise For</label>
                <select
                  value={raisedForAuthUserId}
                  onChange={(event) => setRaisedForAuthUserId(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {visiblePeople.map((person) => (
                    <option key={person.authUserId} value={person.authUserId}>
                      {person.name} {person.employeeCode ? `(${person.employeeCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Raised To</label>
                <select
                  value={ownerAuthUserId}
                  onChange={(event) => {
                    const nextOwnerId = event.target.value;
                    setOwnerAuthUserId(nextOwnerId);
                    setSelectedCc((current) => current.filter((id) => id !== nextOwnerId));
                  }}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {visiblePeople.map((person) => (
                    <option key={person.authUserId} value={person.authUserId}>
                      {person.name} {person.employeeCode ? `(${person.employeeCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Explain the issue clearly so the main handler can act quickly."
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">CC</label>
                <div className="space-y-3 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-3">
                  <div>
                    <input
                      value={ccSearch}
                      onChange={(event) => setCcSearch(event.target.value)}
                      className="w-full rounded-2xl border border-outline-variant/20 bg-white/70 px-4 py-2.5 text-sm outline-none transition focus:border-violet-200 focus:ring-2 focus:ring-violet-100"
                      placeholder="Search CC people"
                    />
                  </div>
                  <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                    {ccOptions.map((person) => {
                      const checked = selectedCc.includes(person.authUserId);
                      return (
                        <label
                          key={person.authUserId}
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-colors ${
                            checked
                              ? 'border-violet-200 bg-violet-100 text-violet-900'
                              : 'border-transparent bg-white/70 text-on-surface hover:border-violet-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedCc((current) =>
                                checked ? current.filter((value) => value !== person.authUserId) : [...current, person.authUserId]
                              )
                            }
                          />
                          <AvatarNode person={person} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{person.name}</span>
                            <span className="block truncate text-xs text-on-surface-variant">
                              {person.employeeCode || person.role.replace('_', ' ')}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {ccOptions.length === 0 ? (
                    <div className="rounded-2xl bg-white/70 p-3">
                      <HrmEmptyState
                        compact
                        icon="person_search"
                        title="No matching people"
                        message="No people matched your CC search."
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Files</label>
                <FileDropzone files={newFiles} onFilesChange={setNewFiles} />
              </div>
            </div>
          </div>

          <div className="h-fit space-y-6 self-start rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6 editorial-shadow">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">Ticket Summary</p>
              <div className="mt-4 grid gap-3 text-sm text-on-surface">
                <p><span className="font-semibold">Raised by:</span> {personLabel(data?.actor)}</p>
                <p><span className="font-semibold">Raised To:</span> {personLabel(visiblePeople.find((person) => person.authUserId === ownerAuthUserId))}</p>
                <p><span className="font-semibold">Raise For:</span> {personLabel(visiblePeople.find((person) => person.authUserId === raisedForAuthUserId))}</p>
                <p><span className="font-semibold">CC count:</span> {selectedCc.length}</p>
                <p><span className="font-semibold">Files:</span> {newFiles.length}</p>
              </div>
            </div>

            {selectedCc.length ? (
              <div className="rounded-2xl bg-violet-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">CC Preview</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCc.map((authUserId) => {
                    const person = visiblePeople.find((item) => item.authUserId === authUserId);
                    return (
                      <span key={authUserId} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-900">
                        {person?.name || authUserId}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCreateTicket}
              disabled={isSaving}
              className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-md hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Creating Ticket...' : 'Create Ticket'}
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          {isDetailViewOpen ? (
            <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6 editorial-shadow">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeDetailView}
                  className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Tickets
                </button>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Detail View</span>
              </div>

              {detail ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{detail.ticketNo}</p>
                      <h2 className="mt-2 text-2xl font-headline font-bold text-on-surface">{detail.subject}</h2>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{detail.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">{detail.statusLabel}</span>
                      <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                        {detail.priorityLabel}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Ticket Flow</p>
                    <StatusPipeline detail={detail} />
                  </div>

                  {(detail.nextAllowedStep || detail.permissions.canReopen) ? (
                    <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Status Actions</p>
                      <StatusActionRow detail={detail} isSaving={isSaving} onAdvance={handleStatusUpdate} onReopen={handleReopen} />
                    </div>
                  ) : detail.status === 'closed' ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">Final Closure</p>
                      <p className="mt-2 text-sm font-semibold text-rose-800">Ticket has been permanently closed.</p>
                      <p className="mt-1 text-sm text-rose-700">No further reopen action is allowed for this ticket.</p>
                    </div>
                  ) : null}

                  {showCloseConfirm ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 px-4 backdrop-blur-[2px]">
                      <div className="w-full max-w-md rounded-[2rem] border border-rose-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                            <span className="material-symbols-outlined text-[24px]">warning</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">Permanent Close</p>
                            <h3 className="mt-2 text-lg font-bold text-slate-950">Close this ticket permanently?</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              This ticket will be permanently closed. After closing, it cannot be reopened again.
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() => setShowCloseConfirm(false)}
                            className="rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={confirmPermanentClose}
                            disabled={isSaving}
                            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving ? 'Closing...' : 'Yes, Close Permanently'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 rounded-3xl bg-surface-container-low p-5 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Requester</p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">{personLabel(detail.requester)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Raised To</p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">{personLabel(detail.owner)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Raised For</p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">{personLabel(detail.raisedFor)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Last Activity</p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">{formatTicketDateTime(detail.lastActivityAt)}</p>
                    </div>
                  </div>

                  {detail.ccPeople.length ? (
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">CC People</p>
                      <div className="flex flex-wrap gap-2">
                        {detail.ccPeople.map((person) => (
                          <span key={person.authUserId} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface">
                            {person.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {(detail.permissions.canEditMeta || detail.permissions.canReassign) ? (
                    <div className="grid gap-4 rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Priority</label>
                        <select
                          value={detail.priority}
                          onChange={(event) => handleAdminMetaUpdate('priority', event.target.value)}
                          className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm"
                        >
                          {PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Category</label>
                        <select
                          value={detail.category}
                          onChange={(event) => handleAdminMetaUpdate('category', event.target.value)}
                          className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm"
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Raised To</label>
                        <select
                          value={detail.owner?.authUserId || ''}
                          onChange={(event) => handleAdminMetaUpdate('ownerAuthUserId', event.target.value)}
                          className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm"
                        >
                          {visiblePeople.map((person) => (
                            <option key={person.authUserId} value={person.authUserId}>
                              {person.name} {person.employeeCode ? `(${person.employeeCode})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Ticket Files</p>
                    {detail.attachments.length ? (
                      <AttachmentList attachments={detail.attachments} />
                    ) : (
                      <div className="rounded-2xl bg-surface-container-low p-3">
                        <HrmEmptyState
                          compact
                          icon="attach_file"
                          title="No ticket files attached"
                          message="No files were attached to the ticket header."
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Conversation</p>
                      <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
                        {detail.comments.length} message(s)
                      </span>
                    </div>

                    {detail.comments.length ? (
                      <div className="space-y-5">
                        {detail.comments.map((comment, index) => (
                          <div key={comment.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-4">
                            <div className="relative flex flex-col items-center">
                              <AvatarNode person={comment.author} />
                              {index < detail.comments.length - 1 ? <div className="mt-3 h-full min-h-[56px] w-[2px] rounded-full bg-violet-200" /> : null}
                            </div>

                            <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-low p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-on-surface">{personLabel(comment.author)}</p>
                                  <p className="text-xs text-on-surface-variant">{formatTicketDateTime(comment.createdAt)}</p>
                                </div>
                              </div>
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-on-surface">{comment.body}</p>
                              {comment.attachments.length ? (
                                <div className="mt-4">
                                  <AttachmentList attachments={comment.attachments} />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-surface-container-low p-3">
                        <HrmEmptyState
                          compact
                          icon="forum"
                          title="No comments yet"
                          message="The conversation thread will appear here once someone replies to this ticket."
                        />
                      </div>
                    )}
                  </div>

                  {detail.permissions.canComment ? (
                    <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-4">
                      <div className="flex items-start justify-center pt-1">
                        <AvatarNode person={data?.actor || null} />
                      </div>

                      <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Reply</p>
                        <textarea
                          value={commentBody}
                          onChange={(event) => setCommentBody(event.target.value)}
                          rows={4}
                          className="w-full resize-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                          placeholder="Reply to this ticket..."
                        />
                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <input type="file" multiple onChange={(event) => setCommentFiles(Array.from(event.target.files || []))} className="text-sm" />
                          <button
                            type="button"
                            onClick={handleAddComment}
                            disabled={isSaving}
                            className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-md hover:shadow-violet-200 disabled:opacity-60"
                          >
                            {isSaving ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.6fr)_220px_220px] lg:justify-start">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full max-w-[360px] rounded-2xl border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-violet-200 focus:ring-2 focus:ring-violet-100"
                  placeholder="Search by ticket number or subject"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full max-w-[220px] rounded-2xl border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-violet-200 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">All Statuses</option>
                  {(data?.filters.statuses || []).map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full max-w-[220px] rounded-2xl border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-violet-200 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">All Categories</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {visibleTickets.length === 0 ? (
                <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5 editorial-shadow">
                  <HrmEmptyState
                    icon={
                      activeSection === 'my'
                        ? 'confirmation_number'
                        : activeSection === 'assigned'
                          ? 'assignment_ind'
                          : 'inventory_2'
                    }
                    title={
                      activeSection === 'my'
                        ? 'No tickets in your queue'
                        : activeSection === 'assigned'
                          ? 'No assigned tickets right now'
                          : 'No resolved tickets yet'
                    }
                    message="No tickets found in this section."
                  />
                </div>
              ) : (
                visibleTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    showCompactFlow={activeSection === 'closed'}
                    onSelect={() => {
                      setSelectedTicketId(ticket.id);
                      loadTicketDetail(ticket.id);
                    }}
                  />
                ))
              )}

              {activeCollection.length > currentVisibleCount ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCounts((current) => ({
                      ...current,
                      [activeSection]: (current[activeSection] || INITIAL_VISIBLE_COUNT) + INITIAL_VISIBLE_COUNT,
                    }))
                  }
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
                >
                  Load More
                </button>
              ) : null}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import EmployeePageHeader from '../../ui/EmployeePageHeader';

type OrgChartNode = {
  id: string;
  entityId: string;
  kind: 'super_admin' | 'employee' | 'group';
  name: string;
  employeeId: string | null;
  title: string;
  avatarUrl: string | null;
  parentId: string | null;
  childIds: string[];
  directReportCount: number;
  status?: string | null;
};

type OrgChartResponse = {
  success: boolean;
  roots: string[];
  nodes: OrgChartNode[];
  metadata?: {
    rootCount?: number;
    superAdminCount?: number;
    employeeCount?: number;
    reportingSuperAdminSupported?: boolean;
    generatedAt?: string;
  };
};

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 1.45;
const ZOOM_STEP = 0.1;

function formatWorkspaceDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

function buildStatusTone(node: OrgChartNode, isHighlighted: boolean) {
  if (isHighlighted) {
    return 'border-violet-400 bg-violet-50 shadow-[0_18px_44px_rgba(139,92,246,0.16)]';
  }

  if (node.kind === 'super_admin') {
    return 'border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.08)]';
  }

  if (node.kind === 'group') {
    return 'border-amber-200 bg-amber-50';
  }

  return 'border-outline-variant/20 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]';
}

function Avatar({ node }: { node: OrgChartNode }) {
  if (node.avatarUrl) {
    return (
      <Image
        alt={node.name}
        className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200"
        src={node.avatarUrl}
        width={48}
        height={48}
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
      <span className="material-symbols-outlined text-[22px]">
        {node.kind === 'super_admin' ? 'shield_person' : node.kind === 'group' ? 'warning' : 'person'}
      </span>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  if (!count) {
    return null;
  }

  return (
    <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
      {count}
    </span>
  );
}

function TreeNode({
  nodeId,
  nodes,
  expandedNodeIds,
  highlightedNodeIds,
  registerNodeRef,
  onToggle,
  depth = 0,
}: {
  nodeId: string;
  nodes: Map<string, OrgChartNode>;
  expandedNodeIds: Set<string>;
  highlightedNodeIds: Set<string>;
  registerNodeRef: (nodeId: string, element: HTMLButtonElement | null) => void;
  onToggle: (nodeId: string) => void;
  depth?: number;
}) {
  const node = nodes.get(nodeId);

  if (!node) {
    return null;
  }

  const hasChildren = node.childIds.length > 0;
  const showChildren = hasChildren && (depth === 0 || expandedNodeIds.has(nodeId));
  const isHighlighted = highlightedNodeIds.has(nodeId);

  return (
    <div className="flex flex-col items-center">
      <button
        ref={(element) => {
          registerNodeRef(nodeId, element);
        }}
        type="button"
        onClick={() => {
          if (hasChildren) {
            onToggle(nodeId);
          }
        }}
        className={`group relative w-[260px] rounded-[28px] border px-4 py-4 text-left transition-all ${buildStatusTone(node, isHighlighted)} ${
          hasChildren ? 'cursor-pointer hover:-translate-y-0.5 hover:border-violet-300' : 'cursor-default'
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar node={node} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[17px] font-bold text-slate-900">{node.name}</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">{node.title}</p>
              </div>
              <CountBadge count={node.directReportCount} />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>{node.kind === 'super_admin' ? 'Executive' : node.kind === 'group' ? 'Fallback Group' : 'Employee'}</span>
              {node.employeeId ? <span className="truncate tracking-[0.14em] text-slate-500">{node.employeeId}</span> : null}
            </div>
          </div>
        </div>

        {hasChildren ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            <span>{showChildren ? 'Hide team' : 'Show team'}</span>
            <span className="material-symbols-outlined text-[18px]">
              {showChildren ? 'remove' : 'add'}
            </span>
          </div>
        ) : null}
      </button>

      {showChildren ? (
        <div className="mt-4 flex w-full flex-col items-center">
          <div className="h-6 w-px bg-slate-300" />
          <div className="relative">
            {node.childIds.length > 1 ? (
              <div className="absolute left-12 right-12 top-0 h-px bg-slate-300" />
            ) : null}
            <div className="flex items-start justify-center gap-6 px-2 pt-0">
              {node.childIds.map((childId) => (
                <div key={childId} className="flex flex-col items-center">
                  <div className="h-6 w-px bg-slate-300" />
                  <TreeNode
                    nodeId={childId}
                    nodes={nodes}
                    expandedNodeIds={expandedNodeIds}
                    highlightedNodeIds={highlightedNodeIds}
                    registerNodeRef={registerNodeRef}
                    onToggle={onToggle}
                    depth={depth + 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function OrganizationChart({
  apiPath = '/HRM/api/admin/organization-chart',
}: {
  apiPath?: string;
}) {
  const todayLabel = useMemo(() => formatWorkspaceDate(new Date()), []);
  const [data, setData] = useState<OrgChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [dragState, setDragState] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    let active = true;

    async function loadOrganizationChart() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(apiPath, { method: 'GET' });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || 'Failed to load organization chart');
        }

        if (!active) {
          return;
        }

        setData(result);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load organization chart');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadOrganizationChart();

    return () => {
      active = false;
    };
  }, [apiPath]);

  const nodes = useMemo(
    () => new Map((data?.nodes || []).map((node) => [node.id, node])),
    [data]
  );

  const searchMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return Array.from(nodes.values())
      .filter((node) => {
        const haystack = `${node.name} ${node.employeeId || ''} ${node.title}`.toLowerCase();
        return haystack.includes(query);
      })
      .map((node) => node.id);
  }, [nodes, searchQuery]);

  const highlightedNodeIds = useMemo(() => new Set(searchMatches), [searchMatches]);

  const searchExpandedNodeIds = useMemo(() => {
    const expanded = new Set<string>();

    searchMatches.forEach((nodeId) => {
      let currentId = nodes.get(nodeId)?.parentId || null;

      while (currentId) {
        expanded.add(currentId);
        currentId = nodes.get(currentId)?.parentId || null;
      }
    });

    return expanded;
  }, [nodes, searchMatches]);

  const effectiveExpandedNodeIds = useMemo(() => {
    const expanded = new Set(expandedNodeIds);

    searchExpandedNodeIds.forEach((nodeId) => {
      expanded.add(nodeId);
    });

    return expanded;
  }, [expandedNodeIds, searchExpandedNodeIds]);

  useEffect(() => {
    if (!searchMatches.length) {
      return;
    }

    const firstMatchId = searchMatches[0];
    const element = nodeRefs.current[firstMatchId];

    if (!element) {
      return;
    }

    const timer = window.setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchMatches]);

  function handleToggle(nodeId: string) {
    setExpandedNodeIds((current) =>
      current.includes(nodeId) ? current.filter((item) => item !== nodeId) : [...current, nodeId]
    );
  }

  function registerNodeRef(nodeId: string, element: HTMLButtonElement | null) {
    nodeRefs.current = {
      ...nodeRefs.current,
      [nodeId]: element,
    };
  }

  function handleZoom(nextZoom: number) {
    setZoom(clampZoom(nextZoom));
  }

  function handleViewportMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!viewportRef.current) {
      return;
    }

    setDragState({
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
    });
  }

  function handleViewportMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!dragState.active || !viewportRef.current) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    viewportRef.current.scrollLeft = dragState.scrollLeft - deltaX;
    viewportRef.current.scrollTop = dragState.scrollTop - deltaY;
  }

  function endDragging() {
    setDragState((current) => (current.active ? { ...current, active: false } : current));
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    handleZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }

  const summaryCard = (
    <div className="inline-flex rounded-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-1 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] px-4 py-2.5 text-sm font-semibold text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]">
        <span className="material-symbols-outlined text-[18px]">account_tree</span>
        Live Reporting View
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-7 py-7 pb-10">
      <EmployeePageHeader
        icon="account_tree"
        title="Organization Chart"
        description={`Today: ${todayLabel}`}
        action={summaryCard}
      />

      <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
            <label className="relative block w-full max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                search
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Find by employee name or ID"
                className="w-full rounded-2xl border border-outline-variant/20 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 font-medium">
                {data?.metadata?.employeeCount || 0} employees
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 font-medium">
                {data?.metadata?.superAdminCount || 0} super admins
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => handleZoom(zoom - ZOOM_STEP)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              Zoom Out
            </button>
            <button
              type="button"
              onClick={() => handleZoom(1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => handleZoom(zoom + ZOOM_STEP)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              Zoom In
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium">Click a node to open its team</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium">Drag anywhere to move around the chart</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium">Use Ctrl + mouse wheel to zoom</span>
        </div>
      </section>

      <section className="p-0">
        {isLoading ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/25 bg-surface">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <span className="material-symbols-outlined animate-pulse text-[22px]">account_tree</span>
              Building organization chart...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-center">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-rose-700">Unable to load organization chart</p>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        ) : !data?.roots?.length ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/25 bg-surface p-6 text-center">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-700">No reporting data available yet</p>
              <p className="text-sm text-slate-500">Add employees and reporting relationships to see the organization tree.</p>
            </div>
          </div>
        ) : (
          <div
            ref={viewportRef}
            onMouseDown={handleViewportMouseDown}
            onMouseMove={handleViewportMouseMove}
            onMouseUp={endDragging}
            onMouseLeave={endDragging}
            onWheel={handleWheel}
            className={`subtle-scrollbar h-[72vh] overflow-auto bg-transparent p-0 ${
              dragState.active ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
          >
            <div
              className="origin-top-left"
              style={{
                transform: `scale(${zoom})`,
                width: 'max-content',
                minWidth: '100%',
              }}
            >
              <div className="flex min-w-[1180px] justify-center px-8 pb-20 pt-6">
                <div className="space-y-10">
                  <div className="flex items-start justify-center gap-14">
                    {data.roots.map((rootId) => (
                      <TreeNode
                        key={rootId}
                        nodeId={rootId}
                        nodes={nodes}
                        expandedNodeIds={effectiveExpandedNodeIds}
                        highlightedNodeIds={highlightedNodeIds}
                        registerNodeRef={registerNodeRef}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

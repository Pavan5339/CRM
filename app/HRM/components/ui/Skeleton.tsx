'use client';

import React from 'react';

export function Skeleton({
  className = '',
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function ShellSkeleton({
  sidebarWidthClass = 'w-60',
}: {
  sidebarWidthClass?: string;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className={`${sidebarWidthClass} fixed left-0 top-0 h-screen bg-surface-container-low px-6 py-5`}>
        <div className="flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="mt-4 h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-full" />
          ))}
        </div>
      </aside>

      <div className="ml-64 flex-1 px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
          <Skeleton className="h-72" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    </div>
  );
}

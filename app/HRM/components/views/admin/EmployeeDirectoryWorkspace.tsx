'use client';

import React, { useMemo } from 'react';
import EmployeePageHeader from '../../ui/EmployeePageHeader';
import EmployeeList from './EmployeeList';
import AddEmployee from './AddEmployee';
import DetailedEmployeeProfile from './DetailedEmployeeProfile';

type SectionMode = 'database' | 'add';

const SECTION_OPTIONS: Array<{ id: SectionMode; label: string; icon: string }> = [
  { id: 'database', label: 'Employee Database', icon: 'database' },
  { id: 'add', label: 'Add New Employee', icon: 'person_add' },
];

function formatWorkspaceDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function EmployeeDirectoryWorkspace({
  currentTab,
  setCurrentTab,
  selectedEmployeeId,
  setSelectedEmployeeId,
}: {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedEmployeeId?: string | null;
  setSelectedEmployeeId: (employeeId: string | null) => void;
}) {
  const todayLabel = useMemo(() => formatWorkspaceDate(new Date()), []);
  const activeSection: SectionMode = currentTab === 'admin-add-employee' ? 'add' : 'database';

  const switchAction = useMemo(
    () => (
      <div className="inline-flex rounded-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-1 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        {SECTION_OPTIONS.map((option) => {
          const isActive = activeSection === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setCurrentTab(option.id === 'database' ? 'admin-employee-list' : 'admin-add-employee');
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[linear-gradient(180deg,#eadcff_0%,#cfbdfd_100%)] text-violet-950 shadow-[0_10px_18px_rgba(167,139,250,0.16)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    ),
    [activeSection, setCurrentTab]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-7 py-7 pb-10">
      <EmployeePageHeader
        icon="badge"
        title="Employee Directory"
        description={`Today: ${todayLabel}`}
        action={switchAction}
      />

      {activeSection === 'database' ? (
        <div className="space-y-6">
          {selectedEmployeeId ? (
            <DetailedEmployeeProfile
              embedded
              employeeId={selectedEmployeeId}
              onBack={() => setSelectedEmployeeId(null)}
              setCurrentTab={setCurrentTab}
            />
          ) : (
            <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
              <EmployeeList
                hideHeader
                setCurrentTab={setCurrentTab}
                setSelectedEmployeeId={(employeeId) => setSelectedEmployeeId(employeeId)}
                selectedEmployeeId={selectedEmployeeId}
                onEmployeeSelect={(employeeId) => setSelectedEmployeeId(employeeId)}
                onAddEmployee={() => {
                  setCurrentTab('admin-add-employee');
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
          <AddEmployee
            embedded
            setCurrentTab={setCurrentTab}
          />
        </div>
      )}
    </div>
  );
}

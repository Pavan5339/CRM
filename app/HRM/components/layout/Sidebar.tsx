'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useHrmFeedback } from '../ui/HrmFeedback';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => Promise<void> | void;
  isLoggingOut?: boolean;
  employee?: {
    name?: string;
    employee_id?: string;
    email?: string;
    role?: string;
    profile_picture_url?: string;
    module_access?: { task_manager?: boolean }[] | { task_manager?: boolean } | null;
    designation?: { title?: string } | { name?: string } | null;
  } | null;
}

export default function Sidebar({ currentTab, setCurrentTab, employee, onLogout, isLoggingOut = false }: SidebarProps) {
  const { showFeedback } = useHrmFeedback();
  const [isTogglingAttendance, setIsTogglingAttendance] = useState(false);
  const [attendanceActionLabel, setAttendanceActionLabel] = useState<'Check In' | 'Check Out'>('Check In');
  const displayName = employee?.name || employee?.employee_id || 'Employee';
  const loginId = employee?.employee_id || employee?.email || 'LOGIN ID';
  const workEmail = employee?.email || 'Work email not set';
  const avatarSrc =
    employee?.profile_picture_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=DBEAFE&color=1E3A8A&size=160`;
  const moduleAccess = Array.isArray(employee?.module_access)
    ? employee?.module_access?.[0]
    : employee?.module_access;
  const hasTaskManagerAccess = employee ? moduleAccess?.task_manager !== false : false;
  const attendanceButtonClassName =
    'group relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-violet-400 via-violet-500 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(139,92,246,0.28)] transition-all duration-200 before:absolute before:inset-x-3 before:top-1 before:h-[42%] before:rounded-full before:bg-white/20 before:blur-md hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(139,92,246,0.34)] active:translate-y-1 active:shadow-[0_6px_14px_rgba(139,92,246,0.22)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

  useEffect(() => {
    let active = true;

    const resolveTodayAttendanceAction = async () => {
      const now = new Date();
      const attendanceMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      try {
        const response = await fetch(`/HRM/api/attendance?month=${attendanceMonth}`, { method: 'GET' });
        const result = await response.json();

        if (!active || !response.ok) {
          return;
        }

        const todayAction = result?.todayAction === 'check_out' ? 'Check Out' : 'Check In';
        setAttendanceActionLabel(todayAction);
      } catch {
        if (active) {
          setAttendanceActionLabel('Check In');
        }
      }
    };

    resolveTodayAttendanceAction();

    const refreshAttendanceAction = () => {
      resolveTodayAttendanceAction();
    };

    window.addEventListener('hrm-attendance-updated', refreshAttendanceAction);
    return () => {
      active = false;
      window.removeEventListener('hrm-attendance-updated', refreshAttendanceAction);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: 'dashboard' },
    { id: 'attendance', label: 'Attendance', icon: 'calendar_today' },
    { id: 'regularize-attendance', label: 'Regularization', icon: 'edit_calendar' },
    { id: 'tickets', label: 'Tickets', icon: 'support_agent' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt_long' },
    { id: 'organization-chart', label: 'Organization Chart', icon: 'account_tree' },
    { id: 'leave', label: 'Leave', icon: 'event_busy' },
    { id: 'salary', label: 'Salary', icon: 'payments' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  const handleTaskManagerRedirect = () => {
    if (!hasTaskManagerAccess || typeof window === 'undefined') {
      return;
    }

    window.location.href = '/Taskmanager/dashboard';
  };

  const handleQuickCheckIn = async () => {
    if (isTogglingAttendance) {
      return;
    }

    try {
      setIsTogglingAttendance(true);
      const response = await fetch('/HRM/api/attendance', { method: 'POST' });
      const result = await response.json();

      if (!response.ok) {
        showFeedback({
          type: 'warning',
          title: 'Attendance Not Marked',
          message: result.error || 'Unable to update attendance right now.',
        });
        return;
      }

      setAttendanceActionLabel(result.action === 'checked_in' ? 'Check Out' : 'Check In');
      window.dispatchEvent(new CustomEvent('hrm-attendance-updated'));
    } catch {
      showFeedback({
        type: 'error',
        title: 'Attendance Not Updated',
        message: 'Unable to update attendance right now.',
      });
    } finally {
      setIsTogglingAttendance(false);
    }
  };

  return (
    <aside className="subtle-scrollbar fixed left-0 top-0 z-50 flex h-screen w-60 flex-col overflow-y-auto bg-surface-container-low py-5 pr-4">
      <div className="px-6 mb-6">
        <div className="flex flex-col items-center text-center">
          <Image
            alt="User Profile Avatar"
            className="h-24 w-24 rounded-full object-cover shadow-md"
            src={avatarSrc}
            width={96}
            height={96}
            unoptimized={!employee?.profile_picture_url}
          />
          <div className="mt-4 min-w-0">
            <p className="font-headline text-sm font-bold text-on-surface break-words">
              {displayName}
              <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                {loginId}
              </span>
            </p>
            <p className="mt-2 text-[11px] text-on-surface-variant break-all">
              {workEmail}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 transition-colors group ${
                isActive 
                  ? 'text-primary bg-surface-container-lowest rounded-r-full font-bold shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50 rounded-r-full'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span
                className={`font-body text-sm min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-6 mt-3">
        <button
          onClick={handleQuickCheckIn}
          disabled={isTogglingAttendance}
          className={attendanceButtonClassName}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">
              {attendanceActionLabel === 'Check Out' ? 'logout' : 'login'}
            </span>
            {isTogglingAttendance ? 'Updating...' : attendanceActionLabel}
          </span>
        </button>
      </div>

      <div className="mt-auto border-t border-outline-variant/10 pt-4">
        <button
          onClick={handleTaskManagerRedirect}
          disabled={!hasTaskManagerAccess}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-on-surface-variant hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-on-surface-variant"
          title={hasTaskManagerAccess ? 'Open Task Manager' : 'Task Manager access is not enabled'}
        >
          <span className="material-symbols-outlined">home_app_logo</span>
          <span className="font-body text-sm font-medium">Task Manager</span>
        </button>
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-error/80 hover:text-error transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-5 py-2.5 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-body text-sm font-medium">Home Page</span>
        </Link>
      </div>
    </aside>
  );
}

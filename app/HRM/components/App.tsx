'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import Leave from './views/Leave';
import Attendance from './views/Attendance';
import RegularizeAttendance from './views/RegularizeAttendance';
import Salary from './views/Salary';
import Tickets from './views/Tickets';
import Expenses from './views/Expenses';
import OrganizationChart from './views/admin/OrganizationChart';
import { ShellSkeleton } from './ui/Skeleton';
import { HrmFeedbackProvider } from './ui/HrmFeedback';
import { createClient } from '@/utils/supabase/client';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [employee, setEmployee] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ home: true });

  useEffect(() => {
    let active = true;

    async function loadEmployee() {
      try {
        const response = await fetch('/HRM/api/employee/me', { method: 'GET' });
        const result = await response.json();

        if (!response.ok || !active) {
          return;
        }

        setEmployee(result.employee || null);
      } catch {
        if (active) {
          setEmployee(null);
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    }

    loadEmployee();

    return () => {
      active = false;
    };
  }, []);

  const refreshEmployee = async () => {
    const response = await fetch('/HRM/api/employee/me', { method: 'GET' });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to refresh employee profile');
    }

    setEmployee(result.employee || null);
    return result.employee || null;
  };

  useEffect(() => {
    setVisitedTabs((current) => (current[currentTab] ? current : { ...current, [currentTab]: true }));
  }, [currentTab]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to sign out employee:', error);
    } finally {
      setEmployee(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const tabViews: Record<string, React.ReactNode> = {
    home: <Dashboard employee={employee} setCurrentTab={setCurrentTab} onLogout={handleLogout} isLoggingOut={isLoggingOut} />,
    attendance: <Attendance onOpenRegularizeAttendance={() => setCurrentTab('regularize-attendance')} />,
    'regularize-attendance': <RegularizeAttendance />,
    tickets: <Tickets variant="employee" />,
    expenses: <Expenses variant="employee" />,
    'organization-chart': <OrganizationChart apiPath="/HRM/api/employee/organization-chart" />,
    leave: <Leave />,
    salary: <Salary employee={employee} />,
    profile: <Profile employee={employee} onEmployeeChange={setEmployee} onRefreshEmployee={refreshEmployee} />,
  };

  if (isBootstrapping) {
    return <ShellSkeleton />;
  }

  return (
    <HrmFeedbackProvider>
      <div className="flex min-h-screen bg-surface">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        employee={employee}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      
      <div className="flex-1 flex min-w-0 flex-col ml-64">
        <main
          className={`flex-1 relative ${
            currentTab === 'organization-chart'
              ? ''
              : 'px-5 pt-6 pb-8 pr-8 lg:px-6 lg:pr-10 lg:pt-6'
          }`}
        >
          {Object.entries(tabViews).map(([tabId, view]) => {
            if (!visitedTabs[tabId]) {
              return null;
            }

            return (
              <div key={tabId} className={currentTab === tabId ? 'block' : 'hidden'}>
                {view}
              </div>
            );
          })}
          {!tabViews[currentTab] ? (
            <div className="flex items-center justify-center h-[60vh]">
              <p className="text-on-surface-variant">This view is under construction.</p>
            </div>
          ) : null}
        </main>
      </div>
      </div>
    </HrmFeedbackProvider>
  );
}


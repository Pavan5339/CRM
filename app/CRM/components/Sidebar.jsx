"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  Activity, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Package, 
  UserCircle, 
  Link as LinkIcon, 
  Mail, 
  Zap, 
  Settings, 
  Settings2, 
  Bot, 
  Info,
  ChevronLeft,
  Moon,
  Sun,
  MessageSquareCode,
  Database,
  Loader2,
  X
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

const SidebarItem = ({ icon: Icon, label, href, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = href ? pathname === href : false;

  return (
    <Link 
      href={href || "#"} 
      className={`flex items-center py-3 cursor-pointer transition-colors duration-200 ${
        isActive 
          ? 'bg-slate-800 border-l-4 border-blue-400 text-white dark:bg-slate-800 dark:border-blue-500' 
          : 'border-l-4 border-transparent text-slate-300 hover:bg-slate-800 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800'
      } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
      {!isCollapsed && <span className="text-sm font-medium truncate">{label}</span>}
    </Link>
  );
};

const Divider = () => (
  <div className="my-2 border-t border-slate-700 mx-4" />
);

const SidebarAction = ({ icon: Icon, label, onClick, isCollapsed }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center border-l-4 border-transparent py-3 text-left text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800 ${
      isCollapsed ? 'justify-center px-0' : 'px-4'
    }`}
    title={isCollapsed ? label : undefined}
  >
    <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
    {!isCollapsed && <span className="truncate text-sm font-medium">{label}</span>}
  </button>
);

const IMPORT_TABLES = [
  { value: 'service_enquiries', label: 'Service Enquiries' },
  { value: 'voice_requirements', label: 'Voice Requirements' },
];

const IMPORT_LIMITS = [25, 50, 100, 500];

const ImportDataModal = ({ open, onClose }) => {
  const { currentUser, refreshCrmData } = useCrm();
  const [selectedTables, setSelectedTables] = React.useState(IMPORT_TABLES.map((table) => table.value));
  const [limit, setLimit] = React.useState(50);
  const [isImporting, setIsImporting] = React.useState(false);
  const [summary, setSummary] = React.useState(null);
  const [error, setError] = React.useState('');

  if (!open) return null;

  const toggleTable = (table) => {
    setSelectedTables((current) => {
      if (current.includes(table)) {
        return current.length === 1 ? current : current.filter((value) => value !== table);
      }
      return [...current, table];
    });
  };

  const importData = async () => {
    setIsImporting(true);
    setError('');
    setSummary(null);

    try {
      const response = await fetch('/CRM/api/import-followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: selectedTables,
          limit,
          currentUser: { role: currentUser.role },
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setSummary(result);
      await refreshCrmData();
    } catch (importError) {
      setError(importError.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import Data</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sync source enquiries into CRM leads and follow-ups.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close import data modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <fieldset>
            <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">Source tables</legend>
            <div className="mt-3 space-y-2">
              {IMPORT_TABLES.map((table) => (
                <label key={table.value} className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table.value)}
                    onChange={() => toggleTable(table.value)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {table.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Row limit</span>
            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {IMPORT_LIMITS.map((value) => (
                <option key={value} value={value}>{value} rows</option>
              ))}
            </select>
          </label>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          {summary && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <div className="font-semibold">Imported {summary.imported ?? 0} rows</div>
              <div className="mt-2 space-y-1">
                {Object.entries(summary.tables || {}).map(([table, count]) => (
                  <div key={table} className="flex justify-between gap-4">
                    <span>{IMPORT_TABLES.find((item) => item.value === table)?.label || table}</span>
                    <span>{count} fetched</span>
                  </div>
                ))}
              </div>
              {summary.skipped > 0 && <div className="mt-2">{summary.skipped} skipped</div>}
              {summary.errors?.length > 0 && <div className="mt-2">{summary.errors.length} rows need attention</div>}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={importData}
            disabled={isImporting || selectedTables.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { currentUser, isDarkMode, toggleDarkMode, permissions, isSidebarCollapsed, toggleSidebar } = useCrm();
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  // "Admin" and "Manager" are the only roles that see the dashboard link
  const canViewDashboard = ["admin", "manager"].includes(currentUser.role);
  const canImportData = currentUser.role === 'admin';

  return (
    <>
    <div className={`flex flex-col h-screen bg-slate-900 dark:bg-slate-950 text-slate-300 flex-shrink-0 shadow-xl overflow-y-auto scrollbar-hide border-r border-transparent dark:border-slate-800 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Top Header Section */}
      <div className={`flex flex-col pt-4 pb-6 ${isSidebarCollapsed ? 'px-2 items-center' : 'px-4'}`}>
        <div className={`flex items-center mb-6 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && <h1 className="text-lg font-semibold text-white tracking-wide">TasksFlow</h1>}
          <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-white shrink-0">
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className={`${isSidebarCollapsed ? 'w-12 h-12 mb-2' : 'w-20 h-20 mb-3'} rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-600 shadow-inner transition-all duration-300`}>
             <span className={`${isSidebarCollapsed ? 'text-lg' : 'text-2xl'} font-bold text-slate-400`}>
               {currentUser.name.substring(0, 2).toUpperCase()}
             </span>
          </div>
          
          {!isSidebarCollapsed && (
            <>
              <h2 className="text-white font-bold text-base mb-1 text-center truncate w-full">{currentUser.name}</h2>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-200 tracking-wide uppercase">
                {currentUser.role}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 flex flex-col py-2">
        <div className={`mb-2 ${isSidebarCollapsed ? 'text-center' : 'px-4'}`}>
          {isSidebarCollapsed ? (
             <div className="w-8 mx-auto border-t border-slate-700" />
          ) : (
             <span className="text-xs font-semibold text-slate-500 tracking-wider">MAIN</span>
          )}
        </div>
        
        <div className="flex flex-col space-y-1 mb-2">
          {canViewDashboard && <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/CRM/dashboard" isCollapsed={isSidebarCollapsed} />}
          {canImportData && <SidebarAction icon={Database} label="Import Data" onClick={() => setIsImportModalOpen(true)} isCollapsed={isSidebarCollapsed} />}
          <SidebarItem icon={Users} label="Lead Tracking" href="/CRM/leads" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Activity} label="Activities" href="/CRM/activities" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={CheckSquare} label="Tasks" href="/CRM/tasks" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={MessageSquareCode} label="Follow-ups" href="/CRM/followups" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={CalendarIcon} label="Calendar" href="/CRM/calendar" isCollapsed={isSidebarCollapsed} />
        </div>

        <Divider />

        <div className="flex flex-col space-y-1 my-2">
          <SidebarItem icon={Package} label="Products & Services" href="/CRM/products" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={UserCircle} label="Customers" href="/CRM/customers" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={LinkIcon} label="Lead Sources" href="/CRM/sources" isCollapsed={isSidebarCollapsed} />
          {permissions.canManageEmailTemplates && <SidebarItem icon={Mail} label="Email Templates" href="/CRM/templates" isCollapsed={isSidebarCollapsed} />}
          {permissions.canManageEmailTemplates && <SidebarItem icon={Mail} label="Campaigns" href="/CRM/campaigns" isCollapsed={isSidebarCollapsed} />}
          {permissions.canManageEmailTemplates && <SidebarItem icon={Zap} label="Email Triggers" href="/CRM/triggers" isCollapsed={isSidebarCollapsed} />}
        </div>

        {permissions.canManageSystemSettings && (
          <>
            <Divider />
            <div className="flex flex-col space-y-1 my-2">
              <SidebarItem icon={Settings} label="Settings" href="/CRM/settings" isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={Settings2} label="System Settings" href="#" isCollapsed={isSidebarCollapsed} />
            </div>
          </>
        )}

        <Divider />

        <div className="flex flex-col space-y-1 mt-2 mb-4">
          <SidebarItem icon={Bot} label="AI Assistant" href="/CRM/ai-assistant" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Info} label="About App" href="#" isCollapsed={isSidebarCollapsed} />
        </div>
        
      </div>

      {/* RBAC MOCK controls / Dark Mode */}
      <div className={`p-4 bg-slate-800 dark:bg-slate-900 border-t border-slate-700 mt-auto ${isSidebarCollapsed ? 'flex flex-col items-center justify-center p-2 pt-4 pb-4' : ''}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'justify-between'}`}>
          {!isSidebarCollapsed && <span className="text-xs font-bold text-slate-400">DARK MODE</span>}
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition shadow-sm"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
    <ImportDataModal open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </>
  );
};

export default Sidebar;

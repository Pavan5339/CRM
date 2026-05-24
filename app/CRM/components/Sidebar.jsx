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
  UserCog, 
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
  Sun
} from 'lucide-react';
import { useCrm, MOCK_USERS } from '../context/CrmContext';

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

const Sidebar = () => {
  const { currentUser, switchUser, isDarkMode, toggleDarkMode, permissions, isSidebarCollapsed, toggleSidebar } = useCrm();

  // "Admin" and "Manager" are the only roles that see the dashboard link
  const canViewDashboard = ["admin", "manager"].includes(currentUser.role);

  return (
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
          <SidebarItem icon={Users} label="Lead Tracking" href="/CRM/leads" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={KanbanSquare} label="Pipeline" href="/CRM/leads" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Activity} label="Activities" href="/CRM/activities" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={CheckSquare} label="Tasks" href="/CRM/tasks" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={CalendarIcon} label="Calendar" href="/CRM/calendar" isCollapsed={isSidebarCollapsed} />
        </div>

        <Divider />

        <div className="flex flex-col space-y-1 my-2">
          {permissions.canManageUsers && <SidebarItem icon={UserCog} label="Users Management" href="/CRM/users" isCollapsed={isSidebarCollapsed} />}
          <SidebarItem icon={Package} label="Products & Services" href="/CRM/products" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={UserCircle} label="Customers" href="/CRM/customers" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={LinkIcon} label="Lead Sources" href="/CRM/sources" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Package} label="Payments" href="/CRM/payments" isCollapsed={isSidebarCollapsed} />
          {permissions.canManageEmailTemplates && <SidebarItem icon={Mail} label="Email Templates" href="/CRM/templates" isCollapsed={isSidebarCollapsed} />}
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
        <div className={`flex items-center mb-4 ${isSidebarCollapsed ? 'justify-center w-full' : 'justify-between'}`}>
          {!isSidebarCollapsed && <span className="text-xs font-bold text-slate-400">DARK MODE</span>}
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition shadow-sm"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
        
        {!isSidebarCollapsed && (
          <>
            <div className="text-xs font-bold text-slate-400 mb-2 mt-2">TEST AS (RBAC)</div>
            <div className="grid grid-cols-2 gap-2 pb-2">
              {Object.keys(MOCK_USERS).map(roleKey => (
                <button 
                  key={roleKey}
                  onClick={() => switchUser(roleKey)}
                  className={`text-[10px] py-1.5 px-2 rounded font-bold uppercase transition shadow-sm
                    ${currentUser.role === roleKey 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  {roleKey}
                </button>
              ))}
            </div>
          </>
        )}
        
        {isSidebarCollapsed && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-700 w-full px-1">
             {Object.keys(MOCK_USERS).map(roleKey => (
                <button 
                  key={roleKey}
                  onClick={() => switchUser(roleKey)}
                  title={`Test as: ${roleKey}`}
                  className={`text-[10px] py-2 px-1 rounded font-bold uppercase transition shadow-sm w-full text-center truncate
                    ${currentUser.role === roleKey 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  {roleKey.substring(0, 3)}
                </button>
              ))}
          </div>
        )}
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
  );
};

export default Sidebar;

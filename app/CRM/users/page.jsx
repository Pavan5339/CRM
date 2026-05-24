"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrm, MOCK_USERS } from '../context/CrmContext';
import { UserCog, Shield, ShieldAlert, ShieldCheck, Mail, Edit3, Trash2, Plus } from 'lucide-react';

export default function UsersManagementPage() {
  const { currentUser, permissions } = useCrm();
  const router = useRouter();
  const [users, setUsers] = useState(Object.values(MOCK_USERS));

  if (!permissions.canManageUsers) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-8 text-center transition-colors">
        <div className="max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-red-200 dark:border-red-900/50">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your role (<span className="uppercase font-bold">{currentUser.role}</span>) does not have authorization to view or manage global user directories. Administrator access required.
          </p>
          <button 
            onClick={() => router.push('/CRM/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            Acknowledge
          </button>
        </div>
      </div>
    );
  }

  const handleAddUser = () => {
    const newUser = {
      id: "u" + (Math.floor(Math.random() * 90) + 10),
      name: "New Local User",
      role: "viewer",
      email: "new.user@organization.com"
    };
    setUsers([...users, newUser]);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'manager': return <ShieldCheck className="w-4 h-4 text-orange-500" />;
      case 'sales': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 'manager': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
      case 'sales': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="p-8 text-slate-800 dark:text-slate-100 transition-colors duration-300 h-full overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Users Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Control system access and Role-Based Access Control (RBAC) levels.</p>
        </div>
        <button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition shadow flex items-center text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-x-auto transition-colors duration-300">
        <div className="flex items-center space-x-3 mb-6">
           <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <UserCog className="w-6 h-6" />
           </div>
           <h2 className="text-xl font-bold dark:text-white">Active Directory</h2>
        </div>
        
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm">
              <th className="py-3 px-4 font-semibold text-sm">System ID</th>
              <th className="py-3 px-4 font-semibold text-sm">Display Name</th>
              <th className="py-3 px-4 font-semibold text-sm">Email Address</th>
              <th className="py-3 px-4 font-semibold text-sm">Access Role</th>
              <th className="py-3 px-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="py-3 px-4 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{user.id}</td>
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{user.name}</td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center"><Mail className="w-3 h-3 mr-2" /> {user.email || `${user.id}@organization.com`}</span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded font-bold uppercase text-[10px] tracking-wider flex w-fit items-center ${getRoleBadgeColor(user.role)}`}>
                    <span className="mr-1">{getRoleIcon(user.role)}</span> {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                   <button className="text-slate-400 hover:text-blue-500 transition px-2"><Edit3 className="w-4 h-4 inline" /></button>
                   <button className="text-slate-400 hover:text-red-500 transition px-2 disabled:opacity-50" disabled={currentUser.id === user.id}>
                     <Trash2 className="w-4 h-4 inline" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

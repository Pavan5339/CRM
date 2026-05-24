"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrm } from '../context/CrmContext';
import MOCK_DATA from '../data/mockData.json';
import { Mail, Edit3, Type } from 'lucide-react';
import AddTemplateModal from '../components/AddTemplateModal';

export default function TemplatesPage() {
  const { currentUser } = useCrm();
  const router = useRouter();
  const [templates, setTemplates] = useState(MOCK_DATA.email_templates);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Strict RBAC: Admins ONLY
  if (currentUser.role !== 'admin') {
    return (
      <div className="flex h-[80vh] items-center justify-center p-8 text-center transition-colors">
        <div className="max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-red-200 dark:border-red-900/50">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your role (<span className="uppercase font-bold">{currentUser.role}</span>) does not have authorization to view or edit outbound email templates. Administrator access required.
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

  const handleAddTemplate = (newTemplate) => {
    setTemplates([newTemplate, ...templates]);
  };

  return (
    <div className="p-8 text-slate-800 dark:text-slate-100 transition-colors duration-300 h-full overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Email Templates</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage organizational communication blueprints.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition shadow-sm text-sm flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{template.name}</h3>
              <button title="Edit Template" className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded transition opacity-0 group-hover:opacity-100">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3 rounded mb-4">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center uppercase tracking-wide">
                <Type className="w-3 h-3 mr-1" /> Subject
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {template.subject}
              </p>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3 rounded overflow-hidden relative">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Body
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line text-ellipsis overflow-hidden">
                {template.body}
              </p>
              {/* Fade out bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent"></div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-2">
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{"{{CompanyName}}"}</span>
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{"{{ContactName}}"}</span>
            </div>
          </div>
        ))}
      </div>

      <AddTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTemplate}
      />
    </div>
  );
}

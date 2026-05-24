"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrm } from '../context/CrmContext';
import MOCK_DATA from '../data/mockData.json';
import { DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  const { currentUser, permissions } = useCrm();
  const router = useRouter();
  const [payments, setPayments] = useState(MOCK_DATA.payments);

  // Strict RBAC: Viewers cannot see this financial route
  if (currentUser.role === 'viewer') {
    return (
      <div className="flex h-[80vh] items-center justify-center p-8 text-center transition-colors">
        <div className="max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-red-200 dark:border-red-900/50">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Financial Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your current role (<span className="uppercase font-bold">{currentUser.role}</span>) does not have clearance to view payment logs.
          </p>
          <button 
            onClick={() => router.push('/CRM/leads')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            Return to Pipeline
          </button>
        </div>
      </div>
    );
  }

  const getLeadName = (leadId) => {
    const lead = MOCK_DATA.leads.find(l => l.id === leadId) || MOCK_DATA.customers.find(c => c.id === leadId);
    return lead ? lead.company : "Unknown Account";
  };

  const handleAddPayment = () => {
    const newPayment = {
      id: Math.floor(Math.random() * 1000) + 1000,
      leadId: MOCK_DATA.leads[0]?.id || 1, // Map to first lead
      amount: "$" + (Math.floor(Math.random() * 50) + 10) + ",000",
      type: "Full",
      status: "Paid",
      date: new Date().toISOString().split('T')[0]
    };
    setPayments([newPayment, ...payments]);
  };

  return (
    <div className="p-8 text-slate-800 dark:text-slate-100 transition-colors duration-300 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white mb-2">Payment Tracking</h1>
        <p className="text-slate-500 dark:text-slate-400">Monitor installments and full account clearances.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-x-auto transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <DollarSign className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-bold dark:text-white">Transaction Logs</h2>
          </div>
          {!permissions.isReadOnly && (
             <button onClick={handleAddPayment} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition shadow-sm text-sm">
               + Log Payment
             </button>
          )}
        </div>
        
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm">
              <th className="py-3 px-4 font-semibold text-sm">Account</th>
              <th className="py-3 px-4 font-semibold text-sm">Amount</th>
              <th className="py-3 px-4 font-semibold text-sm">Type</th>
              <th className="py-3 px-4 font-semibold text-sm">Status</th>
              <th className="py-3 px-4 font-semibold text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{getLeadName(payment.leadId)}</td>
                <td className="py-3 px-4 text-green-600 dark:text-green-400 font-bold">{payment.amount}</td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                  <span className={`px-2 py-1 rounded font-medium text-xs ${payment.type === "Full" ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {payment.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded font-medium text-xs ${payment.status === "Paid" ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(payment.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

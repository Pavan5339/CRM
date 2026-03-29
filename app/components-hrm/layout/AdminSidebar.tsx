import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function AdminSidebar({ currentTab, setCurrentTab }: AdminSidebarProps) {
  const router = useRouter();

  const navItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: 'admin_panel_settings' },
    { id: 'admin-employee-list', label: 'Employee Directory', icon: 'groups' },
    { id: 'admin-payouts', label: 'Payouts & Payroll', icon: 'account_balance_wallet' },
    { id: 'admin-analytics', label: 'Analytics', icon: 'insights' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-surface-container-low flex flex-col py-6 pr-4 border-r border-outline-variant/20 z-50">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-on-background font-headline">HR Admin</h1>
      </div>
      
      <div className="px-6 mb-8 flex items-center gap-4">
        <img 
          alt="Admin Avatar" 
          className="w-10 h-10 rounded-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9uJH1i8zKJXpfoh9Yh7RZq-cTIioMkp9r80fWS8nWmkFmSlAR6QQxpRyQeDtE_9Wd0EMhYRoe1ggQDke6PEOzhTnhpnEkRsd1tsMnXXNCmA5NiFdaEB2vZ36t48qERBFgrPdQ-vsjFkPIYoT1rgK-_V1L2GUz9AHHp6W3Wj_iAD9uO3DFM53TyeACEXl8hT8r3zGTBhrEumYXhJ_PIwkjBuM_PQr_4_IAA2KHVpN50FvS2_BfHcEmxMSDMl0o9e7CZgE2KpxQcqk"
        />
        <div>
          <p className="font-headline text-sm font-bold text-on-surface">Alex Rivers</p>
          <p className="text-[10px] tracking-widest uppercase text-error font-bold">Administrator</p>
        </div>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 transition-colors group ${
                isActive 
                  ? 'text-primary bg-surface-container-lowest rounded-r-full font-bold shadow-sm border-y border-r border-outline-variant/10' 
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
                className={`font-body text-sm min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant/10 pt-6 space-y-2">
        <Link href="/hrm" className="w-full flex items-center gap-3 px-5 py-2.5 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">exit_to_app</span>
          <span className="font-body text-sm font-medium">Exit Admin Mode</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-5 py-2.5 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}

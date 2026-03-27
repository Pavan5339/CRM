import React from 'react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'dashboard' },
    { id: 'attendance', label: 'Attendance', icon: 'calendar_today' },
    { id: 'leave', label: 'Leave', icon: 'event_busy' },
    { id: 'salary', label: 'Salary', icon: 'payments' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <aside className="h-screen w-60 fixed left-0 top-0 overflow-y-auto bg-surface-container-low flex flex-col py-6 pr-4 z-50">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-on-background font-headline">Sanctuary HR</h1>
      </div>
      
      <div className="px-6 mb-6 flex items-center gap-4">
        <img 
          alt="User Profile Avatar" 
          className="w-10 h-10 rounded-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9uJH1i8zKJXpfoh9Yh7RZq-cTIioMkp9r80fWS8nWmkFmSlAR6QQxpRyQeDtE_9Wd0EMhYRoe1ggQDke6PEOzhTnhpnEkRsd1tsMnXXNCmA5NiFdaEB2vZ36t48qERBFgrPdQ-vsjFkPIYoT1rgK-_V1L2GUz9AHHp6W3Wj_iAD9uO3DFM53TyeACEXl8hT8r3zGTBhrEumYXhJ_PIwkjBuM_PQr_4_IAA2KHVpN50FvS2_BfHcEmxMSDMl0o9e7CZgE2KpxQcqk"
        />
        <div>
          <p className="font-headline text-sm font-bold text-on-surface">Alex Rivers</p>
          <p className="text-[10px] tracking-widest uppercase text-on-surface-variant font-medium">Product Designer</p>
        </div>
      </div>

      <nav className="flex-grow space-y-1">
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
              <span className={`font-body text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-6 mt-4">
        <button className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
          Quick Check-in
        </button>
      </div>

      <div className="mt-auto border-t border-outline-variant/10 pt-6">
        <button className="w-full flex items-center gap-3 px-5 py-2.5 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body text-sm font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-5 py-2.5 text-error/80 hover:text-error transition-colors">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

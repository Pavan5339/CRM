export const metadata = {
  title: 'CRM Dashboard',
  description: 'Manage customer relationships, sales pipelines, and track leads.',
};

import Sidebar from './components/Sidebar';
import { CrmProvider } from './context/CrmContext';

export default function CRMLayout({ children }) {
  return (
    <CrmProvider>
      <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </CrmProvider>
  );
}
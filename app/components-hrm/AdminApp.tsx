import React, { useState } from 'react';
import AdminSidebar from './layout/AdminSidebar';
import TopBar from './layout/TopBar';

// We will import the actual views here once they are created
import AdminDashboard from './views/admin/AdminDashboard';
import PayoutsPayroll from './views/admin/PayoutsPayroll';
import EmployeeList from './views/admin/EmployeeList';
import DetailedEmployeeProfile from './views/admin/DetailedEmployeeProfile';
import AddEmployee from './views/admin/AddEmployee';
import EmployeeAnalytics from './views/admin/EmployeeAnalytics';

export default function AdminApp() {
  const [currentTab, setCurrentTab] = useState('admin-dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-employee-list':
        return <EmployeeList setCurrentTab={setCurrentTab} />;
      case 'admin-payouts':
        return <PayoutsPayroll />;
      case 'admin-analytics':
        return <EmployeeAnalytics />;
      // Detailed views
      case 'admin-employee-profile':
        return <DetailedEmployeeProfile />;
      case 'admin-add-employee':
        return <AddEmployee />;
      default:
        return (
          <div className="flex items-center justify-center p-12">
            <p className="text-on-surface-variant text-lg">This view is under construction.</p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case 'admin-dashboard': return 'Admin Dashboard';
      case 'admin-employee-list': return 'Employee Directory';
      case 'admin-payouts': return 'Payouts & Payroll';
      case 'admin-analytics': return 'Analytics';
      case 'admin-employee-profile': return 'Employee Profile';
      case 'admin-add-employee': return 'Add New Employee';
      default: return 'HR Admin Panel';
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <TopBar title={getTitle()} showDate={currentTab === 'admin-dashboard'} />
        
        <main className="flex-1 relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

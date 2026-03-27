import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import Leave from './views/Leave';
import Attendance from './views/Attendance';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Dashboard />;
      case 'attendance':
        return <Attendance />;
      case 'leave':
        return <Leave />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-on-surface-variant">This view is under construction.</p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case 'home': return '';
      case 'attendance': return 'Attendance';
      case 'leave': return 'Leave Management';
      case 'profile': return 'Profile';
      default: return 'Sanctuary HR';
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <div className="flex-1 flex flex-col ml-64">
        <TopBar title={getTitle()} showDate={currentTab === 'home'} />
        
        <main className="flex-1 relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}


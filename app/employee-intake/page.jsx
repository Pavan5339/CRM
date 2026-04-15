'use client';

import '@/app/HRM/components/styles/index.css';
import AddEmployee from '@/app/HRM/components/views/admin/AddEmployee';

export default function EmployeeIntakePage() {
  return (
    <div className="min-h-screen bg-surface">
      <AddEmployee
        publicMode
        metaUrl="/HRM/api/employees?includeMeta=1&public=1"
        submitUrl="/HRM/api/employees?public=1"
      />
    </div>
  );
}

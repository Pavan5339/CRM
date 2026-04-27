'use client';

import '@/app/HRM/components/styles/index.css';
import HRMApp from '@/app/HRM/components/App';
import { ModuleAccessGate } from '@/app/components-homepage/ModuleAccessGate';

export default function HRMPage() {
  return (
    <ModuleAccessGate moduleKey="hrm" moduleLabel="HRM">
      <HRMApp />
    </ModuleAccessGate>
  );
}

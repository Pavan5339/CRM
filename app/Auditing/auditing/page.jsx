import AuditFlow from '@/app/Auditing/components/AuditFlow';
import { ModuleAccessGate } from '@/app/components-homepage/ModuleAccessGate';

export default function AuditingPage() {
  return (
    <ModuleAccessGate moduleKey="auditing" moduleLabel="Auditing">
      <AuditFlow />
    </ModuleAccessGate>
  );
}

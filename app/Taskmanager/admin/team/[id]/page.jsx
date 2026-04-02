import EmployeeAnalyticsPage from '@/app/Taskmanager/components/EmployeeAnalyticsPage';

export default async function AdminEmployeeAnalyticsPage({ params }) {
  const { id } = await params;
  return <EmployeeAnalyticsPage employeeId={id} />;
}

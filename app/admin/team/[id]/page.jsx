import EmployeeAnalyticsPage from '@/app/component-dashboard/EmployeeAnalyticsPage';

export default async function AdminEmployeeAnalyticsPage({ params }) {
  const { id } = await params;
  return <EmployeeAnalyticsPage employeeId={id} />;
}

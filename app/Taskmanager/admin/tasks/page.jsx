import DashboardApp from '@/app/Taskmanager/components/DashboardApp';

export default function AdminTasksPage() {
  return <DashboardApp mode='admin' startLoggedIn initialView='tasks' />;
}


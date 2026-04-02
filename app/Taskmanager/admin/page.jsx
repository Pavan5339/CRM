import DashboardApp from '@/app/Taskmanager/components/DashboardApp';

export default function AdminPage() {
  return <DashboardApp mode='admin' startLoggedIn initialView='dashboard' />;
}


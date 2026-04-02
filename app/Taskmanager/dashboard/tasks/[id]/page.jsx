import TaskDetailPage from '@/app/Taskmanager/components/TaskDetailPage';

export default async function EmployeeTaskDetailPage({ params }) {
  const { id } = await params;
  return <TaskDetailPage taskId={id} mode='employee' />;
}

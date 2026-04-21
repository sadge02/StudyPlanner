import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      {/* TODO: Implement dashboard content */}
    </div>
  );
}

import { checkAuth } from './check-auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuth();

  return (
    <main className="min-h-screen flex flex-col items-center">{children}</main>
  );
}

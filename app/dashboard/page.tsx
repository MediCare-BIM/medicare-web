import { AppointmentWithProfiles, DailyAppointmentStats } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Dashboard } from './components/Dashboard';

async function getDashboardData(searchTerm?: string) {
  const supabase = createClient();

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Base query
  let appointmentsQuery = supabase
    .from('appointments')
    .select(
      '*, doctor_profile:profiles!doctor_id(full_name, avatar_url), patient_profile:profiles!patient_id(full_name, avatar_url)'
    )
    .gte('appointment_date', todayStart)
    .lte('appointment_date', todayEnd)
    .order('appointment_date', {
      ascending: true,
    });

  // Apply search filter if searchTerm is provided
  if (searchTerm) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${searchTerm}%`);

    const patientIds = profiles?.map((p) => p.id) || [];
    appointmentsQuery = appointmentsQuery.in('patient_id', patientIds);
  }

  // Fetch data in parallel
  const [appointmentsData, summaryStatsData] = await Promise.all([
    appointmentsQuery,
    supabase.rpc('get_daily_appointment_stats'),
  ]);

  const { data: appointments, error: appointmentsError } = appointmentsData;
  const { data: summaryStats, error: summaryStatsError } = summaryStatsData;

  if (appointmentsError || summaryStatsError) {
    console.error({ appointmentsError, summaryStatsError });
    return {
      appointments: [],
      stats: { total_today: 0, high_priority_today: 0, daily_average: 0 },
      error: 'Failed to fetch data.',
    };
  }

  const stats: DailyAppointmentStats = summaryStats[0] ?? {
    daily_average: 0,
    total_today: 0,
    high_priority_today: 0,
  };

  return {
    appointments: appointments ?? [],
    stats,
    error: null,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const searchTerm = (await searchParams).search;
  const { appointments, stats, error } = await getDashboardData(searchTerm);

  if (error) {
    return <div className="p-4">{error}</div>;
  }

  const todayString = new Date().toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" user={user} />
      <SidebarInset>
        <SiteHeader />
        <Dashboard
          appointments={appointments as AppointmentWithProfiles[]}
          stats={stats}
          todayString={todayString}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

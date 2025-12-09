import { AlertTriangle, BarChart2, User } from 'lucide-react';
import { AppointmentWithProfiles } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Dashboard } from './components/Dashboard';

async function getDashboardData() {
  const supabase = createClient();

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Fetch data in parallel
  const [appointmentsData, summaryStatsData] = await Promise.all([
    supabase
      .from('appointments')
      .select(
        '*, doctor_profile:profiles!doctor_id(full_name, avatar_url), patient_profile:profiles!patient_id(full_name, avatar_url)'
      )
      .gte('appointment_date', todayStart)
      .lte('appointment_date', todayEnd)
      .order('appointment_date', { ascending: true }),
    supabase.rpc('get_daily_appointment_stats'),
  ]);

  const { data: appointments, error: appointmentsError } = appointmentsData;
  const { data: summaryStats, error: summaryStatsError } = summaryStatsData;

  if (appointmentsError || summaryStatsError) {
    console.error({ appointmentsError, summaryStatsError });
    return {
      appointments: [],
      summaryData: [],
      error: 'Failed to fetch data.',
    };
  }

  const stats =
    summaryStats && summaryStats.length > 0
      ? summaryStats[0]
      : {
          total_today: 0,
          high_priority_today: 0,
          daily_average: 0,
        };

  const summaryData = [
    {
      title: 'Pacienți astăzi',
      value: (stats.total_today ?? 0).toString(),
      percentageChange: '+5%', // Dummy value
      icon: User,
    },
    {
      title: 'Prioritate ridicată',
      value: (stats.high_priority_today ?? 0).toString(),
      percentageChange: '-2%', // Dummy value
      icon: AlertTriangle,
    },
    {
      title: 'Media zilnică',
      value: stats.daily_average ? stats.daily_average.toFixed(1) : '0.0',
      percentageChange: '', // Not applicable
      icon: BarChart2,
    },
  ];

  return { appointments: appointments ?? [], summaryData, error: null };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { appointments, summaryData, error } = await getDashboardData();

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
          summaryData={summaryData}
          todayString={todayString}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

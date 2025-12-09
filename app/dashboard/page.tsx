import { AlertTriangle, BarChart2, User } from 'lucide-react';
import { AppointmentWithPatient, SummaryData } from '@/lib/types';
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
  const [appointmentsData, highPriorityData, dailyAvgData] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, patients(full_name, avatar_url)')
      .gte('appointment_date', todayStart)
      .lte('appointment_date', todayEnd)
      .order('appointment_date', { ascending: true }),
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('priority', 'High')
      .gte('appointment_date', todayStart)
      .lte('appointment_date', todayEnd),
    supabase.rpc('get_daily_appointment_average'),
  ]);

  const { data: appointments, error: appointmentsError } = appointmentsData;
  const { count: highPriorityCount, error: highPriorityError } =
    highPriorityData;
  const { data: dailyAvg, error: dailyAvgError } = dailyAvgData;

  if (appointmentsError || highPriorityError || dailyAvgError) {
    console.error({ appointmentsError, highPriorityError, dailyAvgError });
    return {
      appointments: [],
      summaryData: [],
      error: 'Failed to fetch data.',
    };
  }

  const summaryData: SummaryData[] = [
    {
      title: 'Pacienți astăzi',
      value: (appointments?.length ?? 0).toString(),
      percentageChange: '+5%', // Dummy value
      icon: User,
    },
    {
      title: 'Prioritate ridicată',
      value: (highPriorityCount ?? 0).toString(),
      percentageChange: '-2%', // Dummy value
      icon: AlertTriangle,
    },
    {
      title: 'Media zilnică',
      value: dailyAvg ? dailyAvg.toFixed(1) : '0.0',
      percentageChange: '', // Not applicable
      icon: BarChart2,
    },
  ];

  return { appointments, summaryData, error: null };
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
          appointments={appointments as AppointmentWithPatient[]}
          summaryData={summaryData}
          todayString={todayString}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

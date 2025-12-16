import { AppointmentWithDoctorAndPatient } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { Dashboard } from './components/Dashboard';

async function getDashboardData(filters: {
  search?: string;
  status?: string;
}) {
  const supabase = await createClient();

  const { search, status } = filters;

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Base query
  let appointmentsQuery = supabase
    .from('appointments')
    .select(
      '*, doctor:doctors(full_name), patient:patients(full_name)'
    )
    .gte('start_time', todayStart)
    .lte('start_time', todayEnd)
    .order('start_time', {
      ascending: true,
    });

  // Apply search filter if searchTerm is provided
  if (search) {
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .ilike('full_name', `%${search}%`);

    const patientIds = patients?.map((p) => p.id) || [];
    appointmentsQuery = appointmentsQuery.in('patient_id', patientIds);
  }

  // Apply status filter
  if (status && status !== 'Toate') {
    appointmentsQuery = appointmentsQuery.eq('status', status);
  }

  // Fetch data
  const { data: appointments, error: appointmentsError } = await appointmentsQuery;

  if (appointmentsError) {
    console.error({ appointmentsError });
    return {
      appointments: [],
      error: 'Failed to fetch data.',
    };
  }

  return {
    appointments: appointments ?? [],
    error: null,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { search, status } = await searchParams;
  const { appointments, error } = await getDashboardData({
    search,
    status,
  });

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
    <Dashboard
      appointments={appointments as AppointmentWithDoctorAndPatient[]}
      todayString={todayString}
    />
  );
}


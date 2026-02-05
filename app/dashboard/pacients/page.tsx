import { createClient } from '@/lib/supabase/server';
import { DataTable } from './components/data-table';

export default async function Page() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('patient_table_view')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching patients:', error);
    return (
      <div className="flex flex-1 flex-col">
        <h2 className="text-2xl font-bold tracking-tight pl-4 lg:pl-6 my-2">
          Istoric pacienți
        </h2>
        <div className="p-4">Error loading patients data</div>
      </div>
    );
  }

  // Add default status for each patient
  const patientsWithStatus = (data || []).map((patient) => ({
    ...patient,
    status: 'Active', // Default status
  }));

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-2xl font-bold tracking-tight pl-4 lg:pl-6 my-2">
        Istoric pacienți
      </h2>
      <DataTable data={patientsWithStatus} />
    </div>
  );
}

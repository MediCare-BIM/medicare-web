import { createClient } from '@/lib/supabase/server';
import { DataTable } from './components/data-table';

export default async function Page() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('patient_table_view')
    .select('*')
    .order('full_name', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching patients:', error);
    return (
      <div className="flex flex-1 flex-col">
        <h2 className="text-2xl font-bold tracking-tight pl-4 lg:pl-6 my-2">
          Istoric pacienți
        </h2>
        <div className="p-4">
          <p className="mb-2 text-sm text-red-600">
            Unable to load patient data. Please try refreshing this page.
          </p>
          <p className="mb-4 text-xs text-muted-foreground">
            If the problem persists, please contact support.
          </p>
          <a
            href=""
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Retry loading data
          </a>
        </div>
      </div>
    );
  }

  // Ensure each patient has a status; preserve existing status if present
  const patientsWithStatus = (data || []).map((patient) => ({
    ...patient,
    status: patient.status ?? 'Active', // Default to 'Active' only when status is missing
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

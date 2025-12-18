
import { SupabaseClient } from '@supabase/supabase-js'

export interface AppointmentRow {
  id: string;
  doctor_id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  status?: string;
  reason?: string;
  priority?: string;
  patient_full_name?: string | null;
}

export const getAppointments = async (
  supabase: SupabaseClient,
  { from, to }: { from: string; to: string }
) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
        id,
        doctor_id,
        patient_id,
        start_time,
        end_time,
        status,
        reason,
        priority,
        patients ( full_name )
    `
    )
    .gte('start_time', from)
    .lte('start_time', to)
    .order('start_time', { ascending: true })

  if (error) {
    return { data: null, error };
  }

  const appointments: AppointmentRow[] = (data || []).map((row: any) => ({
    id: row.id,
    doctor_id: row.doctor_id,
    patient_id: row.patient_id,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    reason: row.reason,
    priority: row.priority,
    patient_full_name: row.patients?.full_name ?? null,
  }));

  return { data: appointments, error: null };
}

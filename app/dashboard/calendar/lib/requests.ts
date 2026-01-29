
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
  notes?: string | null;
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
        notes,
        patient:patients ( full_name )
    `
    )
    .gte('start_time', from)
    .lte('start_time', to)
    .order('start_time', { ascending: true })

  if (error) {
    return { data: null, error };
  }


  const appointments: AppointmentRow[] = (data || []).map((row) => ({
    id: row.id,
    doctor_id: row.doctor_id,
    patient_id: row.patient_id,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    reason: row.reason,
    priority: row.priority,
    //@ts-expect-error The 'patient' property is actually an object, but TS considers it as an array due to the join operation.
    patient_full_name: row.patient?.full_name ?? null,
    notes: row.notes,
  }));

  return { data: appointments, error: null };
}

export const updateAppointment = async (
  supabase: SupabaseClient,
  appointmentId: string,
  { start_time, end_time, reason, notes }: { start_time: string; end_time: string; reason?: string; notes?: string }
) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ start_time, end_time, reason, notes })
    .eq('id', appointmentId);

  return { data, error };
}

export const deleteAppointment = async (
  supabase: SupabaseClient,
  appointmentId: string
) => {
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  return { data, error };
};



export const createAppointment = async (
  supabase: SupabaseClient,
  appointment: {
    patient_id: string;
    start_time: string;
    end_time: string;
    reason: string;
    notes: string;
  }
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not found');
  }
  const { data: doctorData, error: doctorError } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();

  if (doctorError) {
    throw new Error(doctorError.message);
  }

  const { data, error } = await supabase.from('appointments').insert([
    {
      ...appointment,
      doctor_id: doctorData.id,
      end_time: appointment.end_time,
    },
  ]);
  return { data, error };
};

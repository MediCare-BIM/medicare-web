
import { SupabaseClient } from '@supabase/supabase-js'
import { fetchPatientTimeline, TimelineItem } from '@/lib/timeline-fetcher'

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
  patient_birth_date?: string | null;
  patient_sex?: string | null;
  ai_summary?: string | null;
  timeline?: TimelineItem[];
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
        patient:patients ( full_name, birth_date, sex )
    `
    )
    .gte('start_time', from)
    .lte('start_time', to)
    .order('start_time', { ascending: true })

  if (error) {
    return { data: null, error };
  }


  const appointments: AppointmentRow[] = (data || []).map((row) => {
    const patientData = row.patient as { full_name?: string; birth_date?: string; sex?: string };
    return {
      id: row.id,
      doctor_id: row.doctor_id,
      patient_id: row.patient_id,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      reason: row.reason,
      priority: row.priority,
      patient_full_name: patientData?.full_name ?? null,
      patient_birth_date: patientData?.birth_date ?? null,
      patient_sex: patientData?.sex ?? null,
      ai_summary: null, // Will be fetched separately via a query below
      notes: row.notes,
    };
  });

  // Fetch AI summaries and timeline data for each patient
  const appointmentsWithData = await Promise.all(
    appointments.map(async (appointment) => {
      const patientId = appointment.patient_id;

      // Fetch AI summary
      const { data: summaryData } = await supabase
        .from('ai_summaries')
        .select('content')
        .eq('patient_id', patientId)
        .single();

      // Extract summaries from content JSONB structure
      let aiSummaryText = null;
      if (summaryData?.content) {
        const content = summaryData.content as {
          summaries?: Array<{ subject: string; summary: string }>;
        };
        if (content.summaries && Array.isArray(content.summaries) && content.summaries.length > 0) {
          // Combine all summaries into a single text
          aiSummaryText = content.summaries
            .map((s) => `${s.subject}: ${s.summary}`)
            .join('\n');
        }
      }

      // Fetch timeline data using shared function (limit to 5 most recent)
      const timeline = await fetchPatientTimeline(supabase, patientId);

      return {
        ...appointment,
        ai_summary: aiSummaryText,
        timeline: timeline.slice(0, 5), // Keep only 5 most recent
      };
    })
  );

  return { data: appointmentsWithData, error: null };
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

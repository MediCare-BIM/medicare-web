import { createClient } from '@/lib/supabase/server';
import { PatientPageClient } from './components/PatientPageClient';
import { calculateAge } from './components/utils';
import { fetchPatientTimeline } from '@/lib/timeline-fetcher';

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await params;

  // Use patient ID from URL params
  const patientId = resolvedParams.id;

  // Fetch patient data
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  // Fetch AI summary
  const { data: aiSummaryData } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('patient_id', patientId)
    .single();

  // Fetch latest diagnosis from control_consultations (like patient_table_view)
  const { data: latestConsultation } = await supabase
    .from('control_consultations')
    .select('diagnosis')
    .eq('patient_id', patientId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch timeline data using shared function
  const timelineData = await fetchPatientTimeline(supabase, patientId);

  // Prepare patient data
  const patientData = {
    id: patient?.id || '',
    name: patient?.full_name || 'Pacient necunoscut',
    status: 'Stabil', // Could be calculated based on conditions
    conditions: latestConsultation?.diagnosis || 'Fără diagnostic',
    age: calculateAge(patient?.birth_date || null),
  };

  // Prepare AI summary
  const summaries =
    typeof aiSummaryData?.content === 'object' &&
    aiSummaryData.content !== null &&
    'summaries' in aiSummaryData.content &&
    Array.isArray(
      (aiSummaryData.content as { summaries?: unknown[] }).summaries
    )
      ? (
          aiSummaryData.content as {
            summaries: Array<{ subject: string; summary: string }>;
          }
        ).summaries
      : [];

  const aiSummary = {
    eventsAnalyzed: summaries.length,
    summaries,
  };

  return (
    <PatientPageClient
      patientData={patientData}
      aiSummary={aiSummary}
      timelineData={timelineData}
    />
  );
}

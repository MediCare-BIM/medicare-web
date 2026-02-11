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

  // Fetch conditions for patient status
  const { data: conditions } = await supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'active');

  // Fetch timeline data using shared function
  const timelineData = await fetchPatientTimeline(supabase, patientId);

  // Prepare patient data
  const patientData = {
    id: patient?.id || '',
    name: patient?.full_name || 'Pacient necunoscut',
    status: 'Stabil', // Could be calculated based on conditions
    conditions:
      conditions && conditions.length > 0
        ? conditions.map((c) => c.name).join(' + ')
        : 'Fără afecțiuni active',
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

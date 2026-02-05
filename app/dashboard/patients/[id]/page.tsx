import { createClient } from '@/lib/supabase/server';
import { PatientPageClient } from './components/PatientPageClient';
import { formatDate, calculateAge } from './components/utils';

// Hardcoded patient ID for testing
const HARDCODED_PATIENT_ID = 'fbd9e6f5-d906-4c37-9268-bbcc41ca2e61';

type TimelineItemType = 'consultatie' | 'analiza' | 'prescriptie';

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  title: string;
  subtitle: string;
  date: string;
  doctor?: string;
  location?: string;
  visitReason?: string;
  findings?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  pdfFile?: {
    name: string;
    size: string;
  };
  resultData?: any;
}

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await params;

  // Use hardcoded ID instead of URL param
  const patientId = HARDCODED_PATIENT_ID;

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

  // Fetch control consultations with doctor info
  const { data: consultations } = await supabase
    .from('control_consultations')
    .select('*, doctors(full_name, specialization)')
    .eq('patient_id', patientId)
    .order('generated_at', { ascending: false });

  // Fetch lab results
  const { data: labResults } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('result_date', { ascending: false });

  // Fetch prescriptions with doctor info
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*, doctors(full_name, specialization)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  // Fetch conditions for patient status
  const { data: conditions } = await supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'active');

  // Build timeline data
  const timelineData: TimelineItem[] = [];

  // Add consultations
  if (consultations) {
    consultations.forEach((consultation: any) => {
      timelineData.push({
        id: consultation.id,
        type: 'consultatie',
        title: 'Consultație de control',
        subtitle: consultation.visit_reason || 'Consultație medicală',
        date: formatDate(consultation.generated_at),
        doctor: consultation.doctors?.full_name
          ? `Dr. ${consultation.doctors.full_name}`
          : 'Doctor necunoscut',
        location: 'Cabinet medical',
        visitReason: consultation.visit_reason || '',
        findings: consultation.findings || '',
        diagnosis: consultation.diagnosis || '',
        treatment: consultation.treatment || '',
        notes: consultation.notes || '',
      });
    });
  }

  // Add lab results
  if (labResults) {
    labResults.forEach((result: any) => {
      timelineData.push({
        id: result.id,
        type: 'analiza',
        title: result.test_name || 'Analize medicale',
        subtitle: 'Rezultate analize',
        date: formatDate(result.result_date),
        resultData: result.results,
      });
    });
  }

  // Add prescriptions
  if (prescriptions) {
    prescriptions.forEach((prescription: any) => {
      // Handle nested medications structure
      const medicationsData =
        prescription.medications?.medications || prescription.medications || [];

      const medications = Array.isArray(medicationsData) ? medicationsData : [];

      const treatmentText = medications
        .map((med: any) => {
          const parts = [med.name || ''];
          if (med.dosage) parts.push(med.dosage);
          if (med.mod_administrare) parts.push(`- ${med.mod_administrare}`);
          return parts.join(' ');
        })
        .join('\n');

      timelineData.push({
        id: prescription.id,
        type: 'prescriptie',
        title: 'Prescripție',
        subtitle: 'Medicamente prescrise',
        date: formatDate(prescription.created_at),
        doctor: prescription.doctors?.full_name
          ? `Dr. ${prescription.doctors.full_name}`
          : 'Doctor necunoscut',
        treatment: treatmentText || 'Nu sunt medicamente specificate',
      });
    });
  }

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
    Array.isArray((aiSummaryData.content as any).summaries)
      ? (aiSummaryData.content as any).summaries
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

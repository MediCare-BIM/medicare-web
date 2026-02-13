import {
  Report,
  ControlConsultationWithPatient,
  PrescriptionWithPatient,
  Prescription,
} from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { Reports } from './components/Reports';

async function getReportsData() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { reports: [], error: 'User not authenticated' };
  }

  // Get doctor ID for the current user
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (doctorError || !doctorData) {
    return { reports: [], error: 'Doctor not found' };
  }

  const doctorId = doctorData.id;

  // Fetch control consultations
  const { data: consultations, error: consultationsError } = await supabase
    .from('control_consultations')
    .select('id, generated_at, diagnosis, patient_id, patients(full_name)')
    .eq('doctor_id', doctorId)
    .order('generated_at', { ascending: false });
  // Fetch prescriptions
  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from('prescriptions')
    .select(
      `
      id,
      created_at,
      medications,
      patient_id,
      patients!prescriptions_patient_id_fkey (
        full_name
      )
    `
    )
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (consultationsError || prescriptionsError) {
    return {
      reports: [],
      error: 'Failed to fetch reports',
    };
  }

  // Normalize consultations to Report type (use 'description' instead of 'diagnosis')
  const consultationReports: Report[] = (
    (consultations as ControlConsultationWithPatient[]) || []
  ).map((consultation) => {
    const patient = Array.isArray(consultation.patients)
      ? consultation.patients[0]
      : consultation.patients;

    return {
      id: consultation.id,
      patientName: patient?.full_name || 'N/A',
      date: consultation.generated_at,
      description: consultation.diagnosis || 'Consultație medicală',
      type: 'Consultație' as const,
      patientId: consultation.patient_id,
    };
  });

  // Normalize prescriptions to Report type (use 'description' for medication summary)
  const prescriptionReports: Report[] = (
    (prescriptions as PrescriptionWithPatient[]) || []
  ).map((prescription) => {
    const patient = Array.isArray(prescription.patients)
      ? prescription.patients[0]
      : prescription.patients;

    return {
      id: prescription.id,
      patientName: patient?.full_name || 'N/A',
      date: prescription.created_at,
      description: extractMedicationsLabel(prescription.medications),
      type: 'Prescripție' as const,
      patientId: prescription.patient_id,
    };
  });

  // Combine and sort by date descending
  const allReports = [...consultationReports, ...prescriptionReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    reports: allReports,
    error: null,
  };
}

// Helper function to extract label from medications JSONB
// Structure: { medications: [{ name: string, dosage: string, mod_administrare: string }, ...] }
function extractMedicationsLabel(
  medications: Prescription['medications']
): string {
  if (!medications) return 'Prescripție medicală';

  // Extract the medications array from the object structure
  if (
    typeof medications === 'object' &&
    !Array.isArray(medications) &&
    'medications' in medications
  ) {
    const medsArray = medications.medications;

    if (Array.isArray(medsArray) && medsArray.length > 0) {
      const names = medsArray
        .map((med) => {
          if (
            med &&
            typeof med === 'object' &&
            'name' in med &&
            typeof med.name === 'string'
          ) {
            return med.name;
          }
          return '';
        })
        .filter(Boolean);

      if (names.length > 0) {
        return names.join(', ').substring(0, 80);
      }
    }
  }

  return 'Prescripție medicală';
}

export default async function ReportsPage() {
  const { reports, error } = await getReportsData();

  if (error) {
    return <div className="p-4">{error}</div>;
  }

  return <Reports reports={reports} />;
}

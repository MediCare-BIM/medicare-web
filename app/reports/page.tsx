import { Report } from '@/lib/types';
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
    const { data: consultations, error: consultationsError }
        =
        await supabase
            .from(
                'control_consultations'
            )
            .select(
                'id, generated_at, diagnosis, patient_id, patients(full_name)'
            )
            .eq(
                'doctor_id'
                , doctorId)
            .order(
                'generated_at'
                , {
                    ascending:
                        false
                });
    // Fetch prescriptions
    const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
      id,
      created_at,
      medications,
      patient_id,
      patients!prescriptions_patient_id_fkey (
        full_name
      )
    `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (consultationsError || prescriptionsError) {
        return {
            reports: [],
            error: 'Failed to fetch reports',
        };
    }

    // Normalize consultations to Report type
    const consultationReports: Report[] = (consultations || []).map((consultation) => {
        const patient = Array.isArray(consultation.patients)
            ? consultation.patients[0]
            : consultation.patients;

        return {
            id: consultation.id,
            patientName: patient?.full_name || 'N/A',
            date: consultation.generated_at,
            diagnosis: consultation.diagnosis || 'Consultație medicală',
            type: 'Consultație' as const,
            patientId: consultation.patient_id,
        };
    });

    // Normalize prescriptions to Report type
    const prescriptionReports: Report[] = (prescriptions || []).map((prescription) => {
        const patient = Array.isArray(prescription.patients)
            ? prescription.patients[0]
            : prescription.patients;

        return {
            id: prescription.id,
            patientName: patient?.full_name || 'N/A',
            date: prescription.created_at,
            diagnosis: extractMedicationsLabel(prescription.medications),
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
function extractMedicationsLabel(medications: any): string {
    if (!medications) return 'Prescripție medicală';

    // If medications is an array, get the first medication name
    if (Array.isArray(medications) && medications.length > 0) {
        const firstMed = medications[0];
        if (typeof firstMed === 'string') {
            return firstMed.substring(0, 50);
        }
        if (firstMed.name) {
            return firstMed.name.substring(0, 50);
        }
    }

    // If medications is an object with a name property
    if (typeof medications === 'object' && medications.name) {
        return medications.name.substring(0, 50);
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

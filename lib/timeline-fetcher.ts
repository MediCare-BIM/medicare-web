import { SupabaseClient } from '@supabase/supabase-js';

export type TimelineItemType = 'consultatie' | 'analiza' | 'prescriptie';

export interface TimelineItem {
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
    resultData?: unknown;
}

interface Consultation {
    id: string;
    generated_at: string;
    visit_reason?: string;
    findings?: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    doctors?: {
        full_name?: string;
        specialization?: string;
    };
}

interface LabResult {
    id: string;
    result_date: string;
    test_name?: string;
    results?: unknown;
}

interface Medication {
    name?: string;
    dosage?: string;
    mod_administrare?: string;
}

interface Prescription {
    id: string;
    created_at: string;
    medications?: {
        medications?: Medication[];
    } | Medication[];
    doctors?: {
        full_name?: string;
        specialization?: string;
    };
}

/**
 * Fetches and builds timeline data for a patient from consultations, lab results, and prescriptions
 * @param supabase - Supabase client instance
 * @param patientId - The ID of the patient
 * @returns Array of timeline items sorted by date (most recent first)
 */
export async function fetchPatientTimeline(
    supabase: SupabaseClient,
    patientId: string
): Promise<TimelineItem[]> {
    // Always fetch detailed information
    const consultationsSelect = '*, doctors(full_name, specialization)';
    const labResultsSelect = '*';
    const prescriptionsSelect = '*, doctors(full_name, specialization)';

    // Fetch all timeline data in parallel
    const [consultations, labResults, prescriptions] = await Promise.all([
        supabase
            .from('control_consultations')
            .select(consultationsSelect)
            .eq('patient_id', patientId)
            .order('generated_at', { ascending: false }),
        supabase
            .from('lab_results')
            .select(labResultsSelect)
            .eq('patient_id', patientId)
            .order('result_date', { ascending: false }),
        supabase
            .from('prescriptions')
            .select(prescriptionsSelect)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false }),
    ]);

    const timeline: TimelineItem[] = [];

    // Add consultations
    if (consultations.data) {
        (consultations.data as unknown as Consultation[]).forEach((consultation) => {
            const item: TimelineItem = {
                id: consultation.id,
                type: 'consultatie',
                title: 'Consultație de control',
                subtitle: consultation.visit_reason || 'Consultație medicală',
                date: defaultFormatDate(consultation.generated_at),
                doctor: consultation.doctors?.full_name
                    ? `Dr. ${consultation.doctors.full_name}`
                    : 'Doctor necunoscut',
                location: 'Cabinet medical',
                visitReason: consultation.visit_reason || '',
                findings: consultation.findings || '',
                diagnosis: consultation.diagnosis || '',
                treatment: consultation.treatment || '',
                notes: consultation.notes || '',
            };

            timeline.push(item);
        });
    }

    // Add lab results
    if (labResults.data) {
        (labResults.data as unknown as LabResult[]).forEach((result) => {
            const item: TimelineItem = {
                id: result.id,
                type: 'analiza',
                title: result.test_name || 'Analize medicale',
                subtitle: 'Rezultate analize',
                date: defaultFormatDate(result.result_date),
                resultData: result.results,
            };

            timeline.push(item);
        });
    }

    // Add prescriptions
    if (prescriptions.data) {
        (prescriptions.data as unknown as Prescription[]).forEach((prescription) => {
            // Handle nested medications structure
            const rawMedications = prescription.medications;
            const medicationsData =
                (typeof rawMedications === 'object' &&
                    rawMedications !== null &&
                    'medications' in rawMedications)
                    ? rawMedications.medications
                    : rawMedications;

            const medications = Array.isArray(medicationsData)
                ? medicationsData
                : [];

            const treatmentText = medications
                .map((med: Medication) => {
                    const parts = [med.name || ''];
                    if (med.dosage) parts.push(med.dosage);
                    if (med.mod_administrare) parts.push(`- ${med.mod_administrare}`);
                    return parts.join(' ');
                })
                .join('\n');

            const item: TimelineItem = {
                id: prescription.id,
                type: 'prescriptie',
                title: 'Prescripție',
                subtitle: 'Medicamente prescrise',
                date: defaultFormatDate(prescription.created_at),
                doctor: prescription.doctors?.full_name
                    ? `Dr. ${prescription.doctors.full_name}`
                    : 'Doctor necunoscut',
                treatment: treatmentText || 'Nu sunt medicamente specificate',
            };

            timeline.push(item);
        });
    }

    // Sort timeline by date (most recent first)
    timeline.sort((a, b) => {
        const dateA = parseDateForSorting(a.date);
        const dateB = parseDateForSorting(b.date);
        return dateB.getTime() - dateA.getTime();
    });

    return timeline;
}

/**
 * Default date formatter using Romanian locale
 */
function defaultFormatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
        'ian',
        'feb',
        'mar',
        'apr',
        'mai',
        'iun',
        'iul',
        'aug',
        'sep',
        'oct',
        'noi',
        'dec',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}. ${year}`;
}

/**
 * Parse a Romanian date string for sorting purposes
 */
function parseDateForSorting(dateStr: string): Date {
    // Try parsing as ISO date first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
        return isoDate;
    }

    // Parse Romanian format: "15 ian. 2025"
    const monthMap: Record<string, number> = {
        ian: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        mai: 4,
        iun: 5,
        iul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        noi: 10,
        dec: 11,
    };

    const parts = dateStr.toLowerCase().split(' ');
    const day = parseInt(parts[0]);
    const month = monthMap[parts[1]?.replace('.', '') || ''] ?? 0;
    const year = parseInt(parts[2] || '2025');

    return new Date(year, month, day);
}

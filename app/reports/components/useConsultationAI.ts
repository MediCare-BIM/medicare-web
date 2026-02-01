import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { ConsultationFormData } from './ConsultationFormContext';

interface ConsultationAIPayload {
    patientId: string;
    consultationPurpose: string;
    visitReason: string;
    findings?: string;
    diagnosis?: string;
    treatment?: string;
    investigations?: string;
    notes?: string;
}

interface ConsultationAIResponse {
    diagnosis?: string;
    treatment?: string;
    investigations?: string;
}

export function useConsultationAI() {
    const [isLoading, setIsLoading] = useState(false);

    const generateCompletion = async (
        payload: ConsultationAIPayload
    ): Promise<ConsultationAIResponse | null> => {
        setIsLoading(true);

        try {
            const supabase = createClient();

            const { data, error } = await supabase.functions.invoke(
                'consultation-generator',
                {
                    body: {
                        patientId: payload.patientId,
                        consultationPurpose: payload.consultationPurpose,
                        visitReason: payload.visitReason,
                        findings: payload.findings || undefined,
                        diagnosis: payload.diagnosis || undefined,
                        treatment: payload.treatment || undefined,
                        investigations: payload.investigations || undefined,
                        notes: payload.notes || undefined,
                    },
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_X_API_KEY || '',
                    },
                }
            );

            if (error) {
                console.error('AI Completion response error:', error);
                throw error;
            }

            if (!data) {
                throw new Error('Nu s-au primit date de la AI');
            }

            toast.success('Câmpurile au fost completate cu succes');
            return data as ConsultationAIResponse;
        } catch (error) {
            console.error('AI Completion error:', error);
            toast.error('Eroare la completarea cu AI');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        generateCompletion,
    };
}

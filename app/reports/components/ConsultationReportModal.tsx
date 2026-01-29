'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConsultationForm } from './ConsultationFormContext';
import { PatientDetailsStep } from './PatientDetailsStep';
import { ConsultationDetailsStep } from './ConsultationDetailsStep';
import { PlanRecommendationsStep } from './PlanRecommendationsStep';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface ConsultationReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultationReportModal({
  open,
  onOpenChange,
}: ConsultationReportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const { formData, resetForm } = useConsultationForm();

  const steps = [
    { number: 1, label: 'Detalii pacient' },
    { number: 2, label: 'Detalii consultație' },
    { number: 3, label: 'Plan și recomandări' },
  ];

  const handleClose = () => {
    setCurrentStep(1);
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.patientId) {
        toast.error('Te rog selectează un pacient');
        return false;
      }
      if (!formData.consultationDate) {
        toast.error('Te rog selectează data consultației');
        return false;
      }
      if (!formData.consultationPurpose) {
        toast.error('Te rog selectează scopul consultației');
        return false;
      }
      if (!formData.visitReason.trim()) {
        toast.error('Te rog completează motivul prezentării');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      handleContinue();
    }
  };

  const handleAICompletion = async () => {
    setIsAILoading(true);

    // Placeholder for AI completion functionality
    // In the future, this could call an AI API to generate recommendations
    // based on the patient details and consultation findings

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just show that the feature is connected
      // eslint-disable-next-line no-console
      console.log('AI Completion triggered with data:', {
        patientId: formData.patientId,
        visitReason: formData.visitReason,
        findings: formData.findings,
        diagnosis: formData.diagnosis,
      });

      // Could update form with AI suggestions here
      // updateFormData({ treatment: '...', investigations: '...', notes: '...' });
      toast.success('Funcția AI va fi disponibilă în curând');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('AI Completion error:', error);
      toast.error('Eroare la completarea cu AI');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Nu ești autentificat');
        return;
      }

      // Get doctor ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError || !doctorData) {
        toast.error('Eroare la obținerea informațiilor despre doctor');
        return;
      }

      // Insert consultation
      const { error: insertError } = await supabase
        .from('control_consultations')
        .insert({
          patient_id: formData.patientId,
          doctor_id: doctorData.id,
          visit_reason: formData.visitReason,
          findings: formData.findings || null,
          diagnosis: formData.diagnosis || null,
          treatment: formData.treatment || null,
          notes: formData.notes || null,
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('Raportul a fost generat cu succes');
      handleClose();

      // Refresh the page to show the new report
      window.location.reload();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting consultation:', error);
      toast.error('Eroare la generarea raportului');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Generează raport de consultație
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                      currentStep === step.number
                        ? 'border-primary bg-primary text-primary-foreground'
                        : currentStep > step.number
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-2 text-xs ${
                      currentStep >= step.number
                        ? 'text-primary font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="py-4">
          {currentStep === 1 && <PatientDetailsStep />}
          {currentStep === 2 && <ConsultationDetailsStep />}
          {currentStep === 3 && <PlanRecommendationsStep />}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handleBack}
          >
            {currentStep === 1 ? 'Închide' : 'Înapoi'}
          </Button>
          <div className="flex gap-2">
            {(currentStep === 2 || currentStep === 3) && (
              <Button
                onClick={handleAICompletion}
                disabled={isAILoading}
                className="border border-primary text-primary bg-background shadow-xs hover:bg-primary/10 hover:text-primary dark:bg-input/30 dark:border-primary dark:hover:bg-primary/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isAILoading ? 'Se completează...' : 'Completează cu AI'}
              </Button>
            )}
            {currentStep < 3 ? (
              <Button onClick={handleNext}>Continuă</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Se generează...' : 'Generează'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

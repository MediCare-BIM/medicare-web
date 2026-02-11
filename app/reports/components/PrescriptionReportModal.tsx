'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePrescriptionForm } from './PrescriptionFormContext';
import { PrescriptionPatientDetailsStep } from './PrescriptionPatientDetailsStep';
import { MedicationListStep } from './MedicationListStep';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PrescriptionReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PrescriptionReportModal({
  open,
  onOpenChange,
  onSuccess,
}: PrescriptionReportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, resetForm } = usePrescriptionForm();

  const steps = [
    { number: 1, label: 'Detalii pacient' },
    { number: 2, label: 'Medicamente' },
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
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.patientId) {
        toast.error('Te rog selectează un pacient');
        return false;
      }
      if (!formData.prescriptionDate) {
        toast.error('Te rog selectează data prescripției');
        return false;
      }
    }

    if (currentStep === 2) {
      if (formData.medications.length === 0) {
        toast.error('Te rog adaugă cel puțin un medicament');
        return false;
      }

      // Validate each medication has all required fields
      for (let i = 0; i < formData.medications.length; i++) {
        const med = formData.medications[i];
        if (!med.name.trim()) {
          toast.error(`Medicamentul ${i + 1}: Te rog completează denumirea`);
          return false;
        }
        if (!med.dosage.trim()) {
          toast.error(`Medicamentul ${i + 1}: Te rog completează dozajul`);
          return false;
        }
        if (!med.mod_administrare.trim()) {
          toast.error(
            `Medicamentul ${i + 1}: Te rog completează modul de administrare`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      handleContinue();
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
        setIsSubmitting(false);
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
        setIsSubmitting(false);
        return;
      }

      // Prepare medications data - remove the temporary ID field
      const medicationsData = formData.medications.map((med) => ({
        name: med.name,
        dosage: med.dosage,
        mod_administrare: med.mod_administrare,
      }));

      // Insert prescription
      const { error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: formData.patientId,
          doctor_id: doctorData.id,
          medications: { medications: medicationsData },
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('Prescripția a fost generată cu succes');
      handleClose();

      // Trigger refresh callback
      onSuccess?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting prescription:', error);
      toast.error('Eroare la generarea prescripției');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Generează prescripție</DialogTitle>
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
          {currentStep === 1 && <PrescriptionPatientDetailsStep />}
          {currentStep === 2 && <MedicationListStep />}
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
            {currentStep < 2 ? (
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

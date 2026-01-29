'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ConsultationPurpose =
  | 'Initial'
  | 'Control'
  | 'Ajustare tratament'
  | 'Evaluare simptom';

export interface ConsultationFormData {
  // Step 1: Patient Details
  patientId: string;
  consultationDate: Date | undefined;
  consultationPurpose: ConsultationPurpose | '';
  visitReason: string;

  // Step 2: Consultation Details
  findings: string;
  diagnosis: string;

  // Step 3: Plan and Recommendations
  treatment: string;
  investigations: string;
  notes: string;
}

interface ConsultationFormContextType {
  formData: ConsultationFormData;
  updateFormData: (data: Partial<ConsultationFormData>) => void;
  resetForm: () => void;
}

const initialFormData: ConsultationFormData = {
  patientId: '',
  consultationDate: undefined,
  consultationPurpose: '',
  visitReason: '',
  findings: '',
  diagnosis: '',
  treatment: '',
  investigations: '',
  notes: '',
};

const ConsultationFormContext = createContext<
  ConsultationFormContextType | undefined
>(undefined);

export function ConsultationFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [formData, setFormData] =
    useState<ConsultationFormData>(initialFormData);

  const updateFormData = (data: Partial<ConsultationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return (
    <ConsultationFormContext.Provider
      value={{ formData, updateFormData, resetForm }}
    >
      {children}
    </ConsultationFormContext.Provider>
  );
}

export function useConsultationForm() {
  const context = useContext(ConsultationFormContext);
  if (!context) {
    throw new Error(
      'useConsultationForm must be used within ConsultationFormProvider'
    );
  }
  return context;
}

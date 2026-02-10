'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Medication {
  id: string; // For React keys
  name: string;
  dosage: string;
  mod_administrare: string;
}

export interface PrescriptionFormData {
  // Step 1: Patient Details
  patientId: string;
  prescriptionDate: Date | undefined;

  // Step 2: Medications
  medications: Medication[];
}

interface PrescriptionFormContextType {
  formData: PrescriptionFormData;
  updateFormData: (data: Partial<PrescriptionFormData>) => void;
  addMedication: () => void;
  removeMedication: (id: string) => void;
  updateMedication: (id: string, data: Partial<Medication>) => void;
  resetForm: () => void;
}

const initialFormData: PrescriptionFormData = {
  patientId: '',
  prescriptionDate: undefined,
  medications: [],
};

const PrescriptionFormContext = createContext<
  PrescriptionFormContextType | undefined
>(undefined);

export function PrescriptionFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [formData, setFormData] =
    useState<PrescriptionFormData>(initialFormData);

  const updateFormData = (data: Partial<PrescriptionFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: crypto.randomUUID(),
      name: '',
      dosage: '',
      mod_administrare: '',
    };
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, newMedication],
    }));
  };

  const removeMedication = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
    }));
  };

  const updateMedication = (id: string, data: Partial<Medication>) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id ? { ...med, ...data } : med
      ),
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return (
    <PrescriptionFormContext.Provider
      value={{
        formData,
        updateFormData,
        addMedication,
        removeMedication,
        updateMedication,
        resetForm,
      }}
    >
      {children}
    </PrescriptionFormContext.Provider>
  );
}

export function usePrescriptionForm() {
  const context = useContext(PrescriptionFormContext);
  if (!context) {
    throw new Error(
      'usePrescriptionForm must be used within PrescriptionFormProvider'
    );
  }
  return context;
}

'use client';

import React from 'react';
import { useConsultationForm } from './ConsultationFormContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ConsultationDetailsStep() {
  const { formData, updateFormData } = useConsultationForm();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="findings">Constatări clinice</Label>
        <Textarea
          id="findings"
          placeholder="Descrieți constatările clinice..."
          value={formData.findings}
          onChange={(e) => updateFormData({ findings: e.target.value })}
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnostic preliminar</Label>
        <Textarea
          id="diagnosis"
          placeholder="Introduceți diagnosticul preliminar..."
          value={formData.diagnosis}
          onChange={(e) => updateFormData({ diagnosis: e.target.value })}
          rows={5}
        />
      </div>
    </div>
  );
}

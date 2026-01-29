'use client';

import React from 'react';
import { useConsultationForm } from './ConsultationFormContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function PlanRecommendationsStep() {
  const { formData, updateFormData } = useConsultationForm();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="treatment">Tratament recomandat</Label>
        <Textarea
          id="treatment"
          placeholder="Descrieți tratamentul recomandat..."
          value={formData.treatment}
          onChange={(e) => updateFormData({ treatment: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="investigations">
          Investigații / analize recomandate
        </Label>
        <Textarea
          id="investigations"
          placeholder="Listați investigațiile și analizele recomandate..."
          value={formData.investigations}
          onChange={(e) => updateFormData({ investigations: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observații suplimentare</Label>
        <Textarea
          id="notes"
          placeholder="Adăugați orice observații suplimentare..."
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

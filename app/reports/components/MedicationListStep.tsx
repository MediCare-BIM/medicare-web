'use client';

import React from 'react';
import { usePrescriptionForm } from './PrescriptionFormContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export function MedicationListStep() {
  const { formData, addMedication, removeMedication, updateMedication } =
    usePrescriptionForm();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Medicamente</h3>
          <p className="text-sm text-muted-foreground">
            Adaugă medicamentele prescrise pentru pacient
          </p>
        </div>
        <Button onClick={addMedication} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adaugă medicament
        </Button>
      </div>

      {formData.medications.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-center">
            <div className="text-sm text-muted-foreground">
              Niciun medicament adăugat. Apasă butonul de mai sus pentru a
              adăuga.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {formData.medications.map((medication, index) => (
            <Card key={medication.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medicament {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${medication.id}`}>
                        Denumire *
                      </Label>
                      <Input
                        id={`name-${medication.id}`}
                        placeholder="Ex: Paracetamol"
                        value={medication.name}
                        onChange={(e) =>
                          updateMedication(medication.id, {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`dosage-${medication.id}`}>Dozaj *</Label>
                      <Input
                        id={`dosage-${medication.id}`}
                        placeholder="Ex: 500 mg"
                        value={medication.dosage}
                        onChange={(e) =>
                          updateMedication(medication.id, {
                            dosage: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`mod-${medication.id}`}>
                      Mod administrare *
                    </Label>
                    <Textarea
                      id={`mod-${medication.id}`}
                      placeholder="Ex: oral, 1 comprimat de 3 ori pe zi după masă"
                      value={medication.mod_administrare}
                      onChange={(e) =>
                        updateMedication(medication.id, {
                          mod_administrare: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

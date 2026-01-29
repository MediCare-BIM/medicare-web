'use client';

import React, { useState, useEffect } from 'react';
import {
  useConsultationForm,
  ConsultationPurpose,
} from './ConsultationFormContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface Patient {
  id: string;
  full_name: string;
}

const consultationPurposes: ConsultationPurpose[] = [
  'Initial',
  'Control',
  'Ajustare tratament',
  'Evaluare simptom',
];

export function PatientDetailsStep() {
  const { formData, updateFormData } = useConsultationForm();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .order('full_name');

      if (error) {
        toast.error('Eroare la încărcarea pacienților');
        setError(true);
      } else if (data) {
        setPatients(data);
      }
      setLoading(false);
    }

    fetchPatients();
  }, []);

  const selectedPatient = patients.find((p) => p.id === formData.patientId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient">Pacient *</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedPatient
                ? selectedPatient.full_name
                : 'Selectează pacient...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Caută pacient..." />
              <CommandEmpty>
                {loading
                  ? 'Se încarcă...'
                  : error
                    ? 'Eroare la încărcarea pacienților'
                    : 'Nu s-au găsit pacienți.'}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.full_name}
                    onSelect={() => {
                      updateFormData({ patientId: patient.id });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        formData.patientId === patient.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {patient.full_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consultationDate">Data consultației *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !formData.consultationDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.consultationDate ? (
                format(formData.consultationDate, 'PPP')
              ) : (
                <span>Alege data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.consultationDate}
              onSelect={(date) => updateFormData({ consultationDate: date })}
              disabled={{ after: new Date() }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consultationPurpose">Scopul consultației *</Label>
        <Select
          value={formData.consultationPurpose}
          onValueChange={(value) =>
            updateFormData({
              consultationPurpose: value as ConsultationPurpose,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selectează scopul" />
          </SelectTrigger>
          <SelectContent>
            {consultationPurposes.map((purpose) => (
              <SelectItem key={purpose} value={purpose}>
                {purpose}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visitReason">Motivul prezentării *</Label>
        <Textarea
          id="visitReason"
          placeholder="Descrieți motivul vizitei pacientului..."
          value={formData.visitReason}
          onChange={(e) => updateFormData({ visitReason: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppointmentForm } from '../../hooks/useAppointmentForm';
import { AppointmentForm } from './AppointmentForm';
import { useCreateAppointment } from '../../hooks/useCreateAppointment';
import { format } from 'date-fns';

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAppointmentDialog({
  isOpen,
  onClose,
}: AddAppointmentDialogProps) {
  const { formData, formHandlers, formState } = useAppointmentForm();
  const createAppointment = useCreateAppointment();

  const handleSave = () => {
    if (formData.date && formData.time && formData.patientId) {
      createAppointment.mutate(
        {
          patient_id: formData.patientId,
          start_time: `${format(formData.date, 'yyyy-MM-dd')}T${
            formData.time
          }:00`,
          notes: formData.notes,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Adaugă programare</DialogTitle>
          <DialogDescription>
            Creează o programare nouă. Pacientul va fi notificat automat.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          formData={formData}
          formHandlers={formHandlers}
          formState={formState}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={createAppointment.isPending}
          >
            {createAppointment.isPending ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

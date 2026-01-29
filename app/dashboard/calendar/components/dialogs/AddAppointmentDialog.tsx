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
import { addMinutes, setHours, setMinutes, setSeconds } from 'date-fns';
import { APPOINTMENT_INTERVAL } from '@/lib/consts';

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAppointmentDialog({
  isOpen,
  onClose,
}: AddAppointmentDialogProps) {
  const { formData, formHandlers, formState } = useAppointmentForm();
  const { mutate, isPending } = useCreateAppointment();

  const handleSave = () => {
    const { date, time, patientId, reason, notes } = formData;

    if (!date || !time || !patientId || !reason) {
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const startTime = setSeconds(setMinutes(setHours(date, hours), minutes), 0);
    const endTime = addMinutes(startTime, APPOINTMENT_INTERVAL);

    mutate(
      {
        patient_id: patientId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        reason: reason,
        notes: notes,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
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
            disabled={
              isPending ||
              formData.patientId === undefined ||
              formData.time === '' ||
              !formData.reason.trim()
            }
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { AppointmentForm } from './AppointmentForm';
import { useAppointmentForm } from '../../hooks/useAppointmentForm';
import { useUpdateAppointment } from '../../hooks/useUpdateAppointment';
import { AppointmentRow } from '../../lib/requests';

interface EditAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: AppointmentRow;
}

export function EditAppointmentDialog({
  isOpen,
  onClose,
  selectedAppointment,
}: EditAppointmentDialogProps) {
  const { formData, formHandlers, formState } =
    useAppointmentForm(selectedAppointment);
  const { mutate, isPending } = useUpdateAppointment(
    selectedAppointment.id,
    onClose
  );

  const handleSave = () => {
    if (formData.date && formData.time) {
      mutate({
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editează programare</DialogTitle>
          <DialogDescription>
            Actualizează detaliile acestei programări. Modificările vor fi
            salvate automat în calendar iar pacientul va fi notificat.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          appointment={selectedAppointment}
          formData={formData}
          formHandlers={formHandlers}
          formState={formState}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

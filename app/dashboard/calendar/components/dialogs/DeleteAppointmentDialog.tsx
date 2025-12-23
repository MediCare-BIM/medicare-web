'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteAppointment } from '../../hooks/useDeleteAppointment';
import { AppointmentRow } from '../../lib/requests';

interface DeleteAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: AppointmentRow;
}

export function DeleteAppointmentDialog({
  isOpen,
  onClose,
  selectedAppointment,
}: DeleteAppointmentDialogProps) {
  const { mutate: handleDelete, isPending } = useDeleteAppointment(
    selectedAppointment.id,
    onClose
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Șterge programarea?</AlertDialogTitle>
          <AlertDialogDescription>
            Ștergerea va elimina această programare din calendarul tău iar
            pacientul va fi nevoit să se reprogrameze.
          </AlertDialogDescription>
          <AlertDialogDescription className="text-bold">
            Această acțiune este ireversibilă.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Anulează
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete()}
            disabled={isPending}
          >
            {isPending ? 'Se șterge...' : 'Șterge'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

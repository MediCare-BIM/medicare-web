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

interface DeleteAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAppointmentDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAppointmentDialogProps) {
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
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Șterge
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

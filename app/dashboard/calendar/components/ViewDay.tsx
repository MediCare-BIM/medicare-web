'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  IconCalendar,
  IconClock,
  IconTrash,
  IconX,
  IconPencil,
  IconAlarm,
} from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { useState } from 'react';
import { EditAppointmentDialog } from './dialogs/EditAppointmentDialog';
import { DeleteAppointmentDialog } from './dialogs/DeleteAppointmentDialog';
import { AppointmentRow } from '../lib/requests';

interface ViewDayProps {
  selectedAppointment: AppointmentRow;
  onClose: () => void;
  isMobile: boolean;
}

interface ViewDayHeaderProps {
  title: string;
  onClose: () => void;
  hideCloseButton?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ViewDayHeader = ({
  title,
  onClose,
  hideCloseButton,
  onEdit,
  onDelete,
}: ViewDayHeaderProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between w-full items-center">
      <span className="font-semibold">{title}</span>
      <div className="flex items-center gap-2">
        {!hideCloseButton && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={onEdit}>
        <IconPencil className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onDelete}>
        <IconTrash className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const ViewDayContent = ({
  selectedAppointment,
}: {
  selectedAppointment: AppointmentRow;
}) => {
  const startDate = format(
    new Date(selectedAppointment.start_time),
    'eeee, MMM dd, yyyy'
  );
  const startTime = format(new Date(selectedAppointment.start_time), 'p');
  const endTime = selectedAppointment.end_time
    ? format(new Date(selectedAppointment.end_time), 'p')
    : '';

  return (
    <>
      <div className="space-y-4 mt-2">
        <div className="flex items-center gap-2">
          <IconCalendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm">{startDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconClock className="h-5 w-5 text-gray-500" />
          <span className="text-sm">
            {startTime} - {endTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconAlarm className="h-5 w-5 text-gray-500" />
          <span className="text-sm">10 min. înainte</span>
        </div>
      </div>

      <div className="space-y-4 mt-2">
        <span className="text-md font-semibold">Despre Pacient:</span>
        <p className="text-sm text-gray-500 mt-1">
          Hipertensiune arterială + Diabet tip 2 45 ani Metformin 2000mg x 2/zi,
          Enalapril 300mg x 1/zi, Omega 3
        </p>
      </div>
    </>
  );
};

export function ViewDay({
  selectedAppointment,
  onClose,
  isMobile,
}: ViewDayProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent className="w-[400px] sm:w-[540px] p-4 flex flex-col gap-4">
          <SheetHeader className="p-0">
            <ViewDayHeader
              title={selectedAppointment.patient_full_name || ''}
              onClose={onClose}
              hideCloseButton
              onEdit={() => setIsEditOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
            />
          </SheetHeader>
          <ViewDayContent selectedAppointment={selectedAppointment} />
          {isEditOpen && (
            <EditAppointmentDialog
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              selectedAppointment={selectedAppointment}
            />
          )}
          {isDeleteOpen && (
            <DeleteAppointmentDialog
              isOpen={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
              selectedAppointment={selectedAppointment}
            />
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-[400px] p-4 flex flex-col gap-4">
      <ViewDayHeader
        title={selectedAppointment.patient_full_name || ''}
        onClose={onClose}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />
      <ViewDayContent selectedAppointment={selectedAppointment} />
      {isEditOpen && (
        <EditAppointmentDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          selectedAppointment={selectedAppointment}
        />
      )}
      {isDeleteOpen && (
        <DeleteAppointmentDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          selectedAppointment={selectedAppointment}
        />
      )}
    </div>
  );
}

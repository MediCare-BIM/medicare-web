'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  IconCalendar,
  IconClock,
  IconTrash,
  IconX,
  IconPencil,
  IconAlarm,
  IconFileText,
} from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { useState } from 'react';
import { EditAppointmentDialog } from './dialogs/EditAppointmentDialog';
import { DeleteAppointmentDialog } from './dialogs/DeleteAppointmentDialog';
import { AppointmentRow } from '../lib/requests';
import { Separator } from '@/components/ui/separator';

interface ViewDayProps {
  selectedAppointment: AppointmentRow;
  onClose: () => void;
  isMobile: boolean;
}

interface ViewDayHeaderProps {
  title: string;
  status?: string;
  onClose: () => void;
  hideCloseButton?: boolean;
}

const ViewDayHeader = ({
  title,
  status,
  onClose,
  hideCloseButton,
}: ViewDayHeaderProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex justify-between w-full items-start">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {status && (
          <Badge variant="secondary" className="mt-2">
            {status}
          </Badge>
        )}
      </div>
      {!hideCloseButton && (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

const ViewDayContent = ({
  selectedAppointment,
  onEdit,
  onDelete,
  onGenerateReport,
}: {
  selectedAppointment: AppointmentRow;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateReport: () => void;
}) => {
  const startDate = format(
    new Date(selectedAppointment.start_time),
    'EEEE, MMM dd, yyyy'
  );
  const startTime = format(new Date(selectedAppointment.start_time), 'p');
  const endTime = selectedAppointment.end_time
    ? format(new Date(selectedAppointment.end_time), 'p')
    : '';

  return (
    <div className="space-y-4">
      {/* Time Details */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <IconCalendar className="h-5 w-5 text-primary" />
          <span className="text-sm text-gray-700">{startDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <IconClock className="h-5 w-5 text-primary" />
          <span className="text-sm text-gray-700">
            {startTime} - {endTime}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <IconAlarm className="h-5 w-5 text-primary" />
          <span className="text-sm text-gray-700">10 min. înainte</span>
        </div>
      </div>

      <Separator />

      {/* Patient Info */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900">Despre Pacient:</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          Hipertensiune arterială + Diabet tip 2<br />
          45 ani
          <br />
          Medicație: Metformin 2000mg x 2/zi, Enalapril 300mg x 1/zi, Omega 3
        </p>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onEdit}
        >
          <IconPencil className="h-4 w-4 mr-2" />
          Editează Programarea
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-primary border-primary hover:bg-primary/10"
          onClick={onGenerateReport}
        >
          <IconFileText className="h-4 w-4 mr-2" />
          Generează Raport
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
          onClick={onDelete}
        >
          <IconTrash className="h-4 w-4 mr-2" />
          Șterge Programarea
        </Button>
      </div>
    </div>
  );
};

export function ViewDay({
  selectedAppointment,
  onClose,
  isMobile,
}: ViewDayProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleOnClose = () => {
    onClose();
    setIsEditOpen(false);
    setIsDeleteOpen(false);
  };

  const handleGenerateReport = () => {
    // TODO: Integrate with consultation report modal
    console.log('Generate report for appointment:', selectedAppointment.id);
  };

  if (isMobile) {
    return (
      <Sheet
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent className="w-[400px] sm:w-[540px] p-6 flex flex-col gap-6">
          <SheetHeader className="p-0">
            <ViewDayHeader
              title={selectedAppointment.patient_full_name || ''}
              status="Confirmed"
              onClose={onClose}
              hideCloseButton
            />
          </SheetHeader>
          <ViewDayContent
            selectedAppointment={selectedAppointment}
            onEdit={() => setIsEditOpen(true)}
            onDelete={() => setIsDeleteOpen(true)}
            onGenerateReport={handleGenerateReport}
          />
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
              onClose={handleOnClose}
              selectedAppointment={selectedAppointment}
            />
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-[400px] border-l bg-white p-6 flex flex-col gap-6 overflow-y-auto">
      <ViewDayHeader
        title={selectedAppointment.patient_full_name || ''}
        status="Confirmed"
        onClose={handleOnClose}
      />
      <ViewDayContent
        selectedAppointment={selectedAppointment}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
        onGenerateReport={handleGenerateReport}
      />
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
          onClose={handleOnClose}
          selectedAppointment={selectedAppointment}
        />
      )}
    </div>
  );
}

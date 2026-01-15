'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { IconCalendar } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { usePatients } from '../../hooks/usePatients';
import { useAppointmentForm } from '../../hooks/useAppointmentForm';
import { AppointmentRow } from '../../lib/requests';

interface AppointmentFormProps {
  appointment?: AppointmentRow;
  formData: ReturnType<typeof useAppointmentForm>['formData'];
  formHandlers: ReturnType<typeof useAppointmentForm>['formHandlers'];
  formState: ReturnType<typeof useAppointmentForm>['formState'];
}

export function AppointmentForm({
  appointment,
  formData,
  formHandlers,
  formState,
}: AppointmentFormProps) {
  const { data: patients, isLoading: isLoadingPatients } = usePatients();
  const { date, time, notes, patientId } = formData;
  const { setDate, setTime, setNotes, setPatientId } = formHandlers;
  const { availableTimes, isLoadingTimes } = formState;

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <Label htmlFor="patient" className="text-left md:text-right">
          Pacient
        </Label>
        <Select
          onValueChange={setPatientId}
          value={patientId}
          disabled={!!appointment || isLoadingPatients}
        >
          <SelectTrigger
            className="w-full mt-2"
            disabled={patients?.length === 0}
          >
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="grid grid-cols-1 gap-2 flex-1">
          <Label htmlFor="date" className="text-left md:text-right">
            Modifică data programării
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal mt-2',
                  !date && 'text-muted-foreground'
                )}
              >
                <IconCalendar className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                required
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-1 gap-2 flex-1">
          <Label htmlFor="time" className="text-left md:text-right">
            Modifică ora programării
          </Label>
          <Select
            onValueChange={setTime}
            value={time}
            disabled={isLoadingTimes || !date}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes?.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-left">
          Adaugă notițe{' '}
          <span className="text-gray-500">(vizibile doar pentru tine)</span>
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adaugă observații relevante pentru această programare."
          className="mt-2"
        />
      </div>
    </div>
  );
}

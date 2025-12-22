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
import { Input } from '@/components/ui/input';
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
import { EventClickArg } from '@fullcalendar/core';
import { format, isSameDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { IconCalendar } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAvailableTimes } from '../../hooks/useAvailableTimes';

interface EditAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: Date, time: string, notes: string) => void;
  selectedEvent: EventClickArg;
}

export function EditAppointmentDialog({
  isOpen,
  onClose,
  onSave,
  selectedEvent,
}: EditAppointmentDialogProps) {
  const { event } = selectedEvent;

  const [date, setDate] = useState<Date | undefined>(event.start!);
  const [time, setTime] = useState<string>(
    event.start ? format(event.start, 'HH:mm') : ''
  );
  const [notes, setNotes] = useState<string>(event.extendedProps?.notes || '');
  const { data: availableTimes, isLoading: isLoadingTimes } =
    useAvailableTimes(date);

  useEffect(() => {
    if (event.start) {
      const originalDate = event.start;
      setDate(originalDate);
      setTime(format(originalDate, 'HH:mm'));
      setNotes(event.extendedProps?.notes || '');
    }
  }, [event]);

  useEffect(() => {
    // Reset time when date changes, if the new date is different from the original event's date
    if (date && event.start && !isSameDay(date, event.start)) {
      setTime('');
    }
  }, [date, event.start]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (date && time) {
      onSave(date, time, notes);
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

        <div className="flex w-full flex-col gap-4">
          <div>
            <Label htmlFor="name" className="text-left md:text-right">
              Pacient
            </Label>
            <Input
              id="name"
              value={event.title}
              className="col-span-3 mt-2"
              disabled
            />
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
                      'w-full justify-start text-left font-normal',
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
                    onSelect={handleDateSelect}
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
                <SelectTrigger className="w-full">
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button type="submit" onClick={handleSave}>
            Salvează
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

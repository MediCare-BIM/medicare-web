'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg } from '@fullcalendar/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppointments } from '../hooks/useAppointments';
import { transformAppointmentsToEvents } from '../lib/utils';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { View } from './CalendarHeader';

interface CalendarProps {
  view: View;
  date: Date;
  searchQuery: string;
}

export function Calendar({ view, date, searchQuery }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(
    null
  );

  const dateRange = useMemo(() => {
    const start =
      view === 'dayGridMonth'
        ? startOfMonth(date)
        : startOfWeek(date, { weekStartsOn: 1 });
    const end =
      view === 'dayGridMonth'
        ? endOfMonth(date)
        : endOfWeek(date, { weekStartsOn: 1 });
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }, [date, view]);

  const { data: appointments, isLoading, isError } = useAppointments(dateRange);

  const filteredEvents = useMemo(() => {
    if (!appointments) return [];
    const events = transformAppointmentsToEvents(appointments as any);
    if (!searchQuery) return events;
    return events.filter((event) =>
      event.extendedProps?.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  }, [date]);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
    }
  }, [view]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo);
    setOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching appointments</div>;

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        headerToolbar={false}
        initialView="timeGridWeek"
        viewDidMount={(arg) => {
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(arg.view.type);
          }
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={filteredEvents}
        eventClick={handleEventClick}
        eventContent={(eventInfo) => (
          <div className="flex flex-col h-full justify-between p-1">
            <div className="text-xs font-semibold text-indigo-700">
              {eventInfo.event.title}
            </div>
            {eventInfo.event.extendedProps.patientName && (
              <div className="text-[11px] text-indigo-600">
                {eventInfo.event.extendedProps.patientName}
              </div>
            )}
          </div>
        )}
        height="auto"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.event.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div>
              <p>
                <strong>Patient:</strong>{' '}
                {selectedEvent.event.extendedProps.patientName}
              </p>
              <p>
                <strong>Time:</strong>{' '}
                {selectedEvent.event.start?.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {selectedEvent.event.end?.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

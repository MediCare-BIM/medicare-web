'use client';

import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';

import { useIsMobile } from '@/hooks/use-mobile';
import { ViewDay } from './ViewDay';
import { useAppointments } from '../hooks/useAppointments';
import { View } from './CalendarHeader';
import { useDateRange } from '../hooks/useDateRange';
import { format, isToday } from 'date-fns';
import { useFilteredEvents } from '../hooks/useFilteredEvents';

// Props
interface CalendarProps {
  view: View;
  date: Date;
  searchQuery: string;
}

// Sub-components
const AppointmentEventContent = (eventInfo: EventContentArg) => (
  <div className="flex flex-col h-full justify-between p-1">
    <div className="text-xs font-semibold text-indigo-700 truncate">
      {eventInfo.event.title}
    </div>
    {eventInfo.event.extendedProps.patientName && (
      <div className="text-[11px] text-indigo-600 truncate">
        {eventInfo.event.extendedProps.patientName}
      </div>
    )}
  </div>
);

// Main Component
export function Calendar({ view, date, searchQuery }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(
    null
  );
  const isMobile = useIsMobile();

  const dateRange = useDateRange(date, view);
  const { data: appointments, isLoading, isError } = useAppointments(dateRange);
  const filteredEvents = useFilteredEvents(appointments, searchQuery);

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
    if (view === 'dayGridMonth') return;

    if (
      selectedEvent?.event?.extendedProps?.appointmentId ===
      clickInfo.event?.extendedProps?.appointmentId
    ) {
      setSelectedEvent(null);
    } else {
      setSelectedEvent(clickInfo);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching appointments</div>;

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          headerToolbar={false}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={filteredEvents}
          eventClick={handleEventClick}
          eventContent={AppointmentEventContent}
          dayHeaderContent={(arg) => {
            const dayOfMonth = format(arg.date, 'd');
            const dayOfWeek = format(arg.date, 'E');
            const today = isToday(arg.date);
            return (
              <div className="flex items-center justify-center gap-2 h-9">
                <span>{dayOfWeek}</span>
                {today ? (
                  <span className="day-of-month">{dayOfMonth}</span>
                ) : (
                  <span>{dayOfMonth}</span>
                )}
              </div>
            );
          }}
          height="100%"
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
        />
      </div>

      {selectedEvent && (
        <ViewDay
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

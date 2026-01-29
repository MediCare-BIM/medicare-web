'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';

import { useIsMobile } from '@/hooks/use-mobile';
import { ViewDay } from './ViewDay';
import { useAppointments } from '../hooks/useAppointments';
import { useDateRange } from '../hooks/useDateRange';
import { format, isToday } from 'date-fns';
import { useFilteredEvents } from '../hooks/useFilteredEvents';
import { AppointmentRow } from '../lib/requests';
import { useCalendarStore } from '../store';

const AppointmentEventContent = (eventInfo: EventContentArg) => {
  const reason =
    eventInfo.event.extendedProps?.reason ||
    eventInfo.event.title ||
    'General Consultation';
  const patientName = eventInfo.event.extendedProps?.patientName;

  return (
    <div className="flex flex-col h-full justify-start gap-0.5 p-1.5">
      <div className="text-xs font-semibold text-indigo-700 truncate leading-tight">
        {reason}
      </div>
      {patientName && (
        <div className="text-[11px] text-indigo-600 truncate leading-tight">
          {patientName}
        </div>
      )}
    </div>
  );
};

export function Calendar({
  calendarRef,
}: {
  calendarRef: React.RefObject<FullCalendar | null>;
}) {
  const {
    view,
    date,
    searchQuery,
    selectedAppointmentId,
    setSelectedAppointmentId,
  } = useCalendarStore();
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRow | null>(null);
  const isMobile = useIsMobile();

  const dateRange = useDateRange(date, view);
  const { data: appointments, isLoading, isError } = useAppointments(dateRange);
  const filteredEvents = useFilteredEvents(appointments, searchQuery);

  // Update current time indicator every minute
  useEffect(() => {
    const updateCurrentTime = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        // Force re-render by updating a dummy state or refetching
        calendarApi.refetchEvents();
      }
    };

    const interval = setInterval(updateCurrentTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [calendarRef]);

  // Sync selected appointment with store
  useEffect(() => {
    if (selectedAppointmentId && appointments) {
      const appointment = appointments.find(
        (a) => a.id === selectedAppointmentId
      );
      if (appointment) {
        setSelectedAppointment(appointment);
      }
    } else {
      setSelectedAppointment(null);
    }
  }, [selectedAppointmentId, appointments]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (view === 'dayGridMonth' || !appointments) return;

    const appointmentId = clickInfo.event?.extendedProps?.appointmentId;

    if (selectedAppointmentId === appointmentId) {
      setSelectedAppointmentId(null);
      return;
    }

    setSelectedAppointmentId(appointmentId);
  };

  const handleClose = () => {
    setSelectedAppointmentId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-gray-500">Loading appointments...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-red-500">Error fetching appointments</div>
      </div>
    );
  }

  return (
    <div className="h-full border-t">
      <div className="flex h-full">
        <div className="flex-1 relative">
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
            nowIndicator={true}
            dayHeaderContent={(arg) => {
              const dayOfMonth = format(arg.date, 'd');
              const dayOfWeek = format(arg.date, 'E');
              const today = isToday(arg.date);
              return (
                <div className="flex items-center justify-center gap-2 h-9">
                  <span className="text-sm font-medium text-gray-600">
                    {dayOfWeek}
                  </span>
                  {today ? (
                    <span className="day-of-month">{dayOfMonth}</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {dayOfMonth}
                    </span>
                  )}
                </div>
              );
            }}
            height="100%"
            slotMinTime="09:00:00"
            slotMaxTime="18:00:00"
          />
        </div>

        {selectedAppointment && (
          <ViewDay
            selectedAppointment={selectedAppointment}
            onClose={handleClose}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}

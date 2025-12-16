"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import scrollGridPlugin from "@fullcalendar/scrollgrid"; // Import scrollGridPlugin
import { EventClickArg } from "@fullcalendar/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FullCalendarScheduler() {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo);
    setOpen(true);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, scrollGridPlugin]}
        headerToolbar={{
          left: "",
          center: "",
          right: "",
        }}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={[
          {
            title: "Consultație generală",
            start: "2025-01-06T09:00:00",
            end: "2025-01-06T10:00:00",
            extendedProps: { patient: "Kianna Press" },
          },
          {
            title: "Recomandare analize...",
            start: "2025-01-07T10:00:00",
            end: "2025-01-07T11:00:00",
            extendedProps: { patient: "Marcus Gouse" },
          },
          {
            title: "Interpretare analize d...",
            start: "2025-01-08T09:00:00",
            end: "2025-01-08T10:00:00",
            extendedProps: { patient: "Omar Lubin" },
          },
          {
            title: "ECG Tiroidă",
            start: "2025-01-09T09:00:00",
            end: "2025-01-09T10:00:00",
            extendedProps: { patient: "" },
          },
          {
            title: "Control diabet",
            start: "2025-01-06T11:30:00",
            end: "2025-01-06T12:30:00",
            extendedProps: { patient: "Terry Kenter" },
          },
          {
            title: "Recomandare analize...",
            start: "2025-01-08T10:30:00",
            end: "2025-01-08T11:30:00",
            extendedProps: { patient: "Tiana Culhane" },
          },
          {
            title: "ECG Tiroidă",
            start: "2025-01-10T10:30:00",
            end: "2025-01-10T11:30:00",
            extendedProps: { patient: "Maren Lubin" },
          },
          {
            title: "Recomandare analize...",
            start: "2025-01-09T14:00:00",
            end: "2025-01-09T15:00:00",
            extendedProps: { patient: "Aspen Rhiel Madsen" },
          },
          {
            title: "Control diabet",
            start: "2025-01-10T11:30:00",
            end: "2025-01-10T12:30:00",
            extendedProps: { patient: "" },
          },
          {
            title: "Consultație generală",
            start: "2025-01-08T14:00:00",
            end: "2025-01-08T15:00:00",
            extendedProps: { patient: "Dulce Bator" },
          },
          {
            title: "Control diabet",
            start: "2025-01-07T15:00:00",
            end: "2025-01-07T16:00:00",
            extendedProps: { patient: "Angel Westervelt" },
          },
          {
            title: "Recomandare analize...",
            start: "2025-01-08T15:00:00",
            end: "2025-01-08T16:00:00",
            extendedProps: { patient: "Giana Culhane" },
          },
          {
            title: "Consultație generală",
            start: "2025-01-09T15:00:00",
            end: "2025-01-09T16:00:00",
            extendedProps: { patient: "Hanna Dorwart" },
          },
        ]}
        eventClick={handleEventClick}
        height="auto" // This makes the calendar take the height of its parent
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.event.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div>
              <p>
                <strong>Patient:</strong>{" "}
                {selectedEvent.event.extendedProps.patient}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {selectedEvent.event.start?.toLocaleTimeString()} -{" "}
                {selectedEvent.event.end?.toLocaleTimeString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
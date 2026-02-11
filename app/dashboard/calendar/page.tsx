'use client';

import { useRef } from 'react';
import { Calendar } from './components/Calendar';
import { CalendarHeader } from './components/CalendarHeader';
import FullCalendar from '@fullcalendar/react';

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <CalendarHeader calendarRef={calendarRef} />
      <div className="flex-1 min-h-0">
        <Calendar calendarRef={calendarRef} />
      </div>
    </div>
  );
}

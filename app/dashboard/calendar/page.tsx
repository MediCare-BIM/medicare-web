'use client';

import { useRef } from 'react';
import { Calendar } from './components/Calendar';
import { CalendarHeader } from './components/CalendarHeader';
import FullCalendar from '@fullcalendar/react';

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <>
      <CalendarHeader calendarRef={calendarRef} />
      <Calendar calendarRef={calendarRef} />
    </>
  );
}

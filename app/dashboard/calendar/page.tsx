'use client';

import { FullCalendarScheduler } from './components/Calendar';
import { CalendarHeader } from './components/CalendarHeader';

export default function CalendarPage() {
  return (
    <div className="">
      <CalendarHeader />
      <FullCalendarScheduler />
    </div>
  );
}

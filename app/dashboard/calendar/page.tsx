'use client';

import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { CalendarHeader, View } from './components/CalendarHeader';

export default function CalendarPage() {
  const [view, setView] = useState<View>('timeGridWeek');
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <CalendarHeader
        view={view}
        date={date}
        onViewChange={setView}
        onDateChange={setDate}
        onSearch={setSearchQuery}
      />
      <div className="p-4">
        <Calendar view={view} date={date} searchQuery={searchQuery} />
      </div>
    </>
  );
}

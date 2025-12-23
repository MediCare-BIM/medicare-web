import { useMemo } from 'react';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { View } from '../components/CalendarHeader';

export function useDateRange(date: Date, view: View) {
  return useMemo(() => {
    const start =
      view === 'dayGridMonth'
        ? startOfMonth(date)
        : startOfWeek(date, { weekStartsOn: 1 });
    const end =
      view === 'dayGridMonth'
        ? endOfMonth(date)
        : endOfWeek(date, { weekStartsOn: 1 });
    return { from: start.toISOString(), to: end.toISOString() };
  }, [date, view]);
}

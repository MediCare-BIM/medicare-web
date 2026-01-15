import { useMemo } from 'react';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { View } from '../store';

export function useDateRange(date: Date, view: View) {
  return useMemo(() => {
    const start =
      view === 'dayGridMonth'
        ? startOfMonth(date)
        : startOfWeek(date);
    const end =
      view === 'dayGridMonth'
        ? endOfMonth(date)
        : endOfWeek(date);
    return { from: start.toISOString(), to: end.toISOString() };
  }, [date, view]);
}

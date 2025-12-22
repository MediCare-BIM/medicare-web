
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getAvailableTimeSlots } from '../lib/time-slots';

async function fetchAppointmentsForDate(date: Date): Promise<{ start_time: string }[]> {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(`/api/appointments/${formattedDate}`);

  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }

  return response.json();
}

export function useAvailableTimes(date: Date | undefined) {
  return useQuery({
    queryKey: ['availableTimes', date ? format(date, 'yyyy-MM-dd') : ''],
    queryFn: async () => {
      if (!date) {
        return [];
      }
      const appointments = await fetchAppointmentsForDate(date);
      return getAvailableTimeSlots(date, appointments);
    },
    enabled: !!date,
  });
}

import { startOfDay, endOfDay } from 'date-fns';
import { getAvailableTimeSlots } from '../lib/time-slots';
import { useAppointments } from './useAppointments';


export function useAvailableTimes(date: Date) {
  const { data: appointments, isLoading, isError } = useAppointments({ from: startOfDay(date).toISOString(), to: endOfDay(date).toISOString() });



  return { data: getAvailableTimeSlots(date, appointments || []), isLoading, isError };
}


import { useMemo } from 'react';
import { transformAppointmentsToEvents } from '../lib/utils';
import { AppointmentRow } from '../lib/requests';

export function useFilteredEvents(
  appointments: AppointmentRow[] | undefined,
  searchQuery: string
) {
  return useMemo(() => {
    if (!appointments) return [];
    const events = transformAppointmentsToEvents(appointments);
    if (!searchQuery) return events;
    return events.filter((event) =>
      event.extendedProps?.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);
}

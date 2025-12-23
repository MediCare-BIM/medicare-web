import { type EventInput } from '@fullcalendar/core'
import { format, startOfWeek } from 'date-fns'
import { AppointmentRow } from './requests';

export const transformAppointmentsToEvents = (
  appointments: AppointmentRow[]
): EventInput[] => {
  return appointments.map((appointment) => ({
    title: `${appointment.reason}`,
    start: `${appointment.start_time}`,
    end: `${appointment.end_time}`,
    extendedProps: {
      appointmentId: appointment.id,
      patientName: appointment.patient_full_name,
      appointmentType: "General",
    },
  }))
}

export const getPeriodString = (
  date: Date,
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
) => {
  if (view === 'dayGridMonth') {
    return format(date, 'MMMM yyyy')
  }

  if (view === 'timeGridWeek') {
    const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 })
    const endOfWeekDate = new Date(startOfWeekDate)
    endOfWeekDate.setDate(startOfWeekDate.getDate() + 6)

    return `${format(startOfWeekDate, 'd MMM yyyy')} - ${format(
      endOfWeekDate,
      'd MMM yyyy'
    )}`
  }

  if (view === 'timeGridDay') {
    return format(date, 'd MMM yyyy')
  }

  return ''
}

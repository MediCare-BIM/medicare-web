
import { type Appointment } from './types'
import { type EventInput } from '@fullcalendar/core'
import { format, startOfWeek } from 'date-fns'

export const transformAppointmentsToEvents = (
  appointments: Appointment[]
): EventInput[] => {
  return appointments.map((appointment) => ({
    title: `${appointment.type} - ${appointment.patients.name}`,
    start: `${appointment.date}T${appointment.start_time}`,
    end: `${appointment.date}T${appointment.end_time}`,
    extendedProps: {
      appointmentId: appointment.id,
      patientName: appointment.patients.name,
      appointmentType: appointment.type,
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

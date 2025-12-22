
import { APPOINTMENT_INTERVAL, END_HOUR, START_HOUR } from '@/lib/consts';
import { addMinutes, format, setHours, setMinutes } from 'date-fns';
import { parseISO } from 'date-fns/parseISO'



export function generateTimeSlots(
  date: Date,
  interval: number = APPOINTMENT_INTERVAL
): string[] {
  const startTime = setMinutes(setHours(date, START_HOUR), 0);
  const endTime = setMinutes(setHours(date, END_HOUR), 0);
  const slots: string[] = [];

  let currentTime = startTime;
  while (currentTime < endTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, interval);
  }

  return slots;
}

export function getAvailableTimeSlots(
  date: Date,
  appointments: { start_time: string }[],
  interval: number = APPOINTMENT_INTERVAL
): string[] {
  const allSlots = generateTimeSlots(date, interval);
  const reservedSlots = appointments.map((apt) =>
    format(parseISO(apt.start_time), 'HH:mm')
  );

  return allSlots.filter((slot) => !reservedSlots.includes(slot));
}

import { format, isSameDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAvailableTimes } from './useAvailableTimes';
import { AppointmentRow } from '../lib/requests';

export function useAppointmentForm(
  appointment?: AppointmentRow
) {
  const [date, setDate] = useState<Date>(
    appointment ? new Date(appointment.start_time) : new Date()
  );
  const [time, setTime] = useState<string>(
    appointment ? format(new Date(appointment.start_time), 'HH:mm') : ''
  );
  const [notes, setNotes] = useState<string>(appointment?.notes || '');
  const [reason, setReason] = useState<string>(appointment?.reason || '');
  const [patientId, setPatientId] = useState<string | undefined>(
    appointment?.patient_id
  );

  const { data: availableTimes, isLoading: isLoadingTimes } =
    useAvailableTimes(date);

  useEffect(() => {
    if (appointment) {
      setDate(new Date(appointment.start_time));
      setTime(format(new Date(appointment.start_time), 'HH:mm'));
      setNotes(appointment.notes || '');
      setReason(appointment.reason || '');
      setPatientId(appointment.patient_id);
    }
  }, [appointment]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    setDate(selectedDate);
    if (
      !appointment ||
      !isSameDay(selectedDate, new Date(appointment.start_time))
    ) {
      setTime('');
    }
  }


  const formData = {
    date,
    time,
    notes,
    reason,
    patientId,
  };

  const formHandlers = {
    setDate: handleDateSelect,
    setTime,
    setNotes,
    setReason,
    setPatientId,
  };

  const formState = {
    availableTimes,
    isLoadingTimes,
  };

  return { formData, formHandlers, formState };
}

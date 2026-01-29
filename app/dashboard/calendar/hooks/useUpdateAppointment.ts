'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { updateAppointment } from '../lib/requests';
import { setHours, setMinutes, addMinutes } from 'date-fns';
import { APPOINTMENT_INTERVAL } from '@/lib/consts';

export function useUpdateAppointment(appointmentId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      date,
      time,
      reason,
      notes,
    }: {
      date: Date;
      time: string;
      reason: string;
      notes: string;
    }) => {
      const [hours, minutes] = time.split(':').map(Number);
      const newStartDate = setMinutes(setHours(date, hours), minutes);
      const newEndDate = addMinutes(newStartDate, APPOINTMENT_INTERVAL);

      return updateAppointment(supabase, appointmentId, {
        start_time: newStartDate.toISOString(),
        end_time: newEndDate.toISOString(),
        reason: reason,
        notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Programare editată.');
      onDone();
    },
    onError: () => {
      toast.error('Nu am putut salva modificările.');
    },
  });
}

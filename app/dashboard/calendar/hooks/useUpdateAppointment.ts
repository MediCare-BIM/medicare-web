'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { updateAppointment } from '../lib/requests';
import { setHours, setMinutes, addMinutes } from 'date-fns';

export function useUpdateAppointment(appointmentId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      date,
      time,
      notes,
    }: {
      date: Date;
      time: string;
      notes: string;
    }) => {
      const [hours, minutes] = time.split(':').map(Number);
      const newStartDate = setMinutes(setHours(date, hours), minutes);
      const newEndDate = addMinutes(newStartDate, 30);

      return updateAppointment(supabase, appointmentId, {
        start_time: newStartDate.toISOString(),
        end_time: newEndDate.toISOString(),
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

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { deleteAppointment } from '../lib/requests';

export function useDeleteAppointment(
  appointmentId: string,
  onDone: () => void
) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      return deleteAppointment(supabase, appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Programare ștearsă.');
      onDone();
    },
    onError: () => {
      toast.error('Nu am putut șterge programarea.');
    },
  });
}


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createAppointment as createAppointmentRequest } from '../lib/requests';
import { createClient } from '@/lib/supabase/client';

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      patient_id: string;
      start_time: string;
      end_time: string;
      reason: string;
      notes: string;
    }) => {
      const supabase = createClient();
      return createAppointmentRequest(supabase, appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully.');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

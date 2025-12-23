
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('patients').select('id, full_name');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}


import { createClient } from '@/lib/supabase/client'
import { getAppointments } from '../lib/requests'
import { useQuery } from '@tanstack/react-query'

export function useAppointments({ from, to }: { from: string; to: string }) {
  return useQuery({
    queryKey: ['appointments', from, to],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await getAppointments(supabase, { from, to })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
  })
}


import { useQuery } from '@tanstack/react-query';
import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
} from 'date-fns';
import { getAppointments } from '@/app/dashboard/calendar/lib/requests';
import { createClient } from '@/lib/supabase/client';
import { AppointmentRow } from '@/app/dashboard/calendar/lib/requests';

const calculatePercentageChange = (today: number, yesterday: number) => {
  if (yesterday === 0) {
    return today > 0 ? 100 : 0;
  }
  if (today === yesterday) {
    return 0;
  }
  const change = ((today - yesterday) / yesterday) * 100;

  // if change is for example from 1 to 0, it is -100%. from 2 to 1 it is -50%. from 1 to 2 it is 100%.
  // if today is 0 and yesterday is > 0, the change is -100.
  if (today === 0 && yesterday > 0) {
    return -100;
  }

  return change;
};

const processAppointments = (appointments: AppointmentRow[] | null) => {
  if (!appointments) return { total: 0, highPriority: 0, waiting: 0 };
  const total = appointments.length;
  const highPriority = appointments.filter(
    (apt) => apt.priority === 'High'
  ).length;
  const waiting = appointments.filter(
    (apt) => apt.status === 'pending'
  ).length;
  return { total, highPriority, waiting };
};

export function useDashboardInsights() {
  return useQuery({
    queryKey: ['dashboardInsights'],
    queryFn: async () => {
      const supabase = createClient();

      const todayRange = {
        from: startOfToday().toISOString(),
        to: endOfToday().toISOString(),
      };
      const yesterdayRange = {
        from: startOfYesterday().toISOString(),
        to: endOfYesterday().toISOString(),
      };

      const [todayResponse, yesterdayResponse] = await Promise.all([
        getAppointments(supabase, todayRange),
        getAppointments(supabase, yesterdayRange),
      ]);

      if (todayResponse.error || yesterdayResponse.error) {
        throw new Error(
          todayResponse.error?.message || yesterdayResponse.error?.message || 'An unknown error occurred'
        );
      }

      const todayStats = processAppointments(todayResponse.data);
      const yesterdayStats = processAppointments(yesterdayResponse.data);

      const insights = {
        totalPatients: {
          value: todayStats.total,
          trend: calculatePercentageChange(
            todayStats.total,
            yesterdayStats.total
          ),
        },
        highPriority: {
          value: todayStats.highPriority,
          trend: calculatePercentageChange(
            todayStats.highPriority,
            yesterdayStats.highPriority
          ),
        },
        waiting: {
          value: todayStats.waiting,
          trend: calculatePercentageChange(
            todayStats.waiting,
            yesterdayStats.waiting
          ),
        },
      };

      return insights;
    },
  });
}

'use client';

import { useDashboardInsights } from '../hooks/useDashboardInsights';
import { InsightCard } from './InsightCard';
import { Users, Activity, Clock } from 'lucide-react';

export function Insights() {
  const { data: insights, isLoading, isError } = useDashboardInsights();

  if (isError) {
    // You might want to render a more user-friendly error component
    return <div className="text-red-500">Failed to load insights.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <InsightCard
        title="Pacienți astăzi"
        value={insights?.totalPatients.value ?? 0}
        trend={insights?.totalPatients.trend ?? 0}
        icon={<Users className="h-6 w-6" />}
        loading={isLoading}
      />
      <InsightCard
        title="Prioritate ridicată"
        value={insights?.highPriority.value ?? 0}
        trend={insights?.highPriority.trend ?? 0}
        icon={<Activity className="h-6 w-6" />}
        loading={isLoading}
      />
      <InsightCard
        title="În așteptare"
        value={insights?.waiting.value ?? 0}
        trend={insights?.waiting.trend ?? 0}
        icon={<Clock className="h-6 w-6" />}
        loading={isLoading}
      />
    </div>
  );
}

import { DailyAppointmentStats } from '@/lib/types';
import { SummaryCard } from './SummaryCard';

type SummaryCardsProps = {
  stats: DailyAppointmentStats;
};

export function SummaryCards({ stats }: SummaryCardsProps) {
  const summaryData = [
    {
      title: 'Pacienți astăzi',
      value: (stats.total_today ?? 0).toString(),
      percentageChange: '+5%', // Dummy value
      icon: 'user',
    },
    {
      title: 'Prioritate ridicată',
      value: (stats.high_priority_today ?? 0).toString(),
      percentageChange: '-2%', // Dummy value
      icon: 'alert-triangle',
    },
    {
      title: 'Media zilnică',
      value: stats.daily_average ? stats.daily_average.toFixed(1) : '0.0',
      percentageChange: '', // Not applicable
      icon: 'bar-chart-2',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {summaryData.map((data) => (
        <SummaryCard key={data.title} data={data} />
      ))}
    </div>
  );
}

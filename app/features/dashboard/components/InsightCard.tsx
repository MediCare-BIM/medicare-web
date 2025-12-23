import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import React from 'react';

type InsightCardProps = {
  title: string;
  value: number;
  trend: number;
  icon: React.ReactNode;
  loading?: boolean;
};

export function InsightCard({
  title,
  value,
  trend,
  icon,
  loading,
}: InsightCardProps) {
  if (loading) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  const trendColor =
    trend > 0
      ? 'text-green-500'
      : trend < 0
      ? 'text-red-500'
      : 'text-muted-foreground';
  const TrendIcon = trend > 0 ? ArrowUp : ArrowDown;
  const showTrend = trend !== 0;

  return (
    <Card>
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary  p-2 text-white">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold pt-1">{value}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-muted-foreground cursor-pointer">
              <Info className="h-4 w-4" />
            </div>
            {showTrend && (
              <div
                className={`mt-4 flex items-center text-sm font-semibold ${trendColor}`}
              >
                <TrendIcon className="mr-1 h-4 w-4" />
                <span>{`${Math.abs(trend).toFixed(0)}%`}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

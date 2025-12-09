import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, AlertTriangle, BarChart2 } from 'lucide-react';
import React from 'react';

const iconMap: { [key: string]: React.ElementType } = {
  user: User,
  'alert-triangle': AlertTriangle,
  'bar-chart-2': BarChart2,
};

type SummaryCardProps = {
  data: {
    title: string;
    value: string;
    percentageChange: string;
    icon: string;
  };
};

export function SummaryCard({ data }: SummaryCardProps) {
  const { title, value, percentageChange, icon } = data;
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {percentageChange} de luna trecută
        </p>
      </CardContent>
    </Card>
  );
}

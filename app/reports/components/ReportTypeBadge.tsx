import { Badge } from '@/components/ui/badge';
import { ReportType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileText, Pill } from 'lucide-react';

type ReportTypeBadgeProps = {
  type: ReportType;
};

export function ReportTypeBadge({ type }: ReportTypeBadgeProps) {
  const typeConfig = {
    Consultație: {
      icon: FileText,
      color:
        'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/20 dark:text-blue-400',
    },
    Prescripție: {
      icon: Pill,
      color:
        'bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-900/20 dark:text-purple-400',
    },
  };

  const { icon: Icon, color } = typeConfig[type];

  return (
    <Badge variant="outline" className={cn('gap-x-1.5', color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{type}</span>
    </Badge>
  );
}

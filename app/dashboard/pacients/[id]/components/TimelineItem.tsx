import { cn } from '@/lib/utils';
import { File, Pill, Syringe } from 'lucide-react';
import {
  TimelineItemType as ItemType,
  TimelineItem as TimelineItemType,
} from './types';

interface TimelineItemProps {
  item: TimelineItemType;
  isSelected: boolean;
  onClick: () => void;
}

const getIconForType = (type: ItemType) => {
  switch (type) {
    case 'consultatie':
      return File;
    case 'analiza':
      return Syringe;
    case 'prescriptie':
      return Pill;
    default:
      return File;
  }
};

export function TimelineItem({ item, isSelected, onClick }: TimelineItemProps) {
  const Icon = getIconForType(item.type);

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 cursor-pointer p-3 rounded-lg transition-colors',
        isSelected
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-accent/50'
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background',
          isSelected ? 'bg-primary' : 'border-border'
        )}
      >
        <Icon
          className={cn('h-6 w-6', isSelected ? 'text-primary-foreground' : '')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{item.title}</h4>
        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
        {item.pdfFile && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <File className="h-3 w-3" />
            <span>
              {item.pdfFile.name} {item.pdfFile.size}
            </span>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {item.date}
      </div>
    </div>
  );
}

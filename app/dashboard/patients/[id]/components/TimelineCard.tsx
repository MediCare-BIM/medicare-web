import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TimelineFilters } from './TimelineFilters';
import { TimelineItem } from './TimelineItem';
import {
  FilterCounts,
  TimelineItemType as ItemType,
  TimelineItem as TimelineItemType,
} from './types';

interface TimelineCardProps {
  filteredTimeline: TimelineItemType[];
  selectedFilter: ItemType | null;
  selectedItemId: string | null;
  filterCounts: FilterCounts;
  onFilterChange: (filter: ItemType | null) => void;
  onItemSelect: (item: TimelineItemType) => void;
}

export function TimelineCard({
  filteredTimeline,
  selectedFilter,
  selectedItemId,
  filterCounts,
  onFilterChange,
  onItemSelect,
}: TimelineCardProps) {
  return (
    <Card className="border-none shadow-none px-0 -mx-6">
      <CardHeader className="">
        <h3 className="font-semibold">Cronologie medicală</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <TimelineFilters
          selectedFilter={selectedFilter}
          filterCounts={filterCounts}
          onFilterChange={onFilterChange}
        />

        {/* Timeline Items */}
        <div className="space-y-4">
          {filteredTimeline.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu există evenimente disponibile
            </p>
          ) : (
            filteredTimeline.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onClick={() => onItemSelect(item)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

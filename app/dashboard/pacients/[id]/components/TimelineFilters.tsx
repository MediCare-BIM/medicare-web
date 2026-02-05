import { Button } from '@/components/ui/button';
import { FilterCounts, TimelineItemType } from './types';

interface TimelineFiltersProps {
  selectedFilter: TimelineItemType | null;
  filterCounts: FilterCounts;
  onFilterChange: (filter: TimelineItemType | null) => void;
}

export function TimelineFilters({
  selectedFilter,
  filterCounts,
  onFilterChange,
}: TimelineFiltersProps) {
  const handleFilterClick = (filter: TimelineItemType) => {
    onFilterChange(selectedFilter === filter ? null : filter);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant={selectedFilter === 'consultatie' ? 'secondary' : 'outline'}
        size="lg"
        onClick={() => handleFilterClick('consultatie')}
      >
        Consultatii {filterCounts.consultatie}
      </Button>
      <Button
        variant={selectedFilter === 'analiza' ? 'secondary' : 'outline'}
        size="lg"
        onClick={() => handleFilterClick('analiza')}
      >
        Analize {filterCounts.analiza}
      </Button>
      <Button
        variant={selectedFilter === 'prescriptie' ? 'secondary' : 'outline'}
        size="lg"
        onClick={() => handleFilterClick('prescriptie')}
      >
        Prescripții {filterCounts.prescriptie}
      </Button>
    </div>
  );
}

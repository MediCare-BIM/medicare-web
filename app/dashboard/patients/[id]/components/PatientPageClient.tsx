'use client';

import { useMemo, useState } from 'react';
import { AiSummaryCard } from './AiSummaryCard';
import { PatientHeader } from './PatientHeader';
import { TimelineCard } from './TimelineCard';
import { TimelineDetailView } from './TimelineDetailView';
import {
  AiSummary,
  PatientData,
  TimelineItem,
  TimelineItemType,
} from './types';
import { parseRomanianDate } from './utils';

interface PatientPageClientProps {
  patientData: PatientData;
  aiSummary: AiSummary;
  timelineData: TimelineItem[];
}

export function PatientPageClient({
  patientData,
  aiSummary,
  timelineData,
}: PatientPageClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<TimelineItemType | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  const filteredTimeline = useMemo(() => {
    const list =
      selectedFilter === null
        ? [...timelineData]
        : timelineData.filter((item) => item.type === selectedFilter);
    // Sort by date descending (most recent first)
    return list.sort(
      (a, b) => parseRomanianDate(b.date) - parseRomanianDate(a.date)
    );
  }, [selectedFilter, timelineData]);

  const filterCounts = useMemo(() => {
    return {
      consultatie: timelineData.filter((item) => item.type === 'consultatie')
        .length,
      analiza: timelineData.filter((item) => item.type === 'analiza').length,
      prescriptie: timelineData.filter((item) => item.type === 'prescriptie')
        .length,
    };
  }, [timelineData]);

  return (
    <div className="flex flex-1 flex-col p-4 lg:p-6 overflow-hidden">
      <PatientHeader patientData={patientData} />

      {/* Main Content */}
      <div className="flex flex-1 gap-6 flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Column */}
        <div className="flex flex-col gap-2 w-1/3 min-w-[400px]">
          <AiSummaryCard
            aiSummary={aiSummary}
            isExpanded={isAiExpanded}
            onToggle={() => setIsAiExpanded(!isAiExpanded)}
          />

          <TimelineCard
            filteredTimeline={filteredTimeline}
            selectedFilter={selectedFilter}
            selectedItemId={selectedItem?.id ?? null}
            filterCounts={filterCounts}
            onFilterChange={setSelectedFilter}
            onItemSelect={setSelectedItem}
          />
        </div>

        {/* Right Column - Detail View */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <TimelineDetailView selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
}

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/components/ui/empty';
import { ChartGantt } from 'lucide-react';
import { AnalysisView } from './AnalysisView';
import { ConsultationView } from './ConsultationView';
import { PrescriptionView } from './PrescriptionView';
import { TimelineItem } from './types';

interface TimelineDetailViewProps {
  selectedItem: TimelineItem | null;
}

export function TimelineDetailView({ selectedItem }: TimelineDetailViewProps) {
  if (!selectedItem) {
    return (
      <div className="h-full flex items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartGantt />
            </EmptyMedia>
            <EmptyDescription>
              Selectează un eveniment din stânga pentru a vedea mai multe
              detalii.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // Render dedicated view based on item type
  return (
    <div className="h-full overflow-hidden">
      {selectedItem.type === 'consultatie' && (
        <ConsultationView item={selectedItem} />
      )}
      {selectedItem.type === 'analiza' && <AnalysisView item={selectedItem} />}
      {selectedItem.type === 'prescriptie' && (
        <PrescriptionView item={selectedItem} />
      )}
    </div>
  );
}

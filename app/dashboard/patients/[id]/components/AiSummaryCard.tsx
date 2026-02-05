import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { AiSummary } from './types';

interface AiSummaryCardProps {
  aiSummary: AiSummary;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AiSummaryCard({
  aiSummary,
  isExpanded,
  onToggle,
}: AiSummaryCardProps) {
  return (
    <Card className={cn('overflow-hidden', !isExpanded && 'pb-4')}>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {/* Back rectangle */}
              <div
                className="absolute rounded-lg bg-primary"
                style={{
                  width: 40,
                  height: 40,
                  top: '-4px',
                  right: '-4px',
                  transform: 'rotate(10deg)',
                  zIndex: 0,
                }}
              />
              {/* Foreground icon container */}
              <div className="relative rounded-lg bg-primary/10 backdrop-blur-lg p-2 flex items-center justify-center border-2 border-white z-10">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">
                Sinteză AI{' '}
                <span className="text-xs font-normal">
                  ({aiSummary.eventsAnalyzed} evenimente analizate)
                </span>
              </h3>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground rotate-90" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {aiSummary.summaries.length > 0 ? (
            aiSummary.summaries.map((item, index) => (
              <div key={index} className="space-y-1 pb-2">
                <h4 className="text-sm text-muted-foreground">
                  {item.subject}
                </h4>
                <p className="text-sm text-foreground">{item.summary}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nu există sinteză AI disponibilă pentru acest pacient.
            </p>
          )}

          <p className="text-xs text-muted-foreground italic pt-4">
            Această sinteză este generată automat pe baza istoricului medical și
            nu înlocuiește evaluarea clinică.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

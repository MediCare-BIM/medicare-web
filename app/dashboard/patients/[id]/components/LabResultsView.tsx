import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle } from 'lucide-react';

interface LabResult {
  unit: string;
  result: number;
  is_normal: boolean;
  test_name: string;

  // if there is no test_name, use the name
  name?: string;
  explanation: string;
  reference_range: string;
}

interface LabResultsData {
  results: LabResult[];
}

interface LabResultsViewProps {
  data: LabResultsData;
}

export function LabResultsView({ data }: LabResultsViewProps) {
  if (!data?.results || data.results.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nu există rezultate disponibile.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {data.results.map((result, index) => (
          <div key={index}>
            <Card className="border-none shadow-none -mx-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Test Name and Status */}
                  <div className="flex items-center gap-2 justify-between">
                    <h4 className="text-sm font-medium">
                      {result.test_name || result.name}
                    </h4>
                    <div className="flex items-center">
                      {result.is_normal ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Valori normale
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          În afara valorilor
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Result Value */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{result.result}</span>
                    <span className="text-sm text-muted-foreground">
                      {result.unit}
                    </span>
                  </div>

                  {/* Reference Range */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Valori de referință:{' '}
                    </span>
                    <span>{result.reference_range}</span>
                  </div>
                  {/* Explanation */}
                  <div className="text-sm text-muted-foreground">
                    {result.explanation}
                  </div>
                </div>
              </div>
            </Card>
            {index < data.results.length - 1 && <Separator className="-mx-4" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

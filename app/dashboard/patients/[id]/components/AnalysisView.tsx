'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { LabResultsView } from './LabResultsView';
import { TimelineItem } from './types';
import { generateLabResultsPDF } from '../lib/pdf-generator';

interface AnalysisViewProps {
  item: TimelineItem;
}

export function AnalysisView({ item }: AnalysisViewProps) {
  const handleDownloadPDF = () => {
    generateLabResultsPDF(item);
  };

  return (
    <Card className="border-none shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="text-muted-foreground">{item.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Metadata Fields */}
        {(item.doctor || item.location) && (
          <div className="shrink-0">
            <div className="flex gap-2">
              {item.doctor && (
                <div className="space-y-2 flex-1 min-w-0">
                  <label className="text-sm font-medium">Medic</label>
                  <Input value={item.doctor} readOnly className="bg-muted/50" />
                </div>
              )}

              {item.location && (
                <div className="space-y-2 flex-1 min-w-0">
                  <label className="text-sm font-medium">Locație</label>
                  <Input
                    value={item.location}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              )}
            </div>
            <Separator className="mt-6" />
          </div>
        )}

        {/* Lab Results with Download */}
        {item.resultData && (
          <div className="space-y-2 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* File Header with Download Button */}
            <div className="shrink-0 flex items-center justify-between gap-4 p-3 rounded-md">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="h-6 w-6 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  Rezultate_Analize.pdf
                </span>
              </div>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Descarcă PDF
              </Button>
            </div>

            {/* Lab Results View */}
            <div className="flex-1 overflow-hidden">
              <LabResultsView data={item.resultData} />
            </div>
          </div>
        )}

        {/* PDF File */}
        {item.pdfFile && (
          <div className="shrink-0">
            <Separator className="mb-6" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Document</label>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {item.pdfFile.name} ({item.pdfFile.size})
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { TimelineItem } from './types';

interface ConsultationViewProps {
  item: TimelineItem;
}

export function ConsultationView({ item }: ConsultationViewProps) {
  return (
    <Card className="border-none shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="text-muted-foreground">{item.subtitle}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-6 pr-4">
            {/* Metadata Fields */}
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

            {/* Visit Details */}
            {item.visitReason && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivul vizitei</label>
                <Textarea
                  value={item.visitReason}
                  readOnly
                  className="bg-muted/50 min-h-[80px] resize-none"
                />
              </div>
            )}

            {item.findings && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Constatări</label>
                <Textarea
                  value={item.findings}
                  readOnly
                  className="bg-muted/50 min-h-[80px] resize-none"
                />
              </div>
            )}

            {item.diagnosis && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diagnostic</label>
                  <Input
                    value={item.diagnosis}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              </>
            )}

            {item.treatment && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tratament</label>
                <Textarea
                  value={item.treatment}
                  readOnly
                  className="bg-muted/50 min-h-[80px] resize-none"
                />
              </div>
            )}

            {item.notes && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Notițe suplimentare
                  </label>
                  <Textarea
                    value={item.notes}
                    readOnly
                    className="bg-muted/50 min-h-[80px] resize-none"
                  />
                </div>
              </>
            )}

            {item.pdfFile && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document</label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {item.pdfFile.name} ({item.pdfFile.size})
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

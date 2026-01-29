'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Report } from '@/lib/types';
import { ChevronDown, FileText, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ReportsTable } from './ReportsTable';
import { ConsultationFormProvider } from './ConsultationFormContext';
import { ConsultationReportModal } from './ConsultationReportModal';

type ReportsProps = {
  reports: Report[];
};

const reportTypeOptions = [
  { label: 'Toate tipurile', value: 'Toate tipurile' },
  { label: 'Consultație', value: 'Consultație' },
  { label: 'Prescripție', value: 'Prescripție' },
];

export function Reports({ reports }: ReportsProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('Toate tipurile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  const handleConsultationSuccess = () => {
    // Refresh server component data without full page reload
    router.refresh();
  };

  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Filter by type
    if (selectedType !== 'Toate tipurile') {
      filtered = filtered.filter((report) => report.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((report) =>
        report.patientName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [reports, selectedType, searchQuery]);

  return (
    <main>
      <ConsultationFormProvider>
        <ConsultationReportModal
          open={isConsultationModalOpen}
          onOpenChange={setIsConsultationModalOpen}
          onSuccess={handleConsultationSuccess}
        />

        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Rapoarte generate
              </h2>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rapoarte</CardTitle>
              <CardDescription>
                Lista rapoartelor generate pentru pacienții dumneavoastră.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {reports.length > 0 ? (
                <>
                  <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <Select
                        value={selectedType}
                        onValueChange={(value) => setSelectedType(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Tip raport" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="relative flex-grow sm:w-auto sm:flex-grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Caută pacient"
                          className="pl-8 sm:w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="default">
                            Generează raport
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setIsConsultationModalOpen(true)}
                          >
                            Consultație
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Implement prescription report generation
                            }}
                          >
                            Prescripție
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    {filteredReports.length > 0 ? (
                      <ReportsTable reports={filteredReports} />
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
                        Nu s-au găsit rapoarte care să corespundă filtrelor.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Nu există rapoarte generate
                    </h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                      Rapoartele generate vor apărea aici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ConsultationFormProvider>
    </main>
  );
}

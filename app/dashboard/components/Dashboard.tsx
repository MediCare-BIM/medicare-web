import { Download, Search } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { PatientsTable } from './PatientsTable';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { priorityOptions, statusOptions } from '@/lib/consts';
import { AppointmentWithProfiles } from '@/lib/types';

type DashboardProps = {
  appointments: AppointmentWithProfiles[];
  summaryData: unknown[];
  todayString: string;
};

export function Dashboard({
  appointments,
  summaryData,
  todayString,
}: DashboardProps) {
  return (
    <main>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Bună ziua, Doctore! 👋
            </h2>

            <p className="text-muted-foreground">
              Iată ce se întâmplă astăzi, {todayString}.
            </p>
          </div>
        </div>

        <SummaryCards summaryData={summaryData} />

        <Card>
          <CardHeader>
            <CardTitle>Pacienții de astăzi</CardTitle>
            <CardDescription>
              O listă a pacienților programați pentru astăzi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-2">
              <div className="relative w-full sm:w-auto sm:flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută pacient..."
                  className="pl-8 sm:w-64"
                />
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                <Select defaultValue="Toate">
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Prioritate" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="Toate">
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Descarcă
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <PatientsTable appointments={appointments} />
            </div>

            <div className="mt-4 flex items-center justify-end space-x-2">
              <Button variant="outline" size="sm">
                Înapoi
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                Înainte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

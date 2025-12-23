'use client';


import { Insights } from '@/app/features/dashboard/components/Insights';
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
import { statusOptions } from '@/lib/consts';
import { AppointmentWithDoctorAndPatient } from '@/lib/types';
import { Calendar, Download, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { PatientsTable } from './PatientsTable';

type DashboardProps = {
  appointments: AppointmentWithDoctorAndPatient[];
  todayString: string;
};

export function Dashboard({ appointments, todayString }: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'Toate') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`);
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleFilterChange('search', event.currentTarget.value);
    }
  };

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

        <div className="mb-4">
          <Insights />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pacienții de astăzi</CardTitle>
            <CardDescription>
              O listă a pacienților programați pentru astăzi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {appointments.length > 0 ? (
              <>
                <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-2">
                  <div className="relative w-full sm:w-auto sm:flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Caută pacient..."
                      className="pl-8 sm:w-64"
                      defaultValue={searchParams.get('search') || ''}
                      onKeyDown={handleSearch}
                    />
                  </div>

                  <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                    <Select
                      value={searchParams.get('status') || 'Toate'}
                      onValueChange={(value) =>
                        handleFilterChange('status', value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
              </>
            ) : (
              <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Nu ai pacienți programați pentru azi.
                  </h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Când apar consultații, acest tabel va afişa priorităţile,
                    statusul programărilor şi detalii pentru fiecare pacient.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/calendar')}
                    variant="default"
                  >
                    Verifică calendarul
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

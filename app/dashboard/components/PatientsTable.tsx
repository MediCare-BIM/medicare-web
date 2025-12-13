import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AppointmentWithDoctorAndPatient } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Eye } from 'lucide-react';

type PatientsTableProps = {
  appointments: AppointmentWithDoctorAndPatient[];
};

export function PatientsTable({ appointments }: PatientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pacient</TableHead>
          <TableHead>Ora</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {appointment.patient?.full_name ?? 'N/A'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {new Date(appointment.start_time).toLocaleTimeString(
                'ro-RO',
                { hour: '2-digit', minute: '2-digit' }
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={appointment.status} />
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

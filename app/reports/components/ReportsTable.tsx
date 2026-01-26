import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Report } from '@/lib/types';
import { ReportTypeBadge } from './ReportTypeBadge';
import { Eye } from 'lucide-react';

type ReportsTableProps = {
  reports: Report[];
};

export function ReportsTable({ reports }: ReportsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nume pacient</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Diagnostic principal</TableHead>
          <TableHead>Tip raport</TableHead>
          <TableHead className="text-right">Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="font-medium">{report.patientName}</span>
              </div>
            </TableCell>
            <TableCell>
              {new Date(report.date).toLocaleDateString('ro-RO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </TableCell>
            <TableCell>{report.diagnosis}</TableCell>
            <TableCell>
              <ReportTypeBadge type={report.type} />
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" aria-label="View report">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

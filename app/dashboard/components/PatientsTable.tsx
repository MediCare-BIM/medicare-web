
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppointmentWithPatient } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { Eye } from "lucide-react";

type PatientsTableProps = {
  appointments: AppointmentWithPatient[];
};

export function PatientsTable({ appointments }: PatientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pacient</TableHead>
          <TableHead>Ora</TableHead>
          <TableHead>Prioritate</TableHead>
          <TableHead>Motivul vizitei</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={appointment.patients?.avatar_url ?? undefined}
                    alt={appointment.patients?.full_name ?? "N/A"}
                  />
                  <AvatarFallback>
                    {appointment.patients?.full_name?.charAt(0) ?? "N"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {appointment.patients?.full_name ?? "N/A"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {new Date(appointment.appointment_date).toLocaleTimeString(
                "ro-RO",
                { hour: "2-digit", minute: "2-digit" }
              )}
            </TableCell>
            <TableCell>
              <PriorityBadge priority={appointment.priority} />
            </TableCell>
            <TableCell>{appointment.reason}</TableCell>
            <TableCell>
              <StatusBadge status={appointment.status as any} />
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

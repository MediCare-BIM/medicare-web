
import { Database } from "./database.types";

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];

export type AppointmentWithPatient = Appointment & {
  patients: Pick<Patient, "name" | "avatar_url"> | null;
};

export type SummaryData = {
  title: string;
  value: string;
  percentageChange: string;
  icon: React.ComponentType<any>;
};

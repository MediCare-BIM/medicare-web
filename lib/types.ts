import { Database } from "./database.types";

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type UserProfile = Database["public"]["Tables"]["users_profile"]["Row"];
export type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];

export type AppointmentWithDoctorAndPatient = Appointment & {
  doctor: Pick<Doctor, "full_name"> | null;
  patient: Pick<Patient, "full_name"> | null;
};

export type Option = {
  label: string;
  value: string;
};


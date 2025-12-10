import { Database } from "./database.types";

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AppointmentWithProfiles = Appointment & {
  doctor_profile: Pick<Profile, "full_name" | "avatar_url"> | null;
  patient_profile: Pick<Profile, "full_name" | "avatar_url"> | null;
};
export type DailyAppointmentStats = Database["public"]["Functions"]["get_daily_appointment_stats"]["Returns"][0];
export type Option = {
  label: string;
  value: string;
};


import { Database } from "./database.types";

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type UserProfile = Database["public"]["Tables"]["users_profile"]["Row"];
export type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type ControlConsultation = Database["public"]["Tables"]["control_consultations"]["Row"];
export type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

export type AppointmentWithDoctorAndPatient = Appointment & {
  doctor: Pick<Doctor, "full_name"> | null;
  patient: Pick<Patient, "full_name"> | null;
};

export type Option = {
  label: string;
  value: string;
};

export type ReportType = 'Consultație' | 'Prescripție';

// Medication record structure for database storage (without temporary React ID)
export type MedicationRecord = {
  name: string;
  dosage: string;
  mod_administrare: string;
};

// Type for the medications JSONB structure in prescriptions table
export type PrescriptionMedications = {
  medications: MedicationRecord[];
};

// Display type for reports, derived from database types
export type Report = {
  id: string;
  patientName: string;
  date: string;
  diagnosis: string;
  type: ReportType;
  patientId: string;
};

// Type for consultation with patient info for display
export type ControlConsultationWithPatient = ControlConsultation & {
  patients: Pick<Patient, "full_name"> | Pick<Patient, "full_name">[] | null;
};

// Type for prescription with patient info for display
export type PrescriptionWithPatient = Prescription & {
  patients: Pick<Patient, "full_name"> | Pick<Patient, "full_name">[] | null;
};

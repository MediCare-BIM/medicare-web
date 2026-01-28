CREATE TABLE public.control_consultations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  appointment_id uuid NULL,
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,

  visit_reason text NOT NULL,
  findings text,
  diagnosis text,
  treatment text,
  notes text,

  generated_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT control_consultations_pkey PRIMARY KEY (id),

  CONSTRAINT control_consultations_appointment_id_fkey
    FOREIGN KEY (appointment_id)
    REFERENCES public.appointments(id)
    ON DELETE SET NULL,

  CONSTRAINT control_consultations_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES public.patients(id)
    ON DELETE CASCADE,

  CONSTRAINT control_consultations_doctor_id_fkey
    FOREIGN KEY (doctor_id)
    REFERENCES public.doctors(id)
    ON DELETE CASCADE
);

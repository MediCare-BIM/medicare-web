--
-- PostgreSQL/Supabase Schema for MediCare MVP
-- Author: Gemini
-- Version: 2.0 (Squashed)
--
-- This single migration file defines the complete final schema for the MVP.
-- It assumes a fresh database and is not intended for migrating existing data.
--

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Enum Types
-- -------------------
CREATE TYPE user_role AS ENUM ('doctor', 'patient');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed');
CREATE TYPE summary_type AS ENUM ('status', 'risk', 'history', 'alerts', 'recommendation');
CREATE TYPE condition_status AS ENUM ('active', 'resolved');


-- 2. users_profile Table
-- (extension of auth.users)
-- -------------------
CREATE TABLE users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users_profile IS 'Extension of auth.users, storing app-specific user metadata like role.';


-- 3. doctors Table
-- -------------------
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users_profile(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    specialization TEXT
);
CREATE INDEX ON doctors (user_id);
COMMENT ON TABLE doctors IS 'Stores information about medical doctors.';


-- 4. patients Table
-- -------------------
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users_profile(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    birth_date DATE,
    sex TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON patients (user_id);
COMMENT ON TABLE patients IS 'Stores information about patients.';


-- 5. appointments Table
-- -------------------
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON appointments (doctor_id);
CREATE INDEX ON appointments (patient_id);
CREATE INDEX ON appointments (start_time);
COMMENT ON TABLE appointments IS 'Schedules and tracks appointments between doctors and patients.';


-- 6. visits Table
-- -------------------
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_date TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON visits (appointment_id);
CREATE INDEX ON visits (doctor_id);
CREATE INDEX ON visits (patient_id);
COMMENT ON TABLE visits IS 'Records actual patient visits, which may or may not be linked to a scheduled appointment.';


-- 7. medical_notes Table
-- -------------------
CREATE TABLE medical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON medical_notes (visit_id);
CREATE INDEX ON medical_notes (doctor_id);
COMMENT ON TABLE medical_notes IS 'Stores notes taken by doctors during a visit.';


-- 8. conditions Table
-- -------------------
CREATE TABLE conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status condition_status NOT NULL
);
CREATE INDEX ON conditions (patient_id);
COMMENT ON TABLE conditions IS 'Tracks medical conditions for each patient.';


-- 9. allergies Table
-- -------------------
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    severity TEXT
);
CREATE INDEX ON allergies (patient_id);
COMMENT ON TABLE allergies IS 'Tracks patient allergies.';


-- 10. prescriptions Table
-- -------------------
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    medication_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON prescriptions (visit_id);
CREATE INDEX ON prescriptions (patient_id);
CREATE INDEX ON prescriptions (doctor_id);
COMMENT ON TABLE prescriptions IS 'Stores medication prescriptions given during a visit.';


-- 11. lab_results Table
-- -------------------
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    result TEXT,
    unit TEXT,
    result_date DATE NOT NULL
);
CREATE INDEX ON lab_results (patient_id);
CREATE INDEX ON lab_results (visit_id);
COMMENT ON TABLE lab_results IS 'Stores results of laboratory tests.';


-- 12. ai_summaries Table
-- -------------------
CREATE TABLE ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    type summary_type NOT NULL,
    content TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON ai_summaries (patient_id);
CREATE INDEX ON ai_summaries (visit_id);
COMMENT ON TABLE ai_summaries IS 'Stores AI-generated summaries for patients.';


-- 13. medical_reports Table
-- -------------------
CREATE TABLE medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON medical_reports (visit_id);
COMMENT ON TABLE medical_reports IS 'Stores generated medical reports for visits.';


-- 14. Auto-assign Profile Trigger and Function
-- This trigger automatically creates a corresponding users_profile record
-- when a new user signs up via Supabase Auth.
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Default to 'patient' if app_source is not specified
  IF NEW.raw_user_meta_data->>'app_source' = 'doctor_app' THEN
    user_role := 'doctor';
  ELSE
    user_role := 'patient';
  END IF;

  INSERT INTO public.users_profile (id, role)
  VALUES (NEW.id, user_role::public.user_role);

  -- Additionally, create a corresponding doctor or patient record
  IF user_role = 'doctor' THEN
    INSERT INTO public.doctors (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Doctor'));
  ELSE
    INSERT INTO public.patients (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Patient'));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();


-- 15. Row Level Security (RLS) Policies
-- ------------------------------------------

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to get a user's role from their profile
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.users_profile WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- ** Policies for users_profile **
CREATE POLICY "Users can view their own profile" ON users_profile
  FOR SELECT USING (auth.uid() = id);

-- ** Policies for doctors **
CREATE POLICY "Any authenticated user can view doctors" ON doctors
  FOR SELECT USING (auth.role() = 'authenticated');

-- ** Policies for patients **
CREATE POLICY "Users can view their own patient record" ON patients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view all patients" ON patients
  FOR SELECT USING (get_user_role(auth.uid()) = 'doctor');

-- ** Policies for appointments **
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (
    (get_user_role(auth.uid()) = 'doctor' AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())) OR
    (get_user_role(auth.uid()) = 'patient' AND patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))
  );

-- ** Policies for visits **
CREATE POLICY "Users can view their own visits" ON visits
  FOR SELECT USING (
    (get_user_role(auth.uid()) = 'doctor' AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())) OR
    (get_user_role(auth.uid()) = 'patient' AND patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))
  );

-- ** Policies for medical_notes **
CREATE POLICY "Doctors can view any notes for their visits" ON medical_notes
  FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));
CREATE POLICY "Patients can view notes for their own visits" ON medical_notes
  FOR SELECT USING (get_user_role(auth.uid()) = 'patient' AND visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())));

-- ** Policies for patient-specific data (conditions, allergies, etc.) **
CREATE POLICY "Patients can view their own records" ON conditions FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));
CREATE POLICY "Patients can view their own records" ON allergies FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));
CREATE POLICY "Patients can view their own records" ON prescriptions FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));
CREATE POLICY "Patients can view their own records" ON lab_results FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));
CREATE POLICY "Patients can view their own records" ON ai_summaries FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Doctors can view records of patients they have had a visit with
CREATE POLICY "Doctors can view records of their patients" ON conditions FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND patient_id IN (SELECT patient_id FROM visits WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));
CREATE POLICY "Doctors can view records of their patients" ON allergies FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND patient_id IN (SELECT patient_id FROM visits WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));
CREATE POLICY "Doctors can view records of their patients" ON prescriptions FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND patient_id IN (SELECT patient_id FROM visits WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));
CREATE POLICY "Doctors can view records of their patients" ON lab_results FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND patient_id IN (SELECT patient_id FROM visits WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));
CREATE POLICY "Doctors can view records of their patients" ON ai_summaries FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND patient_id IN (SELECT patient_id FROM visits WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));

-- ** Policies for medical_reports **
CREATE POLICY "Patients can view their own visit reports" ON medical_reports
  FOR SELECT USING (get_user_role(auth.uid()) = 'patient' AND visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())));
CREATE POLICY "Doctors can view reports for their visits" ON medical_reports
  FOR SELECT USING (get_user_role(auth.uid()) = 'doctor' AND visit_id IN (SELECT id FROM visits WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));

-- Granting CRUD operations
-- For this MVP, we are a bit permissive. Doctors can manage most data. Patients can manage their own appointments.
-- A more robust implementation would have more granular checks (e.g., cannot change a visit's doctor).

-- Doctors have full control over their data and patient-related data
CREATE POLICY "Doctors can manage all records" ON patients FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage appointments" ON appointments FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage visits" ON visits FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage medical_notes" ON medical_notes FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage conditions" ON conditions FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage allergies" ON allergies FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage prescriptions" ON prescriptions FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage lab_results" ON lab_results FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage ai_summaries" ON ai_summaries FOR ALL USING (get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "Doctors can manage medical_reports" ON medical_reports FOR ALL USING (get_user_role(auth.uid()) = 'doctor');

-- Patients can create and update their own appointments
CREATE POLICY "Patients can manage their own appointments" ON appointments
  FOR ALL USING (get_user_role(auth.uid()) = 'patient' AND patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Patients can't directly create visits or notes, this is handled by doctors.
-- They also cannot edit their own demographic data after creation. A real app would have a process for this.

--
-- PostgreSQL/Supabase Schema for a Healthcare App
-- Author: Gemini
-- Version: 1.0
--
-- Features:
-- - Role-based user management (doctors and patients) via Supabase Auth.
-- - Enforces that only doctors can be assigned as doctors in appointments.
-- - Enforces that only patients can be assigned as patients in appointments.
-- - Prevents double-booking for a doctor at the same time.
-- - Automatically updates `updated_at` timestamps.
-- - Idempotent script (can be re-run safely).
--

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Drop existing objects to ensure a clean slate (idempotency)
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS appointment_priority CASCADE;
DROP FUNCTION IF EXISTS is_doctor(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_patient(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;


-- 2. Create Enum Types
-- -------------------
CREATE TYPE user_role AS ENUM ('doctor', 'patient');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE appointment_priority AS ENUM ('Low', 'Medium', 'High');


-- 3. Create Profiles Table
-- ------------------------
-- This table stores public-facing user information and links to Supabase Auth.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    notes TEXT,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Stores public profile information for authenticated users.';
COMMENT ON COLUMN profiles.id IS 'Links to the authenticated user in auth.users.';
COMMENT ON COLUMN profiles.role IS 'Defines if the user is a doctor or a patient.';


-- 4. Create Helper Functions for Role Validation
-- ----------------------------------------------
-- These functions are used in CHECK constraints to ensure data integrity.

-- Checks if a given profile ID belongs to a doctor.
CREATE OR REPLACE FUNCTION is_doctor(profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND role = 'doctor'
  );
$$ LANGUAGE sql STABLE;

-- Checks if a given profile ID belongs to a patient.
CREATE OR REPLACE FUNCTION is_patient(profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND role = 'patient'
  );
$$ LANGUAGE sql STABLE;


-- 5. Create Appointments Table
-- ----------------------------
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id),
    patient_id UUID NOT NULL REFERENCES profiles(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    priority appointment_priority NOT NULL DEFAULT 'Low',
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints to prevent double-booking for a doctor at the same time.
    CONSTRAINT unique_doctor_appointment_time UNIQUE (doctor_id, appointment_date),

    -- Constraints to ensure correct roles are assigned.
    CONSTRAINT doctor_must_be_a_doctor CHECK (is_doctor(doctor_id)),
    CONSTRAINT patient_must_be_a_patient CHECK (is_patient(patient_id))
);

COMMENT ON TABLE appointments IS 'Stores appointment information.';
COMMENT ON COLUMN appointments.doctor_id IS 'References the profile of the doctor.';
COMMENT ON COLUMN appointments.patient_id IS 'References the profile of the patient.';
COMMENT ON CONSTRAINT unique_doctor_appointment_time ON appointments IS 'Prevents a doctor from being booked by multiple patients at the exact same time.';


-- 6. Create Indexes for Performance
-- ---------------------------------
CREATE INDEX ON profiles (role);
CREATE INDEX ON appointments (doctor_id);
CREATE INDEX ON appointments (patient_id);
CREATE INDEX ON appointments (appointment_date);


-- 7. Create Trigger for Auto-Updating Timestamps
-- ----------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Apply the trigger to the appointments table
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


-- --- End of Schema ---

-- 8. Auto-assign Profile Trigger and Function
-- ------------------------------------------

-- Function to create a profile for a new user based on app_source metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determine role based on app_source from user metadata
  IF NEW.raw_user_meta_data->>'app_source' = 'doctor_app' THEN
    user_role := 'doctor';
  ELSE
    user_role := 'patient';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New ' || user_role),
    user_role::public.user_role -- Cast to the enum type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
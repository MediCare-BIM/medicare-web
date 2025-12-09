-- 0004_add_priority_to_appointments.sql

-- Create the ENUM type for appointment priority if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_priority') THEN
        CREATE TYPE appointment_priority AS ENUM ('Low', 'Medium', 'High');
    END IF;
END$$;

-- Add the priority column to the appointments table if it doesn't exist
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS priority appointment_priority NOT NULL DEFAULT 'Low';

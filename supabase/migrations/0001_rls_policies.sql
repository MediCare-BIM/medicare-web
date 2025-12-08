-- Enable RLS for all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for patients table
-- Doctors can see patients who have an appointment with them.
CREATE POLICY "Allow doctors to see their patients"
ON patients FOR SELECT
USING (
  auth.uid() IN (
    SELECT doctor_id FROM appointments WHERE patient_id = id
  )
);

-- Policies for appointments table
-- Doctors can see their own appointments.
CREATE POLICY "Allow doctors to see their own appointments"
ON appointments FOR SELECT
USING (auth.uid() = doctor_id);

-- Doctors can create appointments for themselves.
CREATE POLICY "Allow doctors to create their own appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

-- Doctors can update their own appointments.
CREATE POLICY "Allow doctors to update their own appointments"
ON appointments FOR UPDATE
USING (auth.uid() = doctor_id);

-- Policies for notifications table
-- Doctors can see their own notifications.
CREATE POLICY "Allow doctors to see their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = doctor_id);

-- Doctors can mark their own notifications as read.
CREATE POLICY "Allow doctors to update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = doctor_id);


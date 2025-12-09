-- 1. Create users in auth.users table (replace with your actual user UUIDs)
-- You can create users using the Supabase Admin UI or the API.
-- This is a placeholder and will not work directly.
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at) VALUES
-- 5 Doctors
('d0c1b3e4-2b3a-4f5c-8d9e-0f1a2b3c4d5e', 'doctor1@example.com', 'hashed_password', NOW(), NOW()),
('d1c2b4e5-3c4b-5f6d-9e0f-1a2b3c4d5e6f', 'doctor2@example.com', 'hashed_password', NOW(), NOW()),
('d2c3b5e6-4d5c-6f7e-0f1a-2b3c4d5e6f7a', 'doctor3@example.com', 'hashed_password', NOW(), NOW()),
('d3c4b6e7-5e6d-7f8f-1a2b-3c4d5e6f7a8b', 'doctor4@example.com', 'hashed_password', NOW(), NOW()),
('d4c5b7e8-6f7e-8f9f-2b3c-4d5e6f7a8b9c', 'doctor5@example.com', 'hashed_password', NOW(), NOW()),
-- 10 Patients
('p0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', 'patient1@example.com', 'hashed_password', NOW(), NOW()),
('p1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', 'patient2@example.com', 'hashed_password', NOW(), NOW()),
('p2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', 'patient3@example.com', 'hashed_password', NOW(), NOW()),
('p3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'patient4@example.com', 'hashed_password', NOW(), NOW()),
('p4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', 'patient5@example.com', 'hashed_password', NOW(), NOW()),
('p5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', 'patient6@example.com', 'hashed_password', NOW(), NOW()),
('p6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1', 'patient7@example.com', 'hashed_password', NOW(), NOW()),
('p7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2', 'patient8@example.com', 'hashed_password', NOW(), NOW()),
('p8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3', 'patient9@example.com', 'hashed_password', NOW(), NOW()),
('p9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4', 'patient10@example.com', 'hashed_password', NOW(), NOW());

-- 2. Create profiles for users
INSERT INTO profiles (id, full_name, role) VALUES
-- 5 Doctors
('d0c1b3e4-2b3a-4f5c-8d9e-0f1a2b3c4d5e', 'Dr. Alice', 'doctor'),
('d1c2b4e5-3c4b-5f6d-9e0f-1a2b3c4d5e6f', 'Dr. Bob', 'doctor'),
('d2c3b5e6-4d5c-6f7e-0f1a-2b3c4d5e6f7a', 'Dr. Charlie', 'doctor'),
('d3c4b6e7-5e6d-7f8f-1a2b-3c4d5e6f7a8b', 'Dr. Diana', 'doctor'),
('d4c5b7e8-6f7e-8f9f-2b3c-4d5e6f7a8b9c', 'Dr. Eve', 'doctor'),
-- 10 Patients
('p0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', 'Patient One', 'patient'),
('p1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', 'Patient Two', 'patient'),
('p2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', 'Patient Three', 'patient'),
('p3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'Patient Four', 'patient'),
('p4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', 'Patient Five', 'patient'),
('p5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', 'Patient Six', 'patient'),
('p6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1', 'Patient Seven', 'patient'),
('p7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2', 'Patient Eight', 'patient'),
('p8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3', 'Patient Nine', 'patient'),
('p9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4', 'Patient Ten', 'patient');

-- 3. Create sample appointments
INSERT INTO appointments (doctor_id, patient_id, appointment_date, reason, status) VALUES
('d0c1b3e4-2b3a-4f5c-8d9e-0f1a2b3c4d5e', 'p0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', NOW() + interval '1 day', 'Check-up', 'confirmed'),
('d1c2b4e5-3c4b-5f6d-9e0f-1a2b3c4d5e6f', 'p1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', NOW() + interval '2 days', 'Flu symptoms', 'pending'),
('d0c1b3e4-2b3a-4f5c-8d9e-0f1a2b3c4d5e', 'p2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', NOW() + interval '3 days', 'Follow-up', 'completed');

-- Note on replacing UUIDs:
-- The UUIDs used above are placeholders. To make this seed file work, you must:
-- 1. Create the user accounts in your Supabase project (either through the UI or API).
-- 2. Get the actual UUID for each user.
-- 3. Replace the placeholder UUIDs in this file with the real UUIDs.
-- The 'p' and 'd' prefixes in the placeholder UUIDs are invalid and are only for readability.

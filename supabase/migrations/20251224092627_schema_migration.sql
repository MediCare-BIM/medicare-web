drop policy if exists "Doctors can view records of their patients" on "public"."ai_summaries";

drop policy if exists "Doctors can view records of their patients" on "public"."allergies";

drop policy if exists "Doctors can view records of their patients" on "public"."conditions";

drop policy if exists "Doctors can view records of their patients" on "public"."lab_results";

drop policy if exists "Patients can view notes for their own visits" on "public"."medical_notes";

drop policy if exists "Doctors can view reports for their visits" on "public"."medical_reports";

drop policy if exists "Patients can view their own visit reports" on "public"."medical_reports";

drop policy if exists "Doctors can view records of their patients" on "public"."prescriptions";

drop policy if exists "Doctors can manage visits" on "public"."visits";

drop policy if exists "Users can view their own visits" on "public"."visits";

revoke delete on table "public"."visits" from "anon";

revoke insert on table "public"."visits" from "anon";

revoke references on table "public"."visits" from "anon";

revoke select on table "public"."visits" from "anon";

revoke trigger on table "public"."visits" from "anon";

revoke truncate on table "public"."visits" from "anon";

revoke update on table "public"."visits" from "anon";

revoke delete on table "public"."visits" from "authenticated";

revoke insert on table "public"."visits" from "authenticated";

revoke references on table "public"."visits" from "authenticated";

revoke select on table "public"."visits" from "authenticated";

revoke trigger on table "public"."visits" from "authenticated";

revoke truncate on table "public"."visits" from "authenticated";

revoke update on table "public"."visits" from "authenticated";

revoke delete on table "public"."visits" from "service_role";

revoke insert on table "public"."visits" from "service_role";

revoke references on table "public"."visits" from "service_role";

revoke select on table "public"."visits" from "service_role";

revoke trigger on table "public"."visits" from "service_role";

revoke truncate on table "public"."visits" from "service_role";

revoke update on table "public"."visits" from "service_role";

alter table "public"."ai_summaries" drop constraint "ai_summaries_visit_id_fkey";

alter table "public"."lab_results" drop constraint "lab_results_visit_id_fkey";

alter table "public"."medical_notes" drop constraint "medical_notes_visit_id_fkey";

alter table "public"."medical_reports" drop constraint "medical_reports_visit_id_fkey";

alter table "public"."prescriptions" drop constraint "prescriptions_visit_id_fkey";

alter table "public"."visits" drop constraint "visits_appointment_id_fkey";

alter table "public"."visits" drop constraint "visits_appointment_id_key";

alter table "public"."visits" drop constraint "visits_doctor_id_fkey";

alter table "public"."visits" drop constraint "visits_patient_id_fkey";

alter table "public"."visits" drop constraint "visits_pkey";

drop index if exists "public"."ai_summaries_visit_id_idx";

drop index if exists "public"."lab_results_visit_id_idx";

drop index if exists "public"."prescriptions_visit_id_idx";

drop index if exists "public"."visits_appointment_id_idx";

drop index if exists "public"."visits_appointment_id_key";

drop index if exists "public"."visits_doctor_id_idx";

drop index if exists "public"."visits_patient_id_idx";

drop index if exists "public"."visits_pkey";

drop index if exists "public"."medical_notes_visit_id_idx";

drop index if exists "public"."medical_reports_visit_id_idx";

drop table "public"."visits";

alter table "public"."ai_summaries" drop column "visit_id";

alter table "public"."lab_results" drop column "visit_id";

alter table "public"."medical_notes" drop column "visit_id";

alter table "public"."medical_notes" add column "appointment_id" uuid not null;

alter table "public"."medical_notes" add column "patient_id" uuid not null;

alter table "public"."medical_reports" drop column "visit_id";

alter table "public"."medical_reports" add column "appointment_id" uuid not null;

alter table "public"."medical_reports" add column "doctor_id" uuid not null;

alter table "public"."medical_reports" add column "patient_id" uuid not null;

alter table "public"."prescriptions" drop column "visit_id";

CREATE INDEX medical_notes_visit_id_idx ON public.medical_notes USING btree (appointment_id);

CREATE INDEX medical_reports_visit_id_idx ON public.medical_reports USING btree (appointment_id);

alter table "public"."medical_notes" add constraint "medical_notes_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."medical_notes" validate constraint "medical_notes_appointment_id_fkey";

alter table "public"."medical_notes" add constraint "medical_notes_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."medical_notes" validate constraint "medical_notes_patient_id_fkey";

alter table "public"."medical_reports" add constraint "medical_reports_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."medical_reports" validate constraint "medical_reports_appointment_id_fkey";

alter table "public"."medical_reports" add constraint "medical_reports_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."medical_reports" validate constraint "medical_reports_doctor_id_fkey";

alter table "public"."medical_reports" add constraint "medical_reports_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."medical_reports" validate constraint "medical_reports_patient_id_fkey";

-- Recreate RLS Policies

-- Medical notes policies
CREATE POLICY "Doctors can view notes for their appointments" ON medical_notes
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can view notes for their appointments" ON medical_notes
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- CREATE POLICY "Doctors can manage medical_notes" ON medical_notes
--   FOR ALL USING (
--     doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
--   );

-- Medical reports policies
CREATE POLICY "Doctors can view reports for their appointments" ON medical_reports
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can view their appointment reports" ON medical_reports
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- CREATE POLICY "Doctors can manage medical_reports" ON medical_reports
--   FOR ALL USING (
--     doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
--   );

-- AI summaries policies
CREATE POLICY "Patients can view their own ai_summaries" ON ai_summaries
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can view ai_summaries for their patients" ON ai_summaries
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'doctor' AND 
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
  );

-- CREATE POLICY "Doctors can manage ai_summaries" ON ai_summaries
--   FOR ALL USING (get_user_role(auth.uid()) = 'doctor');

-- Lab results policies
CREATE POLICY "Patients can view their own lab_results" ON lab_results
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can view lab_results for their patients" ON lab_results
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'doctor' AND 
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
  );

-- CREATE POLICY "Doctors can manage lab_results" ON lab_results
--   FOR ALL USING (get_user_role(auth.uid()) = 'doctor');

-- Allergies policies
CREATE POLICY "Patients can view their own allergies" ON allergies
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can view allergies for their patients" ON allergies
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'doctor' AND 
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
  );

-- CREATE POLICY "Doctors can manage allergies" ON allergies
--   FOR ALL USING (get_user_role(auth.uid()) = 'doctor');

-- Conditions policies
CREATE POLICY "Patients can view their own conditions" ON conditions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can view conditions for their patients" ON conditions
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'doctor' AND 
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
  );

-- CREATE POLICY "Doctors can manage conditions" ON conditions
--   FOR ALL USING (get_user_role(auth.uid()) = 'doctor');

-- Prescriptions policies
CREATE POLICY "Patients can view their own prescriptions" ON prescriptions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can view prescriptions for their patients" ON prescriptions
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'doctor' AND 
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
  );

-- CREATE POLICY "Doctors can manage prescriptions" ON prescriptions
--   FOR ALL USING (get_user_role(auth.uid()) = 'doctor');

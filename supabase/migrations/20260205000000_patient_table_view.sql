-- Create view for patient table data
CREATE OR REPLACE VIEW patient_table_view AS
SELECT
  p.id AS patient_id,
  p.full_name,

  -- Last visit
  (
    SELECT a.start_time
    FROM appointments a
    WHERE a.patient_id = p.id
    ORDER BY a.start_time DESC
    LIMIT 1
  ) AS last_visit,

  -- Latest diagnosis
  (
    SELECT cc.diagnosis
    FROM control_consultations cc
    WHERE cc.patient_id = p.id
    ORDER BY cc.generated_at DESC
    LIMIT 1
  ) AS diagnosis,

  -- Latest treatment / next steps
  (
    SELECT cc.treatment
    FROM control_consultations cc
    WHERE cc.patient_id = p.id
    ORDER BY cc.generated_at DESC
    LIMIT 1
  ) AS treatment

FROM patients p;

-- Index to optimize lookups by patient and latest generated_at in control_consultations
CREATE INDEX IF NOT EXISTS idx_control_consultations_patient_id_generated_at
  ON control_consultations(patient_id, generated_at DESC);

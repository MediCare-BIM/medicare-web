Below is **clear, human-readable database documentation** based **only** on the SQL schema and the diagram you provided.
It is written so **designers, frontend devs, and backend devs** can quickly understand **what exists now** and **what can be built today (MVP scope)**.

No future speculation beyond light notes.

---

# MediCare MVP — Database Documentation

## 1. Purpose of the Database

This database supports the **MVP version of MediCare**, a digital healthcare platform that enables:

- Doctors to manage appointments and consultations
- Doctors to record medical data during visits
- Patients to view their medical history
- AI-generated summaries and reports based on existing medical data

The database is **patient-centric**, with all medical information anchored to **visits**.

---

## 2. Identity & Access Model

### `auth.users` (Supabase-managed)

- Handles authentication (email, password, etc.)
- **Not modified by this schema**

### `users_profile`

Extends Supabase auth users with application-specific data.

**What it represents**

- One profile per authenticated user
- Defines whether the user is a `doctor` or a `patient`

**Key fields**

- `id` → same UUID as `auth.users.id`
- `role` → `doctor` | `patient`

**Used for**

- Access control
- Role-based UI (doctor app vs patient portal)

---

## 3. Core Domain Entities

### Doctors

#### `doctors`

Represents medical professionals.

**Key fields**

- `user_id` → links to `users_profile`
- `full_name`
- `specialization` (free text, MVP)

**Important notes**

- One doctor = one authenticated user
- Specialization is descriptive only (no logic attached)

---

### Patients

#### `patients`

Represents people receiving medical care.

**Key fields**

- `user_id` (optional) → allows patients without portal access
- `full_name`
- `birth_date`
- `sex`

**Important notes**

- A patient **may or may not** have a login
- All medical data links to `patients.id`

---

## 4. Appointments & Visits (Core Flow)

### Conceptual Difference

| Concept     | Meaning                    |
| ----------- | -------------------------- |
| Appointment | Planned meeting (calendar) |
| Visit       | Actual medical encounter   |

---

### `appointments`

Used for **scheduling and calendar views**.

**Key fields**

- `doctor_id`
- `patient_id`
- `start_time`, `end_time`
- `status` (`scheduled`, `confirmed`, `cancelled`, `completed`)

**Used for**

- Doctor calendar
- Patient appointment list
- No medical data is stored here

---

### `visits`

Represents the **medical act itself**.

**Key fields**

- `appointment_id` (optional, 1–1)
- `doctor_id`
- `patient_id`
- `visit_date`
- `reason`

**Important rules**

- A visit may exist without an appointment (walk-in, emergency)
- All medical records attach to visits
- One appointment can generate **at most one visit**

---

## 5. Medical Data (Attached to Visits)

### `medical_notes`

Doctor-written notes and recommendations.

**Used for**

- Consultation notes
- Observations
- Recommendations

**Visibility**

- Intended primarily for doctors
- Can be selectively exposed to patients in UI

---

### `prescriptions`

Stores prescribed medication as free text.

**Key fields**

- `visit_id`
- `patient_id`
- `doctor_id`
- `medication_text`

**MVP simplification**

- No structured medication items
- Entire prescription stored as text

---

### `lab_results`

Stores lab test outcomes.

**Key fields**

- `patient_id`
- `visit_id` (optional)
- `test_name`
- `result`, `unit`
- `result_date`

**Notes**

- Lab results may exist independently of a visit
- Supports timeline-based display

---

## 6. Patient Medical Background

### `conditions`

Chronic or diagnosed illnesses.

**Examples**

- Hypertension
- Diabetes

**Status**

- `active`
- `resolved`

---

### `allergies`

Known allergies.

**Fields**

- `name`
- `severity`

---

## 7. AI-Generated Data

### `ai_summaries`

Stores AI-generated textual summaries.

**Types**

- `status`
- `risk`
- `history`
- `alerts`
- `recommendation`

**Important rules**

- AI data is **derived**, not source of truth
- Can be regenerated at any time
- Never replaces doctor input

---

### `medical_reports`

Formal post-consultation documents (e.g. scrisoare medicală).

**Generated**

- After a visit
- Based on existing medical data

---

## 8. Patient Medical Timeline

There is **no timeline table**.

The timeline is **derived dynamically** by combining:

- visits
- medical_notes
- prescriptions
- lab_results
- ai_summaries
- medical_reports

Sorted by date.

This keeps data consistent and avoids duplication.

---

## 9. What Can Be Built Right Now (MVP)

### Doctor Features

- Calendar with appointments
- Start a visit from an appointment
- Write medical notes
- Add prescriptions
- View patient history
- Generate AI summaries
- Generate medical reports

### Patient Features

- View appointments
- View visit history
- See lab results
- See prescriptions
- Read AI summaries (if allowed)

### Designer Guarantees

- Every screen maps directly to a table
- No hidden or computed-only data
- Dates are always available for timelines

---

## 10. Explicit MVP Limitations

Not supported yet (by design):

- Hospitals / clinics
- Multiple specializations per doctor
- Structured medication catalogs
- Audit/version history
- File storage (PDFs, images)
- National system integrations (xxxxxxxxx)

---

## 11. Mental Model Summary

> **Appointments schedule care** > **Visits record care** > **Everything medical attaches to visits** > **Patients own the data** > **AI summarizes, never decides**

---

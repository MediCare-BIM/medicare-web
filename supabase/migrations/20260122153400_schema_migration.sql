ALTER TABLE public.prescriptions
DROP COLUMN IF EXISTS medication_text;

ALTER TABLE public.prescriptions
ADD COLUMN IF NOT EXISTS medications jsonb;

UPDATE public.prescriptions
SET medications = '{"medications": []}'::jsonb
WHERE medications IS NULL;

ALTER TABLE public.prescriptions
ALTER COLUMN medications SET NOT NULL;
 
-- Remove old single-result columns
ALTER TABLE public.lab_results
DROP COLUMN IF EXISTS result,
DROP COLUMN IF EXISTS unit;
 
-- Add structured results column
ALTER TABLE public.lab_results
ADD COLUMN IF NOT EXISTS results jsonb NOT NULL;
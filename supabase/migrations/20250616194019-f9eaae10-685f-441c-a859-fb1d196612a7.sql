
-- Update the strain_type check constraint to allow the new 5-level system
ALTER TABLE public.scans DROP CONSTRAINT IF EXISTS scans_strain_type_check;

-- Add new constraint with all 5 strain types
ALTER TABLE public.scans ADD CONSTRAINT scans_strain_type_check 
CHECK (strain_type IN ('Indica', 'Indica-Dominant', 'Hybrid', 'Sativa-Dominant', 'Sativa'));

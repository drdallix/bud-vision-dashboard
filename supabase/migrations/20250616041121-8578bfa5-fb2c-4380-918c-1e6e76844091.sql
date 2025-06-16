
-- Remove CBD column from scans table as it's not used in this application
ALTER TABLE public.scans DROP COLUMN IF EXISTS cbd;

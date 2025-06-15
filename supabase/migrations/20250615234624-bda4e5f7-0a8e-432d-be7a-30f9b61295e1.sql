
-- Add emoji column to scans table to store AI-generated emojis for each strain
ALTER TABLE public.scans 
ADD COLUMN emoji text DEFAULT NULL;

-- Add a comment to document the new column
COMMENT ON COLUMN public.scans.emoji IS 'AI-generated emoji representing the strain character/personality';


-- Add public read policy for scans table
CREATE POLICY "Public can view all scans" 
  ON public.scans 
  FOR SELECT 
  TO public
  USING (true);

-- Update existing policies to be more specific about authenticated users
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;

CREATE POLICY "Authenticated users can view all scans" 
  ON public.scans 
  FOR SELECT 
  TO authenticated
  USING (true);

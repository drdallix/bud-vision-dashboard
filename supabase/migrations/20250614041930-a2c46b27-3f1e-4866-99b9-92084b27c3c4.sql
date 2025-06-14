
-- Add in_stock column to scans table
ALTER TABLE public.scans 
ADD COLUMN in_stock BOOLEAN NOT NULL DEFAULT true;

-- Create policy to allow authenticated users to update stock status
CREATE POLICY "Users can update stock status of their own scans" 
  ON public.scans 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update public read policy to only show in-stock items to public users
DROP POLICY IF EXISTS "Public can view all scans" ON public.scans;

CREATE POLICY "Public can view in-stock scans" 
  ON public.scans 
  FOR SELECT 
  TO public
  USING (in_stock = true);

-- Authenticated users can still see all scans (including out of stock)
CREATE POLICY "Authenticated users can view all scans including out of stock" 
  ON public.scans 
  FOR SELECT 
  TO authenticated
  USING (true);

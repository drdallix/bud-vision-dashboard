
-- Update RLS policies to allow all authenticated users to edit any strain
DROP POLICY IF EXISTS "Users can view scans" ON public.scans;
DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON public.scans;

-- Create new policies that allow all authenticated users to edit all strains
CREATE POLICY "Anyone can view scans" 
  ON public.scans 
  FOR SELECT 
  USING (
    -- Public users can only see in-stock items
    CASE 
      WHEN (SELECT auth.role()) = 'anon' THEN in_stock = true
      -- Authenticated users can see all items
      ELSE true
    END
  );

CREATE POLICY "Authenticated users can insert scans" 
  ON public.scans 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update any scan" 
  ON public.scans 
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete any scan" 
  ON public.scans 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Update prices policies to allow all authenticated users to manage prices for any strain
DROP POLICY IF EXISTS "Allow strain owner to read price" ON public.prices;
DROP POLICY IF EXISTS "Allow strain owner to insert price" ON public.prices;
DROP POLICY IF EXISTS "Allow strain owner to update price" ON public.prices;
DROP POLICY IF EXISTS "Allow strain owner to delete price" ON public.prices;

CREATE POLICY "Authenticated users can read all prices"
  ON public.prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert any price"
  ON public.prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update any price"
  ON public.prices FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete any price"
  ON public.prices FOR DELETE
  TO authenticated
  USING (true);

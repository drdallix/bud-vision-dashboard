
-- First, let's check and fix the RLS policies for the scans table
-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON public.scans;
DROP POLICY IF EXISTS "Optimized select policy for scans" ON public.scans;

-- Create new optimized RLS policies for scans table
CREATE POLICY "Users can view scans" 
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

CREATE POLICY "Users can insert their own scans" 
  ON public.scans 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own scans" 
  ON public.scans 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own scans" 
  ON public.scans 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);

-- Fix the RLS policies for prices table to optimize performance
DROP POLICY IF EXISTS "Allow strain owner to read price" ON public.prices;
DROP POLICY IF EXISTS "Allow strain owner to insert price" ON public.prices;
DROP POLICY IF EXISTS "Allow strain owner to update price" ON public.prices;
DROP POLICY IF EXISTS "Allow strain owner to delete price" ON public.prices;

-- Create optimized RLS policies for prices table
CREATE POLICY "Allow strain owner to read price"
  ON public.prices FOR SELECT
  USING (exists (select 1 from scans s where s.id = strain_id and s.user_id = (SELECT auth.uid())));

CREATE POLICY "Allow strain owner to insert price"
  ON public.prices FOR INSERT
  WITH CHECK (exists (select 1 from scans s where s.id = strain_id and s.user_id = (SELECT auth.uid())));

CREATE POLICY "Allow strain owner to update price"
  ON public.prices FOR UPDATE
  USING (exists (select 1 from scans s where s.id = strain_id and s.user_id = (SELECT auth.uid())));

CREATE POLICY "Allow strain owner to delete price"
  ON public.prices FOR DELETE
  USING (exists (select 1 from scans s where s.id = strain_id and s.user_id = (SELECT auth.uid())));

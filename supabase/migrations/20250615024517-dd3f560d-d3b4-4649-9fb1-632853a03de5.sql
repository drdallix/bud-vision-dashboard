
-- Fix RLS performance issues by optimizing auth function calls and consolidating policies

-- Drop existing problematic policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create optimized policies for profiles table using subqueries
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = id);

-- Drop existing problematic policies for scans table
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update stock status of their own scans" ON public.scans;
DROP POLICY IF EXISTS "Public can view all scans" ON public.scans;
DROP POLICY IF EXISTS "Authenticated users can view all scans" ON public.scans;
DROP POLICY IF EXISTS "Public can view in-stock scans" ON public.scans;
DROP POLICY IF EXISTS "Authenticated users can view all scans including out of stock" ON public.scans;

-- Create consolidated, optimized policies for scans table
-- Single SELECT policy that handles both public and authenticated users
CREATE POLICY "Optimized select policy for scans" 
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

-- Single INSERT policy with optimized auth check
CREATE POLICY "Users can insert their own scans" 
  ON public.scans 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Consolidated UPDATE policy that handles both regular updates and stock status
CREATE POLICY "Users can update their own scans" 
  ON public.scans 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Single DELETE policy with optimized auth check
CREATE POLICY "Users can delete their own scans" 
  ON public.scans 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);

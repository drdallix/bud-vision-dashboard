
-- First, drop all existing tables and their dependencies
DROP TABLE IF EXISTS public.user_tones CASCADE;
DROP TABLE IF EXISTS public.strain_tone_descriptions CASCADE;
DROP TABLE IF EXISTS public.prices CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS public.update_strain_description CASCADE;
DROP FUNCTION IF EXISTS public.enforce_preset_prices CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Drop any existing types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Recreate the profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Recreate the scans table (main strain data)
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strain_name TEXT NOT NULL,
  strain_type TEXT NOT NULL CHECK (strain_type IN ('Indica', 'Sativa', 'Hybrid')),
  thc DECIMAL(5,2),
  cbd DECIMAL(5,2),
  effects TEXT[],
  flavors TEXT[],
  terpenes JSONB,
  medical_uses TEXT[],
  description TEXT,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  in_stock BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on scans table
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scans table
CREATE POLICY "Public can view in-stock scans" 
  ON public.scans 
  FOR SELECT 
  TO public
  USING (in_stock = true);

CREATE POLICY "Authenticated users can view all scans" 
  ON public.scans 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert scans" 
  ON public.scans 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Recreate the prices table
CREATE TABLE public.prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strain_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  internal_grower_id UUID NOT NULL,
  now_price NUMERIC NOT NULL,
  was_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prices table
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prices table
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

-- Recreate the price validation function
CREATE OR REPLACE FUNCTION public.enforce_preset_prices() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.now_price NOT IN (30,40,50,60,80,100,120,200,300) THEN
    RAISE EXCEPTION 'Invalid now_price, must be in (30,40,50,60,80,100,120,200,300)';
  END IF;
  IF NEW.was_price IS NOT NULL AND NEW.was_price NOT IN (30,40,50,60,80,100,120,200,300) THEN
    RAISE EXCEPTION 'Invalid was_price, must be in (30,40,50,60,80,100,120,200,300)';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for price validation
CREATE TRIGGER prices_validate
BEFORE INSERT OR UPDATE ON public.prices
FOR EACH ROW EXECUTE FUNCTION public.enforce_preset_prices();

-- Recreate the update strain description function
CREATE OR REPLACE FUNCTION public.update_strain_description(
  p_strain_id uuid,
  p_description text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_strain record;
BEGIN
  -- Check if user owns the strain
  IF NOT EXISTS (
    SELECT 1 FROM scans 
    WHERE id = p_strain_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Strain not found or access denied';
  END IF;

  -- Update the strain description
  UPDATE scans 
  SET 
    description = p_description,
    created_at = created_at -- Keep original created_at unchanged
  WHERE id = p_strain_id AND user_id = p_user_id
  RETURNING * INTO updated_strain;

  -- Return the updated strain data
  RETURN json_build_object(
    'success', true,
    'strain', row_to_json(updated_strain)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Recreate the handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for scans table
ALTER TABLE public.scans REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_strain_description TO authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_preset_prices TO authenticated;

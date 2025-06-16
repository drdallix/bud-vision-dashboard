
-- Enable Row Level Security on scans table if not already enabled
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own scans
CREATE POLICY "Users can view their own scans" 
  ON public.scans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to create their own scans
CREATE POLICY "Users can create their own scans" 
  ON public.scans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own scans
CREATE POLICY "Users can update their own scans" 
  ON public.scans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own scans
CREATE POLICY "Users can delete their own scans" 
  ON public.scans 
  FOR DELETE 
  USING (auth.uid() = user_id);

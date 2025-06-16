
-- Create a table to store generated descriptions for different tones
CREATE TABLE public.strain_tone_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strain_id UUID NOT NULL,
  tone_id UUID NOT NULL,
  generated_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(strain_id, tone_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.strain_tone_descriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for strain_tone_descriptions
CREATE POLICY "Users can view all strain tone descriptions" 
  ON public.strain_tone_descriptions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create strain tone descriptions" 
  ON public.strain_tone_descriptions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update strain tone descriptions" 
  ON public.strain_tone_descriptions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete strain tone descriptions" 
  ON public.strain_tone_descriptions 
  FOR DELETE 
  USING (true);

-- Add indexes for performance
CREATE INDEX idx_strain_tone_descriptions_strain_id ON public.strain_tone_descriptions(strain_id);
CREATE INDEX idx_strain_tone_descriptions_tone_id ON public.strain_tone_descriptions(tone_id);

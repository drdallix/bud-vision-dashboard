-- Create strain_ratings table for the Tinder-style rating system
CREATE TABLE public.strain_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strain_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, strain_id)
);

-- Enable Row Level Security
ALTER TABLE public.strain_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for strain_ratings
CREATE POLICY "Users can view their own ratings" 
ON public.strain_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ratings" 
ON public.strain_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.strain_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.strain_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_strain_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_strain_ratings_updated_at
BEFORE UPDATE ON public.strain_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_strain_ratings_updated_at();
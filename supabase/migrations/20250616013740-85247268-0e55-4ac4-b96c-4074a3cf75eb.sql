
-- Create user_tones table
CREATE TABLE public.user_tones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  persona_prompt TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default_tone_id to profiles
ALTER TABLE public.profiles ADD COLUMN default_tone_id UUID REFERENCES public.user_tones(id);

-- Enable Row Level Security on user_tones
ALTER TABLE public.user_tones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_tones
CREATE POLICY "Users can view their own tones and system tones" 
  ON public.user_tones 
  FOR SELECT 
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own tones" 
  ON public.user_tones 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tones" 
  ON public.user_tones 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tones" 
  ON public.user_tones 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create built-in system tones
INSERT INTO public.user_tones (id, user_id, name, description, persona_prompt, is_default) VALUES
('00000000-0000-0000-0000-000000000001', NULL, 'Professional', 'Clean, informative, professional tone', 'Write in a professional, informative tone suitable for a medical dispensary. Be factual and helpful without being overly technical. Focus on benefits and effects in a clear, trustworthy manner.', TRUE),
('00000000-0000-0000-0000-000000000002', NULL, 'Casual & Fun', 'Relaxed, friendly, conversational', 'Write in a casual, fun, and friendly tone. Use emojis sparingly and relatable language that appeals to younger customers. Be approachable and conversational while staying informative.', FALSE),
('00000000-0000-0000-0000-000000000003', NULL, 'Educational', 'Detailed, scientific, educational', 'Write in an educational tone focusing on the science and benefits. Include detailed information about effects, compounds, and medical applications. Be thorough and informative for knowledgeable consumers.', FALSE);

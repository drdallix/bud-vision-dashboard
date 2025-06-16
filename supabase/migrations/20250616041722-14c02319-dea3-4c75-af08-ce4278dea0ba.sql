
-- Fix the tone management database schema with proper UUID casting
DO $$ 
BEGIN
  -- Check if user_tones table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_tones') THEN
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

    -- Enable Row Level Security
    ALTER TABLE public.user_tones ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
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
  END IF;

  -- Check if default_tone_id column exists in profiles, if not add it
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'default_tone_id') THEN
    ALTER TABLE public.profiles ADD COLUMN default_tone_id UUID REFERENCES public.user_tones(id);
  END IF;

  -- Insert system tones with proper UUID casting
  INSERT INTO public.user_tones (id, user_id, name, description, persona_prompt, is_default)
  VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, NULL, 'Professional', 'Clean, informative, professional tone', 'Write in a professional, informative tone suitable for a medical dispensary. Be factual and helpful without being overly technical. Focus on benefits and effects in a clear, trustworthy manner.', TRUE),
    ('00000000-0000-0000-0000-000000000002'::uuid, NULL, 'Casual & Fun', 'Relaxed, friendly, conversational', 'Write in a casual, fun, and friendly tone. Use emojis sparingly and relatable language that appeals to younger customers. Be approachable and conversational while staying informative.', FALSE),
    ('00000000-0000-0000-0000-000000000003'::uuid, NULL, 'Educational', 'Detailed, scientific, educational', 'Write in an educational tone focusing on the science and benefits. Include detailed information about effects, compounds, and medical applications. Be thorough and informative for knowledgeable consumers.', FALSE)
  ON CONFLICT (id) DO NOTHING;
END $$;

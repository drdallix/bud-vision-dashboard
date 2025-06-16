
-- Add animation_settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN animation_settings jsonb DEFAULT NULL;

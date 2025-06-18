
-- First, create temporary columns for the new structured data
ALTER TABLE public.scans 
ADD COLUMN effect_profiles jsonb DEFAULT '[]'::jsonb,
ADD COLUMN flavor_profiles jsonb DEFAULT '[]'::jsonb;

-- Migrate existing effects data to the new structure
UPDATE public.scans 
SET effect_profiles = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', effect,
      'intensity', 3,
      'emoji', '✨',
      'color', '#8B5CF6'
    )
  )
  FROM unnest(effects) AS effect
  WHERE effects IS NOT NULL AND array_length(effects, 1) > 0
)
WHERE effects IS NOT NULL AND array_length(effects, 1) > 0;

-- Migrate existing flavors data to the new structure  
UPDATE public.scans 
SET flavor_profiles = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', flavor,
      'intensity', 3, 
      'emoji', '🌿',
      'color', '#10B981'
    )
  )
  FROM unnest(flavors) AS flavor
  WHERE flavors IS NOT NULL AND array_length(flavors, 1) > 0
)
WHERE flavors IS NOT NULL AND array_length(flavors, 1) > 0;

-- Drop the old columns and rename the new ones
ALTER TABLE public.scans DROP COLUMN effects;
ALTER TABLE public.scans DROP COLUMN flavors;
ALTER TABLE public.scans RENAME COLUMN effect_profiles TO effects;
ALTER TABLE public.scans RENAME COLUMN flavor_profiles TO flavors;

-- Add comments to clarify the new structure
COMMENT ON COLUMN public.scans.effects IS 'JSON array of effect objects with name, intensity (1-5), emoji, and color';
COMMENT ON COLUMN public.scans.flavors IS 'JSON array of flavor objects with name, intensity (1-5), emoji, and color';

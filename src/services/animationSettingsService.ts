
import { supabase } from '@/integrations/supabase/client';
import { AnimationSettings } from '@/components/StrainShowcase/AnimationSettings';

const DEFAULT_SETTINGS: AnimationSettings = {
  transitionMode: 'elegant',
  slideInterval: 5000,
  textAnimationSpeed: 1000,
  particleIntensity: 50,
  glowIntensity: 50,
  autoTransition: true,
  shuffleTransitions: false,
  emojiAnimations: true,
  parallaxEffect: true,
  backgroundMotion: true
};

export const saveAnimationSettings = async (settings: AnimationSettings): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        animation_settings: settings as unknown as any, // Safe cast through unknown
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving animation settings:', error);
    }
  } catch (error) {
    console.error('Error saving animation settings:', error);
  }
};

// Helper function to validate and cast animation settings
const isValidAnimationSettings = (obj: any): obj is AnimationSettings => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.transitionMode === 'string' &&
    typeof obj.slideInterval === 'number' &&
    typeof obj.textAnimationSpeed === 'number' &&
    typeof obj.particleIntensity === 'number' &&
    typeof obj.glowIntensity === 'number' &&
    typeof obj.autoTransition === 'boolean' &&
    typeof obj.shuffleTransitions === 'boolean' &&
    typeof obj.emojiAnimations === 'boolean' &&
    typeof obj.parallaxEffect === 'boolean' &&
    typeof obj.backgroundMotion === 'boolean'
  );
};

export const loadAnimationSettings = async (): Promise<AnimationSettings> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from('profiles')
      .select('animation_settings')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading animation settings:', error);
      return DEFAULT_SETTINGS;
    }

    if (!data || !data.animation_settings) {
      return DEFAULT_SETTINGS;
    }

    // Safe type checking and conversion
    const settings = data.animation_settings as unknown;
    
    if (isValidAnimationSettings(settings)) {
      return { ...DEFAULT_SETTINGS, ...settings };
    } else {
      console.warn('Invalid animation settings format, using defaults');
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error('Error loading animation settings:', error);
    return DEFAULT_SETTINGS;
  }
};

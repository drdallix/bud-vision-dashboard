
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
        animation_settings: settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving animation settings:', error);
    }
  } catch (error) {
    console.error('Error saving animation settings:', error);
  }
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

    if (error || !data?.animation_settings) {
      return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...data.animation_settings };
  } catch (error) {
    console.error('Error loading animation settings:', error);
    return DEFAULT_SETTINGS;
  }
};


import { EffectProfile, FlavorProfile } from '@/types/strain';

// Convert legacy effects to visual profiles
export const convertEffectsToProfiles = (effects: string[]): EffectProfile[] => {
  const effectMap: Record<string, { emoji: string; color: string; defaultIntensity: number }> = {
    'Relaxed': { emoji: '😌', color: '#8B5CF6', defaultIntensity: 4 },
    'Happy': { emoji: '😊', color: '#F59E0B', defaultIntensity: 4 },
    'Euphoric': { emoji: '🤩', color: '#EF4444', defaultIntensity: 5 },
    'Creative': { emoji: '🎨', color: '#3B82F6', defaultIntensity: 3 },
    'Energetic': { emoji: '⚡', color: '#10B981', defaultIntensity: 5 },
    'Focused': { emoji: '🎯', color: '#6366F1', defaultIntensity: 4 },
    'Sleepy': { emoji: '😴', color: '#6B7280', defaultIntensity: 5 },
    'Uplifted': { emoji: '🚀', color: '#F97316', defaultIntensity: 4 },
    'Talkative': { emoji: '💬', color: '#EC4899', defaultIntensity: 3 },
    'Giggly': { emoji: '😂', color: '#84CC16', defaultIntensity: 4 }
  };

  return effects.map(effect => ({
    name: effect,
    intensity: effectMap[effect]?.defaultIntensity || 3,
    emoji: effectMap[effect]?.emoji || '🌿',
    color: effectMap[effect]?.color || '#10B981'
  }));
};

// Convert legacy flavors to visual profiles
export const convertFlavorsToProfiles = (flavors: string[]): FlavorProfile[] => {
  const flavorMap: Record<string, { emoji: string; color: string; defaultIntensity: number }> = {
    'Sweet': { emoji: '🍯', color: '#F59E0B', defaultIntensity: 4 },
    'Earthy': { emoji: '🌍', color: '#78716C', defaultIntensity: 4 },
    'Pine': { emoji: '🌲', color: '#059669', defaultIntensity: 3 },
    'Citrus': { emoji: '🍋', color: '#EAB308', defaultIntensity: 4 },
    'Berry': { emoji: '🫐', color: '#7C3AED', defaultIntensity: 4 },
    'Diesel': { emoji: '⛽', color: '#374151', defaultIntensity: 5 },
    'Vanilla': { emoji: '🍦', color: '#F3E8FF', defaultIntensity: 3 },
    'Grape': { emoji: '🍇', color: '#8B5CF6', defaultIntensity: 4 },
    'Woody': { emoji: '🪵', color: '#92400E', defaultIntensity: 3 },
    'Tropical': { emoji: '🥭', color: '#F97316', defaultIntensity: 4 },
    'Pungent': { emoji: '💨', color: '#6B7280', defaultIntensity: 5 },
    'Spicy': { emoji: '🌶️', color: '#DC2626', defaultIntensity: 4 }
  };

  return flavors.map(flavor => ({
    name: flavor,
    intensity: flavorMap[flavor]?.defaultIntensity || 3,
    emoji: flavorMap[flavor]?.emoji || '🌿',
    color: flavorMap[flavor]?.color || '#10B981'
  }));
};

// Convert profiles back to arrays for database storage
export const convertProfilesToEffects = (profiles: EffectProfile[]): string[] => {
  return profiles.map(profile => profile.name);
};

export const convertProfilesToFlavors = (profiles: FlavorProfile[]): string[] => {
  return profiles.map(profile => profile.name);
};

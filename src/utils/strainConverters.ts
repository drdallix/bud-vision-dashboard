
import { Strain, DatabaseScan, Terpene, EffectProfile, FlavorProfile, LegacyStrain } from '@/types/strain';

// Type guard to ensure strain_type is valid
const validStrainType = (type: string): type is 'Indica' | 'Sativa' | 'Hybrid' => {
  return ['Indica', 'Sativa', 'Hybrid'].includes(type);
};

// Helper function to safely parse terpenes
const parseTerpenes = (terpenes: any): Terpene[] => {
  if (!terpenes) return [];
  if (Array.isArray(terpenes)) return terpenes;
  try {
    const parsed = typeof terpenes === 'string' ? JSON.parse(terpenes) : terpenes;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Convert legacy effects to visual profiles
const convertEffectsToProfiles = (effects: string[]): EffectProfile[] => {
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
const convertFlavorsToProfiles = (flavors: string[]): FlavorProfile[] => {
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

export const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
  // Ensure THC is always 21% or higher for recreational focus
  const thc = Math.max(Number(scan.thc) || 21, 21);
  
  return {
    id: scan.id,
    name: scan.strain_name,
    type: validStrainType(scan.strain_type) ? scan.strain_type : 'Hybrid',
    thc,
    effectProfiles: convertEffectsToProfiles(scan.effects || []),
    flavorProfiles: convertFlavorsToProfiles(scan.flavors || []),
    terpenes: parseTerpenes(scan.terpenes),
    description: scan.description || '',
    scannedAt: scan.scanned_at,
    confidence: scan.confidence || 0,
    inStock: scan.in_stock,
    userId: scan.user_id,
  };
};

export const convertStrainForDatabase = (strain: Strain, userId: string) => {
  // Convert profiles back to arrays for database compatibility
  const effects = strain.effectProfiles.map(profile => profile.name);
  const flavors = strain.flavorProfiles.map(profile => profile.name);
  
  const terpenes = strain.terpenes && strain.terpenes.length > 0 
    ? JSON.stringify(strain.terpenes) 
    : null;
  
  return {
    user_id: userId,
    strain_name: strain.name,
    strain_type: strain.type,
    thc: strain.thc,
    effects,
    flavors,
    terpenes: terpenes,
    medical_uses: [], // Remove medical uses for recreational focus
    description: strain.description,
    confidence: strain.confidence,
    scanned_at: strain.scannedAt,
    in_stock: strain.inStock,
  };
};

// Helper function to convert legacy strain format to new format
export const migrateLegacyStrain = (legacyStrain: LegacyStrain): Strain => {
  return {
    ...legacyStrain,
    thc: Math.max(legacyStrain.thc, 21), // Ensure 21%+ THC
    effectProfiles: convertEffectsToProfiles(legacyStrain.effects),
    flavorProfiles: convertFlavorsToProfiles(legacyStrain.flavors)
  };
};

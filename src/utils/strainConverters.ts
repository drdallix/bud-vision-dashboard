
import { DatabaseScan, Strain, EffectProfile, FlavorProfile } from '@/types/strain';

/**
 * Convert database scan to frontend Strain object
 */
export const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
  // Generate basic effect profiles from legacy effects array
  const effectProfiles: EffectProfile[] = (scan.effects || []).map((effect, index) => ({
    name: effect,
    intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
    emoji: ['😌', '😊', '🤩', '💭', '✨', '🚀'][index] || '✨',
    color: ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'][index] || '#6B7280'
  }));

  // Generate basic flavor profiles from legacy flavors array
  const flavorProfiles: FlavorProfile[] = (scan.flavors || []).map((flavor, index) => ({
    name: flavor,
    intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
    emoji: ['🌍', '🍯', '🌲', '🍋', '🌶️', '🍓'][index] || '🌿',
    color: ['#78716C', '#F59E0B', '#10B981', '#EAB308', '#F97316', '#EC4899'][index] || '#6B7280'
  }));

  return {
    id: scan.id,
    name: scan.strain_name,
    type: scan.strain_type as 'Indica' | 'Sativa' | 'Hybrid',
    thc: scan.thc || 21,
    cbd: scan.cbd || undefined,
    effectProfiles,
    flavorProfiles,
    terpenes: scan.terpenes || [],
    description: scan.description || `A ${scan.strain_type.toLowerCase()} strain with ${scan.effects?.join(', ') || 'various'} effects.`,
    scannedAt: scan.scanned_at,
    confidence: scan.confidence || 85,
    inStock: scan.in_stock,
    userId: scan.user_id,
    emoji: scan.emoji || undefined // Include the AI-generated emoji
  };
};

/**
 * Convert frontend Strain object to database format
 */
export const convertStrainToDatabaseScan = (strain: Strain): Omit<DatabaseScan, 'id' | 'created_at'> => {
  return {
    user_id: strain.userId,
    strain_name: strain.name,
    strain_type: strain.type,
    thc: strain.thc,
    cbd: strain.cbd || null,
    effects: strain.effectProfiles.map(effect => effect.name),
    flavors: strain.flavorProfiles.map(flavor => flavor.name),
    terpenes: strain.terpenes || null,
    medical_uses: [], // Legacy field, kept for compatibility
    description: strain.description,
    confidence: strain.confidence,
    scanned_at: strain.scannedAt,
    in_stock: strain.inStock,
    emoji: strain.emoji || null // Include the emoji in database updates
  };
};

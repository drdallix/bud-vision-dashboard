
import { DatabaseScan, Strain, EffectProfile, FlavorProfile } from '@/types/strain';

/**
 * Convert database scan to frontend Strain object
 */
export const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
  let effectProfiles: EffectProfile[] = [];
  let flavorProfiles: FlavorProfile[] = [];

  // Handle new structured profiles (jsonb) or legacy effects/flavors (string arrays)
  if (scan.effects) {
    if (Array.isArray(scan.effects) && scan.effects.length > 0) {
      // Check if first element is an object (new structure) or string (legacy)
      if (typeof scan.effects[0] === 'object' && scan.effects[0] !== null && 'name' in scan.effects[0]) {
        // New structured format
        effectProfiles = scan.effects as EffectProfile[];
      } else {
        // Legacy string array format - convert to structured format
        effectProfiles = (scan.effects as string[]).map((effect, index) => ({
          name: effect,
          intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
          emoji: ['😌', '😊', '🤩', '💭', '✨', '🚀'][index] || '✨',
          color: ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'][index] || '#6B7280'
        }));
      }
    }
  }

  if (scan.flavors) {
    if (Array.isArray(scan.flavors) && scan.flavors.length > 0) {
      // Check if first element is an object (new structure) or string (legacy)
      if (typeof scan.flavors[0] === 'object' && scan.flavors[0] !== null && 'name' in scan.flavors[0]) {
        // New structured format
        flavorProfiles = scan.flavors as FlavorProfile[];
      } else {
        // Legacy string array format - convert to structured format
        flavorProfiles = (scan.flavors as string[]).map((flavor, index) => ({
          name: flavor,
          intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
          emoji: ['🌍', '🍯', '🌲', '🍋', '🌶️', '🍓'][index] || '🌿',
          color: ['#78716C', '#F59E0B', '#10B981', '#EAB308', '#F97316', '#EC4899'][index] || '#6B7280'
        }));
      }
    }
  }

  return {
    id: scan.id,
    name: scan.strain_name,
    type: scan.strain_type as 'Indica' | 'Sativa' | 'Hybrid',
    thc: scan.thc || 21,
    cbd: scan.cbd || undefined,
    effectProfiles,
    flavorProfiles,
    terpenes: scan.terpenes || [],
    description: scan.description || `A ${scan.strain_type.toLowerCase()} strain with ${effectProfiles.map(e => e.name).join(', ') || 'various'} effects.`,
    scannedAt: scan.scanned_at,
    confidence: scan.confidence || 85,
    inStock: scan.in_stock,
    userId: scan.user_id
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
    effects: strain.effectProfiles, // Store structured profiles as jsonb
    flavors: strain.flavorProfiles, // Store structured profiles as jsonb
    terpenes: strain.terpenes || null,
    medical_uses: [], // Legacy field, kept for compatibility
    description: strain.description,
    confidence: strain.confidence,
    scanned_at: strain.scannedAt,
    in_stock: strain.inStock
  };
};

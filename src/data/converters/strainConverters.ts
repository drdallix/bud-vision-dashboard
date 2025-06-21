
import { Strain, DatabaseScan, Terpene } from '@/types/strain';

export const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
  // Parse terpenes from JSONB
  let terpenes: Terpene[] = [];
  if (scan.terpenes) {
    try {
      if (typeof scan.terpenes === 'string') {
        terpenes = JSON.parse(scan.terpenes);
      } else {
        terpenes = scan.terpenes as Terpene[];
      }
    } catch (error) {
      console.warn('Failed to parse terpenes:', error);
      terpenes = [];
    }
  }

  // Parse effects from Json type (could be array or other format)
  let effectsArray: string[] = [];
  if (scan.effects) {
    try {
      if (Array.isArray(scan.effects)) {
        effectsArray = scan.effects as string[];
      } else if (typeof scan.effects === 'string') {
        effectsArray = JSON.parse(scan.effects);
      } else {
        effectsArray = [];
      }
    } catch (error) {
      console.warn('Failed to parse effects:', error);
      effectsArray = [];
    }
  }

  // Parse flavors from Json type (could be array or other format)
  let flavorsArray: string[] = [];
  if (scan.flavors) {
    try {
      if (Array.isArray(scan.flavors)) {
        flavorsArray = scan.flavors as string[];
      } else if (typeof scan.flavors === 'string') {
        flavorsArray = JSON.parse(scan.flavors);
      } else {
        flavorsArray = [];
      }
    } catch (error) {
      console.warn('Failed to parse flavors:', error);
      flavorsArray = [];
    }
  }

  // Generate effect profiles with required emoji and color properties
  const effectProfiles = effectsArray.map((effect, index) => ({
    name: effect,
    intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
    emoji: ['😌', '😊', '🤩', '💭', '✨', '🚀'][index] || '✨',
    color: ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'][index] || '#6B7280'
  }));

  // Generate flavor profiles with required emoji and color properties
  const flavorProfiles = flavorsArray.map((flavor, index) => ({
    name: flavor,
    intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
    emoji: ['🌍', '🍯', '🌲', '🍋', '🌶️', '🍓'][index] || '🌿',
    color: ['#78716C', '#F59E0B', '#10B981', '#EAB308', '#F97316', '#EC4899'][index] || '#6B7280'
  }));

  // Map legacy types to new 5-level system
  const mapStrainType = (type: string): 'Indica' | 'Indica-Dominant' | 'Hybrid' | 'Sativa-Dominant' | 'Sativa' => {
    switch (type) {
      case 'Indica':
      case 'Indica-Dominant':
      case 'Sativa-Dominant': 
      case 'Sativa':
        return type as 'Indica' | 'Indica-Dominant' | 'Sativa-Dominant' | 'Sativa';
      case 'Hybrid':
        return 'Hybrid';
      default:
        return 'Hybrid';
    }
  };

  return {
    id: scan.id,
    name: scan.strain_name,
    type: mapStrainType(scan.strain_type),
    thc: scan.thc || 0,
    effectProfiles,
    flavorProfiles,
    terpenes: terpenes,
    description: scan.description || '',
    confidence: scan.confidence || 0,
    scannedAt: scan.scanned_at,
    inStock: scan.in_stock ?? true,
    userId: scan.user_id
  };
};

export const convertDatabaseScansToStrains = (scans: DatabaseScan[]): Strain[] => {
  return scans.map(convertDatabaseScanToStrain);
};

export const convertStrainToDatabase = (strain: Strain, userId: string): Omit<DatabaseScan, 'id' | 'created_at'> => {
  return {
    user_id: userId,
    strain_name: strain.name,
    strain_type: strain.type,
    thc: strain.thc,
    cbd: 0, // Default CBD value since it's not in the new Strain type
    effects: strain.effectProfiles?.map(p => p.name) || [],
    flavors: strain.flavorProfiles?.map(p => p.name) || [],
    terpenes: strain.terpenes && strain.terpenes.length > 0 ? strain.terpenes : null,
    medical_uses: [], // Legacy field, kept for compatibility
    description: strain.description,
    confidence: strain.confidence,
    scanned_at: strain.scannedAt,
    in_stock: strain.inStock ?? true
  };
};

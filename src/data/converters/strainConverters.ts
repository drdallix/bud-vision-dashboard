
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

  // Generate effect profiles with required emoji and color properties
  const effectProfiles = scan.effects?.map((effect, index) => ({
    name: effect,
    intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
    emoji: ['😌', '😊', '🤩', '💭', '✨', '🚀'][index] || '✨',
    color: ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'][index] || '#6B7280'
  })) || [];

  // Generate flavor profiles with required emoji and color properties
  const flavorProfiles = scan.flavors?.map((flavor, index) => ({
    name: flavor,
    intensity: Math.min(Math.max(Math.floor(Math.random() * 3) + 2, 1), 5),
    emoji: ['🌍', '🍯', '🌲', '🍋', '🌶️', '🍓'][index] || '🌿',
    color: ['#78716C', '#F59E0B', '#10B981', '#EAB308', '#F97316', '#EC4899'][index] || '#6B7280'
  })) || [];

  return {
    id: scan.id,
    name: scan.strain_name,
    type: scan.strain_type as 'Indica' | 'Sativa' | 'Hybrid',
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

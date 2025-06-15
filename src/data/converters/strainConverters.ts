
import { Strain, DatabaseScan, Terpene } from '@/types/strain';
import { convertEffectsToProfiles, convertFlavorsToProfiles, convertProfilesToEffects, convertProfilesToFlavors } from './profileConverters';

// Type validation helpers
const validStrainType = (type: string): type is 'Indica' | 'Sativa' | 'Hybrid' => {
  return ['Indica', 'Sativa', 'Hybrid'].includes(type);
};

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

// Main conversion functions
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

export const convertStrainToDatabase = (strain: Strain, userId: string): Omit<DatabaseScan, 'id' | 'created_at'> => {
  const effects = convertProfilesToEffects(strain.effectProfiles);
  const flavors = convertProfilesToFlavors(strain.flavorProfiles);
  
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

// Batch conversion helpers
export const convertDatabaseScansToStrains = (scans: DatabaseScan[]): Strain[] => {
  return scans.map(convertDatabaseScanToStrain);
};

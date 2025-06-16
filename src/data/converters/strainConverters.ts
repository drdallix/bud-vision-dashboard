
import { Strain, DatabaseScan, TerpenePeak } from '@/types/strain';

export const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
  // Parse terpenes from JSONB
  let terpenes: TerpenePeak[] = [];
  if (scan.terpenes) {
    try {
      if (typeof scan.terpenes === 'string') {
        terpenes = JSON.parse(scan.terpenes);
      } else {
        terpenes = scan.terpenes as TerpenePeak[];
      }
    } catch (error) {
      console.warn('Failed to parse terpenes:', error);
      terpenes = [];
    }
  }

  return {
    id: scan.id,
    name: scan.strain_name,
    type: scan.strain_type as 'Indica' | 'Sativa' | 'Hybrid',
    thc: scan.thc || 0,
    effectProfiles: scan.effects?.map(effect => ({ name: effect, intensity: 5 })) || [],
    flavorProfiles: scan.flavors?.map(flavor => ({ name: flavor, intensity: 5 })) || [],
    terpenes: terpenes,
    medicalUses: scan.medical_uses || [],
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
    medical_uses: strain.medicalUses || [],
    description: strain.description,
    confidence: strain.confidence,
    scanned_at: strain.scannedAt,
    in_stock: strain.inStock ?? true
  };
};

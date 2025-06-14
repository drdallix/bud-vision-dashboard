
import { Strain, DatabaseScan, Terpene } from '@/types/strain';

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

export const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
  return {
    id: scan.id,
    name: scan.strain_name,
    type: validStrainType(scan.strain_type) ? scan.strain_type : 'Hybrid',
    thc: Number(scan.thc) || 0,
    cbd: Number(scan.cbd) || 0,
    effects: scan.effects || [],
    flavors: scan.flavors || [],
    terpenes: parseTerpenes(scan.terpenes),
    medicalUses: scan.medical_uses || [],
    description: scan.description || '',
    imageUrl: scan.image_url || '/placeholder.svg',
    scannedAt: scan.scanned_at,
    confidence: scan.confidence || 0,
  };
};

export const convertStrainForDatabase = (strain: Strain, userId: string) => {
  // Convert terpenes to JSON string for database storage
  const terpenes = strain.terpenes && strain.terpenes.length > 0 
    ? JSON.stringify(strain.terpenes) 
    : null;
  
  return {
    user_id: userId,
    strain_name: strain.name,
    strain_type: strain.type,
    thc: strain.thc,
    cbd: strain.cbd,
    effects: strain.effects,
    flavors: strain.flavors,
    terpenes: terpenes,
    medical_uses: strain.medicalUses,
    description: strain.description,
    image_url: strain.imageUrl,
    confidence: strain.confidence,
    scanned_at: strain.scannedAt,
  };
};

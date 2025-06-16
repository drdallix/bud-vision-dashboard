export interface Terpene {
  name: string;
  percentage: number;
  effects: string;
}

export interface EffectProfile {
  name: string;
  intensity: number; // 1-5 scale
  emoji: string;
  color: string;
}

export interface FlavorProfile {
  name: string;
  intensity: number; // 1-5 scale
  emoji: string;
  color: string;
}

export interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number; // Always 21% or higher for recreational focus
  effectProfiles: EffectProfile[];
  flavorProfiles: FlavorProfile[];
  terpenes?: Terpene[];
  description: string;
  scannedAt: string;
  confidence: number;
  inStock: boolean;
  userId: string;
  emoji?: string; // AI-generated emoji representing the strain's character
}

// Keep legacy properties for backward compatibility during migration
export interface LegacyStrain extends Omit<Strain, 'effectProfiles' | 'flavorProfiles'> {
  effects: string[];
  flavors: string[];
  medicalUses: string[];
}

// Database return type from Supabase (matching the generated types)
export type DatabaseScan = {
  id: string;
  user_id: string;
  strain_name: string;
  strain_type: string;
  thc: number | null;
  effects: string[] | null;
  flavors: string[] | null;
  terpenes: any | null;
  medical_uses: string[] | null;
  description: string | null;
  confidence: number | null;
  scanned_at: string;
  created_at: string;
  in_stock: boolean;
  emoji?: string | null; // AI-generated emoji
};

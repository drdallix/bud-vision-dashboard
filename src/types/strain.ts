
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
  type: 'Indica' | 'Indica-Dominant' | 'Hybrid' | 'Sativa-Dominant' | 'Sativa';
  thc: number; // Always 21% or higher for recreational focus
  cbd?: number; // Optional CBD percentage
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

// Database return type from Supabase (matching the actual database schema)
export type DatabaseScan = {
  id: string;
  user_id: string;
  strain_name: string;
  strain_type: string;
  thc: number | null;
  cbd?: number | null;
  effects: any | null; // Changed from string[] to any to match Json type from Supabase
  flavors: any | null; // Changed from string[] to any to match Json type from Supabase
  terpenes: any | null;
  medical_uses: string[] | null;
  description: string | null;
  confidence: number | null;
  scanned_at: string;
  created_at: string;
  in_stock: boolean;
  emoji?: string | null; // AI-generated emoji
};


export interface Terpene {
  name: string;
  percentage: number;
  effects: string;
}

export interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  terpenes?: Terpene[];
  medicalUses: string[];
  description: string;
  scannedAt: string;
  confidence: number;
  inStock: boolean;
  userId: string;
}

// Database return type from Supabase (matching the generated types)
export type DatabaseScan = {
  id: string;
  user_id: string;
  strain_name: string;
  strain_type: string;
  thc: number | null;
  cbd: number | null;
  effects: string[] | null;
  flavors: string[] | null;
  terpenes: any | null; // Using 'any' to match Json type from database
  medical_uses: string[] | null;
  description: string | null;
  image_url: string | null;
  confidence: number | null;
  scanned_at: string;
  created_at: string;
  in_stock: boolean;
};


import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';

export interface StrainDashboardProps {
  strain: Strain;
  prices?: PricePoint[];
  onEdit: () => void;
  onStockToggle: (inStock: boolean) => Promise<void>;
  onPriceEdit: () => void;
  onRegenerateDescription: () => Promise<void>;
}

export interface StrainHeaderProps {
  strain: Strain;
  onEdit: () => void;
  onStockToggle: (inStock: boolean) => Promise<void>;
}

export interface StrainEffectsProps {
  effects: Array<{ name: string; intensity: number; emoji: string }>;
  showVisual?: boolean;
}

export interface StrainFlavorsProps {
  flavors: Array<{ name: string; intensity: number; emoji: string }>;
  showVisual?: boolean;
}

export interface StrainCannabinoidsProps {
  thc: number;
  cbd: number;
  strainName: string; // For deterministic THC calculation
}

export interface StrainTerpenesProps {
  terpenes: Array<{ name: string; percentage: number; effects?: string }>;
}

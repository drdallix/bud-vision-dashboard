
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import StrainErrorBoundary from '@/components/ErrorBoundaries/StrainErrorBoundary';
import SafeStrainGrid from './SafeStrainGrid';

interface StrainGridProps {
  strains: Strain[];
  editMode: boolean;
  selectedStrains: string[];
  user: any;
  onSelect: (strainId: string, checked: boolean) => void;
  onStockToggle: (strainId: string, currentStock: boolean) => void;
  onStrainClick: (strain: Strain) => void;
  inventoryLoading: boolean;
  pricesMap: Record<string, PricePoint[]>;
  pricesLoading: boolean;
}

/**
 * Enhanced StrainGrid Wrapper
 * 
 * Now receives pricesMap as a prop from the centralized store,
 * eliminating conditional hook calls that caused render errors.
 */
const StrainGrid = (props: StrainGridProps) => {
  return (
    <StrainErrorBoundary>
      <SafeStrainGrid {...props} />
    </StrainErrorBoundary>
  );
};

export default StrainGrid;

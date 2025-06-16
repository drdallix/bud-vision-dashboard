
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
  // Map the props to match SafeStrainGrid interface
  const safeGridProps = {
    strains: props.strains,
    editMode: props.editMode,
    selectedStrains: props.selectedStrains,
    onStrainSelect: props.onSelect,
    onStockToggle: props.onStockToggle,
    onStrainClick: props.onStrainClick,
    inventoryLoading: props.inventoryLoading
  };

  return (
    <StrainErrorBoundary>
      <SafeStrainGrid {...safeGridProps} />
    </StrainErrorBoundary>
  );
};

export default StrainGrid;


import { Strain } from '@/types/strain';
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
}

const StrainGrid = (props: StrainGridProps) => {
  return (
    <StrainErrorBoundary>
      <SafeStrainGrid {...props} />
    </StrainErrorBoundary>
  );
};

export default StrainGrid;

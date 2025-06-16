
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import StrainErrorBoundary from '@/components/ErrorBoundaries/StrainErrorBoundary';
import { SafeStrainGrid } from './SafeStrainGrid';

interface StrainGridProps {
  strains: Strain[];
  editMode: boolean;
  selectedStrains: string[];
  pricesMap: Record<string, PricePoint[]>;
  pricesLoading: boolean;
  onToggleStrain: (strainId: string) => void;
}

const StrainGrid = (props: StrainGridProps) => {
  return (
    <StrainErrorBoundary>
      <SafeStrainGrid {...props} />
    </StrainErrorBoundary>
  );
};

export default StrainGrid;

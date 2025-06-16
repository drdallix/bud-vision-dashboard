
import React, { memo } from 'react';
import { StrainGrid } from './StrainGrid';
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';

interface SafeStrainGridProps {
  strains: Strain[];
  selectedStrains: string[];
  editMode: boolean;
  pricesMap: Record<string, PricePoint[]>;
  pricesLoading: boolean;
  onToggleStrain: (strainId: string) => void;
}

// Memoize to prevent unnecessary re-renders
const SafeStrainGrid = memo(({ 
  strains, 
  selectedStrains, 
  editMode, 
  pricesMap, 
  pricesLoading, 
  onToggleStrain 
}: SafeStrainGridProps) => {
  // Remove excessive logging that causes performance issues
  // Only log when there are actual changes that matter
  if (process.env.NODE_ENV === 'development' && strains.length === 0 && !pricesLoading) {
    console.log('SafeStrainGrid: No strains available');
  }

  if (!strains || strains.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No strains found. Try adjusting your filters or add some strains to get started.</p>
      </div>
    );
  }

  return (
    <StrainGrid
      strains={strains}
      selectedStrains={selectedStrains}
      editMode={editMode}
      pricesMap={pricesMap}
      pricesLoading={pricesLoading}
      onToggleStrain={onToggleStrain}
    />
  );
});

SafeStrainGrid.displayName = 'SafeStrainGrid';

export { SafeStrainGrid };

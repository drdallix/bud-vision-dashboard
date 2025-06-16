
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import StrainCard from '../StrainCard';
import StrainPriceEditor from './StrainPriceEditor';

interface SafeStrainGridProps {
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
 * Enhanced SafeStrainGrid
 * 
 * Now receives pricesMap as a prop to avoid conditional hook calls.
 * All price data is managed at the parent level through the centralized store.
 */
const SafeStrainGrid = ({
  strains,
  editMode,
  selectedStrains,
  user,
  onSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading,
  pricesMap,
  pricesLoading
}: SafeStrainGridProps) => {
  console.log('SafeStrainGrid render:', {
    strainCount: strains.length,
    editMode,
    selectedCount: selectedStrains.length,
    pricesMapKeys: Object.keys(pricesMap).length,
    pricesLoading
  });

  return (
    <div className="grid grid-cols-1 gap-4">
      {strains.map((strain) => {
        const prices = pricesMap[strain.id] || [];
        
        return (
          <div key={strain.id}>
            <StrainCard
              strain={strain}
              editMode={editMode && user !== null}
              isSelected={selectedStrains.includes(strain.id)}
              canEdit={user !== null && strain.userId === user.id}
              onSelect={onSelect}
              onStockToggle={onStockToggle}
              onStrainClick={onStrainClick}
              inventoryLoading={inventoryLoading}
              prices={prices}
              pricesLoading={pricesLoading}
            />
            {editMode && user !== null && strain.userId === user.id && (
              <StrainPriceEditor 
                strainId={strain.id} 
                prices={prices} 
                disabled={inventoryLoading || !strain.inStock} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SafeStrainGrid;

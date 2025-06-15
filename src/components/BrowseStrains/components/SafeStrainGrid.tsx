
import { Strain } from '@/types/strain';
import StrainCard from '../StrainCard';
import StrainPriceEditor from './StrainPriceEditor';
import { useBulkStrainPrices } from '@/hooks/useBulkStrainPrices';

interface SafeStrainGridProps {
  strains: Strain[];
  editMode: boolean;
  selectedStrains: string[];
  user: any;
  onSelect: (strainId: string, checked: boolean) => void;
  onStockToggle: (strainId: string, currentStock: boolean) => void;
  onStrainClick: (strain: Strain) => void;
  inventoryLoading: boolean;
}

const SafeStrainGrid = ({
  strains,
  editMode,
  selectedStrains,
  user,
  onSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading
}: SafeStrainGridProps) => {
  // Fetch all prices at once to avoid conditional hook calls
  const strainIds = strains.map(strain => strain.id);
  const { pricesMap, isLoading: pricesLoading } = useBulkStrainPrices(strainIds);

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

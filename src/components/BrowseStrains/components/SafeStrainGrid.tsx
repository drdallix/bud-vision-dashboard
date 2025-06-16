
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import StrainCard from '../StrainCard';
import StrainPriceEditor from './StrainPriceEditor';

interface SafeStrainGridProps {
  strains: Strain[];
  editMode: boolean;
  selectedStrains: string[];
  onStrainSelect: (strainId: string, checked: boolean) => void;
  onStockToggle: (strainId: string, currentStock: boolean) => Promise<boolean>;
  onStrainClick: (strain: Strain) => void;
  inventoryLoading: boolean;
}

const SafeStrainGrid = ({
  strains,
  editMode,
  selectedStrains,
  onStrainSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading
}: SafeStrainGridProps) => {
  console.log('SafeStrainGrid render:', {
    strainCount: strains.length,
    editMode,
    selectedCount: selectedStrains.length
  });

  if (!strains || strains.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No strains found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {strains.map((strain) => {
        return (
          <div key={strain.id}>
            <StrainCard
              strain={strain}
              editMode={editMode}
              isSelected={selectedStrains.includes(strain.id)}
              canEdit={true}
              onSelect={onStrainSelect}
              onStockToggle={onStockToggle}
              onStrainClick={onStrainClick}
              inventoryLoading={inventoryLoading}
              prices={[]}
              pricesLoading={false}
            />
            {editMode && (
              <StrainPriceEditor 
                strainId={strain.id} 
                prices={[]} 
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

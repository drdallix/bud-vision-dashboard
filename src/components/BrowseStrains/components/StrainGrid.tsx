
import { Strain } from '@/types/strain';
import StrainCard from '../StrainCard';

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

const StrainGrid = ({
  strains,
  editMode,
  selectedStrains,
  user,
  onSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading
}: StrainGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {strains.map((strain) => (
        <StrainCard
          key={strain.id}
          strain={strain}
          editMode={editMode && user !== null}
          isSelected={selectedStrains.includes(strain.id)}
          canEdit={user !== null && strain.userId === user.id}
          onSelect={onSelect}
          onStockToggle={onStockToggle}
          onStrainClick={onStrainClick}
          inventoryLoading={inventoryLoading}
        />
      ))}
    </div>
  );
};

export default StrainGrid;

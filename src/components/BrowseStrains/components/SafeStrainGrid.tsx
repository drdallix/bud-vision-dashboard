
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
  searchTerm?: string;
  filterType?: string;
}

const SafeStrainGrid = ({
  strains,
  editMode,
  selectedStrains,
  onStrainSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading,
  searchTerm = '',
  filterType = 'all'
}: SafeStrainGridProps) => {
  console.log('SafeStrainGrid render:', {
    strainCount: strains.length,
    editMode,
    selectedCount: selectedStrains.length
  });

  if (!strains || strains.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-muted-foreground text-lg">No strains found</div>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  // Determine which strains match current filters
  const getIsMatchingFilter = (strain: Strain) => {
    const matchesSearch = !searchTerm || 
      strain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strain.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strain.effectProfiles?.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      strain.flavorProfiles?.some(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || strain.type === filterType;
    
    return matchesSearch && matchesType;
  };

  // Sort strains: matching filters first, then non-matching
  const sortedStrains = [...strains].sort((a, b) => {
    const aMatches = getIsMatchingFilter(a);
    const bMatches = getIsMatchingFilter(b);
    
    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    return 0;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {sortedStrains.map((strain, index) => {
        const isMatchingFilter = getIsMatchingFilter(strain);
        
        return (
          <div 
            key={strain.id} 
            className="animate-slide-in-up"
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
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
              isMatchingFilter={isMatchingFilter}
            />
            {editMode && (
              <div className="mt-2 animate-fade-in">
                <StrainPriceEditor 
                  strainId={strain.id} 
                  prices={[]} 
                  disabled={inventoryLoading || !strain.inStock} 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SafeStrainGrid;

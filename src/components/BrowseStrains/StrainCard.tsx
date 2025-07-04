
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import { useStrainTHC } from '@/hooks/useStrainTHC';
import { StrainEditModal } from '@/components/StrainEditor';
import QuickPriceModal from './components/QuickPriceModal';
import StrainCardIcon from './components/StrainCardIcon';
import StrainCardHeader from './components/StrainCardHeader';
import StrainCardInfo from './components/StrainCardInfo';

interface StrainCardProps {
  strain: Strain;
  editMode: boolean;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: (strainId: string, checked: boolean) => void;
  onStockToggle: (strainId: string, currentStock: boolean) => void;
  onStrainClick: (strain: Strain) => void;
  inventoryLoading: boolean;
  prices: PricePoint[];
  pricesLoading: boolean;
  isMatchingFilter?: boolean; // New prop for filter matching
}

const StrainCard = ({
  strain,
  editMode,
  isSelected,
  canEdit,
  onSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading,
  prices,
  pricesLoading,
  isMatchingFilter = true
}: StrainCardProps) => {
  // Local state to ensure immediate UI feedback
  const [localInStock, setLocalInStock] = useState(strain.inStock);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickPrice, setShowQuickPrice] = useState(false);

  // Use centralized THC calculation
  const { thcDisplay } = useStrainTHC(strain.name);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Indica':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300';
      case 'Indica-Dominant':
        return 'bg-purple-50 text-purple-700 border-purple-150 dark:bg-purple-800 dark:text-purple-200';
      case 'Hybrid':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      case 'Sativa-Dominant':
        return 'bg-green-50 text-green-700 border-green-150 dark:bg-green-800 dark:text-green-200';
      case 'Sativa':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  // Function to handle switch with immediate UI feedback
  const handleStockSwitch = async () => {
    const wasInStock = localInStock;

    // Immediately update local state for instant UI feedback
    setLocalInStock(!wasInStock);

    // Call parent handler for cache/database update
    onStockToggle(strain.id, wasInStock);

    // If marking out of stock, fire & forget deleteAllForStrain (no blocking, no popup)
    if (wasInStock) {
      // Use import() to avoid SSR problems and keep bundle small
      import('@/services/priceService').then(mod => {
        mod.PriceService.deleteAllForStrain(strain.id);
      });
    }
  };

  // Use local state for UI, but sync with prop changes
  React.useEffect(() => {
    setLocalInStock(strain.inStock);
  }, [strain.inStock]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleQuickPriceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickPrice(true);
  };

  const handleStrainSave = (updatedStrain: Strain) => {
    // Update local state immediately
    setLocalInStock(updatedStrain.inStock);
    setShowEditModal(false);
    
    // Trigger a re-render by calling the parent's strain click handler
    // This will refresh the data from the store
    console.log('Strain updated:', updatedStrain.name);
  };

  // Enhanced styling for filter matching and stock status
  const cardClasses = `
    transition-all duration-300 ease-in-out transform
    ${!editMode ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''} 
    ${!localInStock ? 'opacity-70' : ''} 
    ${!isMatchingFilter ? 'opacity-50 grayscale-[0.3] order-last' : 'order-first'}
    ${isMatchingFilter ? 'animate-fade-in' : ''}
  `.trim();

  return (
    <>
      <Card className={cardClasses} onClick={() => !editMode && onStrainClick(strain)}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <StrainCardIcon strainType={strain.type} />
            
            <div className="flex-1 min-w-0 space-y-3">
              <StrainCardHeader
                strainName={strain.name}
                strainType={strain.type}
                editMode={editMode}
                isSelected={isSelected}
                canEdit={canEdit}
                localInStock={localInStock}
                inventoryLoading={inventoryLoading}
                onSelect={(checked) => onSelect(strain.id, checked)}
                onStockToggle={handleStockSwitch}
                onEditClick={handleEditClick}
                onQuickPriceClick={handleQuickPriceClick}
                getTypeColor={getTypeColor}
              />

              <StrainCardInfo
                thcDisplay={thcDisplay}
                effects={strain.effectProfiles || []}
                scannedAt={strain.scannedAt}
                localInStock={localInStock}
                prices={prices}
                pricesLoading={pricesLoading}
                description={strain.description}
                showFullDescription={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <StrainEditModal
        strain={strain}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleStrainSave}
      />

      {/* Quick Price Modal */}
      <QuickPriceModal
        open={showQuickPrice}
        onClose={() => setShowQuickPrice(false)}
        strainId={strain.id}
      />
    </>
  );
};

export default StrainCard;

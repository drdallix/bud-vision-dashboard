
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Strain } from '@/types/strain';
import { useStrainTHC } from '@/hooks/useStrainTHC';
import StrainCardHeader from './components/StrainCardHeader';
import StrainCardInfo from './components/StrainCardInfo';
import StrainPriceEditor from './components/StrainPriceEditor';
import QuickPriceModal from './components/QuickPriceModal';

interface StrainCardProps {
  strain: Strain;
  editMode?: boolean;
  isSelected?: boolean;
  canEdit?: boolean;
  onSelect?: (strainId: string, checked: boolean) => void;
  onEdit?: (strain: Strain) => void;
  onStockToggle?: (strainId: string, inStock: boolean) => void;
  localInStock?: boolean;
  onStrainClick?: (strain: Strain) => void;
  showFullDescription?: boolean;
  inventoryLoading?: boolean;
  prices?: any[];
  pricesLoading?: boolean;
}

const StrainCard = ({
  strain,
  editMode = false,
  isSelected = false,
  canEdit = true,
  onSelect,
  onEdit,
  onStockToggle,
  localInStock,
  onStrainClick,
  showFullDescription = false,
  inventoryLoading = false
}: StrainCardProps) => {
  const [showPriceModal, setShowPriceModal] = useState(false);
  const { thcDisplay } = useStrainTHC(strain.name);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Prevent propagation when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('select')
    ) {
      return;
    }

    onStrainClick?.(strain);
  }, [strain, onStrainClick]);

  const handleStockToggle = () => {
    const newStockStatus = !strain.inStock;
    onStockToggle?.(strain.id, newStockStatus);
  };

  const handleSelection = (checked: boolean) => {
    onSelect?.(strain.id, checked);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(strain);
  };

  const handleQuickPriceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPriceModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sativa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Hybrid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Indica-Dominant':
        return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'Sativa-Dominant':
        return 'bg-green-50 text-green-700 border-green-150';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const finalInStock = localInStock !== undefined ? localInStock : strain.inStock;

  return (
    <>
      <Card
        className={`relative cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'ring-2 ring-blue-500 shadow-lg'
            : 'hover:shadow-md'
        } ${
          finalInStock
            ? 'bg-white dark:bg-gray-800'
            : 'bg-gray-50 dark:bg-gray-900 opacity-75'
        }`}
        onClick={handleCardClick}
      >
        <div className="p-4 space-y-3">
          <StrainCardHeader
            strainName={strain.name}
            strainType={strain.type}
            editMode={editMode}
            isSelected={isSelected}
            canEdit={canEdit}
            localInStock={finalInStock}
            inventoryLoading={inventoryLoading}
            onSelect={handleSelection}
            onStockToggle={handleStockToggle}
            onEditClick={handleEditClick}
            onQuickPriceClick={handleQuickPriceClick}
            getTypeColor={getTypeColor}
          />

          <StrainCardInfo
            strainId={strain.id}
            thcDisplay={thcDisplay}
            effects={strain.effectProfiles || []}
            scannedAt={strain.scannedAt}
            localInStock={finalInStock}
            description={strain.description}
            showFullDescription={showFullDescription}
          />

          {/* Inline Price Editor for selected strains */}
          {isSelected && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <StrainPriceEditor
                strainId={strain.id}
                prices={[]} // Will be fetched internally by the component
                disabled={false}
              />
            </div>
          )}
        </div>
      </Card>

      <QuickPriceModal
        open={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        strainId={strain.id}
      />
    </>
  );
};

export default StrainCard;

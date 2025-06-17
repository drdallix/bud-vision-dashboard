
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
  isSelected?: boolean;
  onSelect?: (strain: Strain) => void;
  onEdit?: (strain: Strain) => void;
  onStockToggle?: (strainId: string, inStock: boolean) => void;
  localInStock?: boolean;
  onStrainClick?: (strain: Strain) => void;
  showFullDescription?: boolean;
}

const StrainCard = ({
  strain,
  isSelected = false,
  onSelect,
  onEdit,
  onStockToggle,
  localInStock,
  onStrainClick,
  showFullDescription = false
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
            strain={strain}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onStockToggle={handleStockToggle}
            finalInStock={finalInStock}
            onPriceClick={() => setShowPriceModal(true)}
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

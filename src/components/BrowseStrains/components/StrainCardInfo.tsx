
import React from 'react';
import { PricePoint } from '@/types/price';
import PriceBadges from './PriceBadges';
import StrainCardEffects from './StrainCardEffects';
import { usePriceStore } from '@/stores/usePriceStore';
import { useStrainPrices } from '@/hooks/useStrainPrices';

interface EffectProfile {
  name: string;
  emoji: string;
  color: string;
}

interface StrainCardInfoProps {
  strainId: string;
  thcDisplay: string;
  effects: EffectProfile[];
  scannedAt: string;
  localInStock: boolean;
  description?: string;
  showFullDescription?: boolean;
}

const StrainCardInfo = ({
  strainId,
  thcDisplay,
  effects,
  scannedAt,
  localInStock,
  description,
  showFullDescription = false
}: StrainCardInfoProps) => {
  // Use both the centralized price store and hook for maximum reliability
  const { getOptimisticPrices } = usePriceStore();
  const {
    prices: fetchedPrices,
    isLoading: pricesLoading
  } = useStrainPrices(strainId);
  
  // Use optimistic prices if available, otherwise use fetched prices
  const optimisticPrices = getOptimisticPrices(strainId);
  const prices = optimisticPrices || fetchedPrices;

  return (
    <div className="flex-1 min-w-0 space-y-2">
      {/* Always show price badges when available - using consistent data source */}
      {!pricesLoading && !!prices.length && (
        <div className="mb-2">
          <PriceBadges prices={prices} />
        </div>
      )}

      {/* Show placeholder when no prices but in stock - using consistent data source */}
      {localInStock && !pricesLoading && !prices.length && (
        <div className="mb-2">
          <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
            No pricing set
          </div>
        </div>
      )}

      <div className="mb-2">
        <div className="text-xs text-muted-foreground">
          THC: {thcDisplay}
        </div>
      </div>

      {/* Full description when requested */}
      {showFullDescription && description && (
        <div className="mb-2">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      )}

      <StrainCardEffects effects={effects} />

      <div className="text-xs text-muted-foreground">
        {new Date(scannedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StrainCardInfo;


import React from 'react';
import { PricePoint } from '@/types/price';
import PriceBadges from './PriceBadges';
import StrainCardEffects from './StrainCardEffects';

interface EffectProfile {
  name: string;
  emoji: string;
  color: string;
}

interface StrainCardInfoProps {
  thcDisplay: string;
  effects: EffectProfile[];
  scannedAt: string;
  localInStock: boolean;
  prices: PricePoint[];
  pricesLoading: boolean;
  description?: string;
  showFullDescription?: boolean;
}

const StrainCardInfo = ({
  thcDisplay,
  effects,
  scannedAt,
  localInStock,
  prices,
  pricesLoading,
  description,
  showFullDescription = false
}: StrainCardInfoProps) => {
  return (
    <div className="flex-1 min-w-0 space-y-2">
      {/* Always show price badges when available */}
      {!pricesLoading && !!prices.length && (
        <div className="mb-2">
          <PriceBadges prices={prices} />
        </div>
      )}

      {/* Show placeholder when no prices but in stock */}
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
          <p className="text-sm text-muted-foreground leading-relaxed">
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

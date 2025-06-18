
import React from 'react';
import { PricePoint } from '@/types/price';
import PriceBadges from './PriceBadges';

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
    <div className="flex-1 min-w-0 space-y-3">
      {/* Price information - now more prominent */}
      {!pricesLoading && !!prices.length && (
        <div className="mb-3">
          <PriceBadges prices={prices} />
        </div>
      )}

      {/* No pricing placeholder - more prominent */}
      {localInStock && !pricesLoading && !prices.length && (
        <div className="mb-3">
          <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-md">
            No pricing set
          </div>
        </div>
      )}

      {/* THC information - larger and more prominent */}
      <div className="mb-3">
        <div className="text-base font-medium text-foreground">
          THC: {thcDisplay}
        </div>
      </div>

      {/* Description - expanded to use reclaimed space */}
      {showFullDescription && description && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4">
            {description}
          </p>
        </div>
      )}

      {/* Date information - slightly larger */}
      <div className="text-sm text-muted-foreground font-medium">
        Scanned {new Date(scannedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StrainCardInfo;


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
}

const StrainCardInfo = ({
  thcDisplay,
  effects,
  scannedAt,
  localInStock,
  prices,
  pricesLoading
}: StrainCardInfoProps) => {
  return (
    <div className="flex-1 min-w-0">
      {/* Price badges (show only if in stock) */}
      {localInStock && !pricesLoading && !!prices.length && (
        <div className="mb-2">
          <PriceBadges prices={prices} />
        </div>
      )}

      <div className="mb-2">
        <div className="text-xs text-muted-foreground">
          THC: {thcDisplay}
        </div>
      </div>

      <StrainCardEffects effects={effects} />

      <div className="text-xs text-muted-foreground">
        {new Date(scannedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StrainCardInfo;

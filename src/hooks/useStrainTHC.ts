
import { useMemo } from 'react';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

/**
 * Hook for consistent THC range calculations across the app
 */
export const useStrainTHC = (strainName: string) => {
  const { thcRange, thcAverage, thcDisplay } = useMemo(() => {
    const [min, max] = getDeterministicTHCRange(strainName);
    const average = Number(((min + max) / 2).toFixed(1));
    const display = `${min}%–${max}%`;
    
    return {
      thcRange: [min, max] as [number, number],
      thcAverage: average,
      thcDisplay: display,
      thcMin: min,
      thcMax: max
    };
  }, [strainName]);

  return {
    thcRange,
    thcAverage,
    thcDisplay,
    thcMin: thcRange[0],
    thcMax: thcRange[1]
  };
};

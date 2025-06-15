
import { useQuery } from '@tanstack/react-query';
import { PriceService } from '@/services/priceService';
import { PricePoint } from '@/types/price';

export function useBulkStrainPrices(strainIds: string[]) {
  const { data: pricesMap = {}, isLoading } = useQuery({
    queryKey: ['bulk-prices', strainIds.sort()],
    queryFn: async () => {
      const results: Record<string, PricePoint[]> = {};
      
      // Fetch prices for all strains in parallel
      const promises = strainIds.map(async (strainId) => {
        const prices = await PriceService.getPricesForStrain(strainId);
        return { strainId, prices };
      });
      
      const responses = await Promise.all(promises);
      responses.forEach(({ strainId, prices }) => {
        results[strainId] = prices;
      });
      
      return results;
    },
    enabled: strainIds.length > 0,
    staleTime: 30 * 1000,
  });

  return {
    pricesMap,
    isLoading,
  };
}

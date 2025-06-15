
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PriceService } from '@/services/priceService';
import { PricePoint } from '@/types/price';

export function useStrainPrices(strainId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['prices', strainId];

  const { data: prices = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => PriceService.getPricesForStrain(strainId),
    enabled: !!strainId,
    staleTime: 30 * 1000,
  });

  const addPricePoint = useMutation({
    mutationFn: (p: {nowPrice: number, wasPrice?: number | null}) =>
      PriceService.addPricePoint(strainId, p.nowPrice, p.wasPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updatePricePoint = useMutation({
    mutationFn: (p: {id: string, nowPrice: number, wasPrice?: number | null}) =>
      PriceService.updatePricePoint(p.id, p.nowPrice, p.wasPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deletePricePoint = useMutation({
    mutationFn: (id: string) => PriceService.deletePricePoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    prices,
    isLoading,
    addPricePoint: addPricePoint.mutateAsync,
    updatePricePoint: updatePricePoint.mutateAsync,
    deletePricePoint: deletePricePoint.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}

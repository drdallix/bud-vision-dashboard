
import { supabase } from '@/integrations/supabase/client';
import { PricePoint } from '@/types/price';

const VALID_PRICES = [30, 40, 50, 60, 80, 100, 120, 200, 300];

export class PriceService {
  static async getPricesForStrain(strainId: string): Promise<PricePoint[]> {
    const { data, error } = await supabase
      .from('prices')
      .select('id,strain_id,now_price,was_price,created_at')
      .eq('strain_id', strainId)
      .order('now_price', { ascending: true });

    if (error) throw error;
    return (data || []).map((x) => ({
      id: x.id,
      strainId: x.strain_id,
      nowPrice: x.now_price,
      wasPrice: x.was_price ?? null,
      createdAt: x.created_at,
    }));
  }

  static async addPricePoint(strainId: string, nowPrice: number, wasPrice?: number | null): Promise<PricePoint> {
    if (!VALID_PRICES.includes(nowPrice)) throw new Error('Invalid price');
    if (wasPrice && !VALID_PRICES.includes(wasPrice)) throw new Error('Invalid was price');

    const { data, error } = await supabase
      .from('prices')
      .insert({
        strain_id: strainId,
        now_price: nowPrice,
        was_price: wasPrice ?? null,
        internal_grower_id: crypto.randomUUID(), // Invisible to UI, random for each entry
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      strainId: data.strain_id,
      nowPrice: data.now_price,
      wasPrice: data.was_price ?? null,
      createdAt: data.created_at,
    };
  }

  static async updatePricePoint(id: string, nowPrice: number, wasPrice?: number | null): Promise<PricePoint> {
    if (!VALID_PRICES.includes(nowPrice)) throw new Error('Invalid price');
    if (wasPrice && !VALID_PRICES.includes(wasPrice)) throw new Error('Invalid was price');
    const { data, error } = await supabase
      .from('prices')
      .update({
        now_price: nowPrice,
        was_price: wasPrice ?? null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      strainId: data.strain_id,
      nowPrice: data.now_price,
      wasPrice: data.was_price ?? null,
      createdAt: data.created_at,
    };
  }

  static async deletePricePoint(id: string): Promise<void> {
    const { error } = await supabase
      .from('prices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async batchSetPrices(strainIds: string[], nowPrice: number, wasPrice?: number): Promise<void> {
    for (const strainId of strainIds) {
      await PriceService.addPricePoint(strainId, nowPrice, wasPrice ?? null);
    }
  }

  static async deleteAllForStrain(strainId: string): Promise<void> {
    const { error } = await supabase
      .from('prices')
      .delete()
      .eq('strain_id', strainId);
    if (error) throw error;
  }
}

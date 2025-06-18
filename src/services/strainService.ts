
import { supabase } from '@/integrations/supabase/client';
import { DatabaseScan } from '@/types/strain';

export class StrainService {
  static async getAllStrains(): Promise<DatabaseScan[]> {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('scanned_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DatabaseScan[];
  }

  static async getUserStrains(userId: string): Promise<DatabaseScan[]> {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DatabaseScan[];
  }

  static async createStrain(strainData: Omit<DatabaseScan, 'id' | 'created_at'>): Promise<DatabaseScan> {
    const { data, error } = await supabase
      .from('scans')
      .insert(strainData)
      .select()
      .single();

    if (error) throw error;
    return data as DatabaseScan;
  }

  static async updateStockStatus(strainId: string, userId: string, inStock: boolean): Promise<void> {
    const { error } = await supabase
      .from('scans')
      .update({ in_stock: inStock })
      .eq('id', strainId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async batchUpdateStock(strainIds: string[], userId: string, inStock: boolean): Promise<void> {
    const { error } = await supabase
      .from('scans')
      .update({ in_stock: inStock })
      .in('id', strainIds)
      .eq('user_id', userId);

    if (error) throw error;
  }
}


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
    // Convert the data to match Supabase's expected format
    const supabaseData = {
      user_id: strainData.user_id,
      strain_name: strainData.strain_name,
      strain_type: strainData.strain_type,
      thc: strainData.thc,
      cbd: strainData.cbd,
      effects: strainData.effects as any, // Cast to Json type expected by Supabase
      flavors: strainData.flavors as any, // Cast to Json type expected by Supabase
      terpenes: strainData.terpenes,
      medical_uses: strainData.medical_uses,
      description: strainData.description,
      confidence: strainData.confidence,
      scanned_at: strainData.scanned_at,
      in_stock: strainData.in_stock
    };

    const { data, error } = await supabase
      .from('scans')
      .insert(supabaseData)
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

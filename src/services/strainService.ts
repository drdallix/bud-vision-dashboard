
import { supabase } from '@/integrations/supabase/client';
import { DatabaseScan } from '@/types/strain';

export class StrainService {
  static async getAllStrains(): Promise<DatabaseScan[]> {
    console.log('StrainService: Fetching all strains');
    
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(100); // Add limit to prevent memory issues

      if (error) {
        console.error('StrainService: Error fetching all strains:', error);
        throw error;
      }
      
      console.log('StrainService: Successfully fetched', data?.length || 0, 'strains');
      return data || [];
    } catch (fetchError) {
      console.error('StrainService: Database fetch failed:', fetchError);
      throw fetchError;
    }
  }

  static async getUserStrains(userId: string): Promise<DatabaseScan[]> {
    console.log('StrainService: Fetching strains for user:', userId);
    
    if (!userId) {
      console.log('StrainService: No userId provided, returning empty array');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('scanned_at', { ascending: false })
        .limit(50); // Add limit to prevent memory issues

      if (error) {
        console.error('StrainService: Error fetching user strains:', error);
        throw error;
      }
      
      console.log('StrainService: Successfully fetched', data?.length || 0, 'user strains');
      return data || [];
    } catch (fetchError) {
      console.error('StrainService: User strains fetch failed:', fetchError);
      throw fetchError;
    }
  }

  static async createStrain(strainData: Omit<DatabaseScan, 'id' | 'created_at'>): Promise<DatabaseScan> {
    console.log('StrainService: Creating strain:', strainData.strain_name);
    
    try {
      const { data, error } = await supabase
        .from('scans')
        .insert(strainData)
        .select()
        .single();

      if (error) {
        console.error('StrainService: Error creating strain:', error);
        throw error;
      }
      
      console.log('StrainService: Successfully created strain:', data.strain_name);
      return data;
    } catch (createError) {
      console.error('StrainService: Strain creation failed:', createError);
      throw createError;
    }
  }

  static async updateStockStatus(strainId: string, userId: string, inStock: boolean): Promise<void> {
    console.log('StrainService: Updating stock status:', strainId, 'to', inStock);
    
    try {
      const { error } = await supabase
        .from('scans')
        .update({ in_stock: inStock })
        .eq('id', strainId)
        .eq('user_id', userId);

      if (error) {
        console.error('StrainService: Error updating stock status:', error);
        throw error;
      }
      
      console.log('StrainService: Successfully updated stock status');
    } catch (updateError) {
      console.error('StrainService: Stock update failed:', updateError);
      throw updateError;
    }
  }

  static async batchUpdateStock(strainIds: string[], userId: string, inStock: boolean): Promise<void> {
    console.log('StrainService: Batch updating stock for', strainIds.length, 'strains');
    
    if (strainIds.length === 0) {
      console.log('StrainService: No strain IDs provided for batch update');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('scans')
        .update({ in_stock: inStock })
        .in('id', strainIds)
        .eq('user_id', userId);

      if (error) {
        console.error('StrainService: Error in batch stock update:', error);
        throw error;
      }
      
      console.log('StrainService: Successfully batch updated stock status');
    } catch (batchError) {
      console.error('StrainService: Batch stock update failed:', batchError);
      throw batchError;
    }
  }
}

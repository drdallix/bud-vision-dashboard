
import { Strain } from '@/types/strain';
import { StrainService } from '@/services/strainService';

export class InventoryManager {
  /**
   * Update stock status for a single strain
   */
  static async updateStockStatus(
    strainId: string, 
    userId: string, 
    inStock: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await StrainService.updateStockStatus(strainId, userId, inStock);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Batch update stock status for multiple strains
   */
  static async batchUpdateStock(
    strainIds: string[], 
    userId: string, 
    inStock: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await StrainService.batchUpdateStock(strainIds, userId, inStock);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get stock statistics for strains
   */
  static getStockStats(strains: Strain[]): {
    total: number;
    inStock: number;
    outOfStock: number;
    stockPercentage: number;
  } {
    const total = strains.length;
    const inStock = strains.filter(s => s.inStock).length;
    const outOfStock = total - inStock;
    const stockPercentage = total > 0 ? Math.round((inStock / total) * 100) : 0;

    return { total, inStock, outOfStock, stockPercentage };
  }

  /**
   * Filter strains by stock status
   */
  static filterByStock(strains: Strain[], stockFilter: 'all' | 'in-stock' | 'out-of-stock'): Strain[] {
    switch (stockFilter) {
      case 'in-stock':
        return strains.filter(s => s.inStock);
      case 'out-of-stock':
        return strains.filter(s => !s.inStock);
      default:
        return strains;
    }
  }
}


import { Strain } from '@/types/strain';
import { supabase } from '@/integrations/supabase/client';

interface CachedScan extends Strain {
  syncStatus: 'pending' | 'synced' | 'failed';
  attempts: number;
  lastAttempt?: string;
}

export class CacheService {
  private static readonly CACHE_KEY = 'cachedScans';
  private static readonly MAX_RETRY_ATTEMPTS = 3;

  static saveScanToCache(scan: Strain, syncStatus: 'pending' | 'synced' | 'failed' = 'pending'): void {
    try {
      const cachedScans = this.getCachedScans();
      const cachedScan: CachedScan = {
        ...scan,
        syncStatus,
        attempts: 0
      };
      cachedScans.push(cachedScan);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedScans));
      console.log('Scan saved to local cache:', scan.name);
    } catch (error) {
      console.error('Failed to save scan to cache:', error);
    }
  }

  static getCachedScans(): CachedScan[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached scans:', error);
      return [];
    }
  }

  static updateCachedScanStatus(scanId: string, status: 'synced' | 'failed', attempts?: number): void {
    try {
      const cachedScans = this.getCachedScans();
      const scanIndex = cachedScans.findIndex(scan => scan.id === scanId);
      if (scanIndex !== -1) {
        cachedScans[scanIndex].syncStatus = status;
        cachedScans[scanIndex].lastAttempt = new Date().toISOString();
        if (attempts !== undefined) {
          cachedScans[scanIndex].attempts = attempts;
        }
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedScans));
      }
    } catch (error) {
      console.error('Failed to update cached scan status:', error);
    }
  }

  static async syncPendingScans(userId: string): Promise<{ synced: number; failed: number }> {
    if (!userId) return { synced: 0, failed: 0 };

    const cachedScans = this.getCachedScans();
    const pendingScans = cachedScans.filter(scan => 
      (scan.syncStatus === 'pending' || scan.syncStatus === 'failed') &&
      scan.attempts < this.MAX_RETRY_ATTEMPTS
    );

    let syncedCount = 0;
    let failedCount = 0;

    for (const scan of pendingScans) {
      try {
        await this.saveToDatabase(scan, userId);
        this.updateCachedScanStatus(scan.id, 'synced');
        syncedCount++;
        console.log('Successfully synced cached scan:', scan.name);
      } catch (error) {
        console.error('Failed to sync cached scan:', scan.name, error);
        this.updateCachedScanStatus(scan.id, 'failed', (scan.attempts || 0) + 1);
        failedCount++;
      }
    }

    return { synced: syncedCount, failed: failedCount };
  }

  static async saveToDatabase(strain: Strain, userId: string): Promise<void> {
    // Convert terpenes to JSON-compatible format
    const terpenes = strain.terpenes && strain.terpenes.length > 0 
      ? JSON.stringify(strain.terpenes) 
      : null;

    const { error } = await supabase.from('scans').insert({
      user_id: userId,
      strain_name: strain.name,
      strain_type: strain.type,
      thc: strain.thc,
      cbd: 0, // Default CBD value since new Strain type doesn't have it
      effects: strain.effectProfiles?.map(p => p.name) || [],
      flavors: strain.flavorProfiles?.map(p => p.name) || [],
      terpenes: terpenes, // Now properly converted to JSON string
      medical_uses: [], // Default empty array since new Strain type doesn't have medicalUses
      description: strain.description,
      confidence: strain.confidence,
      scanned_at: strain.scannedAt,
      in_stock: true
    });

    if (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }
  }

  static getPendingScanCount(): number {
    const cachedScans = this.getCachedScans();
    return cachedScans.filter(scan => scan.syncStatus === 'pending' || scan.syncStatus === 'failed').length;
  }

  static clearSyncedScans(): void {
    try {
      const cachedScans = this.getCachedScans();
      const pendingScans = cachedScans.filter(scan => scan.syncStatus !== 'synced');
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(pendingScans));
    } catch (error) {
      console.error('Failed to clear synced scans:', error);
    }
  }

  static clearAllCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}

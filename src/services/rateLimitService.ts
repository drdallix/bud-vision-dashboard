
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private limits = new Map<string, RateLimitEntry>();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS = 10; // 10 requests per 15 minutes for unauthenticated

  private getClientKey(): string {
    // Use combination of IP-like identifier and user agent
    const userAgent = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    return btoa(`${userAgent}-${screen}`).slice(0, 32);
  }

  checkLimit(): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getClientKey();
    const now = Date.now();
    
    let entry = this.limits.get(key);
    
    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.limits.delete(key);
      entry = undefined;
    }
    
    if (!entry) {
      entry = {
        count: 1,
        resetTime: now + this.WINDOW_MS
      };
      this.limits.set(key, entry);
      return { allowed: true, remaining: this.MAX_REQUESTS - 1, resetTime: entry.resetTime };
    }
    
    if (entry.count >= this.MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }
    
    entry.count++;
    this.limits.set(key, entry);
    
    return { 
      allowed: true, 
      remaining: this.MAX_REQUESTS - entry.count, 
      resetTime: entry.resetTime 
    };
  }

  getRemainingTime(resetTime: number): string {
    const remaining = Math.ceil((resetTime - Date.now()) / 1000 / 60);
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
  }
}

export const rateLimitService = new RateLimitService();


interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private limits = new Map<string, RateLimitEntry>();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS = 10; // 10 requests per 15 minutes for unauthenticated
  private readonly ANON_MAX_REQUESTS = 3; // 3 requests per 15 minutes for anonymous users

  private getClientKey(): string {
    // Use combination of IP-like identifier and user agent
    const userAgent = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    return btoa(`${userAgent}-${screen}`).slice(0, 32);
  }

  checkLimit(isAnonymous: boolean = false): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getClientKey();
    const now = Date.now();
    const maxRequests = isAnonymous ? this.ANON_MAX_REQUESTS : this.MAX_REQUESTS;
    
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
      return { allowed: true, remaining: maxRequests - 1, resetTime: entry.resetTime };
    }
    
    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }
    
    entry.count++;
    this.limits.set(key, entry);
    
    return { 
      allowed: true, 
      remaining: maxRequests - entry.count, 
      resetTime: entry.resetTime 
    };
  }

  getRemainingTime(resetTime: number): string {
    const remaining = Math.ceil((resetTime - Date.now()) / 1000 / 60);
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
  }
}

export const rateLimitService = new RateLimitService();

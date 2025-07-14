import { Strain } from '@/types/strain';

export interface ScanSession {
  id: string;
  scans: Strain[];
  startTime: Date;
  lastScanTime: Date;
  isActive: boolean;
}

export interface CameraStabilityMetrics {
  isStable: boolean;
  shakeLevel: number;
  recommendation: string;
}

class RealtimeScanManager {
  private currentSession: ScanSession | null = null;
  private stabilityHistory: number[] = [];
  private lastFrameData: ImageData | null = null;
  
  startSession(): ScanSession {
    this.currentSession = {
      id: `session_${Date.now()}`,
      scans: [],
      startTime: new Date(),
      lastScanTime: new Date(),
      isActive: true
    };
    
    console.log('Started new scan session:', this.currentSession.id);
    return this.currentSession;
  }
  
  addScanToSession(strain: Strain): void {
    if (!this.currentSession || !this.currentSession.isActive) {
      throw new Error('No active session');
    }
    
    // Check for duplicates in current session
    const isDuplicate = this.currentSession.scans.some(s => 
      s.name.toLowerCase() === strain.name.toLowerCase()
    );
    
    if (!isDuplicate) {
      this.currentSession.scans.push(strain);
      this.currentSession.lastScanTime = new Date();
      console.log(`Added strain to session: ${strain.name}`);
    } else {
      console.log(`Strain already in session: ${strain.name}`);
    }
  }
  
  endSession(): ScanSession | null {
    if (!this.currentSession) return null;
    
    this.currentSession.isActive = false;
    const completedSession = { ...this.currentSession };
    this.currentSession = null;
    
    console.log('Ended scan session:', completedSession.id, 'Total scans:', completedSession.scans.length);
    return completedSession;
  }
  
  getCurrentSession(): ScanSession | null {
    return this.currentSession;
  }
  
  getSessionScans(): Strain[] {
    return this.currentSession?.scans || [];
  }
  
  assessCameraStability(canvas: HTMLCanvasElement, video: HTMLVideoElement): CameraStabilityMetrics {
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let shakeLevel = 0;
    
    if (this.lastFrameData) {
      // Calculate frame difference
      let totalDiff = 0;
      const pixels = currentFrameData.data.length;
      
      for (let i = 0; i < pixels; i += 4) {
        const rDiff = Math.abs(currentFrameData.data[i] - this.lastFrameData.data[i]);
        const gDiff = Math.abs(currentFrameData.data[i + 1] - this.lastFrameData.data[i + 1]);
        const bDiff = Math.abs(currentFrameData.data[i + 2] - this.lastFrameData.data[i + 2]);
        totalDiff += (rDiff + gDiff + bDiff) / 3;
      }
      
      shakeLevel = totalDiff / (pixels / 4);
    }
    
    // Keep history of stability
    this.stabilityHistory.push(shakeLevel);
    if (this.stabilityHistory.length > 10) {
      this.stabilityHistory.shift();
    }
    
    // Calculate average shake
    const avgShake = this.stabilityHistory.reduce((a, b) => a + b, 0) / this.stabilityHistory.length;
    
    this.lastFrameData = currentFrameData;
    
    // Determine stability
    const isStable = avgShake < 15; // Threshold for stability
    let recommendation = '';
    
    if (avgShake > 30) {
      recommendation = '📱 Hold device steady for better scanning';
    } else if (avgShake > 20) {
      recommendation = '🎯 Try to minimize camera movement';
    } else if (avgShake < 10) {
      recommendation = '✅ Camera stable - perfect for scanning';
    } else {
      recommendation = '👍 Good stability - continue scanning';
    }
    
    return {
      isStable,
      shakeLevel: avgShake,
      recommendation
    };
  }
  
  shouldScan(): boolean {
    if (!this.currentSession || !this.currentSession.isActive) return false;
    
    const timeSinceLastScan = Date.now() - this.currentSession.lastScanTime.getTime();
    return timeSinceLastScan >= 3000; // 3 seconds between scans
  }
  
  getSessionStats(): { count: number; duration: string; isActive: boolean } {
    if (!this.currentSession) {
      return { count: 0, duration: '0m', isActive: false };
    }
    
    const duration = Date.now() - this.currentSession.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return {
      count: this.currentSession.scans.length,
      duration: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`,
      isActive: this.currentSession.isActive
    };
  }
}

export const realtimeScanManager = new RealtimeScanManager();


import { Strain } from '@/types/strain';

export interface ShowcaseState {
  currentIndex: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  autoAdvanceInterval: number; // milliseconds
}

export interface ShowcaseSettings {
  autoAdvance: boolean;
  interval: number;
  showEffects: boolean;
  showFlavors: boolean;
  showTerpenes: boolean;
  showDescription: boolean;
}

export class ShowcaseController {
  /**
   * Navigate to next strain
   */
  static goToNext(
    state: ShowcaseState, 
    totalStrains: number
  ): ShowcaseState {
    return {
      ...state,
      currentIndex: (state.currentIndex + 1) % totalStrains
    };
  }

  /**
   * Navigate to previous strain
   */
  static goToPrevious(
    state: ShowcaseState, 
    totalStrains: number
  ): ShowcaseState {
    return {
      ...state,
      currentIndex: state.currentIndex === 0 ? totalStrains - 1 : state.currentIndex - 1
    };
  }

  /**
   * Go to specific strain by index
   */
  static goToIndex(
    state: ShowcaseState, 
    index: number, 
    totalStrains: number
  ): ShowcaseState {
    if (index < 0 || index >= totalStrains) {
      return state;
    }

    return {
      ...state,
      currentIndex: index
    };
  }

  /**
   * Toggle playback
   */
  static togglePlayback(state: ShowcaseState): ShowcaseState {
    return {
      ...state,
      isPlaying: !state.isPlaying
    };
  }

  /**
   * Toggle fullscreen
   */
  static toggleFullscreen(state: ShowcaseState): ShowcaseState {
    return {
      ...state,
      isFullscreen: !state.isFullscreen
    };
  }

  /**
   * Set auto-advance interval
   */
  static setInterval(
    state: ShowcaseState, 
    interval: number
  ): ShowcaseState {
    return {
      ...state,
      autoAdvanceInterval: Math.max(1000, interval) // Minimum 1 second
    };
  }

  /**
   * Get current strain
   */
  static getCurrentStrain(
    strains: Strain[], 
    currentIndex: number
  ): Strain | null {
    if (currentIndex < 0 || currentIndex >= strains.length) {
      return null;
    }
    return strains[currentIndex];
  }

  /**
   * Calculate progress percentage
   */
  static getProgress(
    currentIndex: number, 
    totalStrains: number
  ): number {
    if (totalStrains === 0) return 0;
    return ((currentIndex + 1) / totalStrains) * 100;
  }

  /**
   * Get showcase statistics
   */
  static getShowcaseStats(strains: Strain[]): {
    total: number;
    inStock: number;
    types: Record<string, number>;
    avgThc: number;
  } {
    const total = strains.length;
    const inStock = strains.filter(s => s.inStock).length;
    
    // Count by type
    const types = strains.reduce((acc, strain) => {
      acc[strain.type] = (acc[strain.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average THC
    const avgThc = total > 0 
      ? strains.reduce((sum, strain) => sum + strain.thc, 0) / total 
      : 0;

    return { total, inStock, types, avgThc };
  }
}

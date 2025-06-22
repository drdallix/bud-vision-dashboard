
import { PrintConfig, defaultPrintConfig, OutputMode } from '@/types/printConfig';
import { Strain } from '@/types/strain';

export class PrintConfigManager {
  /**
   * Get default configuration
   */
  static getDefaultConfig(): PrintConfig {
    return { ...defaultPrintConfig };
  }

  /**
   * Validate print configuration
   */
  static validateConfig(config: PrintConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (config.menuColumns < 1 || config.menuColumns > 3) {
      errors.push('Menu columns must be between 1 and 3');
    }

    if (config.menuWidth === 'custom' && config.customWidth < 20) {
      errors.push('Custom width must be at least 20 characters');
    }

    if (!config.menuTitle.trim()) {
      errors.push('Menu title cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate filename from template
   */
  static generateFilename(
    template: string, 
    strainName: string, 
    mode: OutputMode
  ): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const extension = mode === 'json' ? '.json' : '.txt';
    
    return template
      .replace('{StrainName}', strainName.replace(/[^a-z0-9]/gi, '_'))
      .replace('{Date}', date)
      .replace('{Time}', time) + extension;
  }

  /**
   * Calculate estimated output size
   */
  static estimateOutputSize(
    strains: Strain[], 
    config: PrintConfig
  ): {
    characterCount: number;
    lineCount: number;
    estimatedFileSize: string;
  } {
    // Rough estimation based on config
    let charsPerStrain = 50; // Base
    
    if (config.includeDescription) charsPerStrain += 100;
    if (config.includeEffects) charsPerStrain += 30;
    if (config.includeFlavors) charsPerStrain += 30;
    if (config.includeTerpenes) charsPerStrain += 40;
    if (config.includeThc) charsPerStrain += 15;
    
    const characterCount = strains.length * charsPerStrain;
    const lineCount = strains.length * (config.compactMode ? 3 : 6);
    const bytes = characterCount;
    
    let estimatedFileSize: string;
    if (bytes < 1024) {
      estimatedFileSize = `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      estimatedFileSize = `${Math.round(bytes / 1024)} KB`;
    } else {
      estimatedFileSize = `${Math.round(bytes / (1024 * 1024))} MB`;
    }

    return { characterCount, lineCount, estimatedFileSize };
  }

  /**
   * Get preset configurations
   */
  static getPresets(): Record<string, Partial<PrintConfig>> {
    return {
      'mobile-friendly': {
        menuColumns: 1,
        menuWidth: 'narrow',
        compactMode: true,
        includeDescription: false,
        includeTerpenes: false
      },
      'desktop-detailed': {
        menuColumns: 2,
        menuWidth: 'wide',
        compactMode: false,
        includeDescription: true,
        includeTerpenes: true
      },
      'print-optimized': {
        menuColumns: 3,
        menuWidth: 'standard',
        compactMode: true,
        includeDescription: false,
        theme: 'light'
      },
      'social-media': {
        menuColumns: 1,
        menuWidth: 'narrow',
        compactMode: true,
        includeThc: true,
        includeEffects: true,
        includeFlavors: false
      }
    };
  }

  /**
   * Apply preset to configuration
   */
  static applyPreset(
    currentConfig: PrintConfig, 
    presetName: string
  ): PrintConfig {
    const presets = this.getPresets();
    const preset = presets[presetName];
    
    if (!preset) {
      return currentConfig;
    }

    return { ...currentConfig, ...preset };
  }
}

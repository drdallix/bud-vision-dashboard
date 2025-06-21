
export interface PrintConfig {
  // Default actions
  defaultCopyMode: OutputMode;
  defaultExportMode: OutputMode;
  
  // Content inclusion settings
  includeThc: boolean;
  includeEffects: boolean;
  includeFlavors: boolean;
  includeTerpenes: boolean;
  includeDescription: boolean;
  includePricing: boolean;
  includeStockStatus: boolean;
  includeScannedDate: boolean;
  includeConfidence: boolean;
  
  // Menu configuration
  menuTitle: string;
  menuColumns: 1 | 2 | 3;
  menuWidth: 'narrow' | 'standard' | 'wide' | 'custom';
  customWidth: number; // in characters
  groupBy: 'price' | 'type' | 'none';
  sortBy: 'alphabetical' | 'price-low' | 'price-high' | 'thc' | 'recent';
  menuFooter: string;
  showHeader: boolean;
  showFooter: boolean;
  
  // Styling
  asciiTableStyle: 'simple' | 'bordered' | 'double' | 'minimal';
  theme: 'light' | 'dark' | 'colorful';
  compactMode: boolean;
  
  // Export settings
  defaultFilename: string;
  includeTimestamp: boolean;
}

export type OutputMode = 'ascii-table' | 'plain-text' | 'social-media' | 'full-menu' | 'json' | 'csv';

export const defaultPrintConfig: PrintConfig = {
  defaultCopyMode: 'ascii-table',
  defaultExportMode: 'plain-text',
  includeThc: true,
  includeEffects: true,
  includeFlavors: true,
  includeTerpenes: false,
  includeDescription: true,
  includePricing: true,
  includeStockStatus: true,
  includeScannedDate: false,
  includeConfidence: false,
  menuTitle: "Today's Cannabis Menu",
  menuColumns: 1,
  menuWidth: 'narrow',
  customWidth: 60,
  groupBy: 'price',
  sortBy: 'price-low',
  menuFooter: 'All prices are per ounce. Taxes not included.',
  showHeader: true,
  showFooter: true,
  asciiTableStyle: 'bordered',
  theme: 'light',
  compactMode: false,
  defaultFilename: '{StrainName}-{Date}',
  includeTimestamp: true
};

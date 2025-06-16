
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
  
  // Menu configuration
  menuTitle: string;
  menuColumns: 2 | 3;
  groupBy: 'price' | 'type';
  sortBy: 'alphabetical' | 'price-low' | 'price-high';
  menuFooter: string;
  
  // Styling
  asciiTableStyle: 'simple' | 'bordered' | 'double';
  theme: 'light' | 'dark';
  
  // Export settings
  defaultFilename: string;
}

export type OutputMode = 'ascii-table' | 'plain-text' | 'social-media' | 'full-menu' | 'json';

export const defaultPrintConfig: PrintConfig = {
  defaultCopyMode: 'ascii-table',
  defaultExportMode: 'plain-text',
  includeThc: true,
  includeEffects: true,
  includeFlavors: true,
  includeTerpenes: false,
  includeDescription: true,
  includePricing: true,
  menuTitle: "Today's Cannabis Menu",
  menuColumns: 2,
  groupBy: 'price',
  sortBy: 'price-low',
  menuFooter: 'All prices are per ounce. Taxes not included.',
  asciiTableStyle: 'bordered',
  theme: 'light',
  defaultFilename: '{StrainName}-{Date}'
};

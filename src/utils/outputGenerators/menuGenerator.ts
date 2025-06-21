
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/types/printConfig';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

// Menu width presets - easy to edit
const MENU_WIDTHS = {
  narrow: 34,    // Mobile-friendly, very compact
  standard: 60,  // Balanced for most uses
  wide: 80,      // Wider for desktop
} as const;

export const generateFullMenu = (strains: Strain[], config: PrintConfig): string => {
  const inStockStrains = strains.filter(s => s.inStock);
  
  if (inStockStrains.length === 0) {
    return 'No strains currently in stock.';
  }
  
  // Sort strains
  let sortedStrains = [...inStockStrains];
  switch (config.sortBy) {
    case 'alphabetical':
      sortedStrains.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'price-low':
      sortedStrains.sort((a, b) => {
        const [aMin] = getDeterministicTHCRange(a.name);
        const [bMin] = getDeterministicTHCRange(b.name);
        return aMin - bMin;
      });
      break;
    case 'price-high':
      sortedStrains.sort((a, b) => {
        const [aMin] = getDeterministicTHCRange(a.name);
        const [bMin] = getDeterministicTHCRange(b.name);
        return bMin - aMin;
      });
      break;
    case 'thc':
      sortedStrains.sort((a, b) => b.thc - a.thc);
      break;
    case 'recent':
      sortedStrains.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
      break;
  }
  
  const lines: string[] = [];
  const pageWidth = getMenuWidth(config);
  const colWidth = Math.floor(pageWidth / config.menuColumns) - 2;
  
  // Header
  if (config.showHeader) {
    lines.push('='.repeat(pageWidth));
    lines.push(centerText(config.menuTitle, pageWidth));
    if (config.includeTimestamp) {
      lines.push(centerText(`Generated: ${new Date().toLocaleString()}`, pageWidth));
    }
    lines.push('='.repeat(pageWidth));
    lines.push('');
  }
  
  // Group strains
  const groups = config.groupBy === 'none' ? { 'All Strains': sortedStrains } : groupStrains(sortedStrains, config.groupBy);
  
  Object.entries(groups).forEach(([groupName, groupStrains]) => {
    // Group header
    if (config.groupBy !== 'none') {
      lines.push(centerText(`--- ${groupName} ---`, pageWidth));
      lines.push('');
    }
    
    // Format strains in columns
    for (let i = 0; i < groupStrains.length; i += config.menuColumns) {
      const rowStrains = groupStrains.slice(i, i + config.menuColumns);
      const maxLines = Math.max(...rowStrains.map(s => formatStrainForMenu(s, config, colWidth).length));
      
      for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
        const lineParts: string[] = [];
        rowStrains.forEach(strain => {
          const strainLines = formatStrainForMenu(strain, config, colWidth);
          const line = strainLines[lineIndex] || '';
          lineParts.push(line.padEnd(colWidth));
        });
        lines.push(lineParts.join('  '));
      }
      
      if (!config.compactMode) {
        lines.push(''); // Space between rows
      }
    }
    
    if (config.groupBy !== 'none') {
      lines.push('-'.repeat(pageWidth));
      lines.push('');
    }
  });
  
  // Footer
  if (config.showFooter) {
    lines.push(centerText(config.menuFooter, pageWidth));
    lines.push('='.repeat(pageWidth));
  }
  
  return lines.join('\n');
};

const getMenuWidth = (config: PrintConfig): number => {
  switch (config.menuWidth) {
    case 'narrow': return MENU_WIDTHS.narrow;
    case 'standard': return MENU_WIDTHS.standard;
    case 'wide': return MENU_WIDTHS.wide;
    case 'custom': return config.customWidth;
    default: return MENU_WIDTHS.standard;
  }
};

const centerText = (text: string, width: number): string => {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
};

const groupStrains = (strains: Strain[], groupBy: 'price' | 'type'): Record<string, Strain[]> => {
  if (groupBy === 'type') {
    return strains.reduce((groups, strain) => {
      const key = strain.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(strain);
      return groups;
    }, {} as Record<string, Strain[]>);
  }
  
  // Group by price tier (using THC as proxy)
  return strains.reduce((groups, strain) => {
    const [minThc] = getDeterministicTHCRange(strain.name);
    let tier: string;
    if (minThc < 15) tier = 'Budget Tier';
    else if (minThc < 20) tier = 'Mid Tier';
    else if (minThc < 25) tier = 'Premium Tier';
    else tier = 'Top Shelf';
    
    if (!groups[tier]) groups[tier] = [];
    groups[tier].push(strain);
    return groups;
  }, {} as Record<string, Strain[]>);
};

const formatStrainForMenu = (strain: Strain, config: PrintConfig, width: number): string[] => {
  const lines: string[] = [];
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  
  // Strain name
  lines.push(strain.name.substring(0, width));
  
  // Type and THC
  if (config.includeThc) {
    const typeInfo = `${strain.type} | ${minThc}-${maxThc}%`;
    lines.push(typeInfo.substring(0, width));
  } else {
    lines.push(strain.type.substring(0, width));
  }
  
  // Stock status
  if (config.includeStockStatus) {
    lines.push(`Stock: ${strain.inStock ? 'Available' : 'Out of Stock'}`.substring(0, width));
  }
  
  // Top effect
  if (config.includeEffects && strain.effectProfiles?.length) {
    const topEffect = strain.effectProfiles
      .sort((a, b) => b.intensity - a.intensity)[0];
    lines.push(`${topEffect.emoji} ${topEffect.name}`.substring(0, width));
  }
  
  // Top flavor
  if (config.includeFlavors && strain.flavorProfiles?.length) {
    const topFlavor = strain.flavorProfiles
      .sort((a, b) => b.intensity - a.intensity)[0];
    lines.push(`${topFlavor.emoji} ${topFlavor.name}`.substring(0, width));
  }
  
  // Description snippet
  if (config.includeDescription && strain.description && !config.compactMode) {
    const snippet = strain.description.length > width - 10 
      ? strain.description.substring(0, width - 13) + '...'
      : strain.description;
    lines.push(snippet.substring(0, width));
  }
  
  // Scanned date
  if (config.includeScannedDate) {
    const date = new Date(strain.scannedAt).toLocaleDateString();
    lines.push(`Scanned: ${date}`.substring(0, width));
  }
  
  return lines;
};

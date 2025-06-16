
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/components/PrintSettings';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';
import { getStrainUrl } from '@/utils/urlUtils';

export const generateStrainText = (strain: Strain, config: PrintConfig): string => {
  const lines: string[] = [];
  const width = config.receiptWidth;
  
  // Helper function to center text
  const centerText = (text: string): string => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };
  
  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    if (text.length <= maxWidth) return [text];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  // Header
  const emoji = config.showEmojis && strain.emoji ? strain.emoji + ' ' : '';
  const header = `${emoji}${strain.name}`;
  lines.push(centerText(header));
  lines.push('='.repeat(width));
  
  // Type and THC
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  const typeInfo = `${strain.type} | THC: ${minThc}-${maxThc}%`;
  lines.push(centerText(typeInfo));
  
  if (strain.cbd && strain.cbd > 0) {
    lines.push(centerText(`CBD: ${strain.cbd}%`));
  }
  
  lines.push('-'.repeat(width));
  
  // Description
  if (config.includeDescription && strain.description) {
    if (!config.compactMode) lines.push('DESCRIPTION:');
    const descLines = wrapText(strain.description, width);
    lines.push(...descLines);
    lines.push('');
  }
  
  // Effects
  if (config.includeEffects && strain.effectProfiles?.length) {
    const effectsTitle = config.compactMode ? 'Effects:' : 'EFFECTS:';
    lines.push(effectsTitle);
    const effects = strain.effectProfiles.map(e => e.name).join(', ');
    const effectLines = wrapText(effects, width);
    lines.push(...effectLines);
    lines.push('');
  }
  
  // Flavors
  if (config.includeFlavors && strain.flavorProfiles?.length) {
    const flavorsTitle = config.compactMode ? 'Flavors:' : 'FLAVORS:';
    lines.push(flavorsTitle);
    const flavors = strain.flavorProfiles.map(f => f.name).join(', ');
    const flavorLines = wrapText(flavors, width);
    lines.push(...flavorLines);
    lines.push('');
  }
  
  // Terpenes
  if (config.includeTerpenes && strain.terpenes?.length) {
    const terpenesTitle = config.compactMode ? 'Terpenes:' : 'TERPENES:';
    lines.push(terpenesTitle);
    const terpenes = strain.terpenes.map(t => `${t.name} (${t.percentage}%)`).join(', ');
    const terpeneLines = wrapText(terpenes, width);
    lines.push(...terpeneLines);
    lines.push('');
  }
  
  // Stock status
  const stockStatus = strain.inStock ? '✅ IN STOCK' : '❌ OUT OF STOCK';
  lines.push(centerText(stockStatus));
  
  // QR Code placeholder (for URL)
  if (config.includeQRCode) {
    lines.push('');
    lines.push(centerText('QR CODE:'));
    lines.push(centerText(getStrainUrl(strain.name)));
  }
  
  // Footer
  lines.push('='.repeat(width));
  lines.push(centerText('DoobieDB Strain Info'));
  
  return lines.join('\n');
};

export const generateBulkText = (strains: Strain[], config: PrintConfig): string => {
  const sections: string[] = [];
  
  // Header
  sections.push('='.repeat(config.receiptWidth));
  sections.push(' '.repeat(Math.floor((config.receiptWidth - 15) / 2)) + 'STRAIN CATALOG');
  sections.push('='.repeat(config.receiptWidth));
  sections.push('');
  
  // Summary
  const inStock = strains.filter(s => s.inStock).length;
  const outOfStock = strains.length - inStock;
  sections.push(`Total Strains: ${strains.length}`);
  sections.push(`In Stock: ${inStock} | Out of Stock: ${outOfStock}`);
  sections.push('');
  
  // Individual strains
  strains.forEach((strain, index) => {
    if (index > 0) sections.push('\n' + '-'.repeat(config.receiptWidth) + '\n');
    sections.push(generateStrainText(strain, config));
  });
  
  return sections.join('\n');
};

export const generateStrainImage = async (strain: Strain, config: PrintConfig): Promise<string> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Set canvas dimensions
  canvas.width = config.imageWidth;
  const lineHeight = config.fontSize * 1.4;
  
  // Generate text content first to calculate height
  const textContent = generateStrainText(strain, {
    ...config,
    receiptWidth: Math.floor(config.imageWidth / (config.fontSize * 0.6)) // Estimate characters per line
  });
  
  const lines = textContent.split('\n');
  canvas.height = Math.max(400, lines.length * lineHeight + 40);
  
  // Set background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set text properties
  ctx.fillStyle = config.textColor;
  ctx.font = `${config.fontSize}px monospace`;
  ctx.textBaseline = 'top';
  
  // Draw text line by line
  lines.forEach((line, index) => {
    const y = 20 + (index * lineHeight);
    
    // Center align for headers and special lines
    if (line.includes('=') || line.includes('-') || 
        line.includes('DoobieDB') || line.includes('STOCK') ||
        line === strain.name || line.includes('|')) {
      const textWidth = ctx.measureText(line).width;
      const x = (canvas.width - textWidth) / 2;
      ctx.fillText(line, x, y);
    } else {
      // Left align for content
      ctx.fillText(line, 20, y);
    }
  });
  
  // Convert to base64 data URL
  return canvas.toDataURL('image/png');
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

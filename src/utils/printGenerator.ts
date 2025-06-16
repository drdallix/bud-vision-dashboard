
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/components/PrintSettings';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';
import { getStrainUrl } from '@/utils/urlUtils';

export const generateStrainText = (strain: Strain, config: PrintConfig): string => {
  if (config.printStyle === 'showcase') {
    return generateShowcaseText(strain, config);
  }
  return generateReceiptText(strain, config);
};

const generateReceiptText = (strain: Strain, config: PrintConfig): string => {
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

const generateShowcaseText = (strain: Strain, config: PrintConfig): string => {
  const lines: string[] = [];
  const width = 50; // Fixed width for showcase format
  
  // Helper function to center text
  const centerText = (text: string): string => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };
  
  // Showcase Header
  const emoji = config.showEmojis && strain.emoji ? strain.emoji + ' ' : '';
  lines.push('┌' + '─'.repeat(width - 2) + '┐');
  lines.push('│' + centerText(`${emoji}${strain.name}`).slice(0, width - 2).padEnd(width - 2) + '│');
  lines.push('│' + centerText(`${strain.type} Strain`).slice(0, width - 2).padEnd(width - 2) + '│');
  lines.push('├' + '─'.repeat(width - 2) + '┤');
  
  // THC/CBD Info
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  lines.push('│' + ` THC: ${minThc}-${maxThc}%`.padEnd(width - 2) + '│');
  if (strain.cbd && strain.cbd > 0) {
    lines.push('│' + ` CBD: ${strain.cbd}%`.padEnd(width - 2) + '│');
  }
  lines.push('├' + '─'.repeat(width - 2) + '┤');
  
  // Effect Chart
  if (config.includeEffectChart && strain.effectProfiles?.length) {
    lines.push('│' + ' EFFECT INTENSITY CHART'.padEnd(width - 2) + '│');
    strain.effectProfiles.forEach(effect => {
      const bars = '█'.repeat(effect.intensity) + '░'.repeat(5 - effect.intensity);
      const line = ` ${effect.emoji} ${effect.name}: ${bars}`;
      lines.push('│' + line.slice(0, width - 2).padEnd(width - 2) + '│');
    });
    lines.push('├' + '─'.repeat(width - 2) + '┤');
  }
  
  // Flavor Chart
  if (config.includeFlavorChart && strain.flavorProfiles?.length) {
    lines.push('│' + ' FLAVOR PROFILE CHART'.padEnd(width - 2) + '│');
    strain.flavorProfiles.forEach(flavor => {
      const bars = '█'.repeat(flavor.intensity) + '░'.repeat(5 - flavor.intensity);
      const line = ` ${flavor.emoji} ${flavor.name}: ${bars}`;
      lines.push('│' + line.slice(0, width - 2).padEnd(width - 2) + '│');
    });
    lines.push('├' + '─'.repeat(width - 2) + '┤');
  }
  
  // Terpene Chart
  if (config.includeTerpeneChart && strain.terpenes?.length) {
    lines.push('│' + ' TERPENE CONCENTRATION'.padEnd(width - 2) + '│');
    strain.terpenes.forEach(terpene => {
      const scale = Math.min(5, Math.floor(terpene.percentage * 2.5) + 1);
      const bars = '█'.repeat(scale) + '░'.repeat(5 - scale);
      const line = ` ${terpene.name}: ${bars} ${terpene.percentage}%`;
      lines.push('│' + line.slice(0, width - 2).padEnd(width - 2) + '│');
    });
    lines.push('├' + '─'.repeat(width - 2) + '┤');
  }
  
  // Description
  if (config.includeDescription && strain.description) {
    lines.push('│' + ' DESCRIPTION'.padEnd(width - 2) + '│');
    const words = strain.description.split(' ');
    let currentLine = '';
    words.forEach(word => {
      if (currentLine.length + word.length + 1 < width - 4) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push('│' + ` ${currentLine}`.padEnd(width - 2) + '│');
        }
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push('│' + ` ${currentLine}`.padEnd(width - 2) + '│');
    }
    lines.push('├' + '─'.repeat(width - 2) + '┤');
  }
  
  // Stock status
  const stockStatus = strain.inStock ? '✅ IN STOCK' : '❌ OUT OF STOCK';
  lines.push('│' + centerText(stockStatus).slice(0, width - 2).padEnd(width - 2) + '│');
  
  // Footer
  lines.push('└' + '─'.repeat(width - 2) + '┘');
  lines.push(centerText('DoobieDB • Premium Cannabis Data'));
  
  return lines.join('\n');
};

export const generateBulkText = (strains: Strain[], config: PrintConfig): string => {
  const sections: string[] = [];
  
  // Header
  sections.push('='.repeat(config.receiptWidth || 50));
  sections.push(' '.repeat(Math.floor(((config.receiptWidth || 50) - 15) / 2)) + 'STRAIN CATALOG');
  sections.push('='.repeat(config.receiptWidth || 50));
  sections.push('');
  
  // Summary
  const inStock = strains.filter(s => s.inStock).length;
  const outOfStock = strains.length - inStock;
  sections.push(`Total Strains: ${strains.length}`);
  sections.push(`In Stock: ${inStock} | Out of Stock: ${outOfStock}`);
  sections.push('');
  
  // Individual strains
  strains.forEach((strain, index) => {
    if (index > 0) sections.push('\n' + '-'.repeat(config.receiptWidth || 50) + '\n');
    sections.push(generateStrainText(strain, config));
  });
  
  return sections.join('\n');
};

export const generateStrainImage = async (strain: Strain, config: PrintConfig): Promise<string> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Set canvas dimensions based on style
  if (config.printStyle === 'showcase') {
    return generateShowcaseImage(strain, config, canvas, ctx);
  } else {
    return generateReceiptImage(strain, config, canvas, ctx);
  }
};

const generateReceiptImage = async (strain: Strain, config: PrintConfig, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<string> => {
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

const generateShowcaseImage = async (strain: Strain, config: PrintConfig, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<string> => {
  // Set canvas dimensions for showcase (optimized for social media)
  canvas.width = Math.max(800, config.imageWidth);
  canvas.height = 1000; // Taller format for showcase
  
  // Set background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, config.backgroundColor);
  gradient.addColorStop(1, config.backgroundColor === '#ffffff' ? '#f8f9fa' : '#2a2a2a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set text properties
  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'center';
  
  let currentY = 60;
  const padding = 40;
  const centerX = canvas.width / 2;
  
  // Header
  ctx.font = 'bold 36px Arial';
  const emoji = config.showEmojis && strain.emoji ? strain.emoji + ' ' : '';
  ctx.fillText(`${emoji}${strain.name}`, centerX, currentY);
  currentY += 50;
  
  ctx.font = '24px Arial';
  ctx.fillText(`${strain.type} Strain`, centerX, currentY);
  currentY += 60;
  
  // THC/CBD
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  ctx.font = '20px Arial';
  ctx.fillText(`THC: ${minThc}-${maxThc}%`, centerX, currentY);
  if (strain.cbd && strain.cbd > 0) {
    currentY += 30;
    ctx.fillText(`CBD: ${strain.cbd}%`, centerX, currentY);
  }
  currentY += 60;
  
  // Effect Chart
  if (config.includeEffectChart && strain.effectProfiles?.length) {
    ctx.font = 'bold 18px Arial';
    ctx.fillText('EFFECT INTENSITY', centerX, currentY);
    currentY += 40;
    
    strain.effectProfiles.forEach(effect => {
      ctx.textAlign = 'left';
      ctx.font = '16px Arial';
      const textX = padding;
      ctx.fillText(`${effect.emoji} ${effect.name}`, textX, currentY);
      
      // Draw intensity bars
      const barX = textX + 200;
      const barWidth = 200;
      const barHeight = 20;
      
      // Background bar
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(barX, currentY - 15, barWidth, barHeight);
      
      // Intensity bar
      ctx.fillStyle = effect.color || '#22c55e';
      ctx.fillRect(barX, currentY - 15, (barWidth * effect.intensity) / 5, barHeight);
      
      ctx.fillStyle = config.textColor;
      currentY += 35;
    });
    
    ctx.textAlign = 'center';
    currentY += 20;
  }
  
  // Flavor Chart
  if (config.includeFlavorChart && strain.flavorProfiles?.length) {
    ctx.font = 'bold 18px Arial';
    ctx.fillText('FLAVOR PROFILE', centerX, currentY);
    currentY += 40;
    
    strain.flavorProfiles.forEach(flavor => {
      ctx.textAlign = 'left';
      ctx.font = '16px Arial';
      const textX = padding;
      ctx.fillText(`${flavor.emoji} ${flavor.name}`, textX, currentY);
      
      // Draw intensity bars
      const barX = textX + 200;
      const barWidth = 200;
      const barHeight = 20;
      
      // Background bar
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(barX, currentY - 15, barWidth, barHeight);
      
      // Intensity bar
      ctx.fillStyle = flavor.color || '#f97316';
      ctx.fillRect(barX, currentY - 15, (barWidth * flavor.intensity) / 5, barHeight);
      
      ctx.fillStyle = config.textColor;
      currentY += 35;
    });
    
    ctx.textAlign = 'center';
    currentY += 20;
  }
  
  // Terpene Chart
  if (config.includeTerpeneChart && strain.terpenes?.length) {
    ctx.font = 'bold 18px Arial';
    ctx.fillText('TERPENE CONCENTRATION', centerX, currentY);
    currentY += 40;
    
    strain.terpenes.forEach(terpene => {
      ctx.textAlign = 'left';
      ctx.font = '16px Arial';
      const textX = padding;
      ctx.fillText(`${terpene.name} (${terpene.percentage}%)`, textX, currentY);
      
      // Draw concentration bars
      const barX = textX + 200;
      const barWidth = 200;
      const barHeight = 20;
      const scale = Math.min(5, Math.floor(terpene.percentage * 2.5) + 1);
      
      // Background bar
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(barX, currentY - 15, barWidth, barHeight);
      
      // Concentration bar
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(barX, currentY - 15, (barWidth * scale) / 5, barHeight);
      
      ctx.fillStyle = config.textColor;
      currentY += 35;
    });
    
    ctx.textAlign = 'center';
    currentY += 20;
  }
  
  // Description
  if (config.includeDescription && strain.description) {
    ctx.font = 'bold 18px Arial';
    ctx.fillText('DESCRIPTION', centerX, currentY);
    currentY += 40;
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    const maxWidth = canvas.width - (padding * 2);
    const words = strain.description.split(' ');
    let line = '';
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, padding, currentY);
        line = word + ' ';
        currentY += 25;
      } else {
        line = testLine;
      }
    });
    
    if (line) {
      ctx.fillText(line, padding, currentY);
      currentY += 25;
    }
    
    ctx.textAlign = 'center';
    currentY += 40;
  }
  
  // Stock status
  ctx.font = 'bold 24px Arial';
  const stockStatus = strain.inStock ? '✅ IN STOCK' : '❌ OUT OF STOCK';
  ctx.fillText(stockStatus, centerX, currentY);
  currentY += 60;
  
  // Footer
  ctx.font = '16px Arial';
  ctx.fillStyle = config.textColor + '80'; // Semi-transparent
  ctx.fillText('DoobieDB • Premium Cannabis Data', centerX, currentY);
  
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

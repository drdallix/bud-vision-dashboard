
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/types/printConfig';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const generateAsciiTable = (strain: Strain, config: PrintConfig): string => {
  const lines: string[] = [];
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  
  // Table borders based on style
  const borders = {
    simple: { top: '-', side: '|', corner: '+' },
    bordered: { top: '═', side: '║', corner: '╬' },
    double: { top: '═', side: '║', corner: '╬' }
  };
  
  const border = borders[config.asciiTableStyle];
  const width = 60;
  
  // Header
  lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
  lines.push(border.side + ` ${strain.name}`.padEnd(width - 2) + border.side);
  lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
  
  // Basic info
  lines.push(border.side + ` Type: ${strain.type}`.padEnd(width - 2) + border.side);
  
  if (config.includeThc) {
    lines.push(border.side + ` THC: ${minThc}-${maxThc}%`.padEnd(width - 2) + border.side);
  }
  
  if (strain.cbd && strain.cbd > 0) {
    lines.push(border.side + ` CBD: ${strain.cbd}%`.padEnd(width - 2) + border.side);
  }
  
  // Effects
  if (config.includeEffects && strain.effectProfiles?.length) {
    lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
    lines.push(border.side + ' EFFECTS'.padEnd(width - 2) + border.side);
    strain.effectProfiles.forEach(effect => {
      const intensity = '★'.repeat(effect.intensity) + '☆'.repeat(5 - effect.intensity);
      const line = ` ${effect.emoji} ${effect.name}: ${intensity}`;
      lines.push(border.side + line.padEnd(width - 2) + border.side);
    });
  }
  
  // Flavors
  if (config.includeFlavors && strain.flavorProfiles?.length) {
    lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
    lines.push(border.side + ' FLAVORS'.padEnd(width - 2) + border.side);
    strain.flavorProfiles.forEach(flavor => {
      const intensity = '★'.repeat(flavor.intensity) + '☆'.repeat(5 - flavor.intensity);
      const line = ` ${flavor.emoji} ${flavor.name}: ${intensity}`;
      lines.push(border.side + line.padEnd(width - 2) + border.side);
    });
  }
  
  // Terpenes
  if (config.includeTerpenes && strain.terpenes?.length) {
    lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
    lines.push(border.side + ' TERPENES'.padEnd(width - 2) + border.side);
    strain.terpenes.forEach(terpene => {
      const line = ` ${terpene.name}: ${terpene.percentage}%`;
      lines.push(border.side + line.padEnd(width - 2) + border.side);
    });
  }
  
  // Description
  if (config.includeDescription && strain.description) {
    lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
    lines.push(border.side + ' DESCRIPTION'.padEnd(width - 2) + border.side);
    const words = strain.description.split(' ');
    let currentLine = '';
    words.forEach(word => {
      if ((currentLine + word).length < width - 5) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(border.side + ` ${currentLine}`.padEnd(width - 2) + border.side);
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push(border.side + ` ${currentLine}`.padEnd(width - 2) + border.side);
    }
  }
  
  // Footer
  lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
  const stockStatus = strain.inStock ? '✅ IN STOCK' : '❌ OUT OF STOCK';
  lines.push(border.side + ` ${stockStatus}`.padEnd(width - 2) + border.side);
  lines.push(border.corner + border.top.repeat(width - 2) + border.corner);
  
  return lines.join('\n');
};


import { Strain } from '@/types/strain';
import { PrintConfig } from '@/types/printConfig';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const generatePlainText = (strain: Strain, config: PrintConfig): string => {
  const lines: string[] = [];
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  
  // Header
  lines.push(strain.name);
  lines.push(`Type: ${strain.type}`);
  
  if (config.includeThc) {
    lines.push(`THC: ${minThc}-${maxThc}%`);
  }
  
  if (strain.cbd && strain.cbd > 0) {
    lines.push(`CBD: ${strain.cbd}%`);
  }
  
  lines.push('');
  
  // Effects
  if (config.includeEffects && strain.effectProfiles?.length) {
    lines.push('Effects:');
    strain.effectProfiles.forEach(effect => {
      lines.push(`- ${effect.name} (${effect.intensity}/5)`);
    });
    lines.push('');
  }
  
  // Flavors
  if (config.includeFlavors && strain.flavorProfiles?.length) {
    lines.push('Flavors:');
    strain.flavorProfiles.forEach(flavor => {
      lines.push(`- ${flavor.name} (${flavor.intensity}/5)`);
    });
    lines.push('');
  }
  
  // Terpenes
  if (config.includeTerpenes && strain.terpenes?.length) {
    lines.push('Terpenes:');
    strain.terpenes.forEach(terpene => {
      lines.push(`- ${terpene.name}: ${terpene.percentage}%`);
    });
    lines.push('');
  }
  
  // Description
  if (config.includeDescription && strain.description) {
    lines.push('Description:');
    lines.push(strain.description);
    lines.push('');
  }
  
  // Stock status
  const stockStatus = strain.inStock ? 'IN STOCK' : 'OUT OF STOCK';
  lines.push(`Status: ${stockStatus}`);
  
  return lines.join('\n');
};

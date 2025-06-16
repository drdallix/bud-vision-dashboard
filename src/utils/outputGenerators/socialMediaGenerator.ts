
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/types/printConfig';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const generateSocialMedia = (strain: Strain, config: PrintConfig): string => {
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  const lines: string[] = [];
  
  // Header with emoji
  const emoji = strain.emoji || '🌿';
  lines.push(`${emoji} ${strain.name} ${emoji}`);
  lines.push('');
  
  // Type and THC
  if (config.includeThc) {
    lines.push(`🧬 ${strain.type} | THC: ${minThc}-${maxThc}%`);
  } else {
    lines.push(`🧬 ${strain.type} Strain`);
  }
  
  lines.push('');
  
  // Top effects (max 3)
  if (config.includeEffects && strain.effectProfiles?.length) {
    const topEffects = strain.effectProfiles
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3)
      .map(e => `${e.emoji} ${e.name}`)
      .join(' ');
    lines.push(`Effects: ${topEffects}`);
  }
  
  // Top flavors (max 3)
  if (config.includeFlavors && strain.flavorProfiles?.length) {
    const topFlavors = strain.flavorProfiles
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3)
      .map(f => `${f.emoji} ${f.name}`)
      .join(' ');
    lines.push(`Flavors: ${topFlavors}`);
  }
  
  lines.push('');
  
  // Stock status with emoji
  const stockEmoji = strain.inStock ? '✅' : '❌';
  const stockText = strain.inStock ? 'Available Now!' : 'Currently Out of Stock';
  lines.push(`${stockEmoji} ${stockText}`);
  
  lines.push('');
  
  // Hashtags
  const hashtags = [
    '#Cannabis',
    '#DoobieDB',
    `#${strain.type}`,
    ...(strain.effectProfiles?.slice(0, 2).map(e => `#${e.name.replace(/\s+/g, '')}`) || []),
    ...(strain.flavorProfiles?.slice(0, 2).map(f => `#${f.name.replace(/\s+/g, '')}`) || [])
  ];
  
  lines.push(hashtags.join(' '));
  
  return lines.join('\n');
};

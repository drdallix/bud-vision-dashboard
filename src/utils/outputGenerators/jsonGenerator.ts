
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/types/printConfig';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const generateJson = (strain: Strain, config: PrintConfig): string => {
  const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
  
  const data: any = {
    name: strain.name,
    type: strain.type,
    inStock: strain.inStock,
    thc: {
      min: minThc,
      max: maxThc
    }
  };
  
  if (strain.cbd && strain.cbd > 0) {
    data.cbd = strain.cbd;
  }
  
  if (config.includeEffects && strain.effectProfiles?.length) {
    data.effects = strain.effectProfiles.map(e => ({
      name: e.name,
      intensity: e.intensity,
      emoji: e.emoji
    }));
  }
  
  if (config.includeFlavors && strain.flavorProfiles?.length) {
    data.flavors = strain.flavorProfiles.map(f => ({
      name: f.name,
      intensity: f.intensity,
      emoji: f.emoji
    }));
  }
  
  if (config.includeTerpenes && strain.terpenes?.length) {
    data.terpenes = strain.terpenes.map(t => ({
      name: t.name,
      percentage: t.percentage
    }));
  }
  
  if (config.includeDescription && strain.description) {
    data.description = strain.description;
  }
  
  return JSON.stringify(data, null, 2);
};

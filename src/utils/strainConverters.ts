// Re-export from the new data layer for backward compatibility
export { 
  convertDatabaseScanToStrain, 
  convertStrainToDatabase as convertStrainForDatabase,
  convertDatabaseScansToStrains
} from '@/data/converters/strainConverters';

// Re-export profile converters
export { 
  convertEffectsToProfiles, 
  convertFlavorsToProfiles 
} from '@/data/converters/profileConverters';

// Keep legacy support - this file will be deprecated in future refactoring
import { Strain, LegacyStrain } from '@/types/strain';
import { convertEffectsToProfiles, convertFlavorsToProfiles } from '@/data/converters/profileConverters';

export const migrateLegacyStrain = (legacyStrain: LegacyStrain): Strain => {
  return {
    ...legacyStrain,
    thc: Math.max(legacyStrain.thc, 21), // Ensure 21%+ THC
    effectProfiles: convertEffectsToProfiles(legacyStrain.effects),
    flavorProfiles: convertFlavorsToProfiles(legacyStrain.flavors)
  };
};


import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';

/**
 * Safe Tone Service
 * 
 * Ensures every strain has safe tone descriptions and handles missing tone data gracefully.
 * This service prevents crashes when the tone system tries to process strains without proper tone entries.
 */

export interface SafeToneData {
  toneId: string;
  description: string;
  hasStoredDescription: boolean;
}

/**
 * Ensures a strain has at least one default tone description
 * Creates a basic system tone entry if none exists
 */
export const ensureStrainHasDefaultTone = async (strain: Strain, userId?: string): Promise<SafeToneData> => {
  try {
    // First, check if strain already has any tone descriptions
    const { data: existingDescriptions } = await supabase
      .from('strain_tone_descriptions')
      .select('*')
      .eq('strain_id', strain.id)
      .limit(1);

    if (existingDescriptions && existingDescriptions.length > 0) {
      // Strain already has tone descriptions, return the first one
      const existing = existingDescriptions[0];
      return {
        toneId: existing.tone_id,
        description: existing.generated_description,
        hasStoredDescription: true
      };
    }

    // No tone descriptions exist, create a default one
    const defaultTone = await getOrCreateDefaultSystemTone();
    const defaultDescription = strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain with unique characteristics.`;

    // Create default tone description entry
    const { error: insertError } = await supabase
      .from('strain_tone_descriptions')
      .insert({
        strain_id: strain.id,
        tone_id: defaultTone.id,
        generated_description: defaultDescription
      });

    if (insertError) {
      console.error('Error creating default tone description:', insertError);
      // Return fallback data even if database insert fails
      return {
        toneId: defaultTone.id,
        description: defaultDescription,
        hasStoredDescription: false
      };
    }

    return {
      toneId: defaultTone.id,
      description: defaultDescription,
      hasStoredDescription: true
    };

  } catch (error) {
    console.error('Error ensuring strain has default tone:', error);
    
    // Return absolute fallback to prevent crashes
    return {
      toneId: 'system-default',
      description: strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain.`,
      hasStoredDescription: false
    };
  }
};

/**
 * Gets or creates the default system tone
 */
const getOrCreateDefaultSystemTone = async () => {
  try {
    // Try to find existing default system tone
    const { data: existingTone } = await supabase
      .from('user_tones')
      .select('*')
      .is('user_id', null)
      .eq('name', 'Professional')
      .single();

    if (existingTone) {
      return existingTone;
    }

    // Create default system tone if it doesn't exist
    const { data: newTone, error } = await supabase
      .from('user_tones')
      .insert({
        name: 'Professional',
        description: 'Clean, informative descriptions focusing on strain characteristics',
        persona_prompt: 'Write in a professional, informative tone. Focus on the strain\'s key characteristics, effects, and appeal. Keep descriptions clear and factual.',
        user_id: null, // System tone
        is_default: true
      })
      .select()
      .single();

    if (error || !newTone) {
      throw new Error('Failed to create default system tone');
    }

    return newTone;

  } catch (error) {
    console.error('Error getting/creating default system tone:', error);
    
    // Return fallback tone data
    return {
      id: 'system-default',
      name: 'Professional',
      description: 'Default system tone',
      persona_prompt: 'Professional tone',
      user_id: null,
      is_default: true
    };
  }
};

/**
 * Safely fetches tone descriptions for a strain
 * Returns empty object if strain has no tone descriptions yet
 */
export const safelyFetchToneDescriptions = async (strainId: string): Promise<Record<string, string>> => {
  try {
    const { data: descriptions } = await supabase
      .from('strain_tone_descriptions')
      .select('tone_id, generated_description')
      .eq('strain_id', strainId);

    if (!descriptions) return {};

    const descriptionsMap: Record<string, string> = {};
    descriptions.forEach(desc => {
      descriptionsMap[desc.tone_id] = desc.generated_description;
    });

    return descriptionsMap;
  } catch (error) {
    console.error('Error fetching tone descriptions:', error);
    return {};
  }
};

/**
 * Safely fetches available tones with error handling
 */
export const safelyFetchAvailableTones = async (userId?: string) => {
  try {
    const { data: tones } = await supabase
      .from('user_tones')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId || 'null'}`)
      .order('created_at', { ascending: true });

    return tones || [];
  } catch (error) {
    console.error('Error fetching available tones:', error);
    return [];
  }
};

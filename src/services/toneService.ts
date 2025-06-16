
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

/**
 * Tone Service - Optimized for Memory Efficiency
 * 
 * Handles all tone-related operations with proper error handling
 * and memory management to prevent crashes during strain generation.
 */

/**
 * Safely fetch available tones with memory optimization
 */
export const safelyFetchAvailableTones = async (userId?: string): Promise<Tone[]> => {
  try {
    console.log('Fetching available tones for user:', userId);
    
    const { data: tones, error } = await supabase
      .from('user_tones')
      .select('id, name, description, persona_prompt, user_id, is_default')
      .or(`user_id.is.null,user_id.eq.${userId || 'null'}`)
      .order('created_at', { ascending: true })
      .limit(20); // Limit to prevent memory issues

    if (error) {
      console.error('Error fetching tones:', error);
      return getDefaultTones();
    }

    console.log('Successfully fetched', tones?.length || 0, 'tones');
    return tones || getDefaultTones();
  } catch (fetchError) {
    console.error('Failed to fetch tones:', fetchError);
    return getDefaultTones();
  }
};

/**
 * Safely fetch tone descriptions with memory optimization
 */
export const safelyFetchToneDescriptions = async (strainId: string): Promise<Record<string, string>> => {
  try {
    console.log('Fetching tone descriptions for strain:', strainId);
    
    const { data: descriptions, error } = await supabase
      .from('strain_tone_descriptions')
      .select('tone_id, generated_description')
      .eq('strain_id', strainId)
      .limit(10); // Limit to prevent memory issues

    if (error) {
      console.error('Error fetching tone descriptions:', error);
      return {};
    }

    const descriptionsMap = (descriptions || []).reduce((acc, desc) => {
      acc[desc.tone_id] = desc.generated_description;
      return acc;
    }, {} as Record<string, string>);

    console.log('Successfully fetched', Object.keys(descriptionsMap).length, 'tone descriptions');
    return descriptionsMap;
  } catch (fetchError) {
    console.error('Failed to fetch tone descriptions:', fetchError);
    return {};
  }
};

/**
 * Ensure strain has default tone with memory-optimized approach
 */
export const ensureStrainHasDefaultTone = async (
  strain: Strain, 
  userId?: string
): Promise<{ toneId: string; description: string; hasStoredDescription: boolean }> => {
  try {
    console.log('Ensuring default tone for strain:', strain.name);
    
    // Get default professional tone ID
    const defaultToneId = '00000000-0000-0000-0000-000000000001';
    
    // Check if tone description already exists
    const { data: existingDesc } = await supabase
      .from('strain_tone_descriptions')
      .select('generated_description')
      .eq('strain_id', strain.id)
      .eq('tone_id', defaultToneId)
      .single();

    if (existingDesc) {
      console.log('Found existing tone description for strain:', strain.name);
      return {
        toneId: defaultToneId,
        description: existingDesc.generated_description,
        hasStoredDescription: true
      };
    }

    // Create new tone description entry
    const defaultDescription = strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain.`;
    
    const { error: insertError } = await supabase
      .from('strain_tone_descriptions')
      .insert({
        strain_id: strain.id,
        tone_id: defaultToneId,
        generated_description: defaultDescription
      });

    if (insertError) {
      console.error('Error creating default tone description:', insertError);
      // Return fallback but don't throw - allow strain generation to continue
      return {
        toneId: defaultToneId,
        description: defaultDescription,
        hasStoredDescription: false
      };
    }

    console.log('Created default tone description for strain:', strain.name);
    return {
      toneId: defaultToneId,
      description: defaultDescription,
      hasStoredDescription: true
    };

  } catch (toneError) {
    console.error('Error in ensureStrainHasDefaultTone:', toneError);
    // Return safe fallback to prevent crashes
    return {
      toneId: '00000000-0000-0000-0000-000000000001',
      description: strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain.`,
      hasStoredDescription: false
    };
  }
};

/**
 * Get default system tones as fallback
 */
const getDefaultTones = (): Tone[] => {
  return [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Professional',
      description: 'Clear, informative, and business-appropriate tone',
      persona_prompt: 'Write in a professional, clear, and informative manner suitable for business communications.',
      user_id: null,
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

/**
 * Memory-optimized tone generation
 */
export const generateToneDescription = async (
  strain: Strain,
  toneId: string,
  userId?: string
): Promise<string> => {
  try {
    console.log('Generating tone description for:', strain.name, 'with tone:', toneId);
    
    const { data, error } = await supabase.functions.invoke('regenerate-description', {
      body: {
        strainName: strain.name,
        strainType: strain.type,
        currentDescription: strain.description,
        humanGuidance: 'Generate a comprehensive 3-5 sentence description in the selected tone style, focusing on the strain\'s characteristics, effects, and appeal',
        effects: strain.effectProfiles?.map(e => e.name) || [],
        flavors: strain.flavorProfiles?.map(f => f.name) || [],
        toneId: toneId
      }
    });

    if (error || data?.error) {
      throw new Error(error?.message || data?.error || 'Generation failed');
    }

    return data.description || strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain.`;
  } catch (genError) {
    console.error('Error generating tone description:', genError);
    // Return fallback description instead of throwing
    return strain.description || `${strain.name} is a ${strain.type.toLowerCase()} strain.`;
  }
};

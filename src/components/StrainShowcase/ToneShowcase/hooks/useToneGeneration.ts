
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';

/**
 * Tone Generation Hook
 * 
 * Handles AI-powered description generation for specific tones.
 * Separated from main tone logic for better maintainability.
 */
export const useToneGeneration = (
  strain: Strain,
  user: any,
  selectedToneId: string,
  storedDescriptions: Record<string, string>,
  setStoredDescriptions: (update: (prev: Record<string, string>) => Record<string, string>) => void
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDescription, setCurrentDescription] = useState('');
  const { toast } = useToast();

  const generateDescriptionForTone = useCallback(async (toneId: string, silent = false) => {
    if (!user) return;
    if (!silent) setIsGenerating(true);

    try {
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

      const newDescription = data.description;

      // Store the generated description with proper conflict handling
      const { error: storeError } = await supabase
        .from('strain_tone_descriptions')
        .upsert({
          strain_id: strain.id,
          tone_id: toneId,
          generated_description: newDescription
        }, {
          onConflict: 'strain_id,tone_id'
        });

      if (storeError) throw storeError;

      // Update local state
      setStoredDescriptions(prev => ({
        ...prev,
        [toneId]: newDescription
      }));

      // If this is the currently selected tone, update display immediately
      if (toneId === selectedToneId) {
        setCurrentDescription(newDescription);
      }

      if (!silent) {
        toast({
          title: "Description Generated",
          description: "New tone-specific description has been generated."
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      if (!silent) {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate description. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      if (!silent) setIsGenerating(false);
    }
  }, [user, strain, selectedToneId, setStoredDescriptions, toast]);

  return {
    isGenerating,
    currentDescription,
    selectedToneId,
    generateDescriptionForTone
  };
};

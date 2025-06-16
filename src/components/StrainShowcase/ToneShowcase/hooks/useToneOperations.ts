
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStrainData } from '@/data/hooks/useStrainData';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

/**
 * Tone Operations Hook
 * 
 * Handles bulk tone operations like applying tones globally.
 * Separated from main tone logic for better maintainability.
 */
export const useToneOperations = (
  user: any,
  selectedToneId: string,
  availableTones: Tone[],
  storedDescriptions: Record<string, string>,
  updateStrainInCache: (strainId: string, updates: any) => void
) => {
  const [isApplyingGlobally, setIsApplyingGlobally] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const { toast } = useToast();
  const { strains } = useStrainData(true);

  const applyToneToAllStrains = useCallback(async () => {
    if (!selectedToneId || !user) return;
    setIsApplyingGlobally(true);
    setGlobalProgress(0);

    try {
      const { data: toneDescriptions, error: fetchError } = await supabase
        .from('strain_tone_descriptions')
        .select('strain_id, generated_description')
        .eq('tone_id', selectedToneId);

      if (fetchError) throw fetchError;

      if (!toneDescriptions || toneDescriptions.length === 0) {
        toast({
          title: "No Descriptions Available",
          description: "Generate some tone descriptions first by switching between tones.",
          variant: "destructive"
        });
        return;
      }

      const totalDescriptions = toneDescriptions.length;
      let processedCount = 0;

      for (const toneDesc of toneDescriptions) {
        try {
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(toneDesc.strain_id);
          let updateQuery;

          if (isValidUUID) {
            updateQuery = supabase
              .from('scans')
              .update({ description: toneDesc.generated_description })
              .eq('id', toneDesc.strain_id);
          } else {
            const strain = strains.find(s => s.id === toneDesc.strain_id);
            if (strain) {
              updateQuery = supabase
                .from('scans')
                .update({ description: toneDesc.generated_description })
                .eq('strain_name', strain.name)
                .eq('user_id', user.id);
            }
          }

          if (updateQuery) {
            await updateQuery;
            updateStrainInCache(toneDesc.strain_id, { description: toneDesc.generated_description });
          }
        } catch (error) {
          console.error(`Error updating strain ${toneDesc.strain_id}:`, error);
        }

        processedCount++;
        setGlobalProgress((processedCount / totalDescriptions) * 100);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const currentToneName = availableTones.find(t => t.id === selectedToneId)?.name || 'Professional';
      toast({
        title: "✨ Tone Applied Successfully!",
        description: `Applied "${currentToneName}" tone to ${processedCount} strains across your entire database.`
      });
    } catch (error) {
      console.error('Error applying tone globally:', error);
      toast({
        title: "Application Failed",
        description: "Failed to apply tone to all strains.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingGlobally(false);
      setGlobalProgress(0);
    }
  }, [selectedToneId, user, availableTones, strains, updateStrainInCache, toast]);

  return {
    isApplyingGlobally,
    globalProgress,
    applyToneToAllStrains
  };
};

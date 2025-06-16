
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStrainData } from '@/data/hooks/useStrainData';
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

export const useToneLogic = (strain: Strain, onDescriptionChange: (description: string) => void) => {
  const [availableTones, setAvailableTones] = useState<Tone[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string>('');
  const [storedDescriptions, setStoredDescriptions] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingGlobally, setIsApplyingGlobally] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentDescription, setCurrentDescription] = useState(strain.description || '');

  const { toast } = useToast();
  const { user } = useAuth();
  const { strains, updateStrainInCache } = useStrainData(true);

  useEffect(() => {
    if (user) {
      fetchTonesAndDescriptions();
    }
  }, [user, strain.id]);

  const fetchTonesAndDescriptions = async () => {
    try {
      // Fetch all available tones (system + user)
      const { data: tones, error: tonesError } = await supabase
        .from('user_tones')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user?.id}`)
        .order('created_at', { ascending: true });

      if (tonesError) throw tonesError;
      setAvailableTones(tones || []);

      // Fetch stored descriptions for this strain
      const { data: descriptions, error: descriptionsError } = await supabase
        .from('strain_tone_descriptions')
        .select('*')
        .eq('strain_id', strain.id);

      if (descriptionsError) throw descriptionsError;

      const descriptionsMap: Record<string, string> = {};
      descriptions?.forEach(desc => {
        descriptionsMap[desc.tone_id] = desc.generated_description;
      });
      setStoredDescriptions(descriptionsMap);

      // Set initial selected tone and description
      if (tones && tones.length > 0 && !selectedToneId) {
        const firstToneId = tones[0].id;
        setSelectedToneId(firstToneId);
        const initialDescription = descriptionsMap[firstToneId] || strain.description || '';
        setCurrentDescription(initialDescription);
        onDescriptionChange(initialDescription);
        updateStrainInCache(strain.id, { description: initialDescription });
      }

      // Auto-generate missing descriptions in background
      generateMissingDescriptions(tones || [], descriptionsMap);
    } catch (error) {
      console.error('Error fetching tones and descriptions:', error);
    }
  };

  const generateMissingDescriptions = async (tones: Tone[], existingDescriptions: Record<string, string>) => {
    for (const tone of tones) {
      if (!existingDescriptions[tone.id]) {
        try {
          await generateDescriptionForTone(tone.id, true);
        } catch (error) {
          console.error(`Background generation failed for tone ${tone.name}:`, error);
        }
      }
    }
  };

  const generateDescriptionForTone = async (toneId: string, silent = false) => {
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

      // If this is the currently selected tone, update everything immediately
      if (toneId === selectedToneId) {
        setCurrentDescription(newDescription);
        onDescriptionChange(newDescription);
        updateStrainInCache(strain.id, { description: newDescription });
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
  };

  const switchToTone = (toneId: string) => {
    setSelectedToneId(toneId);
    const description = storedDescriptions[toneId] || strain.description || '';
    setCurrentDescription(description);
    onDescriptionChange(description);
    updateStrainInCache(strain.id, { description });

    // If no description exists for this tone, generate it
    if (!storedDescriptions[toneId]) {
      generateDescriptionForTone(toneId, true);
    }
  };

  const applyToneToAllStrains = async () => {
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

      toast({
        title: "✨ Tone Applied Successfully!",
        description: `Applied "${getCurrentToneName()}" tone to ${processedCount} strains across your entire database.`
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
  };

  const getCurrentToneName = () => {
    const tone = availableTones.find(t => t.id === selectedToneId);
    return tone?.name || 'Professional';
  };

  const hasStoredDescription = (toneId: string) => {
    return !!storedDescriptions[toneId];
  };

  return {
    availableTones,
    selectedToneId,
    storedDescriptions,
    isGenerating,
    isApplyingGlobally,
    globalProgress,
    currentDescription,
    switchToTone,
    generateDescriptionForTone,
    applyToneToAllStrains,
    getCurrentToneName,
    hasStoredDescription
  };
};

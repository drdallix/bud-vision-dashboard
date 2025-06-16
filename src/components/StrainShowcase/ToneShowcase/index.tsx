
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStrainData } from '@/data/hooks/useStrainData';
import type { Tables } from '@/integrations/supabase/types';
import { ToneSelector } from './ToneSelector';
import { ToneDescriptionPreview } from './ToneDescriptionPreview';
import { ToneActionButtons } from './ToneActionButtons';
import { ToneBulkActions } from './ToneBulkActions';
import { ToneQuickPreview } from './ToneQuickPreview';

type Tone = Tables<'user_tones'>;

interface ToneShowcaseProps {
  strain: Strain;
  onDescriptionChange: (description: string) => void;
}

export const ToneShowcase = ({
  strain,
  onDescriptionChange
}: ToneShowcaseProps) => {
  const [availableTones, setAvailableTones] = useState<Tone[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string>('');
  const [storedDescriptions, setStoredDescriptions] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingToAll, setIsApplyingToAll] = useState(false);
  const [isApplyingToneToAll, setIsApplyingToneToAll] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [currentDescription, setCurrentDescription] = useState(strain.description || '');
  const { toast } = useToast();
  const { user } = useAuth();
  const { strains, updateStrainInCache } = useStrainData(true);

  useEffect(() => {
    if (user) {
      fetchTonesAndDescriptions();
      generateMissingToneDescriptions();
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

      // Set initial selected tone (first available or one with stored description)
      if (tones && tones.length > 0 && !selectedToneId) {
        const toneWithDescription = tones.find(tone => descriptionsMap[tone.id]);
        const initialToneId = toneWithDescription?.id || tones[0].id;
        setSelectedToneId(initialToneId);
        
        // Set current description and notify parent immediately
        const initialDescription = descriptionsMap[initialToneId] || strain.description || '';
        setCurrentDescription(initialDescription);
        onDescriptionChange(initialDescription);
      }
    } catch (error) {
      console.error('Error fetching tones and descriptions:', error);
    }
  };

  const generateMissingToneDescriptions = async () => {
    if (!user || !strain) return;
    
    try {
      const { data: tones } = await supabase
        .from('user_tones')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user.id}`);

      const { data: existingDescriptions } = await supabase
        .from('strain_tone_descriptions')
        .select('tone_id')
        .eq('strain_id', strain.id);

      const existingToneIds = new Set(existingDescriptions?.map(d => d.tone_id) || []);
      const missingTones = tones?.filter(tone => !existingToneIds.has(tone.id)) || [];

      // Generate descriptions for missing tones in background
      for (const tone of missingTones) {
        try {
          await generateDescriptionForTone(tone.id, true); // silent generation
        } catch (error) {
          console.error(`Background generation failed for tone ${tone.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error generating missing tone descriptions:', error);
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

      // Store the generated description
      const { error: storeError } = await supabase
        .from('strain_tone_descriptions')
        .upsert({
          strain_id: strain.id,
          tone_id: toneId,
          generated_description: newDescription
        });

      if (storeError) throw storeError;

      // Update local state
      setStoredDescriptions(prev => ({
        ...prev,
        [toneId]: newDescription
      }));

      // If this is the currently selected tone, update immediately
      if (toneId === selectedToneId) {
        setCurrentDescription(newDescription);
        onDescriptionChange(newDescription);
        // Also update the strain cache to reflect in showcase above
        updateStrainInCache(strain.id, { description: newDescription });
      }

      if (!silent) {
        toast({
          title: "Description Generated",
          description: "New tone-specific description has been generated and saved."
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
    // Update the strain cache to reflect in showcase above immediately
    updateStrainInCache(strain.id, { description });
  };

  const applyToneToDatabase = async () => {
    if (!user || !currentDescription) return;
    
    try {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(strain.id);
      
      let updateQuery;
      if (isValidUUID) {
        updateQuery = supabase
          .from('scans')
          .update({ description: currentDescription })
          .eq('id', strain.id);
      } else {
        updateQuery = supabase
          .from('scans')
          .update({ description: currentDescription })
          .eq('strain_name', strain.name)
          .eq('user_id', user.id);
      }

      const { error } = await updateQuery;
      if (error) throw error;

      // Update strain cache permanently
      updateStrainInCache(strain.id, { description: currentDescription });

      toast({
        title: "Description Applied",
        description: "The description has been saved to the database and is now the default for this strain."
      });
    } catch (error) {
      console.error('Error applying description:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save description to database.",
        variant: "destructive"
      });
    }
  };

  const applyToneToAllStrains = async () => {
    if (!selectedToneId || !user) return;
    
    setIsApplyingToAll(true);
    setApplyProgress(0);

    try {
      const totalStrains = strains.length;
      let processedCount = 0;

      for (const strainItem of strains) {
        // Get the stored description for this tone
        const { data: storedDesc } = await supabase
          .from('strain_tone_descriptions')
          .select('generated_description')
          .eq('strain_id', strainItem.id)
          .eq('tone_id', selectedToneId)
          .single();

        if (storedDesc?.generated_description) {
          // Apply the tone description to the strain
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(strainItem.id);
          
          let updateQuery;
          if (isValidUUID) {
            updateQuery = supabase
              .from('scans')
              .update({ description: storedDesc.generated_description })
              .eq('id', strainItem.id);
          } else {
            updateQuery = supabase
              .from('scans')
              .update({ description: storedDesc.generated_description })
              .eq('strain_name', strainItem.name)
              .eq('user_id', user.id);
          }

          await updateQuery;
          
          // Update strain cache
          updateStrainInCache(strainItem.id, { description: storedDesc.generated_description });
        }

        processedCount++;
        setApplyProgress((processedCount / totalStrains) * 100);
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Tone Applied Successfully",
        description: `Applied selected tone to ${processedCount} strains in the database.`
      });
    } catch (error) {
      console.error('Error applying tone to all strains:', error);
      toast({
        title: "Application Failed",
        description: "Failed to apply tone to all strains.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingToAll(false);
      setApplyProgress(0);
    }
  };

  // New function to apply the selected tone to all strains that have tone descriptions
  const applySelectedToneToAllValidStrains = async () => {
    if (!selectedToneId || !user) return;
    
    setIsApplyingToneToAll(true);
    setApplyProgress(0);

    try {
      // Get all strain-tone descriptions for the selected tone
      const { data: toneDescriptions, error: fetchError } = await supabase
        .from('strain_tone_descriptions')
        .select('strain_id, generated_description')
        .eq('tone_id', selectedToneId);

      if (fetchError) throw fetchError;

      if (!toneDescriptions || toneDescriptions.length === 0) {
        toast({
          title: "No Descriptions Found",
          description: "No tone descriptions found for the selected tone.",
          variant: "destructive"
        });
        return;
      }

      const totalDescriptions = toneDescriptions.length;
      let processedCount = 0;

      for (const toneDesc of toneDescriptions) {
        try {
          // Apply the tone description to each strain
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(toneDesc.strain_id);
          
          let updateQuery;
          if (isValidUUID) {
            updateQuery = supabase
              .from('scans')
              .update({ description: toneDesc.generated_description })
              .eq('id', toneDesc.strain_id);
          } else {
            // For non-UUID strain IDs, we need to find by strain name and user
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
            
            // Update strain cache
            updateStrainInCache(toneDesc.strain_id, { description: toneDesc.generated_description });
          }
        } catch (error) {
          console.error(`Error updating strain ${toneDesc.strain_id}:`, error);
        }

        processedCount++;
        setApplyProgress((processedCount / totalDescriptions) * 100);
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      toast({
        title: "Tone Applied Successfully",
        description: `Applied "${getCurrentToneName()}" tone to ${processedCount} strains in the database.`
      });
    } catch (error) {
      console.error('Error applying tone to all valid strains:', error);
      toast({
        title: "Application Failed",
        description: "Failed to apply tone to all valid strains.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingToneToAll(false);
      setApplyProgress(0);
    }
  };

  const getCurrentToneName = () => {
    const tone = availableTones.find(t => t.id === selectedToneId);
    return tone?.name || 'Professional';
  };

  const hasStoredDescription = (toneId: string) => {
    return !!storedDescriptions[toneId];
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Tone Showcase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToneSelector
          availableTones={availableTones}
          selectedToneId={selectedToneId}
          storedDescriptions={storedDescriptions}
          onToneChange={switchToTone}
        />

        <ToneDescriptionPreview
          currentDescription={currentDescription}
          toneName={getCurrentToneName()}
          hasStoredDescription={hasStoredDescription(selectedToneId)}
        />

        <div className="flex flex-col gap-2">
          <ToneActionButtons
            isGenerating={isGenerating}
            hasStoredDescription={hasStoredDescription(selectedToneId)}
            currentDescription={currentDescription}
            onGenerate={() => generateDescriptionForTone(selectedToneId)}
            onApplyToStrain={applyToneToDatabase}
          />

          <ToneBulkActions
            selectedToneId={selectedToneId}
            isApplyingToAll={isApplyingToAll}
            applyProgress={applyProgress}
            toneName={getCurrentToneName()}
            strainsCount={strains.length}
            onApplyToAll={applyToneToAllStrains}
          />
        </div>

        <ToneQuickPreview
          availableTones={availableTones}
          selectedToneId={selectedToneId}
          storedDescriptions={storedDescriptions}
          onToneSwitch={switchToTone}
        />

        {/* New Apply Tone to All Valid Strains Button */}
        <div className="border-t pt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Database Actions:
            </label>
            <button
              onClick={applySelectedToneToAllValidStrains}
              disabled={isApplyingToneToAll || !selectedToneId}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isApplyingToneToAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Applying {getCurrentToneName()} to All Valid Strains... ({Math.round(applyProgress)}%)
                </>
              ) : (
                <>
                  🎨 Apply "{getCurrentToneName()}" Tone to All Valid Strains
                </>
              )}
            </button>
            <p className="text-xs text-gray-500">
              This will apply the "{getCurrentToneName()}" tone descriptions to all strains that have generated descriptions for this tone.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

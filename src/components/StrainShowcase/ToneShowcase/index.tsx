
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
  const [applyProgress, setApplyProgress] = useState(0);
  const [currentDescription, setCurrentDescription] = useState(strain.description || '');
  const { toast } = useToast();
  const { user } = useAuth();
  const { strains } = useStrainData(true);

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

      // Set initial selected tone (first available or one with stored description)
      if (tones && tones.length > 0 && !selectedToneId) {
        const toneWithDescription = tones.find(tone => descriptionsMap[tone.id]);
        setSelectedToneId(toneWithDescription?.id || tones[0].id);
      }
    } catch (error) {
      console.error('Error fetching tones and descriptions:', error);
    }
  };

  const generateDescriptionForTone = async (toneId: string) => {
    if (!user) return;
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-description', {
        body: {
          strainName: strain.name,
          strainType: strain.type,
          currentDescription: strain.description,
          humanGuidance: 'Generate a description in the selected tone style',
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
      setCurrentDescription(newDescription);
      onDescriptionChange(newDescription);

      toast({
        title: "Description Generated",
        description: "New tone-specific description has been generated and saved."
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const switchToTone = (toneId: string) => {
    setSelectedToneId(toneId);
    const description = storedDescriptions[toneId] || strain.description || '';
    setCurrentDescription(description);
    onDescriptionChange(description);
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

      toast({
        title: "Description Applied",
        description: "The description has been saved to the database."
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

      for (const strain of strains) {
        // Get the stored description for this tone
        const { data: storedDesc } = await supabase
          .from('strain_tone_descriptions')
          .select('generated_description')
          .eq('strain_id', strain.id)
          .eq('tone_id', selectedToneId)
          .single();

        if (storedDesc?.generated_description) {
          // Apply the tone description to the strain
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(strain.id);
          
          let updateQuery;
          if (isValidUUID) {
            updateQuery = supabase
              .from('scans')
              .update({ description: storedDesc.generated_description })
              .eq('id', strain.id);
          } else {
            updateQuery = supabase
              .from('scans')
              .update({ description: storedDesc.generated_description })
              .eq('strain_name', strain.name)
              .eq('user_id', user.id);
          }

          await updateQuery;
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
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Wand2, Globe, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStrainData } from '@/data/hooks/useStrainData';
import type { Tables } from '@/integrations/supabase/types';
import { ToneSelector } from './ToneSelector';
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
  const [isApplyingGlobally, setIsApplyingGlobally] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentDescription, setCurrentDescription] = useState(strain.description || '');
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    strains,
    updateStrainInCache
  } = useStrainData(true);
  useEffect(() => {
    if (user) {
      fetchTonesAndDescriptions();
    }
  }, [user, strain.id]);
  const fetchTonesAndDescriptions = async () => {
    try {
      // Fetch all available tones (system + user)
      const {
        data: tones,
        error: tonesError
      } = await supabase.from('user_tones').select('*').or(`user_id.is.null,user_id.eq.${user?.id}`).order('created_at', {
        ascending: true
      });
      if (tonesError) throw tonesError;
      setAvailableTones(tones || []);

      // Fetch stored descriptions for this strain
      const {
        data: descriptions,
        error: descriptionsError
      } = await supabase.from('strain_tone_descriptions').select('*').eq('strain_id', strain.id);
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

        // Update showcase immediately
        updateStrainInCache(strain.id, {
          description: initialDescription
        });
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
          await generateDescriptionForTone(tone.id, true); // silent generation
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
      const {
        data,
        error
      } = await supabase.functions.invoke('regenerate-description', {
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
      const {
        error: storeError
      } = await supabase.from('strain_tone_descriptions').upsert({
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

      // If this is the currently selected tone, update everything immediately
      if (toneId === selectedToneId) {
        setCurrentDescription(newDescription);
        onDescriptionChange(newDescription);
        updateStrainInCache(strain.id, {
          description: newDescription
        });
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

    // Update showcase immediately so when user scrolls up, it's already changed
    updateStrainInCache(strain.id, {
      description
    });

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
      // Get all strain-tone descriptions for the selected tone
      const {
        data: toneDescriptions,
        error: fetchError
      } = await supabase.from('strain_tone_descriptions').select('strain_id, generated_description').eq('tone_id', selectedToneId);
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
          // Apply the tone description to each strain
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(toneDesc.strain_id);
          let updateQuery;
          if (isValidUUID) {
            updateQuery = supabase.from('scans').update({
              description: toneDesc.generated_description
            }).eq('id', toneDesc.strain_id);
          } else {
            const strain = strains.find(s => s.id === toneDesc.strain_id);
            if (strain) {
              updateQuery = supabase.from('scans').update({
                description: toneDesc.generated_description
              }).eq('strain_name', strain.name).eq('user_id', user.id);
            }
          }
          if (updateQuery) {
            await updateQuery;
            updateStrainInCache(toneDesc.strain_id, {
              description: toneDesc.generated_description
            });
          }
        } catch (error) {
          console.error(`Error updating strain ${toneDesc.strain_id}:`, error);
        }
        processedCount++;
        setGlobalProgress(processedCount / totalDescriptions * 100);
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
  return <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Tone Control Center
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Switch tones to instantly preview different writing styles. Changes appear in the showcase above automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tone Selection */}
        <ToneSelector availableTones={availableTones} selectedToneId={selectedToneId} storedDescriptions={storedDescriptions} onToneChange={switchToTone} />

        {/* Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Live Preview ({getCurrentToneName()}):
            </label>
            <div className="flex items-center gap-2">
              {hasStoredDescription(selectedToneId) ? <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="h-3 w-3" />
                  Generated
                </div> : <div className="text-orange-600 text-xs">Generating...</div>}
            </div>
          </div>
          <div className="p-4 bg-white border rounded-lg text-sm min-h-[120px] max-h-[200px] overflow-y-auto text-black ">
            {currentDescription || 'No description available'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Generate/Regenerate Button */}
          <Button onClick={() => generateDescriptionForTone(selectedToneId)} disabled={isGenerating} className="w-full" variant={hasStoredDescription(selectedToneId) ? "outline" : "default"}>
            {isGenerating ? <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </> : <>
                <Wand2 className="h-4 w-4 mr-2" />
                {hasStoredDescription(selectedToneId) ? 'Regenerate' : 'Generate'} {getCurrentToneName()} Description
              </>}
          </Button>

          {/* Apply Globally Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary" disabled={!selectedToneId || isApplyingGlobally} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                {isApplyingGlobally ? <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying {getCurrentToneName()} Globally...
                  </> : <>
                    <Globe className="h-4 w-4 mr-2" />
                    Apply "{getCurrentToneName()}" to All My Strains
                  </>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  🎨 Apply Tone Globally?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will apply the "{getCurrentToneName()}" tone to all strains in your database that have generated descriptions for this tone. 
                  This action will permanently update your strain descriptions and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={applyToneToAllStrains}>
                  Apply "{getCurrentToneName()}" Globally
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Progress Bar */}
          {isApplyingGlobally && <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Applying "{getCurrentToneName()}" tone globally...</span>
                <span>{Math.round(globalProgress)}%</span>
              </div>
              <Progress value={globalProgress} className="w-full" />
            </div>}
        </div>

        {/* Quick Tone Preview Grid */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Switch:</label>
          <div className="grid grid-cols-2 gap-2">
            {availableTones.slice(0, 4).map(tone => <Button key={tone.id} variant={tone.id === selectedToneId ? "default" : "outline"} size="sm" onClick={() => switchToTone(tone.id)} className="justify-start text-xs relative">
                {tone.name}
                {hasStoredDescription(tone.id) && <Check className="h-3 w-3 ml-1 text-green-500" />}
              </Button>)}
          </div>
        </div>
      </CardContent>
    </Card>;
};
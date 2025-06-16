import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Check, Loader2, Palette, Globe } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';
type Tone = Tables<'user_tones'>;
type StrainToneDescription = Tables<'strain_tone_descriptions'>;
interface ToneShowcaseProps {
  strain: Strain;
  onDescriptionChange: (description: string) => void;
}
const ToneShowcase = ({
  strain,
  onDescriptionChange
}: ToneShowcaseProps) => {
  const [availableTones, setAvailableTones] = useState<Tone[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string>('');
  const [storedDescriptions, setStoredDescriptions] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(strain.description || '');
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  useEffect(() => {
    if (user) {
      fetchTonesAndDescriptions();
    }
  }, [user, strain.id]);
  const fetchTonesAndDescriptions = async () => {
    try {
      // Fetch available tones
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
      const {
        data,
        error
      } = await supabase.functions.invoke('regenerate-description', {
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
  const applyDescriptionToDatabase = async () => {
    if (!user || !currentDescription) return;
    try {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(strain.id);
      let updateQuery;
      if (isValidUUID) {
        updateQuery = supabase.from('scans').update({
          description: currentDescription
        }).eq('id', strain.id);
      } else {
        updateQuery = supabase.from('scans').update({
          description: currentDescription
        }).eq('strain_name', strain.name).eq('user_id', user.id);
      }
      const {
        error
      } = await updateQuery;
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
          Tone Showcase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Tone:</label>
          <Select value={selectedToneId} onValueChange={switchToTone}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tone..." />
            </SelectTrigger>
            <SelectContent>
              {availableTones.map(tone => <SelectItem key={tone.id} value={tone.id}>
                  <div className="flex items-center gap-2">
                    <span>{tone.name}</span>
                    {hasStoredDescription(tone.id) && <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Generated
                      </Badge>}
                    {!tone.user_id && <Badge variant="outline" className="text-xs">System</Badge>}
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Current Description Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Description ({getCurrentToneName()}):
            </label>
            <Badge variant={hasStoredDescription(selectedToneId) ? "default" : "secondary"}>
              {hasStoredDescription(selectedToneId) ? "Generated" : "Original"}
            </Badge>
          </div>
          <div className="p-3 bg-white border rounded-lg text-sm text-black min-h-[100px] max-h-[200px] overflow-y-auto">
            {currentDescription || 'No description available'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => generateDescriptionForTone(selectedToneId)} disabled={isGenerating} className="flex-1" variant={hasStoredDescription(selectedToneId) ? "outline" : "default"}>
            {isGenerating ? <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </> : <>
                <Wand2 className="h-4 w-4 mr-2" />
                {hasStoredDescription(selectedToneId) ? "Regenerate" : "Generate"}
              </>}
          </Button>

          <Button onClick={applyDescriptionToDatabase} disabled={!currentDescription} variant="secondary" className="flex-1">
            <Globe className="h-4 w-4 mr-2" />
            Apply to Database
          </Button>
        </div>

        {/* Tone Grid for Quick Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Tone Preview:</label>
          <div className="grid grid-cols-2 gap-2">
            {availableTones.slice(0, 4).map(tone => <Button key={tone.id} variant={tone.id === selectedToneId ? "default" : "outline"} size="sm" onClick={() => switchToTone(tone.id)} className="justify-start text-xs">
                {tone.name}
                {hasStoredDescription(tone.id) && <Check className="h-3 w-3 ml-1" />}
              </Button>)}
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default ToneShowcase;
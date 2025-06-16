
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Globe, Wand2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStrainData } from '@/data/hooks/useStrainData';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

const BulkToneManager = () => {
  const [availableTones, setAvailableTones] = useState<Tone[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackgroundGenerating, setIsBackgroundGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { strains } = useStrainData(true);

  useEffect(() => {
    if (user) {
      fetchTones();
    }
  }, [user]);

  const fetchTones = async () => {
    try {
      // Fetch all available tones (system + user)
      const { data: tones, error } = await supabase
        .from('user_tones')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user?.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAvailableTones(tones || []);
    } catch (error) {
      console.error('Error fetching tones:', error);
    }
  };

  const generateDescriptionsForAllStrains = async () => {
    if (!selectedToneId || !user) {
      toast({
        title: "Error",
        description: "Please select a tone first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(strains.length);
    setErrors([]);

    const newErrors: string[] = [];

    for (let i = 0; i < strains.length; i++) {
      const strain = strains[i];
      
      try {
        // Check if description already exists for this tone
        const { data: existing } = await supabase
          .from('strain_tone_descriptions')
          .select('id')
          .eq('strain_id', strain.id)
          .eq('tone_id', selectedToneId)
          .single();

        if (existing) {
          // Skip if already exists
          setProcessedCount(prev => prev + 1);
          setProgress(((i + 1) / strains.length) * 100);
          continue;
        }

        // Generate new description
        const { data, error } = await supabase.functions.invoke('regenerate-description', {
          body: {
            strainName: strain.name,
            strainType: strain.type,
            currentDescription: strain.description,
            humanGuidance: 'Generate a description in the selected tone style',
            effects: strain.effectProfiles?.map(e => e.name) || [],
            flavors: strain.flavorProfiles?.map(f => f.name) || [],
            toneId: selectedToneId
          }
        });

        if (error || data?.error) {
          throw new Error(error?.message || data?.error || 'Generation failed');
        }

        // Store the generated description
        const { error: storeError } = await supabase
          .from('strain_tone_descriptions')
          .insert({
            strain_id: strain.id,
            tone_id: selectedToneId,
            generated_description: data.description
          });

        if (storeError) throw storeError;

        setProcessedCount(prev => prev + 1);
        setProgress(((i + 1) / strains.length) * 100);

        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing strain ${strain.name}:`, error);
        newErrors.push(`${strain.name}: ${error.message}`);
      }
    }

    setErrors(newErrors);
    setIsProcessing(false);

    toast({
      title: "Bulk Generation Complete",
      description: `Processed ${processedCount} strains. ${newErrors.length} errors.`,
      variant: newErrors.length > 0 ? "destructive" : "default"
    });
  };

  const generateAllTonesForNewStrains = async () => {
    if (!user) return;
    
    setIsBackgroundGenerating(true);
    setProgress(0);
    setProcessedCount(0);
    
    // Find strains that don't have descriptions for all tones
    const strainsNeedingTones = [];
    
    for (const strain of strains) {
      const { data: existingDescs } = await supabase
        .from('strain_tone_descriptions')
        .select('tone_id')
        .eq('strain_id', strain.id);
      
      const existingToneIds = existingDescs?.map(d => d.tone_id) || [];
      const missingTones = availableTones.filter(tone => !existingToneIds.includes(tone.id));
      
      if (missingTones.length > 0) {
        strainsNeedingTones.push({ strain, missingTones });
      }
    }
    
    const totalOperations = strainsNeedingTones.reduce((sum, item) => sum + item.missingTones.length, 0);
    setTotalCount(totalOperations);
    
    let completed = 0;
    
    for (const { strain, missingTones } of strainsNeedingTones) {
      for (const tone of missingTones) {
        try {
          const { data, error } = await supabase.functions.invoke('regenerate-description', {
            body: {
              strainName: strain.name,
              strainType: strain.type,
              currentDescription: strain.description,
              humanGuidance: 'Generate a description in the selected tone style',
              effects: strain.effectProfiles?.map(e => e.name) || [],
              flavors: strain.flavorProfiles?.map(f => f.name) || [],
              toneId: tone.id
            }
          });

          if (!error && !data?.error) {
            await supabase
              .from('strain_tone_descriptions')
              .insert({
                strain_id: strain.id,
                tone_id: tone.id,
                generated_description: data.description
              });
          }
          
          completed++;
          setProcessedCount(completed);
          setProgress((completed / totalOperations) * 100);
          
          // Longer delay for background processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Background generation error for ${strain.name}:`, error);
          completed++;
        }
      }
    }
    
    setIsBackgroundGenerating(false);
    
    if (completed > 0) {
      toast({
        title: "Background Generation Complete",
        description: `Generated ${completed} tone descriptions across all strains.`
      });
    }
  };

  const applyToneToAllStrains = async () => {
    if (!selectedToneId || !user) {
      toast({
        title: "Error",
        description: "Please select a tone first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(strains.length);
    setErrors([]);

    const newErrors: string[] = [];

    for (let i = 0; i < strains.length; i++) {
      const strain = strains[i];
      
      try {
        // Get the stored description for this tone
        const { data: storedDesc, error: fetchError } = await supabase
          .from('strain_tone_descriptions')
          .select('generated_description')
          .eq('strain_id', strain.id)
          .eq('tone_id', selectedToneId)
          .single();

        if (fetchError || !storedDesc) {
          newErrors.push(`${strain.name}: No generated description found for selected tone`);
          continue;
        }

        // Update the strain's description in the database
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

        const { error: updateError } = await updateQuery;
        if (updateError) throw updateError;

        setProcessedCount(prev => prev + 1);
        setProgress(((i + 1) / strains.length) * 100);

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error updating strain ${strain.name}:`, error);
        newErrors.push(`${strain.name}: ${error.message}`);
      }
    }

    setErrors(newErrors);
    setIsProcessing(false);

    toast({
      title: "Bulk Apply Complete",
      description: `Updated ${processedCount} strains. ${newErrors.length} errors.`,
      variant: newErrors.length > 0 ? "destructive" : "default"
    });
  };

  const getCurrentToneName = () => {
    const tone = availableTones.find(t => t.id === selectedToneId);
    return tone?.name || 'None Selected';
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-600" />
          Bulk Tone Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Tone for Bulk Operations:</label>
          <Select value={selectedToneId} onValueChange={setSelectedToneId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tone..." />
            </SelectTrigger>
            <SelectContent>
              {availableTones.map((tone) => (
                <SelectItem key={tone.id} value={tone.id}>
                  <div className="flex items-center gap-2">
                    <span>{tone.name}</span>
                    {!tone.user_id && (
                      <Badge variant="outline" className="text-xs">System</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Selected Tone:</span>
            <Badge variant="secondary">{getCurrentToneName()}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Strains:</span>
            <span className="text-sm">{strains.length}</span>
          </div>
        </div>

        {/* Progress */}
        {(isProcessing || isBackgroundGenerating) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isBackgroundGenerating ? 'Background Generation:' : 'Progress:'}
              </span>
              <span className="text-sm">{processedCount}/{totalCount}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={generateDescriptionsForAllStrains}
            disabled={!selectedToneId || isProcessing || isBackgroundGenerating}
            variant="default"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate All Descriptions
          </Button>

          <Button
            onClick={applyToneToAllStrains}
            disabled={!selectedToneId || isProcessing || isBackgroundGenerating}
            variant="secondary"
          >
            <Globe className="h-4 w-4 mr-2" />
            Apply Tone to All
          </Button>
          
          <Button
            onClick={generateAllTonesForNewStrains}
            disabled={isProcessing || isBackgroundGenerating}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Missing Tones (Background)
          </Button>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Errors ({errors.length}):
            </div>
            <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded p-2">
              {errors.map((error, index) => (
                <div key={index} className="text-xs text-red-700 mb-1">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success indicator */}
        {!isProcessing && !isBackgroundGenerating && processedCount > 0 && errors.length === 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            <CheckCircle className="h-4 w-4" />
            All operations completed successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkToneManager;

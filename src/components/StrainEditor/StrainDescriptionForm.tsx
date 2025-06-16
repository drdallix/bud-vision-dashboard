import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, RefreshCw, History, Check, X, Mic } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ToneService, UserTone } from '@/services/toneService';

interface StrainDescriptionFormProps {
  strain: Strain;
  onUpdate: (field: string, value: any) => void;
  isLoading: boolean;
}

const StrainDescriptionForm = ({
  strain,
  onUpdate,
  isLoading
}: StrainDescriptionFormProps) => {
  const [humanGuidance, setHumanGuidance] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [proposedDescription, setProposedDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTones, setAvailableTones] = useState<UserTone[]>([]);
  const [selectedToneId, setSelectedToneId] = useState<string>('');
  const [currentTone, setCurrentTone] = useState<UserTone | null>(null);
  const [tonesLoading, setTonesLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTones();
    }
  }, [user]);

  const loadTones = async () => {
    try {
      setTonesLoading(true);
      const [tones, defaultTone] = await Promise.all([
        ToneService.getUserTones(user!.id),
        ToneService.getUserDefaultTone(user!.id)
      ]);
      
      setAvailableTones(tones);
      setCurrentTone(defaultTone);
      setSelectedToneId(defaultTone?.id || '');
    } catch (error) {
      console.error('Error loading tones:', error);
      toast({
        title: "Error",
        description: "Failed to load tone settings.",
        variant: "destructive"
      });
    } finally {
      setTonesLoading(false);
    }
  };

  const handleRegenerateDescription = async () => {
    if (!humanGuidance.trim()) {
      toast({
        title: "Guidance Required",
        description: "Please provide some guidance or corrections for the AI to work with.",
        variant: "destructive"
      });
      return;
    }

    setIsRegenerating(true);
    try {
      console.log('Calling regenerate-description edge function with tone...');
      const { data, error } = await supabase.functions.invoke('regenerate-description', {
        body: {
          strainName: strain.name,
          strainType: strain.type,
          currentDescription: strain.description,
          humanGuidance: humanGuidance,
          effects: strain.effectProfiles?.map(e => e.name) || [],
          flavors: strain.flavorProfiles?.map(f => f.name) || [],
          toneId: selectedToneId || currentTone?.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Edge function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('Generated description with tone:', data.description);
      setProposedDescription(data.description);
      toast({
        title: "Description Generated",
        description: "Review the new description and approve or reject it."
      });
    } catch (error) {
      console.error('Error regenerating description:', error);
      
      if (error.message?.includes('rate limit')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "OpenAI API rate limit reached. Please try again in a few minutes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate new description. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApproveDescription = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save changes.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Attempting to update strain description for strain ID:', strain.id);
      
      const { error } = await supabase
        .from('scans')
        .update({ 
          description: proposedDescription 
        })
        .eq('id', strain.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Description updated successfully in database');

      onUpdate('description', proposedDescription);
      setProposedDescription('');
      setHumanGuidance('');
      
      toast({
        title: "Description Updated",
        description: "The new description has been applied and saved to the strain."
      });
    } catch (error) {
      console.error('Error saving description:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectDescription = () => {
    setProposedDescription('');
    toast({
      title: "Description Rejected",
      description: "The proposed description has been discarded."
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
        <h3 className="text-base sm:text-lg font-semibold">Description Management</h3>
      </div>

      {/* Current Tone Display */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mic className="h-4 w-4 text-blue-600" />
            Current Tone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tonesLoading ? (
            <div className="animate-pulse text-sm text-muted-foreground">Loading tone...</div>
          ) : currentTone ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{currentTone.name}</Badge>
                {!currentTone.user_id && <Badge variant="outline" className="text-xs">System</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{currentTone.description}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tone selected</p>
          )}
        </CardContent>
      </Card>

      {/* Current Description */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-sm sm:text-base flex items-center justify-between">
            Current Description
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)} 
              className="text-muted-foreground h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
            >
              <History className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-2 sm:p-3 bg-gray-50 border rounded-lg text-xs sm:text-sm text-black">
            {strain.description || 'No description available'}
          </div>
        </CardContent>
      </Card>

      {/* Human Guidance Input */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-sm sm:text-base">Budtender Guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Textarea 
            value={humanGuidance} 
            onChange={(e) => setHumanGuidance(e.target.value)} 
            placeholder="Provide corrections, additional information, or specific changes you want made to the description..." 
            className="min-h-[80px] sm:min-h-[100px] text-sm" 
            disabled={isLoading || isRegenerating} 
          />
          
          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Use Tone (optional):</label>
            <Select 
              value={selectedToneId} 
              onValueChange={setSelectedToneId}
              disabled={tonesLoading || isRegenerating}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Use current default tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use current default tone</SelectItem>
                {availableTones.map((tone) => (
                  <SelectItem key={tone.id} value={tone.id}>
                    <div className="flex items-center gap-2">
                      <span>{tone.name}</span>
                      {!tone.user_id && <Badge variant="outline" className="text-xs">System</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleRegenerateDescription} 
            disabled={!humanGuidance.trim() || isLoading || isRegenerating || tonesLoading} 
            className="w-full text-sm" 
            size="sm"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Regenerate Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Proposed Description Review */}
      {proposedDescription && (
        <Card className="border-purple-200">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm sm:text-base text-purple-900">
              Proposed New Description
              {selectedToneId && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {availableTones.find(t => t.id === selectedToneId)?.name || 'Custom Tone'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm text-black">
              {proposedDescription}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleApproveDescription} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-sm" 
                disabled={isLoading || isSaving} 
                size="sm"
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Approve & Apply'}
              </Button>
              <Button 
                onClick={handleRejectDescription} 
                variant="outline" 
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50 text-sm" 
                disabled={isLoading || isSaving} 
                size="sm"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 sm:pt-6">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">Description Tips</h4>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Be specific about corrections needed</li>
            <li>• Mention unique characteristics or effects</li>
            <li>• Include customer feedback or observations</li>
            <li>• Note any medical uses or warnings</li>
            <li>• Choose different tones for different audiences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrainDescriptionForm;

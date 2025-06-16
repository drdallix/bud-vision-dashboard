import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, History } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ToneService, UserTone } from '@/services/toneService';
import CurrentToneDisplay from './CurrentToneDisplay';
import GuidanceInput from './GuidanceInput';
import DescriptionReviewCard from './DescriptionReviewCard';

interface StrainDescriptionFormProps {
  strain: Strain;
  onUpdate: (field: string, value: any) => void;
  isLoading: boolean;
}

interface UpdateStrainResponse {
  success: boolean;
  error?: string;
  strain?: any;
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
  const [selectedToneId, setSelectedToneId] = useState<string>('default');
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
      setSelectedToneId('default');
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
          toneId: selectedToneId === 'default' ? currentTone?.id : selectedToneId
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

  const handleApproveDescription = async (finalDescription: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save changes.",
        variant: "destructive"
      });
      return;
    }

    // Validate that strain.id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(strain.id)) {
      console.error('Invalid strain ID format:', strain.id);
      toast({
        title: "Invalid Strain ID",
        description: "The strain ID format is invalid. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Calling update_strain_description function for strain ID:', strain.id);
      
      const { data, error } = await supabase.rpc('update_strain_description', {
        p_strain_id: strain.id,
        p_description: finalDescription,
        p_user_id: user.id
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      // Type cast the response to our expected interface
      const response = data as UpdateStrainResponse;

      if (!response?.success) {
        console.error('Function returned error:', response?.error);
        throw new Error(response?.error || 'Failed to update strain description');
      }

      console.log('Description updated successfully:', response);

      // Update local state
      onUpdate('description', finalDescription);
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

      <CurrentToneDisplay currentTone={currentTone} isLoading={tonesLoading} />

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

      <GuidanceInput
        humanGuidance={humanGuidance}
        onGuidanceChange={setHumanGuidance}
        availableTones={availableTones}
        selectedToneId={selectedToneId}
        onToneChange={setSelectedToneId}
        onRegenerate={handleRegenerateDescription}
        isLoading={isLoading}
        isRegenerating={isRegenerating}
        tonesLoading={tonesLoading}
      />

      <DescriptionReviewCard
        proposedDescription={proposedDescription}
        selectedToneId={selectedToneId}
        availableTones={availableTones}
        onApprove={handleApproveDescription}
        onReject={handleRejectDescription}
        isLoading={isLoading}
        isSaving={isSaving}
      />

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

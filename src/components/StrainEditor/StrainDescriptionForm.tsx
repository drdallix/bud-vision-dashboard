
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, RefreshCw, History, Check, X } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StrainDescriptionFormProps {
  strain: Strain;
  onUpdate: (field: string, value: any) => void;
  isLoading: boolean;
}

const StrainDescriptionForm = ({ strain, onUpdate, isLoading }: StrainDescriptionFormProps) => {
  const [humanGuidance, setHumanGuidance] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [proposedDescription, setProposedDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleRegenerateDescription = async () => {
    if (!humanGuidance.trim()) {
      toast({
        title: "Guidance Required",
        description: "Please provide some guidance or corrections for the AI to work with.",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);
    try {
      console.log('Calling regenerate-description edge function...');
      
      const { data, error } = await supabase.functions.invoke('regenerate-description', {
        body: {
          strainName: strain.name,
          strainType: strain.type,
          currentDescription: strain.description,
          humanGuidance: humanGuidance,
          effects: strain.effectProfiles?.map(e => e.name) || [],
          flavors: strain.flavorProfiles?.map(f => f.name) || [],
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Edge function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('Generated description:', data.description);
      setProposedDescription(data.description);
      
      toast({
        title: "Description Generated",
        description: "Review the new description and approve or reject it.",
      });
    } catch (error) {
      console.error('Error regenerating description:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate new description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApproveDescription = async () => {
    setIsSaving(true);
    try {
      // Update in database
      const { error } = await supabase
        .from('strains')
        .update({ description: proposedDescription })
        .eq('id', strain.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state
      onUpdate('description', proposedDescription);
      setProposedDescription('');
      setHumanGuidance('');
      
      toast({
        title: "Description Updated",
        description: "The new description has been applied and saved to the strain.",
      });
    } catch (error) {
      console.error('Error saving description:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectDescription = () => {
    setProposedDescription('');
    toast({
      title: "Description Rejected",
      description: "The proposed description has been discarded.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
        <h3 className="text-base sm:text-lg font-semibold">Description Management</h3>
      </div>

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
          <div className="p-2 sm:p-3 bg-gray-50 border rounded-lg text-xs sm:text-sm">
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
          
          <Button
            onClick={handleRegenerateDescription}
            disabled={!humanGuidance.trim() || isLoading || isRegenerating}
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm">
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
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrainDescriptionForm;

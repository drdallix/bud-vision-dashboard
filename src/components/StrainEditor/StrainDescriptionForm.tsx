
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, RefreshCw, History, Check, X } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [proposedChanges, setProposedChanges] = useState<{
    description: string;
    effects: string[];
    flavors: string[];
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRegenerateDescription = async () => {
    if (!humanGuidance.trim()) {
      toast({
        title: "Guidance Required",
        description: "Please provide some guidance or corrections for the AI to work with.",
        variant: "destructive"
      });
      return;
    }

    if (!strain.id || typeof strain.id !== 'string') {
      console.error('Invalid strain ID:', strain.id);
      toast({
        title: "Error",
        description: "Invalid strain ID. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsRegenerating(true);
    try {
      console.log('Calling regenerate-description edge function with strain ID:', strain.id);
      const { data, error } = await supabase.functions.invoke('regenerate-description', {
        body: {
          strainName: strain.name,
          strainType: strain.type,
          currentDescription: strain.description,
          humanGuidance: humanGuidance,
          effects: strain.effectProfiles?.map(e => e.name) || [],
          flavors: strain.flavorProfiles?.map(f => f.name) || []
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

      console.log('Generated new content:', data);
      setProposedChanges({
        description: data.description,
        effects: data.effects || [],
        flavors: data.flavors || []
      });
      
      toast({
        title: "Content Generated",
        description: "Review the new description, effects, and flavors, then approve or reject them."
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
          description: error.message || "Failed to generate new content. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApproveChanges = async () => {
    if (!user || !proposedChanges) {
      toast({
        title: "Error",
        description: "Missing data for approval.",
        variant: "destructive"
      });
      return;
    }

    if (!strain.id || typeof strain.id !== 'string') {
      console.error('Invalid strain ID for save operation:', strain.id);
      toast({
        title: "Error",
        description: "Invalid strain ID. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Updating strain with new content for strain ID:', strain.id);
      
      const { error } = await supabase
        .from('scans')
        .update({ 
          description: proposedChanges.description,
          effects: proposedChanges.effects,
          flavors: proposedChanges.flavors
        })
        .eq('id', strain.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Content updated successfully in database');

      // Update local state
      onUpdate('description', proposedChanges.description);
      onUpdate('effects', proposedChanges.effects);
      onUpdate('flavors', proposedChanges.flavors);
      
      setProposedChanges(null);
      setHumanGuidance('');
      
      toast({
        title: "Content Updated",
        description: "The new description, effects, and flavors have been applied and saved."
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectChanges = () => {
    setProposedChanges(null);
    toast({
      title: "Changes Rejected",
      description: "The proposed changes have been discarded."
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
            placeholder="Provide corrections, additional information, or specific changes you want made to the description, effects, or flavors..." 
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
                Regenerate Description & Profiles
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Proposed Changes Review */}
      {proposedChanges && (
        <Card className="border-purple-200">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm sm:text-base text-purple-900">
              Proposed Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New Description */}
            <div>
              <h4 className="font-medium text-sm mb-2">New Description:</h4>
              <div className="p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm text-black">
                {proposedChanges.description}
              </div>
            </div>

            {/* New Effects */}
            <div>
              <h4 className="font-medium text-sm mb-2">New Effects:</h4>
              <div className="flex flex-wrap gap-1">
                {proposedChanges.effects.map((effect, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>

            {/* New Flavors */}
            <div>
              <h4 className="font-medium text-sm mb-2">New Flavors:</h4>
              <div className="flex flex-wrap gap-1">
                {proposedChanges.flavors.map((flavor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                onClick={handleApproveChanges} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-sm" 
                disabled={isLoading || isSaving} 
                size="sm"
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Approve & Apply All'}
              </Button>
              <Button 
                onClick={handleRejectChanges} 
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
          <h4 className="font-medium text-blue-900 mb-2 text-sm">Tips</h4>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Be specific about corrections needed for description, effects, or flavors</li>
            <li>• Mention unique characteristics or customer feedback</li>
            <li>• The AI will generate matching effects and flavors for the new description</li>
            <li>• All changes are applied together to maintain consistency</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrainDescriptionForm;

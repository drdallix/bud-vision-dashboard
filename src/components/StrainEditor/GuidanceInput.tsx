
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, RefreshCw } from 'lucide-react';
import { UserTone } from '@/services/toneService';
import ToneSelector from './ToneSelector';

interface GuidanceInputProps {
  humanGuidance: string;
  onGuidanceChange: (value: string) => void;
  availableTones: UserTone[];
  selectedToneId: string;
  onToneChange: (toneId: string) => void;
  onRegenerate: () => void;
  isLoading: boolean;
  isRegenerating: boolean;
  tonesLoading: boolean;
}

const GuidanceInput = ({
  humanGuidance,
  onGuidanceChange,
  availableTones,
  selectedToneId,
  onToneChange,
  onRegenerate,
  isLoading,
  isRegenerating,
  tonesLoading
}: GuidanceInputProps) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base">Budtender Guidance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <Textarea 
          value={humanGuidance} 
          onChange={(e) => onGuidanceChange(e.target.value)} 
          placeholder="Provide corrections, additional information, or specific changes you want made to the description..." 
          className="min-h-[80px] sm:min-h-[100px] text-sm" 
          disabled={isLoading || isRegenerating} 
        />
        
        <ToneSelector
          availableTones={availableTones}
          selectedToneId={selectedToneId}
          onToneChange={onToneChange}
          disabled={tonesLoading || isRegenerating}
        />
        
        <Button 
          onClick={onRegenerate} 
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
  );
};

export default GuidanceInput;

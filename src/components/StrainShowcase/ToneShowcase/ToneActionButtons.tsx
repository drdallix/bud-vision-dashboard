
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Globe, Loader2 } from 'lucide-react';

interface ToneActionButtonsProps {
  isGenerating: boolean;
  hasStoredDescription: boolean;
  currentDescription: string;
  onGenerate: () => void;
  onApplyToStrain: () => void;
}

export const ToneActionButtons = ({
  isGenerating,
  hasStoredDescription,
  currentDescription,
  onGenerate,
  onApplyToStrain
}: ToneActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="flex-1"
        variant={hasStoredDescription ? "outline" : "default"}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            {hasStoredDescription ? "Regenerate" : "Generate"}
          </>
        )}
      </Button>

      <Button
        onClick={onApplyToStrain}
        disabled={!currentDescription}
        variant="secondary"
        className="flex-1"
      >
        <Globe className="h-4 w-4 mr-2" />
        Apply to This Strain
      </Button>
    </div>
  );
};

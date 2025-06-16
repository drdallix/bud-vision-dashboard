
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Wand2, Globe, Loader2 } from 'lucide-react';

interface ToneActionsProps {
  selectedToneId: string;
  toneName: string;
  hasStoredDescription: boolean;
  isGenerating: boolean;
  isApplyingGlobally: boolean;
  onGenerate: () => void;
  onApplyGlobally: () => void;
}

export const ToneActions = ({
  selectedToneId,
  toneName,
  hasStoredDescription,
  isGenerating,
  isApplyingGlobally,
  onGenerate,
  onApplyGlobally
}: ToneActionsProps) => {
  return (
    <div className="space-y-3">
      {/* Generate/Regenerate Button */}
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating} 
        className="w-full" 
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
            {hasStoredDescription ? 'Regenerate' : 'Generate'} {toneName} Description
          </>
        )}
      </Button>

      {/* Apply Globally Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="secondary" 
            disabled={!selectedToneId || isApplyingGlobally} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            {isApplyingGlobally ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying {toneName} Globally...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Apply "{toneName}" to All My Strains
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              🎨 Apply Tone Globally?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will apply the "{toneName}" tone to all strains in your database that have generated descriptions for this tone. 
              This action will permanently update your strain descriptions and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onApplyGlobally}>
              Apply "{toneName}" Globally
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

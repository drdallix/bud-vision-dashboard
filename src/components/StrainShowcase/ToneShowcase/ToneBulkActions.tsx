
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Globe, Loader2, AlertTriangle } from 'lucide-react';

interface ToneBulkActionsProps {
  selectedToneId: string;
  isApplyingToAll: boolean;
  applyProgress: number;
  toneName: string;
  strainsCount: number;
  onApplyToAll: () => void;
}

export const ToneBulkActions = ({
  selectedToneId,
  isApplyingToAll,
  applyProgress,
  toneName,
  strainsCount,
  onApplyToAll
}: ToneBulkActionsProps) => {
  return (
    <div className="space-y-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={!selectedToneId || isApplyingToAll}
            className="w-full"
          >
            {isApplyingToAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying to All...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Apply Tone to All Strains
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Apply Tone to All Strains?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will apply the "{toneName}" tone to all {strainsCount} strains in your database. 
              Only strains that have pre-generated descriptions for this tone will be updated.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onApplyToAll}>
              Apply to All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isApplyingToAll && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Applying tone to strains...</span>
            <span>{Math.round(applyProgress)}%</span>
          </div>
          <Progress value={applyProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};

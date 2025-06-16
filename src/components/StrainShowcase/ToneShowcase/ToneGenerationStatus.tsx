
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ToneGenerationStatusProps {
  isGenerating: boolean;
  isApplyingGlobally: boolean;
  globalProgress: number;
  toneName: string;
}

export const ToneGenerationStatus = ({
  isGenerating,
  isApplyingGlobally,
  globalProgress,
  toneName
}: ToneGenerationStatusProps) => {
  if (!isGenerating && !isApplyingGlobally) {
    return null;
  }

  return (
    <div className="space-y-2">
      {isApplyingGlobally && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span>Applying "{toneName}" tone globally...</span>
            <span>{Math.round(globalProgress)}%</span>
          </div>
          <Progress value={globalProgress} className="w-full" />
        </>
      )}
    </div>
  );
};

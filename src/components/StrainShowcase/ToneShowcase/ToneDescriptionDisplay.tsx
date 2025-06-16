
import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface ToneDescriptionDisplayProps {
  currentDescription: string;
  toneName: string;
  hasStoredDescription: boolean;
  isGenerating: boolean;
}

export const ToneDescriptionDisplay = ({
  currentDescription,
  toneName,
  hasStoredDescription,
  isGenerating
}: ToneDescriptionDisplayProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Live Preview ({toneName}):
        </label>
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <div className="flex items-center gap-1 text-blue-600 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </div>
          ) : hasStoredDescription ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Check className="h-3 w-3" />
              Generated
            </div>
          ) : (
            <div className="text-orange-600 text-xs">Original</div>
          )}
        </div>
      </div>
      <div className="p-4 bg-white border rounded-lg text-sm min-h-[120px] max-h-[200px] overflow-y-auto text-black">
        {currentDescription || 'No description available'}
      </div>
    </div>
  );
};

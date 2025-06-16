
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ToneDescriptionPreviewProps {
  currentDescription: string;
  toneName: string;
  hasStoredDescription: boolean;
}

export const ToneDescriptionPreview = ({
  currentDescription,
  toneName,
  hasStoredDescription
}: ToneDescriptionPreviewProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Description ({toneName}):
        </label>
        <Badge variant={hasStoredDescription ? "default" : "secondary"}>
          {hasStoredDescription ? "Generated" : "Original"}
        </Badge>
      </div>
      <div className="p-3 bg-white border rounded-lg text-sm text-black min-h-[100px] max-h-[200px] overflow-y-auto">
        {currentDescription || 'No description available'}
      </div>
    </div>
  );
};

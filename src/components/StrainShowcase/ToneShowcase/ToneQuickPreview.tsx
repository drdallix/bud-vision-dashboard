
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

interface ToneQuickPreviewProps {
  availableTones: Tone[];
  selectedToneId: string;
  storedDescriptions: Record<string, string>;
  onToneSwitch: (toneId: string) => void;
}

export const ToneQuickPreview = ({
  availableTones,
  selectedToneId,
  storedDescriptions,
  onToneSwitch
}: ToneQuickPreviewProps) => {
  const hasStoredDescription = (toneId: string) => {
    return !!storedDescriptions[toneId];
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quick Tone Preview:</label>
      <div className="grid grid-cols-2 gap-2">
        {availableTones.slice(0, 4).map(tone => (
          <Button
            key={tone.id}
            variant={tone.id === selectedToneId ? "default" : "outline"}
            size="sm"
            onClick={() => onToneSwitch(tone.id)}
            className="justify-start text-xs"
          >
            {tone.name}
            {hasStoredDescription(tone.id) && <Check className="h-3 w-3 ml-1" />}
          </Button>
        ))}
      </div>
    </div>
  );
};

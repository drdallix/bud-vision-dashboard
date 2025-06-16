
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

interface ToneSelectorProps {
  availableTones: Tone[];
  selectedToneId: string;
  storedDescriptions: Record<string, string>;
  onToneChange: (toneId: string) => void;
}

export const ToneSelector = ({
  availableTones,
  selectedToneId,
  storedDescriptions,
  onToneChange
}: ToneSelectorProps) => {
  const hasStoredDescription = (toneId: string) => {
    return !!storedDescriptions[toneId];
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Tone:</label>
      <Select value={selectedToneId} onValueChange={onToneChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a tone..." />
        </SelectTrigger>
        <SelectContent>
          {availableTones.map(tone => (
            <SelectItem key={tone.id} value={tone.id}>
              <div className="flex items-center gap-2">
                <span>{tone.name}</span>
                {hasStoredDescription(tone.id) && (
                  <Badge variant="secondary" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Generated
                  </Badge>
                )}
                {!tone.user_id && (
                  <Badge variant="outline" className="text-xs">System</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};


import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserTone } from '@/services/toneService';

interface ToneSelectorProps {
  availableTones: UserTone[];
  selectedToneId: string;
  onToneChange: (toneId: string) => void;
  disabled?: boolean;
}

const ToneSelector = ({ 
  availableTones, 
  selectedToneId, 
  onToneChange, 
  disabled = false 
}: ToneSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Use Tone (optional):</label>
      <Select 
        value={selectedToneId} 
        onValueChange={onToneChange}
        disabled={disabled}
      >
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Use current default tone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Use current default tone</SelectItem>
          {availableTones.map((tone) => (
            <SelectItem key={tone.id} value={tone.id}>
              <div className="flex items-center gap-2">
                <span>{tone.name}</span>
                {!tone.user_id && <Badge variant="outline" className="text-xs">System</Badge>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ToneSelector;

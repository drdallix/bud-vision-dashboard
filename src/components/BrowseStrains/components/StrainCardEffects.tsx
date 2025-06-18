
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EffectProfile {
  name: string;
  emoji: string;
  color: string;
}

interface StrainCardEffectsProps {
  effects: EffectProfile[];
}

const StrainCardEffects = ({ effects }: StrainCardEffectsProps) => {
  if (!effects || effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {effects.map((effect, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className="text-xs flex items-center gap-1 flex-shrink-0" 
          style={{
            backgroundColor: `${effect.color}20`,
            color: effect.color,
            borderColor: effect.color
          }}
        >
          <span>{effect.emoji}</span>
          <span>{effect.name}</span>
        </Badge>
      ))}
    </div>
  );
};

export default StrainCardEffects;

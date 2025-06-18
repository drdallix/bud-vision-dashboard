
import React from 'react';

interface EffectProfile {
  name: string;
  emoji: string;
  color: string;
}

interface StrainCardEffectsProps {
  effects: EffectProfile[];
}

// Component now returns null to remove effect badges entirely
const StrainCardEffects = ({ effects }: StrainCardEffectsProps) => {
  return null;
};

export default StrainCardEffects;

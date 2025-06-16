
export type TransitionMode = 'elegant' | 'dynamic' | 'psychedelic' | 'zen';

export interface TransitionConfig {
  name: string;
  description: string;
  slideAnimation: string;
  textEffect: string;
  backgroundEffect: string;
  particleCount: number;
  duration: number;
}

export const TRANSITION_MODES: Record<TransitionMode, TransitionConfig> = {
  elegant: {
    name: 'Elegant',
    description: 'Smooth, professional transitions',
    slideAnimation: 'animate-fade-in',
    textEffect: 'text-gradient bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent',
    backgroundEffect: 'from-slate-900 via-purple-900 to-indigo-900',
    particleCount: 3,
    duration: 800
  },
  dynamic: {
    name: 'Dynamic',
    description: 'Energetic strain-based effects',
    slideAnimation: 'animate-bounce',
    textEffect: 'animate-pulse text-yellow-300 drop-shadow-2xl',
    backgroundEffect: 'from-orange-900 via-red-900 to-pink-900',
    particleCount: 6,
    duration: 600
  },
  psychedelic: {
    name: 'Psychedelic',
    description: 'Trippy, colorful animations',
    slideAnimation: 'animate-spin-slow',
    textEffect: 'animate-rainbow-text bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:400%_100%]',
    backgroundEffect: 'from-purple-900 via-pink-900 to-orange-900',
    particleCount: 12,
    duration: 1200
  },
  zen: {
    name: 'Zen',
    description: 'Calm, meditative flow',
    slideAnimation: 'animate-gentle-float',
    textEffect: 'text-emerald-100 drop-shadow-lg',
    backgroundEffect: 'from-emerald-900 via-teal-900 to-cyan-900',
    particleCount: 4,
    duration: 1000
  }
};

export const getStrainTransitionMode = (strainType: string): TransitionMode => {
  switch (strainType) {
    case 'Indica': return 'zen';
    case 'Sativa': return 'dynamic';
    case 'Hybrid': return 'elegant';
    default: return 'elegant';
  }
};

export const getRandomTransitionMode = (): TransitionMode => {
  const modes = Object.keys(TRANSITION_MODES) as TransitionMode[];
  return modes[Math.floor(Math.random() * modes.length)];
};

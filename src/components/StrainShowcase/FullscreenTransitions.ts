
export type TransitionMode = 'elegant' | 'dynamic' | 'psychedelic' | 'zen' | 'cinematic' | 'retro' | 'neon' | 'organic' | 'minimal';

export interface TransitionConfig {
  name: string;
  description: string;
  slideAnimation: string;
  textEffect: string;
  backgroundEffect: string;
  particleCount: number;
  duration: number;
  textSpeed: number;
  glowIntensity: number;
}

export const TRANSITION_MODES: Record<TransitionMode, TransitionConfig> = {
  elegant: {
    name: 'Elegant',
    description: 'Smooth, professional transitions',
    slideAnimation: 'animate-fade-in',
    textEffect: 'text-gradient bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent',
    backgroundEffect: 'from-slate-900 via-purple-900 to-indigo-900',
    particleCount: 3,
    duration: 800,
    textSpeed: 1000,
    glowIntensity: 0.3
  },
  dynamic: {
    name: 'Dynamic',
    description: 'Energetic strain-based effects',
    slideAnimation: 'animate-bounce',
    textEffect: 'animate-pulse text-yellow-300 drop-shadow-2xl',
    backgroundEffect: 'from-orange-900 via-red-900 to-pink-900',
    particleCount: 6,
    duration: 600,
    textSpeed: 800,
    glowIntensity: 0.5
  },
  psychedelic: {
    name: 'Psychedelic',
    description: 'Trippy, colorful animations',
    slideAnimation: 'animate-spin-slow',
    textEffect: 'animate-rainbow-text bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:400%_100%]',
    backgroundEffect: 'from-purple-900 via-pink-900 to-orange-900',
    particleCount: 12,
    duration: 1200,
    textSpeed: 600,
    glowIntensity: 0.8
  },
  zen: {
    name: 'Zen',
    description: 'Calm, meditative flow',
    slideAnimation: 'animate-gentle-float',
    textEffect: 'text-emerald-100 drop-shadow-lg',
    backgroundEffect: 'from-emerald-900 via-teal-900 to-cyan-900',
    particleCount: 4,
    duration: 1000,
    textSpeed: 1200,
    glowIntensity: 0.2
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Movie-like dramatic effects',
    slideAnimation: 'animate-fade-in',
    textEffect: 'text-white drop-shadow-2xl',
    backgroundEffect: 'from-gray-900 via-black to-gray-900',
    particleCount: 8,
    duration: 1500,
    textSpeed: 900,
    glowIntensity: 0.6
  },
  retro: {
    name: 'Retro',
    description: 'Vintage 80s vibes',
    slideAnimation: 'animate-bounce',
    textEffect: 'text-pink-300 drop-shadow-lg animate-pulse',
    backgroundEffect: 'from-purple-900 via-pink-900 to-blue-900',
    particleCount: 10,
    duration: 700,
    textSpeed: 750,
    glowIntensity: 0.7
  },
  neon: {
    name: 'Neon',
    description: 'Electric cyberpunk aesthetics',
    slideAnimation: 'animate-pulse',
    textEffect: 'text-cyan-300 drop-shadow-2xl animate-pulse',
    backgroundEffect: 'from-black via-purple-900 to-black',
    particleCount: 15,
    duration: 500,
    textSpeed: 600,
    glowIntensity: 1.0
  },
  organic: {
    name: 'Organic',
    description: 'Natural, earthy movements',
    slideAnimation: 'animate-gentle-float',
    textEffect: 'text-green-200 drop-shadow-lg',
    backgroundEffect: 'from-green-900 via-brown-900 to-green-900',
    particleCount: 6,
    duration: 1100,
    textSpeed: 1000,
    glowIntensity: 0.3
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, simple transitions',
    slideAnimation: 'animate-fade-in',
    textEffect: 'text-white',
    backgroundEffect: 'from-gray-800 via-gray-900 to-black',
    particleCount: 2,
    duration: 900,
    textSpeed: 1100,
    glowIntensity: 0.1
  }
};

export const getStrainTransitionMode = (strainType: string): TransitionMode => {
  switch (strainType) {
    case 'Indica': return 'zen';
    case 'Indica-Dominant': return 'cinematic';
    case 'Hybrid': return 'elegant';
    case 'Sativa-Dominant': return 'dynamic';
    case 'Sativa': return 'neon';
    default: return 'elegant';
  }
};

export const getRandomTransitionMode = (): TransitionMode => {
  const modes = Object.keys(TRANSITION_MODES) as TransitionMode[];
  return modes[Math.floor(Math.random() * modes.length)];
};

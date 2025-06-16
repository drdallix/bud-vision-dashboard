
import { ReactNode } from 'react';
import { Strain } from '@/types/strain';
import { TransitionMode, getStrainTransitionMode } from './FullscreenTransitions';

interface SceneConfig {
  backgroundGradient: string;
  accentColor: string;
  particleColor: string;
  glowEffect: string;
  emoji: string;
}

const STRAIN_SCENES: Record<string, SceneConfig> = {
  Indica: {
    backgroundGradient: 'from-purple-900 via-indigo-900 to-blue-900',
    accentColor: 'purple-400',
    particleColor: 'text-purple-300',
    glowEffect: 'shadow-purple-500/20',
    emoji: '🌙'
  },
  Sativa: {
    backgroundGradient: 'from-yellow-900 via-orange-900 to-red-900',
    accentColor: 'yellow-400',
    particleColor: 'text-yellow-300',
    glowEffect: 'shadow-yellow-500/20',
    emoji: '☀️'
  },
  Hybrid: {
    backgroundGradient: 'from-green-900 via-teal-900 to-blue-900',
    accentColor: 'emerald-400',
    particleColor: 'text-emerald-300',
    glowEffect: 'shadow-emerald-500/20',
    emoji: '🌿'
  }
};

interface FullscreenSceneManagerProps {
  strain: Strain;
  mode: TransitionMode;
  children: ReactNode;
}

const FullscreenSceneManager = ({ strain, mode, children }: FullscreenSceneManagerProps) => {
  const scene = STRAIN_SCENES[strain.type] || STRAIN_SCENES.Hybrid;
  
  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${scene.backgroundGradient} overflow-hidden`}>
      {/* Ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-${scene.accentColor}/20 rounded-full blur-3xl animate-pulse`}
          style={{ animationDuration: '4s' }}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 bg-${scene.accentColor}/15 rounded-full blur-3xl animate-pulse`}
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        />
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse`}
          style={{ animationDuration: '8s', animationDelay: '4s' }}
        />
      </div>

      {/* Floating strain-themed elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute ${scene.particleColor} opacity-40 animate-bounce`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${1 + Math.random() * 2}rem`
            }}
          >
            {scene.emoji}
          </div>
        ))}
      </div>

      {/* Subtle grid overlay for texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {children}
    </div>
  );
};

export default FullscreenSceneManager;

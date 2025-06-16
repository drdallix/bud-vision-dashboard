
import { useState, useEffect } from 'react';
import { TransitionMode, TRANSITION_MODES } from './FullscreenTransitions';

interface FullscreenTypographyProps {
  text: string;
  level: 'hero' | 'title' | 'subtitle' | 'body';
  mode: TransitionMode;
  isActive: boolean;
  delay?: number;
}

const FullscreenTypography = ({ 
  text, 
  level, 
  mode, 
  isActive, 
  delay = 0 
}: FullscreenTypographyProps) => {
  const [mounted, setMounted] = useState(false);
  const config = TRANSITION_MODES[mode];

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setMounted(true), delay);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isActive, delay]);

  const getTypeScale = () => {
    switch (level) {
      case 'hero':
        return 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none';
      case 'title':
        return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight';
      case 'subtitle':
        return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug';
      case 'body':
        return 'text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed';
      default:
        return 'text-xl';
    }
  };

  const getAnimationClass = () => {
    if (!mounted) return 'opacity-0 translate-y-8 scale-95';
    
    const baseClasses = 'opacity-100 translate-y-0 scale-100 transition-all duration-1000 ease-out';
    
    switch (mode) {
      case 'psychedelic':
        return `${baseClasses} animate-pulse hover:animate-bounce`;
      case 'dynamic':
        return `${baseClasses} hover:scale-110 transition-transform duration-300`;
      case 'zen':
        return `${baseClasses} hover:scale-105 transition-transform duration-500`;
      default:
        return `${baseClasses} hover:scale-102 transition-transform duration-300`;
    }
  };

  const getTextShadow = () => {
    switch (level) {
      case 'hero':
        return '0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3)';
      case 'title':
        return '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)';
      default:
        return '0 0 20px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.1)';
    }
  };

  return (
    <div className={`${getTypeScale()} ${getAnimationClass()}`}>
      <span 
        className={`${config.textEffect} drop-shadow-2xl cursor-default select-none`}
        style={{
          textShadow: getTextShadow(),
          WebkitBackgroundClip: config.textEffect.includes('bg-clip-text') ? 'text' : undefined,
          backgroundClip: config.textEffect.includes('bg-clip-text') ? 'text' : undefined,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default FullscreenTypography;

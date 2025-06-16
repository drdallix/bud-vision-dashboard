
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
        return 'text-6xl md:text-8xl lg:text-9xl font-black leading-none';
      case 'title':
        return 'text-4xl md:text-6xl font-bold leading-tight';
      case 'subtitle':
        return 'text-2xl md:text-3xl font-semibold leading-snug';
      case 'body':
        return 'text-lg md:text-xl leading-relaxed';
      default:
        return 'text-xl';
    }
  };

  const getAnimationClass = () => {
    if (!mounted) return 'opacity-0 translate-y-8 scale-95';
    
    const baseClasses = 'opacity-100 translate-y-0 scale-100 transition-all duration-1000 ease-out';
    
    switch (mode) {
      case 'psychedelic':
        return `${baseClasses} animate-pulse`;
      case 'dynamic':
        return `${baseClasses} animate-bounce`;
      case 'zen':
        return `${baseClasses} hover:scale-105 transition-transform duration-500`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`${getTypeScale()} ${getAnimationClass()}`}>
      <span 
        className={`${config.textEffect} drop-shadow-2xl`}
        style={{
          textShadow: level === 'hero' 
            ? '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1)' 
            : '0 0 20px rgba(255,255,255,0.2)'
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default FullscreenTypography;

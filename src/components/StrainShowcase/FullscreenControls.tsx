import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Settings, Shuffle, Palette } from 'lucide-react';
import { Strain } from '@/types/strain';
import { TransitionMode } from './FullscreenTransitions';
import AnimationSettings, { AnimationSettings as AnimationSettingsType } from './AnimationSettings';
import { saveAnimationSettings, loadAnimationSettings } from '@/services/animationSettingsService';

export interface FullscreenControlsProps {
  total: number;
  current: number;
  paused: boolean;
  slideInterval: number;
  setPaused: (paused: boolean) => void;
  setSlideInterval: (interval: number) => void;
  onNav: (index: number) => void;
  currentStrain: Strain;
  transitionMode?: TransitionMode;
  setTransitionMode?: (mode: TransitionMode) => void;
  shuffleTransitions?: boolean;
  setShuffleTransitions?: (shuffle: boolean) => void;
  shuffleMode?: boolean;
  setShuffleMode?: (shuffle: boolean) => void;
}

const FullscreenControls = ({
  total,
  current,
  paused,
  slideInterval,
  setPaused,
  setSlideInterval,
  onNav,
  currentStrain,
  transitionMode = 'elegant',
  setTransitionMode = () => {},
  shuffleTransitions = false,
  setShuffleTransitions = () => {},
  shuffleMode = false,
  setShuffleMode = () => {}
}: FullscreenControlsProps) => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettingsType>({
    transitionMode: 'elegant',
    slideInterval: 5000,
    textAnimationSpeed: 1000,
    particleIntensity: 50,
    glowIntensity: 50,
    autoTransition: true,
    shuffleTransitions: false,
    emojiAnimations: true,
    parallaxEffect: true,
    backgroundMotion: true
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await loadAnimationSettings();
      setAnimationSettings(settings);
      setTransitionMode(settings.transitionMode);
      setSlideInterval(settings.slideInterval);
      setPaused(!settings.autoTransition);
      setShuffleTransitions(settings.shuffleTransitions);
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      await saveAnimationSettings(animationSettings);
    };
    saveSettings();
  }, [animationSettings]);

  // Enhanced visibility logic with longer timeout and hover detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const shouldShow = e.clientY > window.innerHeight - 250; // Increased trigger area
      
      if (shouldShow !== visible) {
        setVisible(shouldShow);
        
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
        
        if (shouldShow) {
          const timeout = setTimeout(() => {
            // Only hide if settings panel is not open and not hovering over controls
            if (!showSettings && !isHoveringControls(e)) {
              setVisible(false);
            }
          }, 5000); // Increased timeout to 5 seconds
          setHideTimeout(timeout);
        }
      }
    };

    const isHoveringControls = (e: MouseEvent) => {
      const controlsElement = document.querySelector('[data-fullscreen-controls]');
      if (controlsElement) {
        const rect = controlsElement.getBoundingClientRect();
        return e.clientX >= rect.left && e.clientX <= rect.right && 
               e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      return false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [visible, hideTimeout, showSettings]);

  // Keep controls visible when settings panel is open
  useEffect(() => {
    if (showSettings) {
      setVisible(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    }
  }, [showSettings, hideTimeout]);

  const handlePrevious = () => {
    onNav(current > 0 ? current - 1 : total - 1);
  };

  const handleNext = () => {
    onNav(current < total - 1 ? current + 1 : 0);
  };

  const handleSettingsChange = (newSettings: AnimationSettingsType) => {
    setAnimationSettings(newSettings);
    setTransitionMode(newSettings.transitionMode);
    setSlideInterval(newSettings.slideInterval);
    setPaused(!newSettings.autoTransition);
    setShuffleTransitions(newSettings.shuffleTransitions);
  };

  return (
    <div 
      data-fullscreen-controls
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      onMouseEnter={() => {
        setVisible(true);
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
      }}
      onMouseLeave={(e) => {
        // Only start hide timer if not hovering over settings panel
        if (!showSettings) {
          const timeout = setTimeout(() => {
            setVisible(false);
          }, 2000);
          setHideTimeout(timeout);
        }
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm" />
      
      {/* Controls */}
      <div className="relative p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left: Navigation */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setPaused(!paused)}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Center: Progress and Info */}
          <div className="flex-1 mx-8">
            <div className="text-center mb-2">
              <h3 className="text-white text-lg font-semibold truncate animate-fade-in">
                {currentStrain.name}
              </h3>
              <p className="text-white/70 text-sm animate-fade-in">
                {current + 1} of {total} • {currentStrain.type}
              </p>
            </div>
            
            {/* Progress Bar with smooth animation */}
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full h-1 transition-all duration-500 ease-in-out"
                style={{ width: `${((current + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Settings */}
          <div className="flex items-center gap-4 relative">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShuffleMode(!shuffleMode)}
              className={`text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 ${
                shuffleMode ? 'bg-white/20 shadow-lg' : ''
              }`}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowSettings(!showSettings)}
              className={`text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 ${
                showSettings ? 'bg-white/20 shadow-lg' : ''
              }`}
            >
              <Palette className="h-5 w-5" />
            </Button>

            {/* Animation Settings Panel - Enhanced hover handling */}
            {showSettings && (
              <div
                onMouseEnter={() => {
                  setVisible(true);
                  if (hideTimeout) {
                    clearTimeout(hideTimeout);
                  }
                }}
                onMouseLeave={() => {
                  // Give extra time before hiding when leaving settings panel
                  const timeout = setTimeout(() => {
                    setVisible(false);
                  }, 3000);
                  setHideTimeout(timeout);
                }}
              >
                <AnimationSettings
                  settings={animationSettings}
                  onSettingsChange={handleSettingsChange}
                  onClose={() => setShowSettings(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenControls;

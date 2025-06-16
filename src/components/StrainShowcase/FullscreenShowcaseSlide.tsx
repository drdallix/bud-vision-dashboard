
import { useState, useEffect } from 'react';
import { Strain } from '@/types/strain';
import StrainEffectsVisual from '@/components/StrainDashboard/StrainEffectsVisual';
import StrainFlavorsVisual from '@/components/StrainDashboard/StrainFlavorsVisual';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap } from 'lucide-react';
import { useStrainTHC } from '@/hooks/useStrainTHC';
import FullscreenTypography from './FullscreenTypography';
import FullscreenSceneManager from './FullscreenSceneManager';
import { TransitionMode, getStrainTransitionMode, getRandomTransitionMode } from './FullscreenTransitions';

interface FullscreenShowcaseSlideProps {
  strain: Strain;
  isActive?: boolean;
  index?: number;
  transitionMode?: TransitionMode;
  shuffleMode?: boolean;
}

const FullscreenShowcaseSlide = ({ 
  strain, 
  isActive = true, 
  index = 0, 
  transitionMode,
  shuffleMode = false 
}: FullscreenShowcaseSlideProps) => {
  const { thcDisplay } = useStrainTHC(strain.name);
  const [currentMode, setCurrentMode] = useState<TransitionMode>('elegant');

  // Determine transition mode
  useEffect(() => {
    if (!isActive) return;

    if (transitionMode) {
      setCurrentMode(transitionMode);
    } else if (shuffleMode) {
      setCurrentMode(getRandomTransitionMode());
    } else {
      setCurrentMode(getStrainTransitionMode(strain.type));
    }
  }, [isActive, transitionMode, shuffleMode, strain.type, strain.id]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'from-purple-500 to-indigo-600';
      case 'Sativa': return 'from-yellow-400 to-orange-500';
      case 'Hybrid': return 'from-green-500 to-blue-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStrainEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Sativa': return '☀️';
      case 'Hybrid': return '🌓';
      default: return '🌿';
    }
  };

  return (
    <FullscreenSceneManager strain={strain} mode={currentMode}>
      <div className="h-screen w-screen flex flex-col justify-center items-center p-4 md:p-8 lg:p-16 overflow-hidden">
        
        {/* Hero section - optimized for fullscreen */}
        <div className="flex-shrink-0 text-center space-y-6 max-w-7xl w-full mb-8">
          <div className="space-y-4">
            {/* Strain emoji with animation */}
            <div className={`text-8xl md:text-9xl lg:text-[12rem] animate-bounce ${
              isActive ? 'animate-pulse' : ''
            }`} style={{ animationDuration: '3s' }}>
              {getStrainEmoji(strain.type)}
            </div>
            
            <FullscreenTypography
              text={strain.name}
              level="hero"
              mode={currentMode}
              isActive={isActive}
              delay={200}
            />
            
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Badge 
                className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-2xl text-2xl px-8 py-4 rounded-full`}
              >
                {strain.type}
              </Badge>
              <Badge className="bg-green-500/90 text-white border-0 shadow-2xl text-2xl px-8 py-4 rounded-full animate-pulse">
                <Sparkles className="h-6 w-6 mr-3" />
                Premium
              </Badge>
            </div>
          </div>
        </div>

        {/* THC Display - prominent and animated */}
        <div className={`flex-shrink-0 flex items-center justify-center gap-6 mb-12 transform transition-all duration-1000 ${
          isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-70'
        }`}>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-8 shadow-2xl animate-pulse">
            <Zap className="h-12 w-12 text-white" />
          </div>
          <div className="text-center">
            <FullscreenTypography
              text={thcDisplay}
              level="hero"
              mode={currentMode}
              isActive={isActive}
              delay={600}
            />
            <FullscreenTypography
              text="THC"
              level="title"
              mode={currentMode}
              isActive={isActive}
              delay={700}
            />
          </div>
        </div>

        {/* Description - centered and readable */}
        <div className="flex-shrink-0 max-w-5xl text-center mb-12">
          <FullscreenTypography
            text={strain.description}
            level="body"
            mode={currentMode}
            isActive={isActive}
            delay={400}
          />
        </div>
        
        {/* Effects and Flavors Grid - optimized for fullscreen viewing */}
        <div className="flex-1 w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full max-h-96">
            <div className={`transform transition-all duration-1000 delay-800 ${
              isActive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
            }`}>
              <Card className="border-0 bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-lg shadow-2xl h-full flex flex-col">
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</span>
                    <FullscreenTypography
                      text="Effects"
                      level="title"
                      mode={currentMode}
                      isActive={isActive}
                      delay={900}
                    />
                  </div>
                  <div className="flex-1">
                    <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-1000 ${
              isActive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
            }`}>
              <Card className="border-0 bg-gradient-to-br from-orange-900/60 to-yellow-900/60 backdrop-blur-lg shadow-2xl h-full flex flex-col">
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🍃</span>
                    <FullscreenTypography
                      text="Flavors"
                      level="title"
                      mode={currentMode}
                      isActive={isActive}
                      delay={1100}
                    />
                  </div>
                  <div className="flex-1">
                    <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FullscreenSceneManager>
  );
};

export default FullscreenShowcaseSlide;

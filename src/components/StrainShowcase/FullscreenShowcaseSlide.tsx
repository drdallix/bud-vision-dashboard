
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
import { AnimationSettings } from './AnimationSettings';

interface FullscreenShowcaseSlideProps {
  strain: Strain;
  isActive?: boolean;
  index?: number;
  transitionMode?: TransitionMode;
  shuffleMode?: boolean;
  animationSettings?: AnimationSettings;
}

const FullscreenShowcaseSlide = ({ 
  strain, 
  isActive = true, 
  index = 0, 
  transitionMode,
  shuffleMode = false,
  animationSettings
}: FullscreenShowcaseSlideProps) => {
  const { thcDisplay } = useStrainTHC(strain.name);
  const [currentMode, setCurrentMode] = useState<TransitionMode>('elegant');
  const [animationStage, setAnimationStage] = useState(0);

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

  // Staggered animation entrance
  useEffect(() => {
    if (isActive) {
      setAnimationStage(0);
      const stages = [1, 2, 3, 4, 5];
      stages.forEach((stage, i) => {
        setTimeout(() => setAnimationStage(stage), i * 200);
      });
    } else {
      setAnimationStage(0);
    }
  }, [isActive, strain.id]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'from-purple-500 to-indigo-600';
      case 'Indica-Dominant': return 'from-purple-400 to-blue-500';
      case 'Hybrid': return 'from-green-500 to-blue-500';
      case 'Sativa-Dominant': return 'from-green-400 to-yellow-500';
      case 'Sativa': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStrainEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Indica-Dominant': return '🌜';
      case 'Hybrid': return '🌿';
      case 'Sativa-Dominant': return '🌛';
      case 'Sativa': return '☀️';
      default: return '🌿';
    }
  };

  return (
    <FullscreenSceneManager strain={strain} mode={currentMode}>
      <div className={`h-screen w-screen flex items-center p-8 lg:p-16 overflow-hidden transition-all duration-1000 ${
        isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
      }`}>
        
        {/* Main Content - Side by Side Layout */}
        <div className="w-full h-full flex gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Side - Strain Info (60% width) */}
          <div className="flex-[3] flex flex-col justify-center space-y-8 min-w-0">
            
            {/* Hero Section */}
            <div className="space-y-6">
              {/* Strain emoji with enhanced animation */}
              <div className={`text-8xl lg:text-9xl xl:text-[10rem] transition-all duration-1000 ${
                animationStage >= 1 ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-20 opacity-0 scale-75'
              } ${animationSettings?.emojiAnimations ? 'animate-bounce' : ''}`} 
              style={{ 
                animationDuration: animationSettings?.emojiAnimations ? '3s' : undefined,
                filter: `drop-shadow(0 0 ${(animationSettings?.glowIntensity || 50) / 2}px rgba(255,255,255,0.5))`
              }}>
                {getStrainEmoji(strain.type)}
              </div>
              
              <div className={`transition-all duration-1000 delay-200 ${
                animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <FullscreenTypography
                  text={strain.name}
                  level="hero"
                  mode={currentMode}
                  isActive={isActive}
                  delay={200}
                />
              </div>
              
              <div className={`flex items-center gap-6 flex-wrap transition-all duration-1000 delay-400 ${
                animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <Badge 
                  className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-2xl text-xl px-6 py-3 rounded-full transform hover:scale-105 transition-all duration-300`}
                  style={{
                    boxShadow: animationSettings?.glowIntensity ? 
                      `0 0 ${animationSettings.glowIntensity}px rgba(255,255,255,0.3)` : 
                      '0 0 20px rgba(255,255,255,0.3)'
                  }}
                >
                  {strain.type}
                </Badge>
                <Badge className="bg-green-500/90 text-white border-0 shadow-2xl text-xl px-6 py-3 rounded-full animate-pulse hover:scale-105 transition-all duration-300">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Premium
                </Badge>
              </div>
            </div>

            {/* THC Display */}
            <div className={`flex items-center gap-8 transition-all duration-1000 delay-600 ${
              animationStage >= 4 ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-10 opacity-0 scale-90'
            }`}>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 shadow-2xl animate-pulse hover:scale-110 transition-all duration-300">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div>
                <FullscreenTypography
                  text={thcDisplay}
                  level="title"
                  mode={currentMode}
                  isActive={isActive}
                  delay={600}
                />
                <FullscreenTypography
                  text="THC Content"
                  level="subtitle"
                  mode={currentMode}
                  isActive={isActive}
                  delay={700}
                />
              </div>
            </div>

            {/* Description */}
            <div className={`max-w-3xl transition-all duration-1000 delay-800 ${
              animationStage >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <FullscreenTypography
                text={strain.description}
                level="body"
                mode={currentMode}
                isActive={isActive}
                delay={400}
              />
            </div>
          </div>
          
          {/* Right Side - Effects and Flavors (40% width) */}
          <div className="flex-[2] h-full flex flex-col justify-center gap-8 min-w-0">
            
            {/* Effects Card */}
            <div className={`transform transition-all duration-1000 delay-1000 ${
              animationStage >= 4 ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-95'
            }`}>
              <Card className="border-0 bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-lg shadow-2xl h-full hover:scale-105 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</span>
                    <FullscreenTypography
                      text="Effects"
                      level="subtitle"
                      mode={currentMode}
                      isActive={isActive}
                      delay={900}
                    />
                  </div>
                  <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
                </div>
              </Card>
            </div>
            
            {/* Flavors Card */}
            <div className={`transform transition-all duration-1000 delay-1200 ${
              animationStage >= 5 ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-95'
            }`}>
              <Card className="border-0 bg-gradient-to-br from-orange-900/60 to-yellow-900/60 backdrop-blur-lg shadow-2xl h-full hover:scale-105 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🍃</span>
                    <FullscreenTypography
                      text="Flavors"
                      level="subtitle"
                      mode={currentMode}
                      isActive={isActive}
                      delay={1100}
                    />
                  </div>
                  <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
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

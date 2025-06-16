
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

  return (
    <FullscreenSceneManager strain={strain} mode={currentMode}>
      <div className={`h-full flex flex-col transition-all duration-1000 ease-out ${
        isActive ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
      }`}>
        
        {/* Main content - proper flexbox layout with safe areas */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 py-8 min-h-0 overflow-auto">
          
          {/* Hero section - constrained height */}
          <div className="flex-shrink-0 text-center space-y-4 max-w-6xl mb-6">
            <div className="space-y-2">
              <FullscreenTypography
                text={strain.name}
                level="hero"
                mode={currentMode}
                isActive={isActive}
                delay={200}
              />
              
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge 
                  className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-2xl text-lg px-6 py-2`}
                >
                  {strain.type}
                </Badge>
                <Badge className="bg-green-500/90 text-white border-0 shadow-2xl text-lg px-6 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>

          {/* Description - constrained height */}
          <div className="flex-shrink-0 max-w-4xl text-center mb-6">
            <FullscreenTypography
              text={strain.description}
              level="body"
              mode={currentMode}
              isActive={isActive}
              delay={400}
            />
          </div>
          
          {/* THC Display - compact */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 shadow-2xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <FullscreenTypography
                text={thcDisplay}
                level="title"
                mode={currentMode}
                isActive={isActive}
                delay={600}
              />
              <FullscreenTypography
                text="THC"
                level="subtitle"
                mode={currentMode}
                isActive={isActive}
                delay={700}
              />
            </div>
          </div>
        </div>

        {/* Bottom section - effects and flavors with safe bottom margin */}
        <div className="flex-shrink-0 px-8 md:px-16 lg:px-24 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className={`transform transition-all duration-1000 delay-800 ${
              isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <Card className="border-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg shadow-2xl overflow-hidden">
                <div className="p-6">
                  <FullscreenTypography
                    text="Effects"
                    level="subtitle"
                    mode={currentMode}
                    isActive={isActive}
                    delay={900}
                  />
                  <div className="mt-4">
                    <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-1000 ${
              isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <Card className="border-0 bg-gradient-to-br from-orange-900/40 to-yellow-900/40 backdrop-blur-lg shadow-2xl overflow-hidden">
                <div className="p-6">
                  <FullscreenTypography
                    text="Flavors"
                    level="subtitle"
                    mode={currentMode}
                    isActive={isActive}
                    delay={1100}
                  />
                  <div className="mt-4">
                    <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer info - compact */}
          <div className={`mt-6 transition-all duration-1000 delay-1200 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-white/70 bg-black/20 backdrop-blur-sm rounded-2xl p-4 max-w-6xl mx-auto">
              <span className="text-sm">
                Scanned {new Date(strain.scannedAt).toLocaleDateString()}
              </span>
              <Badge variant="outline" className="text-green-300 border-green-400 text-sm px-3 py-1">
                {strain.confidence}% confidence
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </FullscreenSceneManager>
  );
};

export default FullscreenShowcaseSlide;

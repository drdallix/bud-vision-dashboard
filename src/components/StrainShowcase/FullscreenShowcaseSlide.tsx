
import { useState, useEffect } from 'react';
import { Strain } from '@/types/strain';
import StrainEffectsVisual from '@/components/StrainDashboard/StrainEffectsVisual';
import StrainFlavorsVisual from '@/components/StrainDashboard/StrainFlavorsVisual';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Leaf, Star } from 'lucide-react';
import { useStrainTHC } from '@/hooks/useStrainTHC';

interface FullscreenShowcaseSlideProps {
  strain: Strain;
  isActive?: boolean;
  index?: number;
  shuffleMode?: boolean;
}

const FullscreenShowcaseSlide = ({ strain, isActive = true, index = 0, shuffleMode = false }: FullscreenShowcaseSlideProps) => {
  const { thcDisplay } = useStrainTHC(strain.name);
  const [animationClass, setAnimationClass] = useState('');
  const [textEffect, setTextEffect] = useState('');

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

  // Dynamic animations and text effects
  useEffect(() => {
    if (!isActive) return;

    const animations = [
      'animate-fade-in',
      'animate-gentle-float',
      'animate-pulse',
      'animate-bounce',
    ];

    const textEffects = [
      'animate-shimmer bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent bg-[length:200%_100%]',
      'animate-pulse text-shadow-glow',
      'animate-bounce text-yellow-300',
      'text-gradient bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent',
      'text-gradient bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent',
      'text-gradient bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400 bg-clip-text text-transparent',
    ];

    if (shuffleMode) {
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      const randomTextEffect = textEffects[Math.floor(Math.random() * textEffects.length)];
      setAnimationClass(randomAnimation);
      setTextEffect(randomTextEffect);
    } else {
      setAnimationClass('animate-fade-in');
      setTextEffect('');
    }
  }, [isActive, shuffleMode, strain.id]);

  return (
    <div 
      className={`transition-all duration-1000 ease-out max-w-4xl mx-auto ${
        isActive 
          ? `opacity-100 scale-100 transform-none ${animationClass}` 
          : 'opacity-30 scale-90'
      }`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-pulse ${
              i % 3 === 0 ? 'text-yellow-400' : i % 3 === 1 ? 'text-purple-400' : 'text-blue-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {i % 4 === 0 ? <Sparkles className="h-4 w-4" /> : 
             i % 4 === 1 ? <Star className="h-3 w-3" /> : 
             i % 4 === 2 ? <Leaf className="h-3 w-3" /> : 
             <Zap className="h-3 w-3" />}
          </div>
        ))}
      </div>

      <div className="relative space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-6 mb-6">
            <span className="text-8xl animate-gentle-float">
              {getStrainEmoji(strain.type)}
            </span>
          </div>
          
          <div className="space-y-4">
            <h1 className={`text-6xl md:text-8xl font-bold text-white ${textEffect || 'text-shadow-xl'} transition-all duration-1000`}>
              {strain.name}
            </h1>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge 
                className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-2xl text-xl px-6 py-3 animate-pulse`}
              >
                {strain.type}
              </Badge>
              <Badge className="bg-green-500/90 text-white border-0 shadow-2xl text-xl px-6 py-3 animate-pulse">
                <Sparkles className="h-5 w-5 mr-2" />
                In Stock
              </Badge>
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto backdrop-blur-sm bg-black/20 rounded-2xl p-6">
              {strain.description}
            </p>
            
            {/* Enhanced THC Display */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 animate-pulse">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold text-yellow-300 ${shuffleMode ? 'animate-bounce' : ''}`}>
                  {thcDisplay}
                </div>
                <div className="text-xl text-white/80">THC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Effects and Flavors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="transform hover:scale-105 transition-all duration-500 hover:rotate-1">
            <Card className="border-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg shadow-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Effects</h3>
                <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
              </div>
            </Card>
          </div>
          
          <div className="transform hover:scale-105 transition-all duration-500 hover:-rotate-1">
            <Card className="border-0 bg-gradient-to-br from-orange-900/50 to-yellow-900/50 backdrop-blur-lg shadow-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Flavors</h3>
                <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
              </div>
            </Card>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-white/70 bg-black/20 backdrop-blur-sm rounded-2xl p-6">
          <span className="text-lg">
            Scanned {new Date(strain.scannedAt).toLocaleDateString()}
          </span>
          <Badge variant="outline" className="text-green-300 border-green-400 text-lg px-4 py-2">
            {strain.confidence}% confidence
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default FullscreenShowcaseSlide;


import { useState, useEffect } from 'react';
import { Strain } from '@/types/strain';
import StrainEffectsVisual from '@/components/StrainDashboard/StrainEffectsVisual';
import StrainFlavorsVisual from '@/components/StrainDashboard/StrainFlavorsVisual';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Heart, Info } from 'lucide-react';
import { useStrainTHC } from '@/hooks/useStrainTHC';
import { useToast } from '@/hooks/use-toast';

interface ShowcaseSlideProps {
  strain: Strain;
  isActive?: boolean;
  index?: number;
  onStrainClick?: (strain: Strain) => void;
}

const ShowcaseSlide = ({ strain, isActive = true, index = 0, onStrainClick }: ShowcaseSlideProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const { thcDisplay } = useStrainTHC(strain.name);

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

  const handleHeartClick = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${strain.name} ${isLiked ? 'removed from' : 'added to'} your favorites`,
      duration: 2000,
    });
  };

  const handleInfoClick = () => {
    if (onStrainClick) {
      onStrainClick(strain);
    }
  };

  return (
    <div 
      className={`transition-all duration-700 ease-out ${
        isActive 
          ? 'opacity-100 scale-100 transform-none' 
          : 'opacity-60 scale-95'
      }`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${getTypeColor(strain.type)} opacity-10 rounded-full animate-pulse`}></div>
        <div className={`absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br ${getTypeColor(strain.type)} opacity-10 rounded-full animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative space-y-4 md:space-y-6">
        {/* Enhanced Header - Full Width */}
        <div className="relative">
          <Card className="border-0 bg-theme-card shadow-xl">
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                <span className="text-3xl md:text-4xl flex-shrink-0">
                  {getStrainEmoji(strain.type)}
                </span>
                <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                      {strain.name}
                    </h1>
                    <Badge 
                      className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-lg text-xs md:text-sm`}
                    >
                      {strain.type}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse dark:bg-green-900 dark:text-green-100 dark:border-green-700 text-xs md:text-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  </div>
                  
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {strain.description}
                  </p>
                  
                  {/* THC percentage at bottom of description */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-base md:text-lg font-bold text-foreground">
                      {thcDisplay}
                    </span>
                    <span className="text-sm text-muted-foreground">THC</span>
                  </div>
                </div>
              </div>

              {/* Action buttons moved below header */}
              <div className="flex justify-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleHeartClick}
                  className={`${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  } transition-all duration-200 px-6 py-3 rounded-full`}
                  title="Add to favorites"
                >
                  <Heart 
                    className={`h-6 w-6 mr-2 ${isLiked ? 'fill-current' : ''}`} 
                  />
                  {isLiked ? 'Favorited' : 'Add to Favorites'}
                </Button>
                
                {onStrainClick && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleInfoClick}
                    className="px-6 py-3 rounded-full hover:bg-blue-50 hover:border-blue-300"
                    title="View strain details"
                  >
                    <Info className="h-6 w-6 mr-2" />
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Effects and Flavors Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg overflow-hidden">
              <div className="p-1">
                <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
              </div>
            </Card>
          </div>
          
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-lg overflow-hidden">
              <div className="p-1">
                <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
              </div>
            </Card>
          </div>
        </div>

        {/* Confidence and Date - Mobile Friendly */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs md:text-sm text-muted-foreground bg-theme-muted rounded-lg p-2 md:p-3 backdrop-blur-sm">
          <span>
            Scanned {new Date(strain.scannedAt).toLocaleDateString()}
          </span>
          <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-300 dark:border-green-600 self-start sm:self-auto">
            {strain.confidence}% confidence
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSlide;

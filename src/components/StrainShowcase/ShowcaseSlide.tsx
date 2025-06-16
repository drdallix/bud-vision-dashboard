
import { useState, useEffect } from 'react';
import { Strain } from '@/types/strain';
import StrainEffectsVisual from '@/components/StrainDashboard/StrainEffectsVisual';
import StrainFlavorsVisual from '@/components/StrainDashboard/StrainFlavorsVisual';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Heart } from 'lucide-react';
import { useStrainTHC } from '@/hooks/useStrainTHC';

interface ShowcaseSlideProps {
  strain: Strain;
  onStrainClick?: (strain: Strain) => void;
  isActive?: boolean;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (strain: Strain) => void;
}

const ShowcaseSlide = ({ 
  strain, 
  onStrainClick, 
  isActive = true, 
  index = 0,
  isFavorite = false,
  onToggleFavorite
}: ShowcaseSlideProps) => {
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
    if (onToggleFavorite) {
      onToggleFavorite(strain);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Enhanced Header */}
      <Card className="border-0 bg-theme-card shadow-lg">
        <div className="p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
            <span className="text-2xl md:text-3xl flex-shrink-0">
              {getStrainEmoji(strain.type)}
            </span>
            <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                  {strain.name}
                </h1>
                <Badge 
                  className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-md text-xs`}
                >
                  {strain.type}
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              </div>
              
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {strain.description}
              </p>
              
              {/* THC and Heart Button Row */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm md:text-base font-bold text-foreground">
                    {thcDisplay}
                  </span>
                  <span className="text-xs text-muted-foreground">THC</span>
                </div>
                
                {/* Large, easy-to-tap heart button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeartClick();
                  }}
                  className={`${
                    isFavorite 
                      ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  } transition-all duration-200 px-3 py-2 rounded-full min-h-[44px] min-w-[44px]`}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart 
                    className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Effects and Flavors Grid - Compact for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md">
          <div className="p-1">
            <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
          </div>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-md">
          <div className="p-1">
            <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
          </div>
        </Card>
      </div>

      {/* Confidence and Date - Compact */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs text-muted-foreground bg-theme-muted rounded-lg p-2 backdrop-blur-sm">
        <span>
          Scanned {new Date(strain.scannedAt).toLocaleDateString()}
        </span>
        <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-300 dark:border-green-600 self-start sm:self-auto text-xs">
          {strain.confidence}% confidence
        </Badge>
      </div>
    </div>
  );
};

export default ShowcaseSlide;

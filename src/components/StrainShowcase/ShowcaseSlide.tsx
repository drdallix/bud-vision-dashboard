
import { Strain } from '@/types/strain';
import StrainHeader from '@/components/StrainDashboard/StrainHeader';
import StrainEffectsVisual from '@/components/StrainDashboard/StrainEffectsVisual';
import StrainFlavorsVisual from '@/components/StrainDashboard/StrainFlavorsVisual';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap } from 'lucide-react';

interface ShowcaseSlideProps {
  strain: Strain;
  isActive?: boolean;
  index?: number;
}

const ShowcaseSlide = ({ strain, isActive = true, index = 0 }: ShowcaseSlideProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'from-purple-500 to-indigo-600';
      case 'Sativa': return 'from-yellow-400 to-orange-500';
      case 'Hybrid': return 'from-green-500 to-blue-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Sativa': return '☀️';
      case 'Hybrid': return '🌓';
      default: return '🌿';
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

      <div className="relative space-y-6">
        {/* Enhanced Header */}
        <div className="relative">
          <Card className="border-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTypeEmoji(strain.type)}</span>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {strain.name}
                      </h1>
                      <Badge 
                        className={`bg-gradient-to-r ${getTypeColor(strain.type)} text-white border-0 shadow-lg`}
                      >
                        {strain.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed max-w-2xl">
                    {strain.description}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2 justify-end">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-800">
                      {strain.thc}% THC
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
                    <Sparkles className="h-3 w-3 mr-1" />
                    In Stock
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Effects and Flavors Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg overflow-hidden">
              <div className="p-1">
                <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
              </div>
            </Card>
          </div>
          
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg overflow-hidden">
              <div className="p-1">
                <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
              </div>
            </Card>
          </div>
        </div>

        {/* Confidence and Date */}
        <div className="flex justify-between items-center text-sm text-gray-500 bg-white/50 rounded-lg p-3 backdrop-blur-sm">
          <span>
            Scanned on {new Date(strain.scannedAt).toLocaleDateString()}
          </span>
          <Badge variant="outline" className="text-green-700 border-green-300">
            {strain.confidence}% confidence
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSlide;

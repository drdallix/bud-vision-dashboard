
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

interface StrainVisualCardProps {
  strain: Strain;
}

const StrainVisualCard = ({
  strain
}: StrainVisualCardProps) => {
  const getStrainEmoji = (type: string) => {
    switch (type) {
      case 'Indica':
        return '🌙';
      case 'Indica-Dominant':
        return '🌜';
      case 'Hybrid':
        return '🌓';
      case 'Sativa-Dominant':
        return '🌛';
      case 'Sativa':
        return '☀️';
      default:
        return '🌿';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'from-purple-600 to-purple-800';
      case 'Indica-Dominant':
        return 'from-purple-500 to-blue-600';
      case 'Hybrid':
        return 'from-blue-500 to-green-500';
      case 'Sativa-Dominant':
        return 'from-green-500 to-yellow-500';
      case 'Sativa':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getSecondaryColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'bg-purple-800 border-purple-700';
      case 'Indica-Dominant':
        return 'bg-purple-700 border-purple-600';
      case 'Hybrid':
        return 'bg-blue-800 border-blue-700';
      case 'Sativa-Dominant':
        return 'bg-green-700 border-green-600';
      case 'Sativa':
        return 'bg-green-800 border-green-700';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'text-purple-100';
      case 'Indica-Dominant':
        return 'text-purple-100';
      case 'Hybrid':
        return 'text-blue-100';
      case 'Sativa-Dominant':
        return 'text-green-100';
      case 'Sativa':
        return 'text-green-100';
      default:
        return 'text-gray-100';
    }
  };

  const [thcMin, thcMax] = getDeterministicTHCRange(strain.name);

  return <Card className="overflow-hidden">
      <div className={`h-32 bg-gradient-to-br ${getTypeColor(strain.type)} flex items-center justify-center relative`}>
        <div className="text-6xl opacity-20 absolute">🌿</div>
        <div className="text-4xl z-10">{getStrainEmoji(strain.type)}</div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
            {strain.type}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 text-white/80 text-xs">
          {strain.confidence}% confidence
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-2">{strain.name}</h3>
        
        <div className={`p-2 rounded-lg border ${getSecondaryColor(strain.type)} mb-4`}>
          <div className="text-xs text-gray-300 mb-1">THC</div>
          <div className={`font-bold text-lg ${getTextColor(strain.type)}`}>{thcMin}%–{thcMax}%</div>
        </div>

        <div className="text-sm text-muted-foreground">
          Scanned {new Date(strain.scannedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>;
};

export default StrainVisualCard;

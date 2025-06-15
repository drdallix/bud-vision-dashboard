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
      case 'Sativa':
        return '☀️';
      case 'Hybrid':
        return '🌓';
      default:
        return '🌿';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'from-purple-500 to-purple-700';
      case 'Sativa':
        return 'from-green-500 to-green-700';
      case 'Hybrid':
        return 'from-blue-500 to-blue-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };
  const getSecondaryColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'bg-purple-100 border-purple-200';
      case 'Sativa':
        return 'bg-green-100 border-green-200';
      case 'Hybrid':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };
  const [thcMin, thcMax] = getDeterministicTHCRange(strain.name);
  return <Card className="overflow-hidden">
      <div className={`h-32 bg-gradient-to-br ${getTypeColor(strain.type)} flex items-center justify-center relative`}>
        <div className="text-6xl opacity-20 absolute">🌿</div>
        <div className="text-4xl z-10">{getStrainEmoji(strain.type)}</div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
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
          <div className="text-xs text-muted-foreground mb-1">THC</div>
          <div className="font-bold text-lg text-black ">{thcMin}%–{thcMax}%</div>
        </div>

        <div className="text-sm text-muted-foreground">
          Scanned {new Date(strain.scannedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>;
};
export default StrainVisualCard;
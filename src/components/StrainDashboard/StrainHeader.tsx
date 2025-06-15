
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users } from 'lucide-react';
import { Strain } from '@/types/strain';

interface StrainHeaderProps {
  strain: Strain;
}

const StrainHeader = ({ strain }: StrainHeaderProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sativa': return 'bg-green-100 text-green-800 border-green-200';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationContext = (type: string, effects: string[]) => {
    const timeOfDay = type === 'Indica' ? 'evening/nighttime' : type === 'Sativa' ? 'daytime' : 'any time';
    const primaryEffects = effects.slice(0, 2).join(' and ').toLowerCase();
    return `Perfect for ${timeOfDay} use. Customers seeking ${primaryEffects} effects will appreciate this strain.`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <img 
              src={strain.imageUrl} 
              alt={strain.name}
              className="w-48 h-48 object-cover rounded-lg shadow-lg"
            />
          </div>
          
          <div className="flex-grow space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{strain.name}</h1>
                <Badge className={getTypeColor(strain.type)}>
                  {strain.type}
                </Badge>
              </div>
              <p className="text-muted-foreground">{strain.description}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    <strong>Customer Recommendation:</strong> {getRecommendationContext(strain.type, strain.effects)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Scanned on {new Date(strain.scannedAt).toLocaleDateString()} • {strain.confidence}% identification confidence
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">THC</span>
                  <span className="text-sm font-bold">{strain.thc}%</span>
                </div>
                <Progress value={strain.thc} max={35} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">CBD</span>
                  <span className="text-sm font-bold">{strain.cbd}%</span>
                </div>
                <Progress value={strain.cbd} max={25} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainHeader;

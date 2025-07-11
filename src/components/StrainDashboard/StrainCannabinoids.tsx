import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

interface StrainCannabinoidsProps {
  strain: Strain;
}

const StrainCannabinoids = ({ strain }: StrainCannabinoidsProps) => {
  const [thcMin, thcMax] = getDeterministicTHCRange(strain.name);
  const avgTHC = ((thcMin + thcMax) / 2);

  const getPotencyLabel = (thc: number) => {
    if (thc >= 25) return 'High Potency';
    if (thc >= 23) return 'Moderate-High Potency';
    return 'Moderate Potency';
  };

  const getRecommendation = (thc: number, type: string) => {
    const tolerance = thc >= 25 ? 'experienced users' : 'most users';
    const effects = type === 'Indica' ? 'relaxation and stress relief' : 
                   type === 'Sativa' ? 'energy and creativity' : 
                   'balanced mind and body effects';
    
    return `Perfect for ${tolerance} seeking ${effects}. The average ${thc}% THC content delivers ${thc >= 25 ? 'powerful' : 'reliable'} recreational effects.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>THC Potency Analysis</CardTitle>
        <CardDescription>
          Recreational-focused potency breakdown for informed recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">THC (Psychoactive)</span>
                <span className="font-bold text-lg text-green-600">{thcMin}%–{thcMax}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>{getPotencyLabel(avgTHC)}</strong> - Primary compound responsible for euphoric recreational effects<br />
                (Range is deterministic by strain name)
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-green-800">Budtender Recommendation</h4>
              <p className="text-sm text-green-700">
                {getRecommendation(avgTHC, strain.type)}
              </p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2">DoobieDB Confidence</h4>
              <div className="flex items-center gap-2">
                <Progress value={strain.confidence} className="flex-1 h-2" />
                <span className="font-bold text-primary">{strain.confidence}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Package scan accuracy - reliable for customer recommendations
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainCannabinoids;

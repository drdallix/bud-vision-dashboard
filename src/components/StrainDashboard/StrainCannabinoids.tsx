
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Strain } from '@/types/strain';

interface StrainCannabinoidsProps {
  strain: Strain;
}

const StrainCannabinoids = ({ strain }: StrainCannabinoidsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Cannabinoid Analysis</CardTitle>
        <CardDescription>
          Detailed breakdown for informed customer recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">THC (Psychoactive)</span>
                <span className="font-bold text-lg">{strain.thc}%</span>
              </div>
              <Progress value={strain.thc} max={35} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                Primary psychoactive compound - responsible for euphoric effects
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">CBD (Therapeutic)</span>
                <span className="font-bold text-lg">{strain.cbd}%</span>
              </div>
              <Progress value={strain.cbd} max={25} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                Non-psychoactive, therapeutic compound - provides wellness benefits
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-accent/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Budtender Notes</h4>
              <p className="text-sm text-muted-foreground">
                This <strong>{strain.type}</strong> strain is ideal for customers seeking {strain.effects.slice(0, 2).join(' and ').toLowerCase()} effects. 
                The {strain.thc}% THC content provides {strain.thc > 20 ? 'strong' : strain.thc > 15 ? 'moderate' : 'mild'} potency.
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

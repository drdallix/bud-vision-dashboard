
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface StrainEffectsProps {
  effects: string[];
}

const StrainEffects = ({ effects }: StrainEffectsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Customer Effects
        </CardTitle>
        <CardDescription>How customers typically feel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {effects.map((effect, index) => (
            <Badge key={index} variant="secondary">
              <span>{effect}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainEffects;

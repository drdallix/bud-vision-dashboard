
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { EffectProfile } from '@/types/strain';

interface StrainEffectsVisualProps {
  effectProfiles: EffectProfile[];
}

const StrainEffectsVisual = ({ effectProfiles = [] }: StrainEffectsVisualProps) => {
  const getScaleColor = (scale: number) => {
    const colors = {
      1: 'bg-gray-200 text-gray-800',
      2: 'bg-blue-200 text-blue-800', 
      3: 'bg-green-300 text-green-800',
      4: 'bg-yellow-400 text-yellow-900',
      5: 'bg-red-400 text-red-900'
    };
    return colors[scale as keyof typeof colors] || 'bg-gray-200 text-gray-800';
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = ['', 'Subtle', 'Mild', 'Moderate', 'Strong', 'Intense'];
    return labels[intensity] || 'Unknown';
  };

  if (!effectProfiles || effectProfiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Effects Profile
          </CardTitle>
          <CardDescription>How this strain will make you feel</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">No effect information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Effects Profile
        </CardTitle>
        <CardDescription>How this strain will make you feel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {effectProfiles.map((effect, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{effect.emoji}</span>
                  <span className="text-sm font-medium">{effect.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {getIntensityLabel(effect.intensity)}
                  </span>
                  <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getScaleColor(effect.intensity)} border-current`}>
                    {effect.intensity}/5
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded-sm ${
                      i < effect.intensity ? getScaleColor(effect.intensity).split(' ')[0] : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
            <p><strong>Scale:</strong> 1=Subtle • 2=Mild • 3=Moderate • 4=Strong • 5=Intense</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainEffectsVisual;

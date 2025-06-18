
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';
import { FlavorProfile } from '@/types/strain';

interface StrainFlavorsVisualProps {
  flavorProfiles?: FlavorProfile[];
}

const StrainFlavorsVisual = ({ flavorProfiles = [] }: StrainFlavorsVisualProps) => {
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
    const labels = ['', 'Hint', 'Light', 'Noticeable', 'Bold', 'Dominant'];
    return labels[intensity] || 'Unknown';
  };

  // Ensure we have valid flavor data
  const validFlavors = flavorProfiles.filter(flavor => 
    flavor && 
    typeof flavor === 'object' && 
    flavor.name && 
    flavor.emoji && 
    typeof flavor.intensity === 'number'
  );

  if (!validFlavors || validFlavors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-500" />
            Flavor Profile
          </CardTitle>
          <CardDescription>Taste the experience before you try it</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">No flavor information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-orange-500" />
          Flavor Profile
        </CardTitle>
        <CardDescription>Taste the experience before you try it</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {validFlavors.map((flavor, index) => {
            const intensity = Math.max(1, Math.min(5, flavor.intensity || 1));
            const intensityLabel = getIntensityLabel(intensity);
            const scaleColor = getScaleColor(intensity);
            
            return (
              <div key={`${flavor.name}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{String(flavor.emoji)}</span>
                    <span className="text-sm font-medium">{String(flavor.name)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {intensityLabel}
                    </span>
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${scaleColor} border-current`}>
                      {intensity}/5
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-full rounded-sm ${
                        i < intensity ? scaleColor.split(' ')[0] : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
            <p><strong>Scale:</strong> 1=Hint • 2=Light • 3=Noticeable • 4=Bold • 5=Dominant</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainFlavorsVisual;

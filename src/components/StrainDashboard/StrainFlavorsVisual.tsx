
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';
import { FlavorProfile } from '@/types/strain';

interface StrainFlavorsVisualProps {
  flavorProfiles?: FlavorProfile[]; // Make optional
}

const StrainFlavorsVisual = ({ flavorProfiles = [] }: StrainFlavorsVisualProps) => {
  const getIntensityBars = (intensity: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-4 rounded-sm ${
            i < intensity ? 'bg-current' : 'bg-gray-100'
          }`}
        />
      ))}
    </div>
  );

  const getIntensityLabel = (intensity: number) => {
    const labels = ['', 'Hint', 'Light', 'Noticeable', 'Bold', 'Dominant'];
    return labels[intensity] || 'Unknown';
  };

  if (!flavorProfiles || flavorProfiles.length === 0) {
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
        <div className="space-y-4">
          {flavorProfiles.map((flavor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{flavor.emoji}</span>
                  <span className="font-medium">{flavor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {getIntensityLabel(flavor.intensity)}
                  </span>
                  <Badge 
                    className={`text-xs px-2 py-0.5 border-current`}
                    style={{ backgroundColor: `${flavor.color}20`, color: flavor.color, borderColor: flavor.color }}
                  >
                    {flavor.intensity}/5
                  </Badge>
                </div>
              </div>
              <div style={{ color: flavor.color }}>
                {getIntensityBars(flavor.intensity)}
              </div>
            </div>
          ))}
          <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
            <p><strong>Flavor Intensity:</strong> 1=Hint • 2=Light • 3=Noticeable • 4=Bold • 5=Dominant</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainFlavorsVisual;


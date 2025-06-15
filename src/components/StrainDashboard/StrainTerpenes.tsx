
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker } from 'lucide-react';
import { Terpene } from '@/types/strain';

interface StrainTerpenesProps {
  terpenes?: Terpene[];
}

const StrainTerpenes = ({ terpenes }: StrainTerpenesProps) => {
  const getTerpeneScale = (percentage: number) => {
    // Convert percentage to 1-5 scale for better visual representation
    // 0-0.3% = 1, 0.3-0.6% = 2, 0.6-1.2% = 3, 1.2-2.0% = 4, 2.0%+ = 5
    if (percentage >= 2.0) return 5;
    if (percentage >= 1.2) return 4;
    if (percentage >= 0.6) return 3;
    if (percentage >= 0.3) return 2;
    return 1;
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-blue-500" />
          Terpene Profile
        </CardTitle>
        <CardDescription>Active compounds & intensity</CardDescription>
      </CardHeader>
      <CardContent>
        {terpenes && terpenes.length > 0 ? (
          <div className="space-y-3">
            {terpenes.map((terpene, index) => {
              const scale = getTerpeneScale(terpene.percentage);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{terpene.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{terpene.percentage}%</span>
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getScaleColor(scale)} border-current`}>
                        {scale}/5
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded-sm ${
                          i < scale ? getScaleColor(scale).split(' ')[0] : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{terpene.effects}</p>
                </div>
              );
            })}
            <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
              <p><strong>Scale:</strong> 1=Low • 2=Mild • 3=Moderate • 4=High • 5=Very High</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Terpene data not available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StrainTerpenes;

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Database, Zap, Leaf, Heart, Beaker, Users } from 'lucide-react';

interface Terpene {
  name: string;
  percentage: number;
  effects: string;
}

interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  terpenes?: Terpene[];
  medicalUses: string[];
  description: string;
  imageUrl: string;
  scannedAt: string;
  confidence: number;
}

interface StrainDashboardProps {
  strain: Strain | null;
}

const StrainDashboard = ({ strain }: StrainDashboardProps) => {
  if (!strain) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Strain Information</h3>
            <p className="text-muted-foreground max-w-md">
              Scan a cannabis package or select a strain from the menu to view detailed information for customer recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Enhanced terpene scaling function
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
      1: 'bg-gray-200',
      2: 'bg-blue-200', 
      3: 'bg-green-300',
      4: 'bg-yellow-400',
      5: 'bg-red-400'
    };
    return colors[scale as keyof typeof colors] || 'bg-gray-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 slide-up">
      {/* Header Card */}
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

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Effects */}
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
              {strain.effects.map((effect, index) => (
                <Badge key={index} variant="secondary">
                  {effect}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flavors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Flavor Profile
            </CardTitle>
            <CardDescription>Taste and aroma notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strain.flavors.map((flavor, index) => (
                <Badge key={index} variant="outline">
                  {flavor}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Terpenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-blue-500" />
              Terpene Profile
            </CardTitle>
            <CardDescription>Active compounds & intensity</CardDescription>
          </CardHeader>
          <CardContent>
            {strain.terpenes && strain.terpenes.length > 0 ? (
              <div className="space-y-3">
                {strain.terpenes.map((terpene, index) => {
                  const scale = getTerpeneScale(terpene.percentage);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{terpene.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{terpene.percentage}%</span>
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getScaleColor(scale)}`}>
                            {scale}/5
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded-sm ${
                              i < scale ? getScaleColor(scale) : 'bg-gray-100'
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

        {/* Medical Uses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Therapeutic Uses
            </CardTitle>
            <CardDescription>Potential medical benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strain.medicalUses.map((use, index) => (
                <Badge key={index} className="bg-red-50 text-red-700 border-red-200">
                  {use}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cannabinoid Profile */}
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
    </div>
  );
};

export default StrainDashboard;


import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FileSearch, Zap, Leaf, Heart, Beaker } from 'lucide-react';

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
            <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Strain Selected</h3>
            <p className="text-muted-foreground max-w-md">
              Scan a cannabis package or select a strain from your history to view detailed information.
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
                <p className="text-sm text-muted-foreground mt-2">
                  Identified on {new Date(strain.scannedAt).toLocaleDateString()} with {strain.confidence}% confidence
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
              Effects
            </CardTitle>
            <CardDescription>How this strain typically makes you feel</CardDescription>
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
              Flavors
            </CardTitle>
            <CardDescription>Taste and aroma profile</CardDescription>
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

        {/* Terpenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-blue-500" />
              Terpenes
            </CardTitle>
            <CardDescription>Active compounds and their effects</CardDescription>
          </CardHeader>
          <CardContent>
            {strain.terpenes && strain.terpenes.length > 0 ? (
              <div className="space-y-3">
                {strain.terpenes.map((terpene, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{terpene.name}</span>
                      <span className="text-xs font-bold">{terpene.percentage}%</span>
                    </div>
                    <Progress value={terpene.percentage} max={3} className="h-1" />
                    <p className="text-xs text-muted-foreground">{terpene.effects}</p>
                  </div>
                ))}
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
              Medical Uses
            </CardTitle>
            <CardDescription>Potential therapeutic benefits</CardDescription>
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
          <CardTitle>Cannabinoid Profile</CardTitle>
          <CardDescription>
            Detailed breakdown of active compounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">THC (Tetrahydrocannabinol)</span>
                  <span className="font-bold text-lg">{strain.thc}%</span>
                </div>
                <Progress value={strain.thc} max={35} className="h-3" />
                <p className="text-sm text-muted-foreground mt-1">
                  Primary psychoactive compound
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">CBD (Cannabidiol)</span>
                  <span className="font-bold text-lg">{strain.cbd}%</span>
                </div>
                <Progress value={strain.cbd} max={25} className="h-3" />
                <p className="text-sm text-muted-foreground mt-1">
                  Non-psychoactive, therapeutic compound
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Strain Classification</h4>
                <p className="text-sm text-muted-foreground">
                  This <strong>{strain.type}</strong> strain is known for its balanced effects, combining the best characteristics of its genetic lineage.
                </p>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">Identification Confidence</h4>
                <div className="flex items-center gap-2">
                  <Progress value={strain.confidence} className="flex-1 h-2" />
                  <span className="font-bold text-primary">{strain.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrainDashboard;

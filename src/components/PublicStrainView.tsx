
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Leaf, Zap, Heart, Beaker, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const PublicStrainView = () => {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublicStrains();
  }, []);

  const fetchPublicStrains = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedStrains = (data || []).map((scan: any): Strain => ({
        id: scan.id,
        name: scan.strain_name,
        type: ['Indica', 'Sativa', 'Hybrid'].includes(scan.strain_type) ? scan.strain_type : 'Hybrid',
        thc: Number(scan.thc) || 0,
        cbd: Number(scan.cbd) || 0,
        effects: scan.effects || [],
        flavors: scan.flavors || [],
        terpenes: scan.terpenes || [],
        medicalUses: scan.medical_uses || [],
        description: scan.description || '',
        imageUrl: scan.image_url || '/placeholder.svg',
        scannedAt: scan.scanned_at,
        confidence: scan.confidence || 0,
      }));

      setStrains(formattedStrains);
    } catch (error) {
      console.error('Error fetching public strains:', error);
      toast({
        title: "Error loading strains",
        description: "Failed to load strain information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300';
      case 'Sativa': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Available Strains</h2>
        <p className="text-muted-foreground">Browse our current strain inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strains.map((strain) => (
          <Card key={strain.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{strain.name}</CardTitle>
                <Badge className={getTypeColor(strain.type)}>
                  {strain.type}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {strain.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {strain.imageUrl && (
                <img 
                  src={strain.imageUrl} 
                  alt={strain.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">THC</span>
                    <span className="text-sm font-bold">{strain.thc}%</span>
                  </div>
                  <Progress value={strain.thc} max={35} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">CBD</span>
                    <span className="text-sm font-bold">{strain.cbd}%</span>
                  </div>
                  <Progress value={strain.cbd} max={25} className="h-2" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Effects</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strain.effects.slice(0, 3).map((effect, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Flavors</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strain.flavors.slice(0, 3).map((flavor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flavor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Added {new Date(strain.scannedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {strains.length === 0 && (
        <div className="text-center py-16">
          <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Strains Available</h3>
          <p className="text-muted-foreground">Check back later for updated inventory.</p>
        </div>
      )}
    </div>
  );
};

export default PublicStrainView;

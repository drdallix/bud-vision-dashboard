
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Leaf, Zap, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface FeaturedStrain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  price: string;
  rating: number;
  image: string;
  description: string;
}

const ShopMenu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Featured strains for display
  const featuredStrains: FeaturedStrain[] = [
    {
      id: '1',
      name: 'Blue Dream',
      type: 'Hybrid',
      thc: 21,
      cbd: 2,
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Creative'],
      flavors: ['Berry', 'Sweet', 'Earthy'],
      price: '$45/8th',
      rating: 4.8,
      image: '/placeholder.svg',
      description: 'A balanced hybrid providing full-body relaxation with gentle cerebral invigoration.'
    },
    {
      id: '2',
      name: 'OG Kush',
      type: 'Hybrid',
      thc: 24,
      cbd: 1,
      effects: ['Euphoric', 'Happy', 'Relaxed', 'Uplifted'],
      flavors: ['Earthy', 'Pine', 'Woody'],
      price: '$50/8th',
      rating: 4.9,
      image: '/placeholder.svg',
      description: 'Classic strain with complex aroma and balanced head and body effects.'
    },
    {
      id: '3',
      name: 'Granddaddy Purple',
      type: 'Indica',
      thc: 20,
      cbd: 1,
      effects: ['Relaxed', 'Sleepy', 'Happy', 'Euphoric'],
      flavors: ['Grape', 'Berry', 'Sweet'],
      price: '$48/8th',
      rating: 4.7,
      image: '/placeholder.svg',
      description: 'Potent indica delivering deep relaxation and stress relief.'
    },
    {
      id: '4',
      name: 'Green Crack',
      type: 'Sativa',
      thc: 22,
      cbd: 1,
      effects: ['Energetic', 'Focused', 'Happy', 'Uplifted'],
      flavors: ['Citrus', 'Sweet', 'Tropical'],
      price: '$46/8th',
      rating: 4.6,
      image: '/placeholder.svg',
      description: 'Energizing sativa perfect for daytime use and creative activities.'
    },
    {
      id: '5',
      name: 'Wedding Cake',
      type: 'Hybrid',
      thc: 25,
      cbd: 1,
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Sleepy'],
      flavors: ['Sweet', 'Vanilla', 'Earthy'],
      price: '$55/8th',
      rating: 4.9,
      image: '/placeholder.svg',
      description: 'Premium hybrid with exceptional flavor and potent relaxing effects.'
    },
    {
      id: '6',
      name: 'Sour Diesel',
      type: 'Sativa',
      thc: 23,
      cbd: 2,
      effects: ['Energetic', 'Happy', 'Uplifted', 'Creative'],
      flavors: ['Diesel', 'Citrus', 'Pungent'],
      price: '$47/8th',
      rating: 4.5,
      image: '/placeholder.svg',
      description: 'Iconic sativa with distinctive aroma and long-lasting energetic effects.'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sativa': return 'bg-green-100 text-green-800 border-green-200';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredStrains = featuredStrains.filter(strain => {
    const matchesSearch = strain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strain.effects.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         strain.flavors.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || strain.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
            Cannabis Strain Menu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover premium cannabis strains with detailed information about effects, flavors, and potency. 
            Sign in to scan packages with AI identification.
          </p>
          <Button asChild size="lg" className="mr-4">
            <Link to="/auth">Sign In to Scan Packages</Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search strains, effects, or flavors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              All Types
            </Button>
            <Button
              variant={selectedType === 'indica' ? 'default' : 'outline'}
              onClick={() => setSelectedType('indica')}
            >
              Indica
            </Button>
            <Button
              variant={selectedType === 'sativa' ? 'default' : 'outline'}
              onClick={() => setSelectedType('sativa')}
            >
              Sativa
            </Button>
            <Button
              variant={selectedType === 'hybrid' ? 'default' : 'outline'}
              onClick={() => setSelectedType('hybrid')}
            >
              Hybrid
            </Button>
          </div>
        </div>

        {/* Strains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredStrains.map((strain) => (
            <Card key={strain.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <Leaf className="h-16 w-16 text-green-600" />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{strain.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(strain.type)}>
                        {strain.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{strain.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{strain.price}</div>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {strain.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">THC: {strain.thc}%</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(strain.thc / 35) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">CBD: {strain.cbd}%</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${(strain.cbd / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Effects</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strain.effects.slice(0, 3).map((effect, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                    {strain.effects.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{strain.effects.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Flavors</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strain.flavors.map((flavor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flavor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStrains.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No strains found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Identify Your Strains?</h2>
          <p className="text-lg mb-6 opacity-90">
            Sign up to use our AI-powered package scanner and build your personal strain library
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopMenu;

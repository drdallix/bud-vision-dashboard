
import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Eye, Edit3, Package, PackageX, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { convertDatabaseScanToStrain } from '@/utils/strainConverters';
import { Strain } from '@/types/strain';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [editMode, setEditMode] = useState(false);
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateStockStatus, batchUpdateStock, loading: inventoryLoading } = useInventoryManagement();

  useEffect(() => {
    fetchStrains();
  }, []);

  const fetchStrains = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      const formattedStrains = (data || []).map(convertDatabaseScanToStrain);
      setStrains(formattedStrains);
    } catch (error) {
      console.error('Error fetching strains:', error);
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

  const handleStockToggle = async (strainId: string, currentStock: boolean) => {
    const success = await updateStockStatus(strainId, !currentStock);
    if (success) {
      setStrains(prev => prev.map(strain => 
        strain.id === strainId ? { ...strain, inStock: !currentStock } : strain
      ));
    }
  };

  const handleBatchStockUpdate = async (inStock: boolean) => {
    if (selectedStrains.length === 0) return;
    
    const success = await batchUpdateStock(selectedStrains, inStock);
    if (success) {
      setStrains(prev => prev.map(strain => 
        selectedStrains.includes(strain.id) ? { ...strain, inStock } : strain
      ));
      setSelectedStrains([]);
    }
  };

  const handleStrainSelect = (strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  };

  const filteredAndSortedStrains = strains
    .filter(strain => {
      const matchesSearch = strain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          strain.effects.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          strain.flavors.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || strain.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'thc':
          return b.thc - a.thc;
        case 'confidence':
          return b.confidence - a.confidence;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with mode toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Browse Strains</h2>
          <p className="text-muted-foreground">
            {editMode ? 'Manage inventory and stock status' : 'Explore available cannabis strains'}
          </p>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Switch
              checked={editMode}
              onCheckedChange={setEditMode}
              aria-label="Toggle edit mode"
            />
            <Edit3 className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search strains, effects, or flavors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Indica">Indica</SelectItem>
                <SelectItem value="Sativa">Sativa</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="thc">Highest THC</SelectItem>
                <SelectItem value="confidence">Highest Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Batch actions for edit mode */}
          {editMode && selectedStrains.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchStockUpdate(true)}
                disabled={inventoryLoading}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Mark In Stock ({selectedStrains.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchStockUpdate(false)}
                disabled={inventoryLoading}
                className="flex items-center gap-2"
              >
                <PackageX className="h-4 w-4" />
                Mark Out of Stock ({selectedStrains.length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedStrains([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStrains.map((strain) => (
          <Card 
            key={strain.id} 
            className={`transition-all duration-200 ${
              !editMode ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
            } ${!strain.inStock ? 'opacity-60' : ''}`}
            onClick={() => !editMode && onStrainSelect(strain)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {editMode && user && strain.userId === user.id && (
                  <Checkbox
                    checked={selectedStrains.includes(strain.id)}
                    onCheckedChange={(checked) => handleStrainSelect(strain.id, checked as boolean)}
                    className="mt-1 flex-shrink-0"
                  />
                )}
                
                <img 
                  src={strain.imageUrl} 
                  alt={strain.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{strain.name}</h3>
                    <Badge className={`${getTypeColor(strain.type)} text-xs`}>
                      {strain.type}
                    </Badge>
                    {!strain.inStock && (
                      <Badge variant="secondary" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span>THC: {strain.thc}%</span>
                    <span>CBD: {strain.cbd}%</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {strain.effects.slice(0, 2).map((effect, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                    {strain.effects.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{strain.effects.length - 2} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(strain.scannedAt).toLocaleDateString()}
                    </p>
                    
                    {editMode && user && strain.userId === user.id && (
                      <Switch
                        checked={strain.inStock}
                        onCheckedChange={() => handleStockToggle(strain.id, strain.inStock)}
                        disabled={inventoryLoading}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedStrains.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more strains.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrowseStrains;

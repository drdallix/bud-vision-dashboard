
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, TrendingUp, Eye, Edit3, Package, PackageX, Mic, MicOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';
import { Strain } from '@/types/strain';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [editMode, setEditMode] = useState(false);
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateStockStatus, batchUpdateStock, loading: inventoryLoading } = useInventoryManagement();
  
  // Use the new optimized hook
  const { strains, isLoading, updateStrainInCache } = useBrowseStrains(searchTerm, filterType, sortBy);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or use text input.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, toast]);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300';
      case 'Sativa': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  const handleStockToggle = useCallback(async (strainId: string, currentStock: boolean) => {
    // Optimistic update
    updateStrainInCache(strainId, { inStock: !currentStock });
    
    const success = await updateStockStatus(strainId, !currentStock);
    if (!success) {
      // Revert on failure
      updateStrainInCache(strainId, { inStock: currentStock });
    }
  }, [updateStockStatus, updateStrainInCache]);

  const handleBatchStockUpdate = useCallback(async (inStock: boolean) => {
    if (selectedStrains.length === 0) return;
    
    // Optimistic updates
    selectedStrains.forEach(strainId => {
      updateStrainInCache(strainId, { inStock });
    });
    
    const success = await batchUpdateStock(selectedStrains, inStock);
    if (success) {
      setSelectedStrains([]);
    }
  }, [selectedStrains, batchUpdateStock, updateStrainInCache]);

  const handleStrainSelect = useCallback((strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  }, []);

  // Show skeleton loading only on first load, not on navigation
  if (isLoading && strains.length === 0) {
    return (
      <div className="space-y-4 pb-20">
        {/* Search skeleton */}
        <div className="relative">
          <div className="h-12 bg-muted rounded-full animate-pulse" />
        </div>
        
        {/* Filters skeleton */}
        <div className="flex gap-3">
          <div className="w-36 h-10 bg-muted rounded animate-pulse" />
          <div className="w-40 h-10 bg-muted rounded animate-pulse" />
        </div>
        
        {/* Strain cards skeleton */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded animate-pulse w-16" />
                    <div className="h-6 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Omnibar Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search strains, effects, or flavors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-12 h-12 text-lg rounded-full border-2 focus:border-green-500"
          />
          <Button
            onClick={toggleVoiceInput}
            variant="ghost"
            size="sm"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full ${
              isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        {isListening && (
          <div className="absolute top-full mt-2 left-0 right-0 text-center">
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">
              🎤 Listening... Speak now
            </div>
          </div>
        )}
      </div>

      {/* Header with mode toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Browse Strains</h2>
          <p className="text-muted-foreground text-sm">
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Indica">Indica</SelectItem>
            <SelectItem value="Sativa">Sativa</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <TrendingUp className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort" />
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
        <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchStockUpdate(true)}
            disabled={inventoryLoading}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            In Stock ({selectedStrains.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchStockUpdate(false)}
            disabled={inventoryLoading}
            className="flex items-center gap-2"
          >
            <PackageX className="h-4 w-4" />
            Out of Stock ({selectedStrains.length})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedStrains([])}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Strain Grid */}
      <div className="grid grid-cols-1 gap-4">
        {strains.map((strain) => (
          <Card 
            key={strain.id} 
            className={`transition-all duration-200 ${
              !editMode ? 'cursor-pointer hover:shadow-md' : ''
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
                    <h3 className="font-semibold truncate text-lg">{strain.name}</h3>
                    <Badge className={`${getTypeColor(strain.type)} text-xs`}>
                      {strain.type}
                    </Badge>
                    {!strain.inStock && (
                      <Badge variant="secondary" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="font-medium">THC: {strain.thc}%</span>
                    <span>CBD: {strain.cbd}%</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {strain.effects.slice(0, 3).map((effect, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                    {strain.effects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{strain.effects.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(strain.scannedAt).toLocaleDateString()}
                    </p>
                    
                    {editMode && user && strain.userId === user.id && (
                      <Switch
                        checked={strain.inStock}
                        onCheckedChange={() => handleStockToggle(strain.id, strain.inStock)}
                        disabled={inventoryLoading}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {strains.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrowseStrains;


import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Eye, Edit3, Package, PackageX, Mic, MicOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { convertDatabaseScanToStrain } from '@/utils/strainConverters';
import { Strain } from '@/types/strain';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

// Cache interface
interface CacheData {
  strains: Strain[];
  timestamp: number;
}

const CACHE_KEY = 'cached_strains';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [editMode, setEditMode] = useState(false);
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateStockStatus, batchUpdateStock, loading: inventoryLoading } = useInventoryManagement();

  // Voice recognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
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

    fetchStrains();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('strains-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans'
        },
        (payload) => {
          console.log('Real-time strain update:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newStrain = convertDatabaseScanToStrain(payload.new);
      setStrains(prev => [newStrain, ...prev]);
      updateCache([newStrain, ...strains]);
    } else if (payload.eventType === 'UPDATE') {
      const updatedStrain = convertDatabaseScanToStrain(payload.new);
      setStrains(prev => prev.map(strain => 
        strain.id === updatedStrain.id ? updatedStrain : strain
      ));
    } else if (payload.eventType === 'DELETE') {
      setStrains(prev => prev.filter(strain => strain.id !== payload.old.id));
    }
  };

  const getCachedStrains = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CacheData = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
        return isExpired ? null : data;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const updateCache = (strains: Strain[]) => {
    try {
      const cacheData: CacheData = {
        strains,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  const fetchStrains = async () => {
    // Try cache first
    const cachedData = getCachedStrains();
    if (cachedData) {
      setStrains(cachedData.strains);
      setLoading(false);
      // Fetch fresh data in background
      fetchFreshData();
      return;
    }

    // No cache, fetch fresh data with loading state
    await fetchFreshData();
  };

  const fetchFreshData = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      const formattedStrains = (data || []).map(convertDatabaseScanToStrain);
      setStrains(formattedStrains);
      updateCache(formattedStrains);
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

  const toggleVoiceInput = () => {
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
    <div className="space-y-6 pb-20"> {/* Add bottom padding for mobile nav */}
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
        {filteredAndSortedStrains.map((strain) => (
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

      {filteredAndSortedStrains.length === 0 && (
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

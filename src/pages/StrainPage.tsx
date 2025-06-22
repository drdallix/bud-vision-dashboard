
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { useStrainAPI } from '@/hooks/useStrainAPI';
import StrainDashboard from '@/components/StrainDashboard';
import StrainAPIControls from '@/components/StrainAPI/StrainAPIControls';
import URLParameterHelper from '@/components/StrainAPI/URLParameterHelper';
import Header from '@/components/Layout/Header';
import { Strain } from '@/types/strain';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StrainPage = () => {
  const { strainName } = useParams<{ strainName: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { strains, isLoading } = useRealtimeStrainStore(true);
  const { generateStrain, isGenerating, rateLimitInfo, isAuthenticated } = useStrainAPI();
  const { toast } = useToast();
  
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState('strain');

  // Convert URL-friendly name back to searchable format
  const urlToSearchTerm = (urlName: string): string => {
    return urlName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Parse URL parameters for strain generation
  const parseURLParameters = () => {
    const params: any = {};
    
    if (searchParams.get('type')) params.type = searchParams.get('type');
    if (searchParams.get('thc')) params.thc = parseInt(searchParams.get('thc') || '0');
    if (searchParams.get('cbd')) params.cbd = parseInt(searchParams.get('cbd') || '0');
    if (searchParams.get('effects')) params.effects = searchParams.get('effects')?.split(',').map(e => e.trim());
    if (searchParams.get('flavors')) params.flavors = searchParams.get('flavors')?.split(',').map(f => f.trim());
    if (searchParams.get('description')) params.description = searchParams.get('description');
    if (searchParams.get('force')) params.force = searchParams.get('force') === 'true';
    
    return Object.keys(params).length > 0 ? params : null;
  };

  // Fuzzy search for strain name
  const findStrainByName = (searchTerm: string): Strain | null => {
    if (!strains || strains.length === 0) return null;
    
    const cleanSearchTerm = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Try exact match first
    let found = strains.find(strain => 
      strain.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSearchTerm
    );
    
    if (found) return found;
    
    // Try partial match
    found = strains.find(strain => 
      strain.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanSearchTerm) ||
      cleanSearchTerm.includes(strain.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
    
    if (found) return found;
    
    // Try word-by-word match
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    found = strains.find(strain => {
      const strainWords = strain.name.toLowerCase().split(/\s+/);
      return searchWords.some(searchWord => 
        strainWords.some(strainWord => 
          strainWord.includes(searchWord) || searchWord.includes(strainWord)
        )
      );
    });
    
    return found || null;
  };

  // Generate strain with API parameters
  const handleGenerateStrain = async (params: any = {}) => {
    if (!strainName) return;
    
    const searchTerm = urlToSearchTerm(strainName);
    const urlParams = parseURLParameters();
    const finalParams = { ...urlParams, ...params };
    
    const strain = await generateStrain(searchTerm, finalParams);
    if (strain) {
      setCurrentStrain(strain);
      setActiveTab('strain');
    }
  };

  // Search for strain or auto-generate based on URL parameters
  useEffect(() => {
    if (!strainName || isLoading || searchAttempted) return;
    
    const searchTerm = urlToSearchTerm(strainName);
    const urlParams = parseURLParameters();
    
    console.log('Searching for strain:', searchTerm, 'from URL:', strainName);
    console.log('URL Parameters:', urlParams);
    
    const foundStrain = findStrainByName(searchTerm);
    
    if (foundStrain && !urlParams?.force) {
      console.log('Found existing strain:', foundStrain.name);
      setCurrentStrain(foundStrain);
      setActiveTab('strain');
    } else if (urlParams) {
      // Auto-generate with URL parameters
      console.log('Auto-generating strain with URL parameters');
      handleGenerateStrain(urlParams);
    } else {
      // Show API controls for manual generation
      console.log('Strain not found, showing API controls');
      setActiveTab('api');
    }
    
    setSearchAttempted(true);
  }, [strainName, strains, isLoading, searchAttempted]);

  if (!strainName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid strain URL</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && !searchAttempted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading strain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Header onSettingsClick={() => {}} />
        
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="strain" disabled={!currentStrain}>
              Strain Details
            </TabsTrigger>
            <TabsTrigger value="api">
              API Generator
            </TabsTrigger>
            <TabsTrigger value="docs">
              API Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strain" className="space-y-6">
            {currentStrain ? (
              <StrainDashboard strain={currentStrain} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No strain data available. Use the API Generator to create this strain.
                </p>
                <Button onClick={() => setActiveTab('api')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Open API Generator
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <div className="flex justify-center">
              <StrainAPIControls
                strainName={urlToSearchTerm(strainName)}
                onGenerate={handleGenerateStrain}
                isGenerating={isGenerating}
                isAuthenticated={isAuthenticated}
                rateLimitInfo={rateLimitInfo}
              />
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <URLParameterHelper strainName={strainName} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StrainPage;


import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { useStrainAPI } from '@/hooks/useStrainAPI';
import StrainDashboard from '@/components/StrainDashboard';
import DoobieSequence from '@/components/DoobieSequence';
import { Strain } from '@/types/strain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Zap, Cannabis } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StrainPage = () => {
  const { strainName } = useParams<{ strainName: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { strains, isLoading } = useRealtimeStrainStore(true);
  const { generateStrain, isGenerating: apiGenerating, rateLimitInfo, isAuthenticated } = useStrainAPI();
  const { toast } = useToast();
  
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDoobieSequence, setShowDoobieSequence] = useState(false);

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

  // Generate strain with enhanced DoobieDB sequence
  const handleGenerateStrain = async (params: any = {}) => {
    if (!strainName) return;
    
    setIsGenerating(true);
    setShowDoobieSequence(true);
    
    const searchTerm = urlToSearchTerm(strainName);
    const urlParams = parseURLParameters();
    const finalParams = { ...urlParams, ...params };
    
    // Start the sequence animation
    setTimeout(async () => {
      const strain = await generateStrain(searchTerm, finalParams);
      if (strain) {
        setCurrentStrain(strain);
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleSequenceComplete = () => {
    setShowDoobieSequence(false);
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
    } else if (urlParams) {
      // Auto-generate with URL parameters
      console.log('Auto-generating strain with URL parameters');
      handleGenerateStrain(urlParams);
    } else {
      // Show generation interface
      console.log('Strain not found, ready for generation');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-emerald-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            size="sm"
            className="animate-fade-in"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DoobieDB
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <Cannabis className="h-6 w-6 text-green-600" />
              {urlToSearchTerm(strainName)}
            </h1>
            <p className="text-sm text-muted-foreground">Strain Analysis & Generation</p>
          </div>
          
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {showDoobieSequence && (
          <div className="flex justify-center mb-8">
            <DoobieSequence 
              isActive={showDoobieSequence} 
              onComplete={handleSequenceComplete}
            />
          </div>
        )}

        {currentStrain ? (
          <div className="animate-fade-in">
            <StrainDashboard strain={currentStrain} />
          </div>
        ) : !showDoobieSequence ? (
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Generate Strain Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  This strain hasn't been analyzed yet. Generate a comprehensive profile using DoobieDB AI.
                </p>
                
                <Button 
                  onClick={() => handleGenerateStrain()}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate with DoobieDB AI
                </Button>
                
                <div className="text-xs text-center text-muted-foreground">
                  Advanced cannabis genome analysis & strain profiling
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StrainPage;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { useScans } from '@/hooks/useScans';
import { analyzeStrainWithAI } from '@/components/SmartOmnibar/AIAnalysis';
import StrainDashboard from '@/components/StrainDashboard';
import Header from '@/components/Layout/Header';
import { Strain } from '@/types/strain';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StrainPage = () => {
  const { strainName } = useParams<{ strainName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { strains, isLoading } = useRealtimeStrainStore(true);
  const { addScan } = useScans();
  const { toast } = useToast();
  
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

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

  // Generate strain if not found
  const generateStrain = async (searchTerm: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate new strains.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating strain for:', searchTerm);
      const result = await analyzeStrainWithAI(undefined, searchTerm, user.id);
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      await addScan(strain);
      setCurrentStrain(strain);
      
      toast({
        title: "Strain Generated",
        description: `${strain.name} has been generated and added to your collection.`,
      });
    } catch (error) {
      console.error('Failed to generate strain:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate strain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Search for strain when component mounts or strains change
  useEffect(() => {
    if (!strainName || isLoading || searchAttempted) return;
    
    const searchTerm = urlToSearchTerm(strainName);
    console.log('Searching for strain:', searchTerm, 'from URL:', strainName);
    
    const foundStrain = findStrainByName(searchTerm);
    
    if (foundStrain) {
      console.log('Found existing strain:', foundStrain.name);
      setCurrentStrain(foundStrain);
    } else {
      console.log('Strain not found, will generate:', searchTerm);
      generateStrain(searchTerm);
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

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isGenerating ? 'Generating strain profile...' : 'Loading strain data...'}
          </p>
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

        <StrainDashboard strain={currentStrain} />
      </div>
    </div>
  );
};

export default StrainPage;

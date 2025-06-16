
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import BrowseStrains from '@/components/BrowseStrains';
import StrainShowcase from '@/components/StrainShowcase';
import StrainDashboard from '@/components/StrainDashboard';
import SmartOmnibar from '@/components/SmartOmnibar';
import Header from '@/components/Layout/Header';
import MobileNavigation from '@/components/Layout/MobileNavigation';
import Navigation from '@/components/Layout/Navigation';
import QuickStats from '@/components/Layout/QuickStats';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    strains,
    isLoading
  } = useRealtimeStrainStore();
  const [activeTab, setActiveTab] = useState('showcase');
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set default tab based on authentication
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setActiveTab('browse'); // Authenticated users default to browse
      } else {
        setActiveTab('showcase'); // Unauthenticated users default to showcase
      }
    }
  }, [user, authLoading]);

  const handleStrainSelect = (strain: Strain) => {
    setCurrentStrain(strain);
    setActiveTab('details');
  };

  const handleStrainGenerated = (strain: Strain) => {
    setCurrentStrain(strain);
    setActiveTab('details');
  };

  const handleSettingsClick = () => {
    // Settings functionality can be implemented later
    console.log('Settings clicked');
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  return <div className="min-h-screen bg-background text-foreground">
      <Header onSettingsClick={handleSettingsClick} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Authentication Status & Quick Actions */}
        <div className="mb-6">
          {user ? <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">
                  <span className="font-semibold">✓ Authenticated</span> - You can add, edit, and manage all strains in the shared database
                </p>
              </div>
              <QuickStats scans={strains} />
            </div> : <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">
                  <span className="font-semibold">👁️ Viewing Mode</span> - Browse and search all strains, but sign in to add new ones
                </p>
              </div>
              <Button onClick={() => navigate('/auth')} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </div>}
        </div>

        {/* Smart Omnibar - Only show for authenticated users */}
        {user && <Card className="mb-6 bg-card border-border">
            <CardContent className="p-6">
              <SmartOmnibar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                onStrainGenerated={handleStrainGenerated} 
                hasResults={strains.length > 0} 
              />
            </CardContent>
          </Card>}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation */}
          <div className="flex flex-col space-y-4">
            <div className="hidden md:block">
              <Navigation />
            </div>
            
            <div className="md:hidden">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="showcase">Live Showcase</TabsTrigger>
                {user && <TabsTrigger value="browse">Browse & Edit</TabsTrigger>}
              </TabsList>
            </div>
          </div>

          {/* Content */}
          <TabsContent value="showcase" className="space-y-6">
            <StrainShowcase onStrainSelect={handleStrainSelect} />
          </TabsContent>

          {user && <TabsContent value="browse" className="space-y-6">
              <BrowseStrains onStrainSelect={handleStrainSelect} />
            </TabsContent>}

          <TabsContent value="details" className="space-y-6">
            {currentStrain ? <StrainDashboard strain={currentStrain} /> : <div className="text-center py-12">
                <p className="text-muted-foreground">Select a strain to view details</p>
              </div>}
          </TabsContent>
        </Tabs>

        {/* AI Disclaimer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ All information generated by AI • For recreation and enjoyment only • Not for medical purposes
          </p>
        </div>
      </main>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
};

export default Index;

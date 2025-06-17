
import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import { useAppState } from '@/hooks/useAppState';
import StrainDashboard from '@/components/StrainDashboard';
import BrowseStrains from '@/components/BrowseStrains';
import SettingsDialog from '@/components/SettingsDialog';
import InstallBanner from '@/components/InstallBanner';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import MobileNavigation from '@/components/Layout/MobileNavigation';
import QuickStats from '@/components/Layout/QuickStats';
import StrainShowcase from '@/components/StrainShowcase';
import ShowcaseSkeleton from '@/components/ui/skeletons/ShowcaseSkeleton';
import BrowseGridSkeleton from '@/components/ui/skeletons/BrowseGridSkeleton';
import { Strain } from '@/types/strain';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { scans, addScan } = useScans();
  const { appState, updateAppState } = useAppState();
  const { strains, isLoading: strainsLoading } = useRealtimeStrainStore(true);
  
  const [activeTab, setActiveTab] = useState(appState.activeTab);
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  // Restore current strain from saved state
  useEffect(() => {
    if (appState.currentStrainId && strains.length > 0) {
      const strain = strains.find(s => s.id === appState.currentStrainId);
      if (strain) {
        setCurrentStrain(strain);
      }
    }
  }, [appState.currentStrainId, strains]);

  // Handle initial loading and fade-in effect
  useEffect(() => {
    if (!authLoading && !strainsLoading && isInitialLoad) {
      setIsInitialLoad(false);
      // Trigger fade-in after a brief delay
      setTimeout(() => setFadeIn(true), 100);
    }
  }, [authLoading, strainsLoading, isInitialLoad]);

  // Update default tab based on auth status
  useEffect(() => {
    if (!authLoading) {
      const defaultTab = user ? 'browse' : 'showcase';
      if (appState.activeTab !== activeTab) {
        setActiveTab(appState.activeTab);
      } else if (activeTab !== defaultTab && !appState.currentStrainId) {
        setActiveTab(defaultTab);
        updateAppState({ activeTab: defaultTab });
      }
    }
  }, [user, authLoading, appState.activeTab, activeTab, updateAppState]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    }
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    updateAppState({ 
      activeTab: newTab,
      currentStrainId: newTab === 'details' ? currentStrain?.id || null : null
    });
  };

  const handleStrainGenerated = async (strain: Strain) => {
    console.log('Strain generated in Index:', strain.name);
    const completeStrain: Strain = {
      ...strain,
      inStock: true,
      userId: user?.id || ''
    };
    
    setCurrentStrain(completeStrain);
    if (user) {
      await addScan(completeStrain);
    }
    
    updateAppState({ 
      activeTab: 'details',
      currentStrainId: completeStrain.id
    });
    setActiveTab('details');
  };

  const handleDataRestore = (data: Strain[]) => {
    console.log('Data restore requested:', data);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleStrainSelect = (strain: Strain) => {
    console.log('Strain selected in Index:', strain.name);
    setCurrentStrain(strain);
    updateAppState({ 
      activeTab: 'details',
      currentStrainId: strain.id
    });
    setActiveTab('details');
  };

  // Show loading state with skeletons
  if (authLoading || isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 pb-20">
          <Header onSettingsClick={handleSettingsClick} />
          <div className="space-y-6 mt-6">
            <ShowcaseSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-6 pb-20">
        <Header onSettingsClick={handleSettingsClick} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {user && <Navigation />}

          <TabsContent value="browse" className="space-y-6">
            {strainsLoading ? (
              <BrowseGridSkeleton />
            ) : (
              <BrowseStrains onStrainSelect={handleStrainSelect} />
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <StrainDashboard strain={currentStrain} />
          </TabsContent>

          <TabsContent value="showcase" className="space-y-6">
            {strainsLoading ? (
              <ShowcaseSkeleton />
            ) : (
              <StrainShowcase onStrainSelect={handleStrainSelect} />
            )}
          </TabsContent>
        </Tabs>

        {user && <QuickStats scans={scans} />}
      </div>

      {user && (
        <MobileNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      )}

      {user && (
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          scanHistory={scans}
          onDataRestore={handleDataRestore}
        />
      )}
      
      <InstallBanner />
    </div>
  );
};

export default Index;

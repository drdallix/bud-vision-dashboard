import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import StrainDashboard from '@/components/StrainDashboard';
import BrowseStrains from '@/components/BrowseStrains';
import SettingsDialog from '@/components/SettingsDialog';
import InstallBanner from '@/components/InstallBanner';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import MobileNavigation from '@/components/Layout/MobileNavigation';
import QuickStats from '@/components/Layout/QuickStats';
import StrainShowcase from '@/components/StrainShowcase';
import { Strain } from '@/types/strain';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { scans, addScan } = useScans();
  
  // Default to showcase for signed-out users, browse for signed-in users
  const [activeTab, setActiveTab] = useState(user ? 'browse' : 'showcase');
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update default tab based on auth status
  useEffect(() => {
    if (!authLoading) {
      setActiveTab(user ? 'browse' : 'showcase');
    }
  }, [user, authLoading]);

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
    setIsTransitioning(true);
    setCurrentStrain(strain);
    
    // Brief transition effect for seamless UX
    setTimeout(() => {
      setActiveTab('details');
      setIsTransitioning(false);
    }, 150);
  };

  // Show loading state but still render the full component structure
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DoobieDB...</p>
        </div>
      </div>
    );
  }

  // Show skeleton during strain selection transition
  const renderTabContent = () => {
    if (isTransitioning) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {user && <Navigation />}

        <TabsContent value="browse" className="space-y-6">
          <BrowseStrains onStrainSelect={handleStrainSelect} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <StrainDashboard strain={currentStrain} />
        </TabsContent>

        <TabsContent value="showcase" className="space-y-6">
          <StrainShowcase onStrainSelect={handleStrainSelect} />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        <Header onSettingsClick={handleSettingsClick} />
        {renderTabContent()}
        {user && <QuickStats scans={scans} />}
      </div>

      {user && (
        <MobileNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
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
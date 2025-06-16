
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

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { scans, addScan } = useScans();
  
  // Default to showcase for signed-out users, browse for signed-in users
  const [activeTab, setActiveTab] = useState(user ? 'browse' : 'showcase');
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    setCurrentStrain(strain);
    setActiveTab('details');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        <Header onSettingsClick={handleSettingsClick} />

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

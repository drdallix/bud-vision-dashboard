
import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import StrainDashboard from '@/components/StrainDashboard';
import BrowseStrains from '@/components/BrowseStrains';
import SettingsPage from '@/components/Settings';
import InstallBanner from '@/components/InstallBanner';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import MobileNavigation from '@/components/Layout/MobileNavigation';
import QuickStats from '@/components/Layout/QuickStats';
import { Strain } from '@/types/strain';

const Index = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { scans, addScan } = useScans();

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
    // Add required properties for the complete Strain type
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
    setShowSettings(true);
    setActiveTab('settings');
  };

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
          <Navigation showSettings={showSettings} />

          <TabsContent value="browse" className="space-y-6">
            <BrowseStrains onStrainSelect={(strain) => {
              setCurrentStrain(strain);
              setActiveTab('details');
            }} />
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <StrainDashboard strain={currentStrain} />
          </TabsContent>

          {user && showSettings && (
            <TabsContent value="settings" className="space-y-6">
              <SettingsPage scanHistory={scans} onDataRestore={handleDataRestore} />
            </TabsContent>
          )}
        </Tabs>

        {user && <QuickStats scans={scans} />}
      </div>

      <MobileNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <InstallBanner />
    </div>
  );
};

export default Index;

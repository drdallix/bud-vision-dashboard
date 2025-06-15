
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scan, Menu, LogIn, Plus, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import CameraScanner from '@/components/CameraScanner';
import StrainDashboard from '@/components/StrainDashboard';
import BrowseStrains from '@/components/BrowseStrains';
import SearchBar from '@/components/BrowseStrains/SearchBar';
import SettingsPage from '@/components/Settings';
import UserNav from '@/components/UserNav';
import InstallBanner from '@/components/InstallBanner';
import { Strain } from '@/types/strain';

const Index = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user, loading: authLoading } = useAuth();
  const { scans, loading: scansLoading, addScan } = useScans();

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

  const handleScanComplete = async (strain: Omit<Strain, 'inStock' | 'userId'>) => {
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
      <div className="container mx-auto px-4 py-6 pb-20"> {/* Add bottom padding for mobile nav */}
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
              DoobieDB
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {user 
                ? "Professional cannabis knowledge database for informed budtender recommendations" 
                : "Interactive dispensary menu - explore today's available strains"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <UserNav onSettingsClick={handleSettingsClick} />
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Budtender Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:mx-auto">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                {user ? 'Inventory' : 'Menu Board'}
              </TabsTrigger>
              {user && (
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Quick Scan
                </TabsTrigger>
              )}
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Strain Info
              </TabsTrigger>
              {user && showSettings && (
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="browse" className="space-y-6">
            <BrowseStrains onStrainSelect={(strain) => {
              setCurrentStrain(strain);
              setActiveTab('details');
            }} />
          </TabsContent>

          {user && (
            <TabsContent value="add" className="space-y-6">
              {/* Omnibar Search for Quick Scan */}
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Quick Package Scan</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Instantly scan any package in your dispensary to get comprehensive strain information for customer recommendations
                </p>
              </div>
              
              <CameraScanner 
                onScanComplete={handleScanComplete} 
                isScanning={isScanning} 
                setIsScanning={setIsScanning} 
              />
            </TabsContent>
          )}

          <TabsContent value="details" className="space-y-6">
            <StrainDashboard strain={currentStrain} />
          </TabsContent>

          {user && showSettings && (
            <TabsContent value="settings" className="space-y-6">
              <SettingsPage scanHistory={scans} onDataRestore={handleDataRestore} />
            </TabsContent>
          )}
        </Tabs>

        {/* Quick Stats for budtenders */}
        {user && scans.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scanned Today</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scans.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Popular Type</CardTitle>
                <Menu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scans.length > 0 ? Object.entries(scans.reduce((acc, strain) => {
                    acc[strain.type] = (acc[strain.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A' : 'N/A'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg THC Level</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scans.length > 0 ? Math.round(scans.reduce((sum, strain) => sum + strain.thc, 0) / scans.length) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
              activeTab === 'browse' 
                ? 'text-green-600 bg-green-50' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span>{user ? 'Inventory' : 'Menu'}</span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('add')}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                activeTab === 'add' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Scan className="h-5 w-5" />
              <span>Scan</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('details')}
            className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
              activeTab === 'details' 
                ? 'text-green-600 bg-green-50' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="h-5 w-5" />
            <span>Info</span>
          </button>
        </div>
      </div>
      
      <InstallBanner />
    </div>
  );
};

export default Index;

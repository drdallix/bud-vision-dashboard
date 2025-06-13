
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Database, History, Download, Upload, Scan, FileSearch, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import CameraScanner from '@/components/CameraScanner';
import StrainDashboard from '@/components/StrainDashboard';
import ScanHistory from '@/components/ScanHistory';
import DataManager from '@/components/DataManager';
import UserNav from '@/components/UserNav';

interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  medicalUses: string[];
  description: string;
  imageUrl: string;
  scannedAt: string;
  confidence: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [currentStrain, setCurrentStrain] = useState<Strain | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { scans, loading: scansLoading, addScan } = useScans();

  const handleScanComplete = async (strain: Strain) => {
    setCurrentStrain(strain);
    await addScan(strain);
    setActiveTab('dashboard');
  };

  const handleDataRestore = (data: Strain[]) => {
    // For now, just show a message since we're using database storage
    console.log('Data restore requested:', data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
              Cannabis Strain Identifier
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Scan cannabis packages to identify strains and explore comprehensive information about their effects, flavors, and medical uses.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In / Sign Up
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" />
                  Smart Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use AI-powered image recognition to identify cannabis strains from package photos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Scan History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep track of all your identified strains with detailed information and effects.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Cloud Sync
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your scan history is automatically synced across all your devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Nav */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
              Cannabis Strain Identifier
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scan cannabis packages to identify strains and explore comprehensive information about their effects, flavors, and medical uses.
            </p>
          </div>
          <UserNav />
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:mx-auto">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <CameraScanner 
              onScanComplete={handleScanComplete}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <StrainDashboard strain={currentStrain} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ScanHistory 
              strains={scans} 
              onStrainSelect={(strain) => {
                setCurrentStrain(strain);
                setActiveTab('dashboard');
              }}
            />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManager 
              scanHistory={scans}
              onDataRestore={handleDataRestore}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {scans.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scans.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scans.length > 0 ? 
                    Object.entries(scans.reduce((acc, strain) => {
                      acc[strain.type] = (acc[strain.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                    : 'N/A'
                  }
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
                  {scans.length > 0 ? 
                    Math.round(scans.reduce((sum, strain) => sum + strain.thc, 0) / scans.length) 
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

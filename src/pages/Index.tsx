
import { useState } from 'react';
import { Camera, Database, History, Download, Upload, Scan, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CameraScanner from '@/components/CameraScanner';
import StrainDashboard from '@/components/StrainDashboard';
import ScanHistory from '@/components/ScanHistory';
import DataManager from '@/components/DataManager';

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
  const [scanHistory, setScanHistory] = useState<Strain[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScanComplete = (strain: Strain) => {
    setCurrentStrain(strain);
    setScanHistory(prev => [strain, ...prev]);
    setActiveTab('dashboard');
    
    toast({
      title: "Strain Identified!",
      description: `Found ${strain.name} with ${strain.confidence}% confidence`,
    });
  };

  const handleDataRestore = (data: Strain[]) => {
    setScanHistory(data);
    toast({
      title: "Data Restored",
      description: `Successfully restored ${data.length} strain records`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
            Cannabis Strain Identifier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scan cannabis packages to identify strains and explore comprehensive information about their effects, flavors, and medical uses.
          </p>
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
              strains={scanHistory} 
              onStrainSelect={(strain) => {
                setCurrentStrain(strain);
                setActiveTab('dashboard');
              }}
            />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManager 
              scanHistory={scanHistory}
              onDataRestore={handleDataRestore}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {scanHistory.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scanHistory.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scanHistory.length > 0 ? 
                    scanHistory.reduce((acc, strain) => {
                      acc[strain.type] = (acc[strain.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>).Hybrid ? 'Hybrid' : 'Indica'
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
                  {scanHistory.length > 0 ? 
                    Math.round(scanHistory.reduce((sum, strain) => sum + strain.thc, 0) / scanHistory.length) 
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

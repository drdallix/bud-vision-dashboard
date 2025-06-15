
import { useState, useRef } from 'react';
import { Camera, Upload, Scan, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

interface CachedScan extends Strain {
  syncStatus: 'pending' | 'synced' | 'failed';
  attempts: number;
}

interface CameraScannerProps {
  onScanComplete: (strain: Strain) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const CameraScanner = ({ onScanComplete, isScanning, setIsScanning }: CameraScannerProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'failed' | 'cached'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Local cache management
  const saveScanToCache = (scan: Strain, syncStatus: 'pending' | 'synced' | 'failed' = 'pending') => {
    try {
      const cachedScans = getCachedScans();
      const cachedScan: CachedScan = {
        ...scan,
        syncStatus,
        attempts: 0
      };
      cachedScans.push(cachedScan);
      localStorage.setItem('cachedScans', JSON.stringify(cachedScans));
      console.log('Scan saved to local cache:', scan.name);
    } catch (error) {
      console.error('Failed to save scan to cache:', error);
    }
  };

  const getCachedScans = (): CachedScan[] => {
    try {
      const cached = localStorage.getItem('cachedScans');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached scans:', error);
      return [];
    }
  };

  const updateCachedScanStatus = (scanId: string, status: 'synced' | 'failed', attempts?: number) => {
    try {
      const cachedScans = getCachedScans();
      const scanIndex = cachedScans.findIndex(scan => scan.id === scanId);
      if (scanIndex !== -1) {
        cachedScans[scanIndex].syncStatus = status;
        if (attempts !== undefined) {
          cachedScans[scanIndex].attempts = attempts;
        }
        localStorage.setItem('cachedScans', JSON.stringify(cachedScans));
      }
    } catch (error) {
      console.error('Failed to update cached scan status:', error);
    }
  };

  const syncPendingScans = async () => {
    if (!user) return;

    const cachedScans = getCachedScans();
    const pendingScans = cachedScans.filter(scan => scan.syncStatus === 'pending' || scan.syncStatus === 'failed');

    for (const scan of pendingScans) {
      try {
        await saveToDatabase(scan, user.id);
        updateCachedScanStatus(scan.id, 'synced');
        console.log('Successfully synced cached scan:', scan.name);
      } catch (error) {
        console.error('Failed to sync cached scan:', scan.name, error);
        updateCachedScanStatus(scan.id, 'failed', (scan.attempts || 0) + 1);
      }
    }
  };

  const saveToDatabase = async (strain: Strain, userId: string) => {
    const { error } = await supabase.from('scans').insert([{
      user_id: userId,
      strain_name: strain.name,
      strain_type: strain.type,
      thc: strain.thc,
      cbd: strain.cbd,
      effects: strain.effects,
      flavors: strain.flavors,
      terpenes: [], // Will be populated by edge function
      medical_uses: strain.medicalUses,
      description: strain.description,
      confidence: strain.confidence,
      scanned_at: strain.scannedAt,
      in_stock: true
    }]);

    if (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }
  };

  const analyzeStrainWithAI = async (imageData: string) => {
    try {
      console.log('Calling AI strain analysis...');
      
      const requestBody: any = { imageData };
      if (user?.id) {
        requestBody.userId = user.id;
        console.log('Including userId in request:', user.id);
      }
      
      const { data, error } = await supabase.functions.invoke('analyze-strain', {
        body: requestBody
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI analysis result:', data);

      if (data.error) {
        console.error('Edge function returned error:', data.error);
        if (data.fallbackStrain) {
          return data.fallbackStrain;
        }
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error calling strain analysis:', error);
      return {
        name: "Unknown Strain",
        type: "Hybrid" as const,
        thc: 15,
        cbd: 2,
        effects: ["Unknown"],
        flavors: ["Unknown"],
        medicalUses: ["Consult Professional"],
        description: "Package scan incomplete. Please try again with clearer lighting and ensure all text is visible.",
        confidence: 0
      };
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      toast({
        title: "No package image selected",
        description: "Please capture or select a package image first.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your scans.",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    setSaveStatus('saving');
    
    try {
      toast({
        title: "Analyzing package...",
        description: "DoobieDB is reading package information for customer recommendations.",
      });

      const aiResult = await analyzeStrainWithAI(selectedImage);
      
      const identifiedStrain: Strain = {
        ...aiResult,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        imageUrl: selectedImage
      };
      
      console.log('Final strain data:', identifiedStrain);
      
      // Always save to local cache first
      saveScanToCache(identifiedStrain, 'pending');
      
      // Try to save to database
      let databaseSaveSuccess = false;
      try {
        await saveToDatabase(identifiedStrain, user.id);
        updateCachedScanStatus(identifiedStrain.id, 'synced');
        setSaveStatus('success');
        databaseSaveSuccess = true;
        console.log('Successfully saved to database');
      } catch (dbError) {
        console.error('Database save failed, keeping in cache:', dbError);
        setSaveStatus('cached');
        
        toast({
          title: "Saved locally",
          description: "Analysis complete but saved offline. Will sync when connection improves.",
        });
      }
      
      setIsScanning(false);
      onScanComplete(identifiedStrain);
      setSelectedImage(null);
      
      if (databaseSaveSuccess) {
        toast({
          title: "Package analysis complete!",
          description: `Saved to cloud: ${identifiedStrain.name} (${identifiedStrain.confidence}% confidence)`,
        });
      }

      // Try to sync any pending scans
      setTimeout(() => syncPendingScans(), 1000);
      
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
      setSaveStatus('failed');
      
      toast({
        title: "Package scan failed",
        description: "Unable to read package information. Please ensure good lighting and clear text visibility.",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cached':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'success':
        return 'Saved to cloud';
      case 'cached':
        return 'Saved locally (will sync)';
      case 'failed':
        return 'Save failed';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            DoobieDB Package Scanner
            {saveStatus !== 'idle' && (
              <div className="flex items-center gap-1 text-sm">
                {getSaveStatusIcon()}
                <span>{getSaveStatusText()}</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Instantly scan any cannabis package in your dispensary. Get comprehensive strain information for informed customer recommendations in seconds.
            {!user && (
              <div className="mt-2 text-yellow-600 font-medium">
                ⚠️ Sign in required to save scan results
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="relative">
            <div className={`aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center ${isScanning ? 'scan-animation' : ''}`}>
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Cannabis package to scan" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No package image selected</p>
                  <p className="text-sm text-muted-foreground">
                    Capture or upload a cannabis package image
                  </p>
                </div>
              )}
            </div>
            
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white space-y-2">
                  <Scan className="h-8 w-8 animate-spin mx-auto" />
                  <p className="font-medium">DoobieDB Analyzing Package...</p>
                  <p className="text-sm opacity-80">Reading strain information and lab results</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleCameraCapture}
              className="flex-1 h-12"
              variant="outline"
              disabled={isScanning}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Package
            </Button>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-12"
              variant="outline" 
              disabled={isScanning}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            
            <Button 
              onClick={handleScan}
              className="flex-1 h-12 cannabis-gradient text-white"
              disabled={!selectedImage || isScanning || !user}
            >
              <Scan className="h-4 w-4 mr-2" />
              {isScanning ? 'Analyzing...' : 'Scan Package'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Budtender Instructions */}
          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-accent-foreground">Budtender Scanning Tips:</h4>
            <ul className="text-sm text-accent-foreground/80 space-y-1">
              <li>• Ensure package labels are clearly visible and well-lit</li>
              <li>• Include strain name, THC/CBD percentages, and lab results</li>
              <li>• Capture the entire package label in one shot</li>
              <li>• Works best with high-resolution, clear images</li>
              <li>• Perfect for quick customer consultations</li>
            </ul>
          </div>

          {/* Cache Status */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle className="h-4 w-4" />
                <span>Local backup enabled - scans saved offline will sync automatically</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraScanner;

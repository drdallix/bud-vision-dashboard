
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeStrainWithAI } from '@/components/SmartOmnibar/AIAnalysis';
import { CacheService } from '@/services/cacheService';
import { Strain } from '@/types/strain';

export const useScannerLogic = (onScanComplete: (strain: Strain) => void) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'failed' | 'cached'>('idle');
  const { toast } = useToast();
  const { user } = useAuth();

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

      const aiResult = await analyzeStrainWithAI(selectedImage, undefined, user.id);
      
      const identifiedStrain: Strain = {
        ...aiResult,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };
      
      console.log('Final strain data:', identifiedStrain);
      
      // Always save to local cache first
      CacheService.saveScanToCache(identifiedStrain, 'pending');
      
      // Try to save to database
      let databaseSaveSuccess = false;
      try {
        await CacheService.saveToDatabase(identifiedStrain, user.id);
        CacheService.updateCachedScanStatus(identifiedStrain.id, 'synced');
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
      setTimeout(() => CacheService.syncPendingScans(user.id), 1000);
      
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

  return {
    selectedImage,
    isScanning,
    saveStatus,
    handleImageUpload,
    handleScan,
    setIsScanning
  };
};

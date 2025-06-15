
import { useState, useRef } from 'react';
import { Camera, Upload, Scan, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface CameraScannerProps {
  onScanComplete: (strain: Strain) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const CameraScanner = ({ onScanComplete, isScanning, setIsScanning }: CameraScannerProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeStrainWithAI = async (imageData: string) => {
    try {
      console.log('Calling AI strain analysis...');
      
      const { data, error } = await supabase.functions.invoke('analyze-strain', {
        body: { imageData }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI analysis result:', data);

      // Handle both success and error responses from the edge function
      if (data.error) {
        console.error('Edge function returned error:', data.error);
        // Use fallback data if provided
        if (data.fallbackStrain) {
          return data.fallbackStrain;
        }
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error calling strain analysis:', error);
      // Return fallback strain data to prevent app from breaking
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
    
    setIsScanning(true);
    
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
      
      setIsScanning(false);
      onScanComplete(identifiedStrain);
      setSelectedImage(null);
      
      toast({
        title: "Package analysis complete!",
        description: `Ready to recommend: ${identifiedStrain.name} (${identifiedStrain.confidence}% confidence)`,
      });
      
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
      
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            DoobieDB Package Scanner
          </CardTitle>
          <CardDescription>
            Instantly scan any cannabis package in your dispensary. Get comprehensive strain information for informed customer recommendations in seconds.
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
              disabled={!selectedImage || isScanning}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraScanner;

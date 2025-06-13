
import { useState, useRef } from 'react';
import { Camera, Upload, Scan } from 'lucide-react';
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
        name: "Analysis Failed",
        type: "Hybrid" as const,
        thc: 15,
        cbd: 2,
        effects: ["Unknown"],
        flavors: ["Unknown"],
        medicalUses: ["Consult Professional"],
        description: "AI analysis failed. Please try again with a clearer image of the cannabis package.",
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
        title: "No image selected",
        description: "Please select an image first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    
    try {
      toast({
        title: "Analyzing image...",
        description: "AI is analyzing your cannabis package image.",
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
        title: "Analysis complete!",
        description: `Identified: ${identifiedStrain.name} (${identifiedStrain.confidence}% confidence)`,
      });
      
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
      
      toast({
        title: "Analysis failed",
        description: "Unable to analyze the image. Please try again with a clearer photo.",
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
            <Camera className="h-6 w-6 text-primary" />
            AI Package Scanner
          </CardTitle>
          <CardDescription>
            Take a photo of your cannabis package or upload an existing image. AI will analyze it to identify the strain and extract detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="relative">
            <div className={`aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center ${isScanning ? 'scan-animation' : ''}`}>
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Package to scan" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No image selected</p>
                </div>
              )}
            </div>
            
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white space-y-2">
                  <Scan className="h-8 w-8 animate-spin mx-auto" />
                  <p className="font-medium">AI Analyzing Package...</p>
                  <p className="text-sm opacity-80">Reading labels and identifying strain</p>
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
              Take Photo
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
              {isScanning ? 'Analyzing...' : 'Analyze with AI'}
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

          {/* Instructions */}
          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-accent-foreground">AI Analysis Tips:</h4>
            <ul className="text-sm text-accent-foreground/80 space-y-1">
              <li>• Ensure good lighting and clear package visibility</li>
              <li>• Make sure strain name and THC/CBD percentages are readable</li>
              <li>• Include the entire package label in the photo</li>
              <li>• AI works best with high-resolution, clear images</li>
              <li>• Multiple angles can improve identification accuracy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraScanner;

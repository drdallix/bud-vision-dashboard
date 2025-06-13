
import { useState, useRef } from 'react';
import { Camera, Upload, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

// Mock strain database for demo
const mockStrains: Omit<Strain, 'id' | 'scannedAt' | 'imageUrl'>[] = [
  {
    name: "Blue Dream",
    type: "Hybrid",
    thc: 21,
    cbd: 2,
    effects: ["Euphoric", "Relaxed", "Creative", "Happy"],
    flavors: ["Blueberry", "Sweet", "Berry"],
    medicalUses: ["Depression", "Chronic Pain", "Nausea"],
    description: "A sativa-dominant hybrid combining the relaxing effects of Blueberry indica with the cerebral stimulation of Haze sativa.",
    confidence: 94
  },
  {
    name: "OG Kush",
    type: "Hybrid",
    thc: 25,
    cbd: 1,
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    flavors: ["Earthy", "Pine", "Woody"],
    medicalUses: ["Stress", "Depression", "Pain"],
    description: "A legendary strain with a unique terpene profile that boasts a complex aroma with notes of fuel, skunk, and spice.",
    confidence: 89
  },
  {
    name: "Purple Haze",
    type: "Sativa",
    thc: 19,
    cbd: 1,
    effects: ["Creative", "Energetic", "Euphoric", "Happy"],
    flavors: ["Sweet", "Berry", "Grape"],
    medicalUses: ["Depression", "Fatigue", "Stress"],
    description: "Made famous by Jimi Hendrix, this sativa delivers a dreamy burst of euphoria that brings veteran consumers back to their psychedelic heyday.",
    confidence: 91
  }
];

const CameraScanner = ({ onScanComplete, isScanning, setIsScanning }: CameraScannerProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateStrainIdentification = () => {
    const randomStrain = mockStrains[Math.floor(Math.random() * mockStrains.length)];
    const strain: Strain = {
      ...randomStrain,
      id: Date.now().toString(),
      scannedAt: new Date().toISOString(),
      imageUrl: selectedImage || '/placeholder.svg'
    };
    
    return strain;
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
    if (!selectedImage) return;
    
    setIsScanning(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const identifiedStrain = simulateStrainIdentification();
    setIsScanning(false);
    onScanComplete(identifiedStrain);
    setSelectedImage(null);
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
            Package Scanner
          </CardTitle>
          <CardDescription>
            Take a photo of your cannabis package or upload an existing image to identify the strain
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
                  <p className="font-medium">Analyzing package...</p>
                  <p className="text-sm opacity-80">AI is identifying the strain</p>
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
              {isScanning ? 'Scanning...' : 'Identify Strain'}
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
            <h4 className="font-medium text-accent-foreground">Scanning Tips:</h4>
            <ul className="text-sm text-accent-foreground/80 space-y-1">
              <li>• Ensure good lighting and clear package visibility</li>
              <li>• Focus on strain name, THC/CBD percentages, and packaging details</li>
              <li>• Hold camera steady for best results</li>
              <li>• Multiple angles can improve identification accuracy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraScanner;


import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractStrainsFromImage, ExtractedStrain } from '@/services/bulkStrainService';

interface ImageStrainInputProps {
  onStrainNamesUpdate: (strains: ExtractedStrain[]) => void;
  isGenerating: boolean;
}

const ImageStrainInput = ({ onStrainNamesUpdate, isGenerating }: ImageStrainInputProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedStrains, setExtractedStrains] = useState<ExtractedStrain[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    try {
      const result = await extractStrainsFromImage(uploadedImage);
      
      const newStrains = [...extractedStrains, ...result.strains];
      setExtractedStrains(newStrains);
      onStrainNamesUpdate(newStrains);
      
      toast({
        title: "Image Processed",
        description: `Found ${result.strains.length} strains with ${result.confidence}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to extract strain information from image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeStrain = (index: number) => {
    const updated = extractedStrains.filter((_, i) => i !== index);
    setExtractedStrains(updated);
    onStrainNamesUpdate(updated);
  };

  const clearAll = () => {
    setUploadedImage(null);
    setExtractedStrains([]);
    onStrainNamesUpdate([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an image of a strain menu, list, or inventory. AI will extract strain names, prices, and types automatically.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || isProcessing}
                variant="default"
                size="lg"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || isProcessing}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            </div>

            {uploadedImage && (
              <Button
                onClick={processImage}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Extract Strains
                  </>
                )}
              </Button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {uploadedImage && (
        <Card>
          <CardContent className="pt-6">
            <img 
              src={uploadedImage} 
              alt="Uploaded strain list" 
              className="max-w-full h-auto rounded-lg border mx-auto"
              style={{ maxHeight: '300px' }}
            />
          </CardContent>
        </Card>
      )}

      {extractedStrains.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Extracted Strains ({extractedStrains.length})</h4>
              <Button onClick={clearAll} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {extractedStrains.map((strain, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{strain.name}</span>
                    {strain.price && (
                      <Badge variant="outline" className="text-green-600">
                        ${strain.price}
                      </Badge>
                    )}
                    {strain.type && (
                      <Badge variant="secondary">
                        {strain.type}
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => removeStrain(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageStrainInput;

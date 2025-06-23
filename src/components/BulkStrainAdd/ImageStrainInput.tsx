
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageStrainInputProps {
  onStrainNamesUpdate: (names: string[]) => void;
  isGenerating: boolean;
}

const ImageStrainInput = ({ onStrainNamesUpdate, isGenerating }: ImageStrainInputProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [strainNames, setStrainNames] = useState<string[]>([]);
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
        processImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageUrl: string) => {
    setIsProcessing(true);
    try {
      // This would integrate with OCR service or AI vision
      // For now, simulate text extraction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated extracted text - in real implementation this would use OCR
      const simulatedText = "Blue Dream\nGirl Scout Cookies\nOG Kush\nWhite Widow\nSour Diesel";
      setExtractedText(simulatedText);
      
      // Process the extracted text into strain names
      const names = simulatedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/[^\w\s-]/g, '').trim())
        .filter(line => line.length > 1);
      
      setStrainNames(names);
      onStrainNamesUpdate(names);
      
      toast({
        title: "Image Processed",
        description: `Found ${names.length} strain names in the image.`,
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to extract text from image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeStrain = (index: number) => {
    const updated = strainNames.filter((_, i) => i !== index);
    setStrainNames(updated);
    onStrainNamesUpdate(updated);
  };

  const clearAll = () => {
    setUploadedImage(null);
    setExtractedText('');
    setStrainNames([]);
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
              Upload an image of a strain list or menu. We'll extract the strain names automatically.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || isProcessing}
                variant="default"
                size="lg"
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  // This would trigger camera capture
                  fileInputRef.current?.click();
                }}
                disabled={isGenerating || isProcessing}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            </div>

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
            <div className="space-y-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded strain list" 
                className="max-w-full h-auto rounded-lg border"
              />
              
              {extractedText && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Extracted Text:</h4>
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {extractedText}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {strainNames.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Extracted Strains ({strainNames.length})</h4>
              <Button onClick={clearAll} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {strainNames.map((name, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-2">
                  {name}
                  <button
                    onClick={() => removeStrain(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageStrainInput;

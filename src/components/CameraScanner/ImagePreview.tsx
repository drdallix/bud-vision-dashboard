
import { Camera, Scan, Eye, Zap, Database, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImagePreviewProps {
  selectedImage: string | null;
  isScanning: boolean;
  scanStep?: number;
  scanProgress?: number;
  currentScanText?: string;
  scanSteps?: string[];
}

const ImagePreview = ({ 
  selectedImage, 
  isScanning, 
  scanStep = 0, 
  scanProgress = 0, 
  currentScanText = '', 
  scanSteps = [] 
}: ImagePreviewProps) => {
  
  const getScanIcon = () => {
    if (scanStep === 0) return <Database className="h-6 w-6 text-blue-400 animate-pulse" />;
    if (scanStep === 1) return <Eye className="h-6 w-6 text-yellow-400 animate-pulse" />;
    if (scanStep === 2) return <Scan className="h-6 w-6 text-green-400 animate-pulse" />;
    if (scanStep === 3) return <Zap className="h-6 w-6 text-purple-400 animate-pulse" />;
    if (scanStep === 4) return <Database className="h-6 w-6 text-orange-400 animate-pulse" />;
    return <CheckCircle className="h-6 w-6 text-green-500" />;
  };
  return (
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
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center text-white space-y-4 max-w-xs mx-auto p-6">
            <div className="relative">
              {getScanIcon()}
              <div className="absolute -inset-4 border-2 border-white/20 rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-lg">DoobieDB Scanner Active</p>
              <p className="text-sm opacity-90 min-h-[20px] font-medium">
                {currentScanText}
                {currentScanText && <span className="animate-pulse text-green-400 ml-1">▋</span>}
              </p>
            </div>
            
            {scanProgress > 0 && (
              <div className="space-y-2 w-full">
                <Progress value={scanProgress} className="h-2 bg-white/20" />
                <div className="flex justify-between text-xs opacity-75">
                  <span>Step {scanStep + 1} of {scanSteps.length}</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
              </div>
            )}
            
            <div className="text-xs opacity-60 italic">
              Professional cannabis analysis in progress
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;

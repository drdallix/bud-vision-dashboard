
import { Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Strain } from '@/types/strain';
import ImagePreview from './CameraScanner/ImagePreview';
import CameraCaptureControls from './CameraScanner/CameraCaptureControls';
import StatusIndicators from './CameraScanner/StatusIndicators';
import { useScannerLogic } from './CameraScanner/useScannerLogic';

interface CameraScannerProps {
  onScanComplete: (strain: Strain) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const CameraScanner = ({ onScanComplete, isScanning, setIsScanning }: CameraScannerProps) => {
  const { user } = useAuth();
  const {
    selectedImage,
    saveStatus,
    handleImageUpload,
    handleScan
  } = useScannerLogic(onScanComplete);

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
            {!user && (
              <div className="mt-2 text-yellow-600 font-medium">
                ⚠️ Sign in required to save scan results
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImagePreview 
            selectedImage={selectedImage} 
            isScanning={isScanning} 
          />

          <CameraCaptureControls
            selectedImage={selectedImage}
            isScanning={isScanning}
            onImageUpload={handleImageUpload}
            onScan={handleScan}
            disabled={!user}
          />

          <StatusIndicators 
            saveStatus={saveStatus} 
            user={user} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraScanner;

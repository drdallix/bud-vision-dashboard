import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Scan, LoaderCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { analyzeStrainWithAI } from './AIAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { Strain } from '@/types/strain';

interface RealTimeScanProps {
  open: boolean;
  onClose: () => void;
  onStrainGenerated: (strain: Strain) => void;
}

const SCAN_STEPS = [
  { icon: Camera, text: "Initializing real-time scanner...", duration: 800, color: "text-blue-500" },
  { icon: Scan, text: "Detecting package in frame...", duration: 1000, color: "text-green-500" },
  { icon: LoaderCircle, text: "Processing visual information...", duration: 1200, color: "text-purple-500" },
  { icon: Camera, text: "Cross-referencing strain database...", duration: 1000, color: "text-yellow-500" },
  { icon: Scan, text: "Analyzing cannabinoid profiles...", duration: 800, color: "text-orange-500" },
  { icon: LoaderCircle, text: "Finalizing strain identification...", duration: 600, color: "text-green-600" }
];

// Image processing utilities
const cropAndScaleImage = (canvas: HTMLCanvasElement, video: HTMLVideoElement): string => {
  const ctx = canvas.getContext('2d')!;
  const { videoWidth: vw, videoHeight: vh } = video;
  
  // Crop to center square for better OCR
  const size = Math.min(vw, vh);
  const cropX = (vw - size) / 2;
  const cropY = (vh - size) / 2;
  
  // Scale down to 512x512 for optimal OCR and bandwidth
  canvas.width = 512;
  canvas.height = 512;
  
  ctx.drawImage(video, cropX, cropY, size, size, 0, 0, 512, 512);
  return canvas.toDataURL('image/jpeg', 0.8);
};

const RealTimeScan = ({ open, onClose, onStrainGenerated }: RealTimeScanProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callCountRef = useRef(0);
  
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanTime, setScanTime] = useState(0);
  const [result, setResult] = useState<Strain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  const { user } = useAuth();

  // Initialize camera
  useEffect(() => {
    if (!open) {
      cleanup();
      return;
    }

    startCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsScanning(false);
    setProgress(0);
    setCurrentStep(0);
    setScanTime(0);
    setResult(null);
    setError(null);
    setCameraReady(false);
    callCountRef.current = 0;
  };

  const runAnimationSequence = async (onComplete: () => void) => {
    let stepIndex = 0;
    let totalProgress = 0;
    
    const runStep = () => {
      if (stepIndex >= SCAN_STEPS.length) {
        onComplete();
        return;
      }
      
      const step = SCAN_STEPS[stepIndex];
      setCurrentStep(stepIndex);
      
      const stepProgress = 100 / SCAN_STEPS.length;
      const startProgress = totalProgress;
      const endProgress = totalProgress + stepProgress;
      
      // Animate progress for this step
      const duration = step.duration;
      const startTime = Date.now();
      
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const stepCompletion = Math.min(elapsed / duration, 1);
        const currentProgress = startProgress + (stepProgress * stepCompletion);
        
        setProgress(currentProgress);
        
        if (stepCompletion < 1 && !result) {
          requestAnimationFrame(animateProgress);
        } else {
          totalProgress = endProgress;
          stepIndex++;
          setTimeout(runStep, 50);
        }
      };
      
      animateProgress();
    };
    
    runStep();
  };

  const startRealTimeScan = async () => {
    if (!user || !cameraReady || !videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    setError(null);
    callCountRef.current = 0;
    setScanTime(0);
    
    // Start animation sequence
    runAnimationSequence(() => {
      if (!result) {
        setProgress(100);
        setTimeout(() => {
          setError('Scan timeout - please try again with better lighting');
          setTimeout(() => onClose(), 2000);
        }, 500);
      }
    });
    
    // Start scan timer
    const scanTimer = setInterval(() => {
      setScanTime(prev => prev + 1);
    }, 1000);
    
    // Real-time scanning logic
    const performScan = async () => {
      if (callCountRef.current >= 10 || result) {
        clearInterval(scanIntervalRef.current!);
        clearInterval(scanTimer);
        return;
      }
      
      try {
        const imageData = cropAndScaleImage(canvasRef.current!, videoRef.current!);
        callCountRef.current++;
        
        console.log(`Real-time scan attempt ${callCountRef.current}/10`);
        
        const aiResult = await analyzeStrainWithAI(imageData, undefined, user.id);
        
        if (aiResult && aiResult.confidence > 70) {
          const strain: Strain = {
            ...aiResult,
            id: aiResult.id || Date.now().toString(),
            scannedAt: new Date().toISOString(),
            inStock: true,
            userId: user.id
          };
          
          setResult(strain);
          setProgress(100);
          clearInterval(scanIntervalRef.current!);
          clearInterval(scanTimer);
          
          setTimeout(() => {
            onStrainGenerated(strain);
            onClose();
          }, 1000);
        }
      } catch (error) {
        console.error('Scan attempt failed:', error);
      }
    };
    
    // Start scanning every second
    scanIntervalRef.current = setInterval(performScan, 1000);
    
    // Auto-timeout after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (!result) {
        clearInterval(scanIntervalRef.current!);
        clearInterval(scanTimer);
        setError('Scan timeout - package not detected clearly');
        setTimeout(() => onClose(), 2000);
      }
    }, 10000);
  };

  const getCurrentIcon = () => {
    const step = SCAN_STEPS[currentStep];
    const IconComponent = step?.icon || Camera;
    return <IconComponent className={`h-6 w-6 animate-pulse ${step?.color || 'text-blue-500'}`} />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-0 overflow-hidden">
        <DialogTitle className="sr-only">Real-Time Package Scanner</DialogTitle>
        <DialogDescription className="sr-only">
          AI-powered real-time package scanning for strain identification
        </DialogDescription>

        <div className="relative w-screen h-screen flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover absolute inset-0"
            playsInline
            muted
            autoPlay
          />
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning frame */}
            <div className="absolute inset-8 border-2 border-green-400 rounded-lg shadow-lg">
              <div className="absolute inset-0 bg-green-400/10 animate-pulse rounded-lg" />
              {isScanning && (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-400 animate-pulse" />
                  <div className="absolute left-0 top-0 w-1 h-full bg-green-400 animate-pulse" />
                  <div className="absolute right-0 top-0 w-1 h-full bg-green-400 animate-pulse" />
                </>
              )}
            </div>
            
            {/* Corner indicators */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-400" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-400" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-400" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-400" />
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-4 z-10">
            {!isScanning && cameraReady && (
              <Button
                onClick={startRealTimeScan}
                className="cannabis-gradient text-white px-8 py-3 text-lg font-semibold"
                disabled={!user}
              >
                <Scan className="h-5 w-5 mr-2" />
                Start Real-Time Scan
              </Button>
            )}

            {error && (
              <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-center">
                {error}
              </div>
            )}

            {!user && (
              <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-lg text-center">
                Sign in required for scanning
              </div>
            )}
          </div>

          {/* Progress overlay */}
          {isScanning && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 z-10">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {getCurrentIcon()}
                    <div className="absolute -inset-2 border border-white/20 rounded-full animate-ping" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Real-Time AI Scan</span>
                    <div className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                      {Math.round(progress)}%
                    </div>
                  </div>
                </div>
                
                <Progress value={progress} className="h-2 bg-white/20" />
                
                <div className="text-sm text-white/90 min-h-[20px]">
                  {SCAN_STEPS[currentStep]?.text || 'Processing...'}
                  <span className="animate-pulse text-green-400 ml-1">▋</span>
                </div>
                
                <div className="flex justify-between text-xs text-white/60">
                  <span>Attempt {callCountRef.current}/10</span>
                  <span>{scanTime}s elapsed</span>
                </div>
              </div>
            </div>
          )}

          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RealTimeScan;
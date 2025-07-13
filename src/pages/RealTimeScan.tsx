import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, Scan, LoaderCircle, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { analyzeStrainWithAI } from '@/components/SmartOmnibar/AIAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { Strain } from '@/types/strain';

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

const RealTimeScan = () => {
  const navigate = useNavigate();
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionStrength, setDetectionStrength] = useState(0);
  const [lastScannedStrainName, setLastScannedStrainName] = useState<string | null>(null);
  const [scanningActive, setScanningActive] = useState(false);
  
  const { user } = useAuth();

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => cleanup();
  }, []);

  // Auto-start scanning when camera is ready and user is authenticated
  useEffect(() => {
    if (cameraReady && user && !isScanning) {
      startRealTimeScan();
    }
  }, [cameraReady, user]);

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
    setScanningActive(false);
    setProgress(0);
    setCurrentStep(0);
    setScanTime(0);
    setResult(null);
    setError(null);
    setCameraReady(false);
    setLastScannedStrainName(null);
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
        }, 500);
      }
    });
    
    // Start scan timer
    const scanTimer = setInterval(() => {
      setScanTime(prev => prev + 1);
    }, 1000);
    
    // Real-time scanning logic
    setScanningActive(true);
    const performScan = async () => {
      if (!scanningActive || result) {
        clearInterval(scanIntervalRef.current!);
        clearInterval(scanTimer);
        return;
      }
      
      try {
        setIsProcessing(true);
        const imageData = cropAndScaleImage(canvasRef.current!, videoRef.current!);
        callCountRef.current++;
        
        console.log(`Real-time scan attempt ${callCountRef.current} - every 7s`);
        
        const aiResult = await analyzeStrainWithAI(imageData, undefined, user.id);
        
        // Update detection strength based on confidence for visual feedback
        if (aiResult?.confidence) {
          setDetectionStrength(aiResult.confidence);
        }
        
        if (aiResult && aiResult.confidence > 70) {
          // Check for duplicate scans
          if (lastScannedStrainName && lastScannedStrainName.toLowerCase() === aiResult.name?.toLowerCase()) {
            console.log('Duplicate strain detected, skipping...');
            return;
          }
          
          const strain: Strain = {
            ...aiResult,
            id: aiResult.id || Date.now().toString(),
            scannedAt: new Date().toISOString(),
            inStock: true,
            userId: user.id
          };
          
          // Stop scanning immediately when result is found
          setScanningActive(false);
          setLastScannedStrainName(strain.name);
          setResult(strain);
          setProgress(100);
          clearInterval(scanIntervalRef.current!);
          clearInterval(scanTimer);
          
          // Navigate to strain details immediately after generation
          setTimeout(() => {
            navigate('/', { state: { newStrain: strain, selectStrain: strain } });
          }, 2000);
        }
      } catch (error) {
        console.error('Scan attempt failed:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Start scanning every 7 seconds
    scanIntervalRef.current = setInterval(performScan, 7000);
    
    // Auto-timeout after 60 seconds (since we scan every 7s, give more time)
    timeoutRef.current = setTimeout(() => {
      if (!result && scanningActive) {
        setScanningActive(false);
        clearInterval(scanIntervalRef.current!);
        clearInterval(scanTimer);
        setError('Scan timeout - package not detected clearly');
      }
    }, 60000);
  };

  const getCurrentIcon = () => {
    const step = SCAN_STEPS[currentStep];
    const IconComponent = step?.icon || Camera;
    return <IconComponent className={`h-6 w-6 animate-pulse ${step?.color || 'text-blue-500'}`} />;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-white font-semibold">Real-Time Scanner</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanning frame with dynamic detection strength */}
          <div className={`absolute inset-8 border-2 rounded-lg shadow-lg transition-all duration-300 ${
            detectionStrength > 50 ? 'border-yellow-400' : 
            detectionStrength > 30 ? 'border-blue-400' : 'border-green-400'
          }`}>
            <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
              detectionStrength > 50 ? 'bg-yellow-400/20 animate-pulse' : 
              detectionStrength > 30 ? 'bg-blue-400/15 animate-pulse' : 'bg-green-400/10 animate-pulse'
            }`} />
            {isScanning && (
              <>
                <div className={`absolute top-0 left-0 w-full h-1 animate-pulse transition-colors duration-300 ${
                  detectionStrength > 50 ? 'bg-yellow-400' : 
                  detectionStrength > 30 ? 'bg-blue-400' : 'bg-green-400'
                }`} />
                <div className={`absolute bottom-0 left-0 w-full h-1 animate-pulse transition-colors duration-300 ${
                  detectionStrength > 50 ? 'bg-yellow-400' : 
                  detectionStrength > 30 ? 'bg-blue-400' : 'bg-green-400'
                }`} />
                <div className={`absolute left-0 top-0 w-1 h-full animate-pulse transition-colors duration-300 ${
                  detectionStrength > 50 ? 'bg-yellow-400' : 
                  detectionStrength > 30 ? 'bg-blue-400' : 'bg-green-400'
                }`} />
                <div className={`absolute right-0 top-0 w-1 h-full animate-pulse transition-colors duration-300 ${
                  detectionStrength > 50 ? 'bg-yellow-400' : 
                  detectionStrength > 30 ? 'bg-blue-400' : 'bg-green-400'
                }`} />
              </>
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          
          {/* Corner indicators with detection feedback */}
          <div className={`absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 transition-colors duration-300 ${
            detectionStrength > 50 ? 'border-yellow-400' : 
            detectionStrength > 30 ? 'border-blue-400' : 'border-green-400'
          }`} />
          <div className={`absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 transition-colors duration-300 ${
            detectionStrength > 50 ? 'border-yellow-400' : 
            detectionStrength > 30 ? 'border-blue-400' : 'border-green-400'
          }`} />
          <div className={`absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 transition-colors duration-300 ${
            detectionStrength > 50 ? 'border-yellow-400' : 
            detectionStrength > 30 ? 'border-blue-400' : 'border-green-400'
          }`} />
          <div className={`absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 transition-colors duration-300 ${
            detectionStrength > 50 ? 'border-yellow-400' : 
            detectionStrength > 30 ? 'border-blue-400' : 'border-green-400'
          }`} />
          
          {/* Detection strength indicator */}
          {isScanning && detectionStrength > 0 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium mb-1">Detection: {detectionStrength}%</div>
                <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      detectionStrength > 50 ? 'bg-yellow-400' : 
                      detectionStrength > 30 ? 'bg-blue-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${detectionStrength}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress overlay */}
        {isScanning && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)] z-10">
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
                <span>Scanning every 7s</span>
                <span>{scanTime}s elapsed</span>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {result && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-green-500/90 text-white p-6 rounded-lg text-center max-w-sm">
              <div className="text-2xl mb-2">✓</div>
              <div className="font-semibold mb-2">Strain Identified!</div>
              <div className="text-sm opacity-90 mb-4">{result.name}</div>
              <div className="text-xs">Redirecting to dashboard...</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10">
        {!isScanning && cameraReady && (
          <Button
            onClick={startRealTimeScan}
            className="w-full cannabis-gradient text-white py-4 text-lg font-semibold"
            disabled={!user}
          >
            <Scan className="h-5 w-5 mr-2" />
            Start Real-Time Scan
          </Button>
        )}

        {error && (
          <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        {!user && (
          <div className="bg-yellow-500/90 text-white px-4 py-3 rounded-lg text-center">
            Sign in required for scanning
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeScan;
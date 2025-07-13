import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, Scan, LoaderCircle, ArrowLeft, Eye, Search, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Strain } from '@/types/strain';
import { supabase } from '@/integrations/supabase/client';
// @ts-ignore
import Tesseract from 'tesseract.js';

const SCAN_PHASES = [
  { icon: Eye, text: "Scanning for text...", color: "text-blue-400" },
  { icon: Search, text: "Reading package text...", color: "text-green-400" },
  { icon: Scan, text: "Identifying strain...", color: "text-purple-400" },
  { icon: Zap, text: "Generating profile...", color: "text-yellow-400" }
];

// OCR processing utilities
const captureFrame = (canvas: HTMLCanvasElement, video: HTMLVideoElement): ImageData => {
  const ctx = canvas.getContext('2d')!;
  const { videoWidth: vw, videoHeight: vh } = video;
  
  // Full frame capture for better OCR
  canvas.width = vw;
  canvas.height = vh;
  
  ctx.drawImage(video, 0, 0, vw, vh);
  return ctx.getImageData(0, 0, vw, vh);
};

const preprocessImageForOCR = (canvas: HTMLCanvasElement, imageData: ImageData): void => {
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  // Apply contrast enhancement for better OCR
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const enhanced = gray > 128 ? 255 : 0; // High contrast
    data[i] = data[i + 1] = data[i + 2] = enhanced;
  }
  
  ctx.putImageData(imageData, 0, 0);
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
  const [currentPhase, setCurrentPhase] = useState(0);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string>('');
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [result, setResult] = useState<Strain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastDetectedStrain, setLastDetectedStrain] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => cleanup();
  }, []);

  // Auto-start scanning when camera is ready and user is authenticated
  useEffect(() => {
    if (cameraReady && user && !isScanning) {
      startContinuousScanning();
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
    setCurrentPhase(0);
    setFrozenFrame(null);
    setDetectedText('');
    setOcrConfidence(0);
    setResult(null);
    setError(null);
    setCameraReady(false);
    setScanCount(0);
    setLastDetectedStrain(null);
  };

  const performOCR = async (canvas: HTMLCanvasElement): Promise<string> => {
    try {
      const { data: { text, confidence } } = await Tesseract.recognize(canvas, 'eng', {
        logger: () => {} // Suppress logs
      });
      
      setOcrConfidence(confidence);
      return text.trim();
    } catch (error) {
      console.error('OCR failed:', error);
      return '';
    }
  };

  const analyzeStrainFromText = async (text: string): Promise<Strain | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('ocr-strain-analysis', {
        body: { detectedText: text }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Strain analysis failed:', error);
      return null;
    }
  };

  const performSingleScan = async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current || !user) return;

    setIsScanning(true);
    setCurrentPhase(0);
    
    try {
      // Phase 1: Freeze frame
      const imageData = captureFrame(canvasRef.current, videoRef.current);
      const frozenCanvas = document.createElement('canvas');
      frozenCanvas.width = imageData.width;
      frozenCanvas.height = imageData.height;
      frozenCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
      setFrozenFrame(frozenCanvas.toDataURL());
      
      // Phase 2: OCR text detection
      setCurrentPhase(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      preprocessImageForOCR(canvasRef.current, imageData);
      const text = await performOCR(canvasRef.current);
      setDetectedText(text);
      
      if (!text || text.length < 3) {
        throw new Error('No text detected in image');
      }

      // Phase 3: Strain identification
      setCurrentPhase(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const strainData = await analyzeStrainFromText(text);
      
      if (!strainData || strainData.confidence < 60) {
        throw new Error('No valid strain identified');
      }

      // Phase 4: Finalize
      setCurrentPhase(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check for duplicates
      if (lastDetectedStrain && lastDetectedStrain.toLowerCase() === strainData.name.toLowerCase()) {
        throw new Error('Duplicate strain detected');
      }

      const strain: Strain = {
        ...strainData,
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: user.id
      };

      setLastDetectedStrain(strain.name);
      setResult(strain);
      
      // Navigate after success
      setTimeout(() => {
        navigate('/', { state: { newStrain: strain, selectStrain: strain } });
      }, 2000);

    } catch (error) {
      console.error('Scan failed:', error);
      setError(error instanceof Error ? error.message : 'Scan failed');
      
      // Reset for next scan
      setTimeout(() => {
        setIsScanning(false);
        setFrozenFrame(null);
        setError(null);
        setDetectedText('');
        setOcrConfidence(0);
      }, 3000);
    }
  };

  const startContinuousScanning = () => {
    if (!user || !cameraReady || isScanning) return;
    
    setScanCount(0);
    
    // Scan every 5 seconds, but stop if strain is found
    scanIntervalRef.current = setInterval(() => {
      if (!isScanning && !result) {
        setScanCount(prev => prev + 1);
        performSingleScan();
      }
    }, 5000);
  };

  const triggerManualScan = () => {
    if (!isScanning && !result) {
      performSingleScan();
    }
  };

  const getCurrentPhaseInfo = () => {
    const phase = SCAN_PHASES[currentPhase];
    return phase || SCAN_PHASES[0];
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
        {/* Show frozen frame during scanning, live video otherwise */}
        {frozenFrame && isScanning ? (
          <img
            src={frozenFrame}
            className="w-full h-full object-cover"
            alt="Frozen scan frame"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* OCR scanning frame */}
          <div className={`absolute inset-8 border-2 rounded-lg transition-all duration-300 ${
            isScanning ? 'border-green-400 shadow-lg shadow-green-400/20' : 'border-white/30'
          }`}>
            {isScanning && (
              <div className="absolute inset-0 bg-green-400/10 animate-pulse rounded-lg" />
            )}
            
            {/* Scanning lines */}
            {isScanning && (
              <>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-green-400 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 animate-pulse" />
                <div className="absolute left-0 top-0 w-0.5 h-full bg-green-400 animate-pulse" />
                <div className="absolute right-0 top-0 w-0.5 h-full bg-green-400 animate-pulse" />
              </>
            )}
          </div>
          
          {/* Corner indicators */}
          <div className={`absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 transition-colors duration-300 ${
            isScanning ? 'border-green-400' : 'border-white/50'
          }`} />
          <div className={`absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 transition-colors duration-300 ${
            isScanning ? 'border-green-400' : 'border-white/50'
          }`} />
          <div className={`absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 transition-colors duration-300 ${
            isScanning ? 'border-green-400' : 'border-white/50'
          }`} />
          <div className={`absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 transition-colors duration-300 ${
            isScanning ? 'border-green-400' : 'border-white/50'
          }`} />
          
          {/* OCR confidence indicator */}
          {ocrConfidence > 0 && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="text-white text-xs">OCR: {ocrConfidence}%</div>
              </div>
            </div>
          )}
          
          {/* Detected text display */}
          {detectedText && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-xs">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium mb-1">Detected Text:</div>
                <div className="text-green-400 text-xs font-mono">{detectedText}</div>
              </div>
            </div>
          )}
        </div>

        {/* Scanning progress overlay */}
        {isScanning && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)] z-10">
            <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 space-y-3 border border-green-400/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {(() => {
                    const IconComponent = getCurrentPhaseInfo().icon;
                    return <IconComponent className={`h-6 w-6 animate-spin ${getCurrentPhaseInfo().color}`} />;
                  })()}
                  <div className="absolute -inset-2 border border-white/20 rounded-full animate-ping" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">OCR Scanner</span>
                  <div className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                    Phase {currentPhase + 1}/4
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-white/90">
                {getCurrentPhaseInfo().text}
                <span className="animate-pulse text-green-400 ml-1">▋</span>
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
      <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10 space-y-3">
        {/* Status info */}
        <div className="flex justify-between text-sm text-white/70">
          <span>Auto-scan: {cameraReady && user ? 'Active' : 'Inactive'}</span>
          <span>Scans: {scanCount}</span>
        </div>

        {/* Manual scan trigger */}
        {!isScanning && cameraReady && (
          <Button
            onClick={triggerManualScan}
            className="w-full cannabis-gradient text-white py-4 text-lg font-semibold"
            disabled={!user}
          >
            <Scan className="h-5 w-5 mr-2" />
            Scan Now
          </Button>
        )}

        {error && (
          <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg text-center">
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
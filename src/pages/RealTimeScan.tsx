import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, Scan, ArrowLeft, Eye, Search, Zap, Target, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Strain } from '@/types/strain';
import { convertDatabaseScanToStrain } from '@/data/converters/strainConverters';
import { useToast } from '@/hooks/use-toast';

const SCAN_PHASES = [
  { icon: Target, text: "Capturing frames...", color: "text-blue-400" },
  { icon: Eye, text: "Vision analysis...", color: "text-green-400" },
  { icon: Search, text: "Checking duplicates...", color: "text-purple-400" },
  { icon: Sparkles, text: "Generating profile...", color: "text-yellow-400" }
];

// Vision processing utilities
const captureFrame = (canvas: HTMLCanvasElement, video: HTMLVideoElement): string => {
  const ctx = canvas.getContext('2d')!;
  const { videoWidth: vw, videoHeight: vh } = video;
  
  // Set canvas to video dimensions
  canvas.width = vw;
  canvas.height = vh;
  
  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0, vw, vh);
  
  // Return as base64 JPEG for OpenAI Vision
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
};

const burstCapture = (canvas: HTMLCanvasElement, video: HTMLVideoElement, count: number = 3): string[] => {
  const frames: string[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(captureFrame(canvas, video));
  }
  return frames;
};

const RealTimeScan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [detectedStrain, setDetectedStrain] = useState<string>('');
  const [confidence, setConfidence] = useState(0);
  const [result, setResult] = useState<Strain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize camera and WebSocket on mount
  useEffect(() => {
    startCamera();
    initWebSocket();
    return () => cleanup();
  }, []);

  // Auto-start scanning when camera is ready and user is authenticated
  useEffect(() => {
    if (cameraReady && user) {
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
        console.log('Camera initialized successfully');
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
      console.error('Camera initialization failed:', err);
    }
  };

  const initWebSocket = () => {
    if (!user) return;
    
    const wsUrl = `wss://dqymhupheqkwasfrkcqs.functions.supabase.co/realtime-vision-scan?stream=true`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected for realtime scanning');
      wsRef.current = ws;
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleStreamingResponse(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Retrying...');
      // Retry connection after 3 seconds
      setTimeout(initWebSocket, 3000);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      wsRef.current = null;
    };
  };

  const handleStreamingResponse = useCallback((data: any) => {
    switch (data.type) {
      case 'progress':
        setStatusMessage(data.message);
        if (data.phase === 'capture') setCurrentPhase(0);
        else if (data.phase === 'analysis') setCurrentPhase(1);
        else if (data.phase === 'duplicate_check') setCurrentPhase(2);
        break;
        
      case 'detection':
        setDetectedStrain(data.strainName);
        setConfidence(data.confidence);
        setStatusMessage(data.message);
        break;
        
      case 'generation':
        setCurrentPhase(3);
        setStatusMessage(data.message);
        break;
        
      case 'complete':
        if (data.duplicate) {
          setIsDuplicate(true);
          const strain = convertDatabaseScanToStrain(data.strain);
          setResult(strain);
          toast({
            title: "Strain Found",
            description: `${strain.name} already exists in your collection`,
          });
          // Navigate to existing strain
          setTimeout(() => {
            navigate('/', { state: { selectStrain: strain } });
          }, 2000);
        } else {
          setIsDuplicate(false);
          setResult(data.strain);
          toast({
            title: "New Strain Generated",
            description: `${data.strain.name} has been added to your collection`,
          });
          // Navigate to new strain
          setTimeout(() => {
            navigate('/', { state: { newStrain: data.strain, selectStrain: data.strain } });
          }, 2000);
        }
        break;
        
      case 'error':
        setError(data.error);
        resetScanState();
        break;
    }
  }, [navigate, toast]);

  const cleanup = () => {
    // Keep camera stream open - only close on page navigation
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const resetScanState = () => {
    setIsScanning(false);
    setCurrentPhase(0);
    setFrozenFrame(null);
    setDetectedStrain('');
    setConfidence(0);
    setStatusMessage('');
    setError(null);
    
    // Auto-retry after 3 seconds
    setTimeout(() => {
      if (cameraReady && user && !result) {
        startContinuousScanning();
      }
    }, 3000);
  };

  const performBurstScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !user || !wsRef.current) return;

    setIsScanning(true);
    setCurrentPhase(0);
    setError(null);
    setStatusMessage('Preparing burst capture...');
    
    try {
      // Freeze frame for UI feedback
      const frozenFrameData = captureFrame(canvasRef.current, videoRef.current);
      setFrozenFrame(`data:image/jpeg;base64,${frozenFrameData}`);
      
      // Burst capture - take multiple frames for better analysis
      const frames = burstCapture(canvasRef.current, videoRef.current, 3);
      
      // Send frames via WebSocket for streaming analysis
      wsRef.current.send(JSON.stringify({
        imageFrames: frames,
        userId: user.id
      }));
      
    } catch (error) {
      console.error('Burst scan failed:', error);
      setError('Scan failed. Retrying...');
      resetScanState();
    }
  }, [user]);

  const startContinuousScanning = useCallback(() => {
    if (!user || !cameraReady || isScanning || result) return;
    
    setScanCount(0);
    console.log('Starting continuous scanning...');
    
    // Scan every 5 seconds
    scanIntervalRef.current = setInterval(() => {
      if (!isScanning && !result && wsRef.current) {
        setScanCount(prev => prev + 1);
        performBurstScan();
      }
    }, 5000);
  }, [user, cameraReady, isScanning, result, performBurstScan]);

  const triggerManualScan = useCallback(() => {
    if (!isScanning && !result && wsRef.current) {
      clearInterval(scanIntervalRef.current!);
      performBurstScan();
    }
  }, [isScanning, result, performBurstScan]);

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
          {/* Vision scanning frame */}
          <div className={`absolute inset-8 border-2 rounded-lg transition-all duration-500 ${
            isScanning ? 'border-green-400 shadow-lg shadow-green-400/20' : 'border-white/30'
          }`}>
            {isScanning && (
              <div className="absolute inset-0 bg-green-400/10 animate-pulse rounded-lg" />
            )}
            
            {/* Dynamic scanning indicators */}
            {isScanning && (
              <>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" />
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse" />
                <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse" />
                
                {/* Burst indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-ping" />
                </div>
              </>
            )}
          </div>
          
          {/* Corner indicators */}
          <div className={`absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 transition-all duration-300 ${
            isScanning ? 'border-green-400 scale-110' : 'border-white/50'
          }`} />
          <div className={`absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 transition-all duration-300 ${
            isScanning ? 'border-green-400 scale-110' : 'border-white/50'
          }`} />
          <div className={`absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 transition-all duration-300 ${
            isScanning ? 'border-green-400 scale-110' : 'border-white/50'
          }`} />
          <div className={`absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 transition-all duration-300 ${
            isScanning ? 'border-green-400 scale-110' : 'border-white/50'
          }`} />
          
          {/* Detection confidence */}
          {confidence > 0 && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="text-white text-xs">Confidence: {confidence}%</div>
              </div>
            </div>
          )}
          
          {/* Detected strain display */}
          {detectedStrain && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-xs">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium mb-1">Detected Strain:</div>
                <div className="text-green-400 text-lg font-bold">{detectedStrain}</div>
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
                  <span className="text-white font-medium">AI Vision Scanner</span>
                  <div className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                    Phase {currentPhase + 1}/4
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-white/90">
                {statusMessage || getCurrentPhaseInfo().text}
                <span className="animate-pulse text-green-400 ml-1">▋</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPhase + 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {result && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className={`${isDuplicate ? 'bg-blue-500/90' : 'bg-green-500/90'} text-white p-6 rounded-lg text-center max-w-sm animate-scale-in`}>
              <div className="text-3xl mb-3">
                {isDuplicate ? '🔍' : '✨'}
              </div>
              <div className="font-bold text-lg mb-2">
                {isDuplicate ? 'Strain Found!' : 'New Strain Generated!'}
              </div>
              <div className="text-sm opacity-90 mb-4 font-medium">{result.name}</div>
              <div className="text-xs">
                {isDuplicate ? 'Opening existing strain...' : 'Adding to your collection...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10 space-y-3">
        {/* Status info */}
        <div className="flex justify-between text-sm text-white/70">
          <span>Scanner: {cameraReady && user && wsRef.current ? 'Online' : 'Offline'}</span>
          <span>Scans: {scanCount}</span>
        </div>

        {/* Manual scan trigger */}
        {!isScanning && cameraReady && !result && (
          <Button
            onClick={triggerManualScan}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 text-lg font-semibold disabled:opacity-50"
            disabled={!user || !wsRef.current}
          >
            <Camera className="h-5 w-5 mr-2" />
            Burst Scan
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
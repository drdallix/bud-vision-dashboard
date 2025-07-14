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
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoScanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
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
  const [autoScanCountdown, setAutoScanCountdown] = useState(0);
  const [navigationInProgress, setNavigationInProgress] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize camera and start auto-scan countdown
  useEffect(() => {
    startCamera();
    
    // Handle page navigation - close camera after 5 seconds
    const handleBeforeUnload = () => {
      navigationTimeoutRef.current = setTimeout(() => {
        closeCameraStream();
      }, 5000);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Auto-start countdown when camera is ready
  useEffect(() => {
    if (cameraReady && user && !isScanning && !result) {
      startAutoScanCountdown();
    }
  }, [cameraReady, user]);

  // Shader effects animation loop
  useEffect(() => {
    if (cameraReady && shaderCanvasRef.current && videoRef.current) {
      startShaderEffects();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraReady, isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        console.log('Camera initialized successfully');
        
        // Setup shader canvas
        if (shaderCanvasRef.current && videoRef.current) {
          const video = videoRef.current;
          shaderCanvasRef.current.width = video.videoWidth;
          shaderCanvasRef.current.height = video.videoHeight;
        }
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
      console.error('Camera initialization failed:', err);
    }
  };

  const closeCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraReady(false);
      console.log('Camera stream closed');
    }
  };

  const startShaderEffects = () => {
    const animate = () => {
      if (!shaderCanvasRef.current || !videoRef.current) return;
      
      const canvas = shaderCanvasRef.current;
      const ctx = canvas.getContext('2d')!;
      const video = videoRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Apply shader effects based on scanning state
      if (isScanning) {
        // Scanning effects
        applyScanningEffects(ctx, canvas);
      } else {
        // Idle effects
        applyIdleEffects(ctx, canvas);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const applyScanningEffects = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.005;
    
    // Pulse effect
    ctx.globalCompositeOperation = 'overlay';
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    const pulseIntensity = (Math.sin(time * 3) + 1) * 0.5;
    gradient.addColorStop(0, `rgba(0, 255, 100, ${pulseIntensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Scan lines
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(0, 255, 100, ${0.8 + Math.sin(time * 4) * 0.2})`;
    ctx.lineWidth = 2;
    
    const scanLine = (time * 100) % canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, scanLine);
    ctx.lineTo(canvas.width, scanLine);
    ctx.stroke();
    
    // Grid overlay
    ctx.globalCompositeOperation = 'overlay';
    ctx.strokeStyle = `rgba(0, 255, 100, 0.1)`;
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
  };

  const applyIdleEffects = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.002;
    
    // Subtle glow effect
    ctx.globalCompositeOperation = 'overlay';
    const glow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 3
    );
    const glowIntensity = (Math.sin(time) + 1) * 0.5 * 0.1;
    glow.addColorStop(0, `rgba(100, 200, 255, ${glowIntensity})`);
    glow.addColorStop(1, 'rgba(100, 200, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'source-over';
  };

  const startAutoScanCountdown = () => {
    setAutoScanCountdown(3);
    setStatusMessage('Auto-scan starting in 3 seconds...');
    
    const countdown = setInterval(() => {
      setAutoScanCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          if (!isScanning && !result) {
            performBurstScan();
          }
          return 0;
        }
        setStatusMessage(`Auto-scan starting in ${prev - 1} seconds...`);
        return prev - 1;
      });
    }, 1000);
  };

  const performHTTPScan = async (frames: string[]): Promise<any> => {
    try {
      const response = await fetch('https://dqymhupheqkwasfrkcqs.functions.supabase.co/realtime-vision-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeW1odXBoZXFrd2FzZnJrY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODQ0NzQsImV4cCI6MjA2NTM2MDQ3NH0.V47liXKGJg4a9rtA8q-I-SfQB1UlnDaBf8UKEuqj4C8'}`
        },
        body: JSON.stringify({
          imageFrames: frames,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP scan failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HTTP scan error:', error);
      throw error;
    }
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
          navigateToStrain(strain);
        } else {
          setIsDuplicate(false);
          setResult(data.strain);
          toast({
            title: "New Strain Generated",
            description: `${data.strain.name} has been added to your collection`,
          });
          navigateToStrain(data.strain);
        }
        break;
        
      case 'error':
        setError(data.error);
        resetScanState();
        break;
    }
  }, [navigate, toast]);

  const navigateToStrain = useCallback((strain: Strain) => {
    setNavigationInProgress(true);
    setStatusMessage('Navigation in progress...');
    
    // Convert strain name to URL-friendly format
    const urlFriendlyName = strain.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    // Wait a moment for any final database operations
    setTimeout(() => {
      console.log('Navigating to strain page:', `/strain/${urlFriendlyName}`);
      navigate(`/strain/${urlFriendlyName}`);
      
      // Close camera after navigation
      setTimeout(() => {
        closeCameraStream();
      }, 5000);
    }, 1500);
  }, [navigate]);

  const cleanup = () => {
    // Clean up intervals and timeouts
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (autoScanTimeoutRef.current) {
      clearTimeout(autoScanTimeoutRef.current);
    }
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Close WebSocket if exists
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
    setAutoScanCountdown(0);
    
    // Auto-retry after 3 seconds
    setTimeout(() => {
      if (cameraReady && user && !result && !navigationInProgress) {
        startAutoScanCountdown();
      }
    }, 3000);
  };

  const performBurstScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;

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
      
      // Phase 1: Capture complete
      setCurrentPhase(1);
      setStatusMessage('🔬 DoobieDB analyzing strain data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use HTTP fallback since WebSocket is failing
      const result = await performHTTPScan(frames);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Phase 2: Analysis complete
      setCurrentPhase(2);
      setStatusMessage('Processing results...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Phase 3: Database operations
      setCurrentPhase(3);
      setStatusMessage('Saving to database...');
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Handle the response
      if (result.duplicate) {
        const strain = convertDatabaseScanToStrain(result.strain);
        setIsDuplicate(true);
        setResult(strain);
        toast({
          title: "Strain Found",
          description: `${strain.name} already exists in your collection`,
        });
        navigateToStrain(strain);
      } else {
        setIsDuplicate(false);
        setResult(result.strain);
        toast({
          title: "New Strain Generated", 
          description: `${result.strain.name} has been added to your collection`,
        });
        navigateToStrain(result.strain);
      }
      
    } catch (error) {
      console.error('Burst scan failed:', error);
      setError('Scan failed. Retrying...');
      resetScanState();
    }
  }, [user, performHTTPScan, navigateToStrain, toast]);

  const startContinuousScanning = useCallback(() => {
    // Disabled continuous scanning, now using auto-countdown approach
    console.log('Continuous scanning disabled, using countdown approach');
  }, []);

  const triggerManualScan = useCallback(() => {
    if (!isScanning && !result && !navigationInProgress) {
      clearInterval(scanIntervalRef.current!);
      clearTimeout(autoScanTimeoutRef.current!);
      setAutoScanCountdown(0);
      performBurstScan();
    }
  }, [isScanning, result, navigationInProgress, performBurstScan]);

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
        <h1 className="text-white font-semibold">🔬 DoobieDB Realtime</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Camera viewport with shader effects */}
      <div className="flex-1 relative overflow-hidden">
        {/* Live video feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          style={{ opacity: frozenFrame && isScanning ? 0 : 1 }}
        />
        
        {/* Shader effects canvas */}
        <canvas
          ref={shaderCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ 
            mixBlendMode: 'overlay',
            opacity: cameraReady ? 0.8 : 0,
            transition: 'opacity 0.5s ease'
          }}
        />
        
        {/* Frozen frame during scanning */}
        {frozenFrame && isScanning && (
          <img
            src={frozenFrame}
            className="absolute inset-0 w-full h-full object-cover animate-pulse"
            alt="Analyzing frame..."
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Advanced scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dynamic scanning frame */}
          <div className={`absolute inset-8 border-2 rounded-lg transition-all duration-700 ${
            isScanning 
              ? 'border-green-400 shadow-lg shadow-green-400/30 scale-105' 
              : autoScanCountdown > 0
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
                : 'border-white/30'
          }`}>
            {(isScanning || autoScanCountdown > 0) && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 animate-pulse rounded-lg" />
                
                {/* Animated corner brackets */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-green-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-green-400 animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-green-400 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-green-400 animate-pulse" />
                
                {/* Energy particles */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + (i % 2) * 80}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Countdown overlay */}
          {autoScanCountdown > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-400 animate-bounce mb-2">
                  {autoScanCountdown}
                </div>
                <div className="text-white text-lg font-medium">
                  Auto-scan starting...
                </div>
              </div>
            </div>
          )}
          
          {/* Detection confidence */}
          {confidence > 0 && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-400/30">
                <div className="text-green-400 text-sm font-bold">Confidence: {confidence}%</div>
                <div className="w-24 h-2 bg-white/20 rounded-full mt-1">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Detected strain display */}
          {detectedStrain && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-xs">
              <div className="bg-black/90 backdrop-blur-sm rounded-lg px-6 py-3 border border-green-400/30">
                <div className="text-white text-sm font-medium mb-1">Detected Strain:</div>
                <div className="text-green-400 text-xl font-bold animate-pulse">{detectedStrain}</div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced scanning progress overlay */}
        {isScanning && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)] z-10">
            <div className="bg-black/95 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-green-400/30 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {(() => {
                    const IconComponent = getCurrentPhaseInfo().icon;
                    return (
                      <div className="relative">
                        <IconComponent className={`h-8 w-8 animate-spin ${getCurrentPhaseInfo().color}`} />
                        <div className="absolute -inset-3 border-2 border-white/20 rounded-full animate-ping" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full animate-pulse" />
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg">AI Vision Scanner</span>
                    <div className="text-xs text-green-400 bg-green-400/20 px-3 py-1 rounded-full font-bold">
                      Phase {currentPhase + 1}/4
                    </div>
                  </div>
                  <div className="text-sm text-white/90 font-medium">
                    {statusMessage || getCurrentPhaseInfo().text}
                    <span className="animate-pulse text-green-400 ml-1 text-lg">▋</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced progress bar */}
              <div className="space-y-2">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${((currentPhase + 1) / 4) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>Capture</span>
                  <span>Analyze</span>
                  <span>Process</span>
                  <span>Save</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Epic success message */}
        {result && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
            <div className={`${
              isDuplicate ? 'bg-gradient-to-br from-blue-500/90 to-purple-500/90' : 'bg-gradient-to-br from-green-500/90 to-emerald-500/90'
            } text-white p-8 rounded-2xl text-center max-w-sm animate-scale-in shadow-2xl border border-white/20`}>
              <div className="text-6xl mb-4 animate-bounce">
                {isDuplicate ? '🔍' : '✨'}
              </div>
              <div className="font-bold text-2xl mb-3">
                {isDuplicate ? 'Strain Found!' : 'New Strain Created!'}
              </div>
              <div className="text-lg opacity-90 mb-6 font-semibold">{result.name}</div>
              <div className="text-sm opacity-80">
                {isDuplicate ? 'Opening existing strain page...' : 'Adding to your collection...'}
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10 space-y-3">
        {/* Enhanced status info */}
        <div className="flex justify-between items-center text-sm text-white/70 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${cameraReady && user ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span>Scanner: {cameraReady && user ? 'Ready' : 'Initializing'}</span>
          </div>
          <span>Scans: {scanCount}</span>
        </div>

        {/* Manual scan trigger */}
        {!isScanning && cameraReady && !result && !navigationInProgress && (
          <Button
            onClick={triggerManualScan}
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white py-6 text-xl font-bold disabled:opacity-50 shadow-lg border border-white/20"
            disabled={!user}
          >
            <Camera className="h-6 w-6 mr-3" />
            {autoScanCountdown > 0 ? `Auto-scan in ${autoScanCountdown}s` : 'Instant Scan'}
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
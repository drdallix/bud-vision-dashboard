import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, Square, Target, Zap, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Strain } from '@/types/strain';
import { convertDatabaseScanToStrain } from '@/data/converters/strainConverters';
import { useToast } from '@/hooks/use-toast';
import { realtimeScanManager, type ScanSession } from '@/services/RealtimeScanManager';
import DoobieSequence from '@/components/DoobieSequence';

const ContinuousRealTimeScan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stabilityCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stabilityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentSession, setCurrentSession] = useState<ScanSession | null>(null);
  const [stabilityFeedback, setStabilityFeedback] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (cameraReady && user) {
      startContinuousScanning();
    }
    return () => stopContinuousScanning();
  }, [cameraReady, user]);

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
        
        // Start stability monitoring
        startStabilityMonitoring();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
      console.error('Camera initialization failed:', err);
    }
  };

  const startStabilityMonitoring = () => {
    stabilityIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !stabilityCanvasRef.current) return;
      
      const metrics = realtimeScanManager.assessCameraStability(
        stabilityCanvasRef.current, 
        videoRef.current
      );
      
      setStabilityFeedback(metrics.recommendation);
    }, 500); // Check stability every 500ms
  };

  const startContinuousScanning = () => {
    if (!user) return;
    
    const session = realtimeScanManager.startSession();
    setCurrentSession(session);
    setIsScanning(true);
    
    // Scan every 3 seconds
    scanIntervalRef.current = setInterval(() => {
      if (realtimeScanManager.shouldScan()) {
        performScan();
      }
    }, 3000);
    
    // Update scan progress indicator
    const progressInterval = setInterval(() => {
      if (!lastScanTime) {
        setScanProgress(0);
        return;
      }
      
      const timeSinceLastScan = Date.now() - lastScanTime.getTime();
      const progress = Math.min(100, (timeSinceLastScan / 3000) * 100);
      setScanProgress(progress);
    }, 100);
    
    return () => clearInterval(progressInterval);
  };

  const stopContinuousScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const performScan = async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;
    
    try {
      setIsGenerating(true);
      
      // Capture frames
      const frames = captureFrames();
      
      // Immediately restart camera to ensure live feed continues
      ensureCameraIsActive();
      
      const response = await fetch('https://dqymhupheqkwasfrkcqs.functions.supabase.co/realtime-vision-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeW1odXBoZXFrd2FzZnJrY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODQ0NzQsImV4cCI6MjA2NTM2MDQ3NH0.V47liXKGJg4a9rtA8q-I-SfQB1UlnDaBf8UKEuqj4C8`
        },
        body: JSON.stringify({
          imageFrames: frames,
          userId: user.id
        })
      });

      const result = await response.json();
      
      if (result.error) {
        console.warn('Scan failed:', result.error);
        return;
      }

      // Add to session if successful
      const strain = result.duplicate 
        ? convertDatabaseScanToStrain(result.strain)
        : result.strain;
        
      realtimeScanManager.addScanToSession(strain);
      setCurrentSession(realtimeScanManager.getCurrentSession());
      setLastScanTime(new Date());
      
      toast({
        title: result.duplicate ? "Known Strain Detected" : "New Strain Found",
        description: strain.name,
      });
      
    } catch (error) {
      console.warn('Scan error:', error);
    } finally {
      setIsGenerating(false);
      // Ensure camera stays active after processing
      ensureCameraIsActive();
    }
  };

  const ensureCameraIsActive = async () => {
    if (!videoRef.current || !streamRef.current) {
      // Restart camera if it's not active
      await startCamera();
      return;
    }
    
    // Check if video is playing
    if (videoRef.current.paused || videoRef.current.ended) {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.warn('Failed to restart video:', error);
        await startCamera();
      }
    }
  };

  const captureFrames = (): string[] => {
    if (!videoRef.current || !canvasRef.current) return [];
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const frames: string[] = [];
    for (let i = 0; i < 2; i++) {
      ctx.drawImage(video, 0, 0);
      frames.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    }
    
    return frames;
  };

  const endSession = () => {
    const completedSession = realtimeScanManager.endSession();
    stopContinuousScanning();
    
    if (!completedSession || completedSession.scans.length === 0) {
      navigate('/');
      return;
    }
    
    if (completedSession.scans.length === 1) {
      // Navigate directly to single strain
      const strain = completedSession.scans[0];
      const urlFriendlyName = strain.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      navigate(`/strain/${urlFriendlyName}`);
    } else {
      // Show selection interface
      setCurrentSession(completedSession);
      stopContinuousScanning();
    }
  };

  const cleanup = () => {
    stopContinuousScanning();
    
    if (stabilityIntervalRef.current) {
      clearInterval(stabilityIntervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraReady(false);
    }
  };

  const navigateToStrain = (strain: Strain) => {
    const urlFriendlyName = strain.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    navigate(`/strain/${urlFriendlyName}`);
  };

  // Session completed - show strain selection
  if (currentSession && !currentSession.isActive && currentSession.scans.length > 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🎉 Session Complete!</h1>
            <p className="text-muted-foreground">
              Found {currentSession.scans.length} strains. Select one to view:
            </p>
          </div>
          
          <div className="grid gap-4 mb-6">
            {currentSession.scans.map((strain, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => navigateToStrain(strain)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{strain.name}</h3>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{strain.type}</Badge>
                        <span>THC: {strain.thc}%</span>
                        <span>CBD: {strain.cbd}%</span>
                      </div>
                    </div>
                    <div className="text-2xl">🌿</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
        <h1 className="text-white font-semibold">🔬 DoobieDB Continuous Scanner</h1>
        <div className="w-16" />
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={stabilityCanvasRef} className="hidden" />
        
        {/* Session overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold">Active Session</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {realtimeScanManager.getSessionStats().count} scans
              </Badge>
            </div>
            
            <div className="text-sm text-white/70 mb-3">
              Duration: {realtimeScanManager.getSessionStats().duration}
            </div>
            
            {/* Scan progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>Next scan in:</span>
                <span>{Math.max(0, Math.ceil((3000 - scanProgress * 30) / 1000))}s</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
            
            {/* Stability feedback */}
            <div className="mt-3 text-sm text-green-400">
              {stabilityFeedback}
            </div>
          </div>
        </div>

        {/* Scanning indicator */}
        {isGenerating && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <DoobieSequence isActive={true} />
          </div>
        )}

        {/* Scanning frame */}
        <div className={`absolute inset-8 border-2 rounded-lg transition-all duration-500 ${
          isScanning 
            ? 'border-green-400 shadow-lg shadow-green-400/30' 
            : 'border-white/30'
        }`}>
          {isScanning && (
            <>
              <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-green-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-green-400 animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-green-400 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-green-400 animate-pulse" />
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div className="flex justify-center space-x-4">
          {!isScanning ? (
            <Button
              onClick={startContinuousScanning}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              disabled={!cameraReady || !user}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Continuous Scanning
            </Button>
          ) : (
            <>
              <Button
                onClick={stopContinuousScanning}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-6 py-3"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              
              <Button
                onClick={endSession}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
              >
                <Square className="h-5 w-5 mr-2" />
                End Session
              </Button>
            </>
          )}
        </div>
        
        {error && (
          <div className="mt-4 bg-red-500/90 text-white px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}
        
        {!user && (
          <div className="mt-4 bg-yellow-500/90 text-white px-4 py-3 rounded-lg text-center">
            Sign in required for scanning
          </div>
        )}
      </div>
    </div>
  );
};

export default ContinuousRealTimeScan;

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => Promise<void> | void;
}

// States: live (show video/camera), captured (show image & progress)
type Mode = "live" | "processing";

const FAKE_PROGRESS_STEPS = [
  { label: "Scanning package...", percent: 18 },
  { label: "Reading label...", percent: 36 },
  { label: "Detecting strain info...", percent: 58 },
  { label: "Analyzing with AI...", percent: 75 },
  { label: "Finalizing...", percent: 100 },
];

const CameraModal = ({ open, onClose, onCapture }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("live");
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera start/stop logic
  useEffect(() => {
    if (!open) {
      setMode("live");
      setCapturedImage(null);
      setProgressIndex(0);
      setError(null);
      // Stop camera stream if present
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        console.log("Camera stopped (modal closed)");
      }
      return;
    }

    async function startCamera() {
      setLoading(true);
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setLoading(false);
        console.log("Camera started successfully.");
      } catch (e: any) {
        setError("Camera not accessible. Allow camera permission.");
        setLoading(false);
        console.log("Camera start failed:", e);
      }
    }

    startCamera();

    return () => {
      // Ensure cleanup if unmounting
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log("Camera stopped (unmounted)");
      }
    };
  }, [open]);

  // Take a photo, animate, and start "processing"
  async function handleCapture() {
    console.log("handleCapture called - capturing current frame.");
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 480;
    const height = video.videoHeight || 320;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setCapturedImage(dataUrl);
    setMode("processing");

    // Stop the camera stream while we process (saves resources)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      console.log("Camera stream stopped after capture.");
    }

    // Show fake progress sequence before resolving:
    setProgressIndex(0);
    let progressStep = 0;
    const maxStep = FAKE_PROGRESS_STEPS.length - 1;
    const progressInterval = setInterval(() => {
      if (progressStep < maxStep) {
        progressStep++;
        setProgressIndex(progressStep);
        console.log("Progress update:", FAKE_PROGRESS_STEPS[progressStep]);
      } else {
        clearInterval(progressInterval);
      }
    }, 320);

    // fire parent callback "after" some progress (while last step shows) or immediately if parent is async
    setTimeout(async () => {
      // console log
      console.log("Dispatching onCapture callback (image analysis begins)");
      try {
        await Promise.resolve(onCapture(dataUrl));
        // parent closes modal, or we close here as fallback
        setTimeout(() => {
          setMode("live");
          setCapturedImage(null);
          setProgressIndex(0);
          onClose();
        }, 400);
      } catch (e) {
        setError("Image processing failed. Try again.");
        setMode("live");
        setCapturedImage(null);
        setProgressIndex(0);
        onClose();
        console.log("onCapture threw error:", e);
      }
    }, FAKE_PROGRESS_STEPS.length * 320 + 320);

  }

  // FULLSCREEN dialog styling, disable scroll under camera
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-0 overflow-hidden animate-fade-in"
        style={{ maxWidth: '100vw', maxHeight: '100vh', borderRadius: 0, margin: 0 }}
      >
        {/* Dialog accessibility requirements */}
        <DialogTitle className="sr-only">Open Camera</DialogTitle>
        <DialogDescription className="sr-only">
          View live camera to capture package for scanning.
        </DialogDescription>

        <div className="relative w-screen h-screen flex items-center justify-center bg-black">
          {mode === "live" && (
            <>
              <video
                ref={videoRef}
                playsInline
                className="w-full h-full object-cover absolute inset-0"
                width={1280}
                height={720}
                muted
                autoPlay
                onClick={loading || error ? undefined : handleCapture}
                style={{ cursor: loading ? "not-allowed" : "crosshair", userSelect: "none" }}
                tabIndex={0}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <Loader2 className="animate-spin text-white w-14 h-14" />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                  <span className="text-red-500 text-lg">{error}</span>
                </div>
              )}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm z-20 shadow">
                Tap anywhere to scan package
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full px-4 py-1 text-sm z-20"
                type="button"
              >Close</button>
            </>
          )}

          {mode === "processing" && capturedImage && (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <img
                src={capturedImage}
                alt="Scanned package"
                className="w-full h-full object-cover absolute inset-0 animate-scale-in"
                style={{ filter: "brightness(1) blur(0.5px)" }}
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                <Loader2 className="animate-spin text-green-400 w-16 h-16 mb-6" />
                <div className="w-2/3 max-w-lg bg-black/80 rounded-lg p-4 text-white flex flex-col items-center space-y-2 animate-fade-in">
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-3">
                    <div
                      className="bg-green-400 h-4 rounded-full transition-all duration-300"
                      style={{
                        width: `${FAKE_PROGRESS_STEPS[progressIndex].percent}%`,
                        minWidth: "6%",
                      }}
                    />
                  </div>
                  <span className="font-semibold text-base text-green-100 tracking-wide">
                    {FAKE_PROGRESS_STEPS[progressIndex].label}
                  </span>
                  <span className="text-xs text-white/60 mt-1">
                    Package scan in progress...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;

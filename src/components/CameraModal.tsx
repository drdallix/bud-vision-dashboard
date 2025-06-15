
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

// Simple cartoonish edge shader using canvas manipulation (fast and cross-browser)
// For more advanced effects, migrate to three.js postprocessing pipeline and custom shaders

const CameraModal = ({ open, onClose, onCapture }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      setError(null);
      setLoading(true);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setLoading(false);
      } catch (e: any) {
        setError("Camera not accessible. Allow camera permission.");
        setLoading(false);
      }
    }

    if (open) startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      // Cancel animation
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [open]);

  // Canvas: apply outline shader to video stream (live)
  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let width = 480;
    let height = 320;

    function processFrame() {
      if (!canvas || !video) return;
      width = video.videoWidth || 480;
      height = video.videoHeight || 320;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, width, height);

      // --- Simple edge detection/shader: outline composition ---
      let frame = ctx.getImageData(0, 0, width, height);
      let data = frame.data;
      // Sobel operator (only for a simple, sleek look)
      const l = width * height;
      for (let i = 0; i < l; i++) {
        if (i % 4 === 3) continue; // skip alpha
        // Get pixel positions
        let ix = i * 4;
        // Quick approximation: highlight edges by (pixel - neighbors)
        if (ix + 4 < data.length && ix - 4 >= 0) {
          let diff = Math.abs(data[ix] - data[ix + 4]) + Math.abs(data[ix] - data[ix - 4]);
          data[ix]   = Math.min(255, diff * 2); // R
          data[ix+1] = Math.min(255, diff * 2); // G
          data[ix+2] = 220; // Cool blue tint
        }
      }
      ctx.putImageData(frame, 0, 0);

      // Optional: overlay animated pulse ring to indicate "AI vision"
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.2 * Math.sin(Date.now() / 300);
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 5 + 2 * Math.abs(Math.sin(Date.now() / 900));
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      animFrame.current = requestAnimationFrame(processFrame);
    }

    animFrame.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [open]);

  // When the user taps/clicks: capture and close
  function handleCapture() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // The user sees the outline; capture the *original* video frame for better scan.
    // But you can choose to send the processed frame if desired!
    // We use video frame to not confuse the AI model.
    const tempCanvas = document.createElement("canvas");
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 480;
    const height = video.videoHeight || 320;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.drawImage(video, 0, 0, width, height);
    const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.92);
    onCapture(dataUrl);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl p-0 bg-black rounded-lg overflow-hidden shadow-xl">
        <div className="relative w-full aspect-video bg-black cursor-crosshair select-none" onClick={handleCapture}>
          {/* Native video is hidden (performance) */}
          <video
            ref={videoRef}
            playsInline
            className="hidden"
            width={480}
            height={320}
            muted
          />
          {/* Overlay: canvas with shader effect */}
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            className="w-full h-full object-cover"
            style={{ touchAction: 'none', pointerEvents: (loading ? 'none' : 'auto') }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <Loader2 className="animate-spin text-white w-10 h-10" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <span className="text-red-500 text-lg">{error}</span>
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex justify-between items-center p-2">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">Tap anywhere to capture</span>
            <button
              onClick={onClose}
              className="bg-black/60 text-white rounded-full px-3 text-sm h-8 ml-auto"
              type="button"
            >Close</button>
          </div>
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <div className="text-white/70 text-xs bg-black/40 rounded-md px-3 py-1">
              AI outline preview
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;


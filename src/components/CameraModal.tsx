
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

const CameraModal = ({ open, onClose, onCapture }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera on open
  useEffect(() => {
    async function startCamera() {
      setError(null);
      setLoading(true);
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
      } catch (e: any) {
        setError("Camera not accessible. Allow camera permission.");
        setLoading(false);
      }
    }
    if (open) startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  // Take the photo from live video, pass raw frame, and close
  function handleCapture() {
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
    onCapture(dataUrl);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl p-0 bg-black rounded-lg overflow-hidden shadow-xl">
        <div
          className="relative w-full aspect-video bg-black cursor-crosshair select-none"
          onClick={loading || error ? undefined : handleCapture}
          tabIndex={0}
        >
          {/* Live video: no effects */}
          <video
            ref={videoRef}
            playsInline
            className="w-full h-full object-cover"
            width={480}
            height={320}
            muted
            autoPlay
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <Loader2 className="animate-spin text-white w-10 h-10" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <span className="text-red-500 text-lg">{error}</span>
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex justify-between items-center p-2">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Tap to capture</span>
            <button
              onClick={onClose}
              className="bg-black/50 text-white rounded-full px-3 text-sm h-8 ml-auto"
              type="button"
            >Close</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;

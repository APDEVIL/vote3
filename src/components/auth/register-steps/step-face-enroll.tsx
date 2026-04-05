"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle, SkipForward, RefreshCw } from "lucide-react";
import { api } from "@/trpc/react";

interface StepFaceEnrollProps {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

export function StepFaceEnroll({ userId, onNext, onBack }: StepFaceEnrollProps) {
  const [enrolled, setEnrolled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const enrollMutation = api.auth.enrollFace.useMutation({
    onSuccess: () => {
      setEnrolled(true);
      stopCamera();
      toast.success("Face captured and enrolled!");
    },
    onError: (e) => toast.error(e.message),
  });

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 400, height: 400, facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error("Could not access camera. Please check permissions.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      
      // Send the real Base64 image data to the backend
      enrollMutation.mutate({
        userId: userId,
        imageData: imageData
      });
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      
      {/* Video / Preview Area */}
      <div className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-primary/20 bg-black shadow-inner">
        {enrolled ? (
          <div className="flex h-full w-full items-center justify-center bg-green-500/10">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {/* Overlay for positioning */}
            <div className="absolute inset-0 border-[20px] border-black/20 rounded-full pointer-events-none" />
          </>
        )}
      </div>

      {/* Hidden canvas for capturing the frame */}
      <canvas ref={canvasRef} className="hidden" />

      <div>
        <h3 className="text-base font-semibold text-foreground">
          {enrolled ? "Verification Success" : "Center Your Face"}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {enrolled
            ? "Biometric ID linked to your voter profile."
            : "Please look directly at the camera and click Capture."}
        </p>
      </div>

      <div className="flex w-full gap-3">
        {!enrolled ? (
          <>
            <Button
              variant="outline"
              onClick={onBack}
              disabled={enrollMutation.isPending}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleCapture}
              disabled={enrollMutation.isPending || !stream}
              className="flex-[2] bg-primary font-semibold"
            >
              {enrollMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {enrollMutation.isPending ? "Processing..." : "Capture Face"}
            </Button>
          </>
        ) : (
          <Button
            onClick={onNext}
            className="w-full bg-primary font-semibold"
          >
            Continue → Secret Questions
          </Button>
        )}
      </div>

      {!enrolled && (
        <Button variant="link" onClick={onNext} className="text-xs text-muted-foreground">
          Skip for now (Dev Mode)
        </Button>
      )}
    </div>
  );
}
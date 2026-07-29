import type { RefObject } from "react";
import { ScannerOverlay } from "./ScannerOverlay";

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
}

export function CameraPreview({ videoRef, isScanning }: CameraPreviewProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-950 sm:aspect-video">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} muted playsInline className="size-full object-cover" />
      {isScanning && <ScannerOverlay />}
      {!isScanning && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
          Starting camera...
        </div>
      )}
    </div>
  );
}

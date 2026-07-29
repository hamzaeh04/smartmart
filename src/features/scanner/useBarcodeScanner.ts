import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

export type ScannerErrorType =
  | "permission-denied"
  | "no-camera"
  | "camera-in-use"
  | "unsupported"
  | "unknown";

export interface ScannerError {
  type: ScannerErrorType;
  message: string;
}

const ERROR_MESSAGES: Record<ScannerErrorType, string> = {
  "permission-denied": "Camera access was denied. Please allow camera permission and try again.",
  "no-camera": "No camera was detected. Enter the product code manually.",
  "camera-in-use": "The camera is already in use by another application.",
  unsupported: "Barcode scanning isn't supported in this browser. Enter the product code manually.",
  unknown: "Something went wrong while starting the camera. Please try again.",
};

function classifyError(err: unknown): ScannerError {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return { type: "permission-denied", message: ERROR_MESSAGES["permission-denied"] };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return { type: "no-camera", message: ERROR_MESSAGES["no-camera"] };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return { type: "camera-in-use", message: ERROR_MESSAGES["camera-in-use"] };
  }
  return { type: "unknown", message: ERROR_MESSAGES.unknown };
}

interface UseBarcodeScannerOptions {
  active: boolean;
  onDecode: (value: string) => void;
}

export function useBarcodeScanner({ active, onDecode }: UseBarcodeScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<ScannerError | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const hasDecodedRef = useRef(false);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  const toggleTorch = useCallback(async () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      // torch toggle unsupported on this device; ignore silently
    }
  }, [torchOn]);

  const start = useCallback(async (deviceId?: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError({ type: "unsupported", message: ERROR_MESSAGES.unsupported });
      return;
    }
    setError(null);
    hasDecodedRef.current = false;

    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    try {
      const video = videoRef.current;
      if (!video) return;

      const controls = await readerRef.current.decodeFromVideoDevice(deviceId, video, (result, err) => {
        if (result && !hasDecodedRef.current) {
          hasDecodedRef.current = true;
          onDecodeRef.current(result.getText());
        }
        // NotFoundException fires continuously while no code is in frame — expected, ignore.
        void err;
      });
      controlsRef.current = controls;
      setIsScanning(true);

      const stream = video.srcObject as MediaStream | null;
      const track = stream?.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.();
      setTorchSupported(!!capabilities && "torch" in capabilities);

      const allDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(allDevices);
      const activeTrackSettings = track?.getSettings();
      setSelectedDeviceId(deviceId ?? activeTrackSettings?.deviceId ?? allDevices[0]?.deviceId);

      if (allDevices.length === 0) {
        setError({ type: "no-camera", message: ERROR_MESSAGES["no-camera"] });
      }
    } catch (err) {
      setError(classifyError(err));
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      start(selectedDeviceId);
    } else {
      stop();
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const switchDevice = useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      stop();
      start(deviceId);
    },
    [start, stop],
  );

  return {
    videoRef,
    devices,
    selectedDeviceId,
    switchDevice,
    isScanning,
    error,
    setError,
    torchSupported,
    torchOn,
    toggleTorch,
    restart: () => start(selectedDeviceId),
  };
}

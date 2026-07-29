import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCodeDisplay({ value, size = 160, className }: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).catch(() => {});
  }, [value, size]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={`QR code for ${value}`} />;
}

export async function getQrCodeDataUrl(value: string, size = 300): Promise<string> {
  return QRCode.toDataURL(value, { width: size, margin: 1 });
}

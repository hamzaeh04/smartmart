import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  height?: number;
  className?: string;
}

export function BarcodeDisplay({ value, height = 60, className }: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "EAN13",
        height,
        width: 1.6,
        fontSize: 12,
        margin: 4,
        displayValue: true,
      });
    } catch {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        height,
        width: 1.6,
        fontSize: 12,
        margin: 4,
        displayValue: true,
      });
    }
  }, [value, height]);

  return <svg ref={svgRef} className={className} role="img" aria-label={`Barcode ${value}`} />;
}

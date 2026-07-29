export function ScannerOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <div className="relative size-56 sm:size-64">
        <span className="absolute left-0 top-0 size-8 rounded-tl-lg border-l-4 border-t-4 border-brand-400" />
        <span className="absolute right-0 top-0 size-8 rounded-tr-lg border-r-4 border-t-4 border-brand-400" />
        <span className="absolute bottom-0 left-0 size-8 rounded-bl-lg border-b-4 border-l-4 border-brand-400" />
        <span className="absolute bottom-0 right-0 size-8 rounded-br-lg border-b-4 border-r-4 border-brand-400" />
        <div className="scan-line absolute inset-x-2 top-2 h-0.5 rounded-full bg-brand-400/80 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
      </div>
      <p className="mt-6 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
        Place the QR code or barcode inside the frame
      </p>
    </div>
  );
}

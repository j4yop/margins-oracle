/**
 * PhoneMockup — refined smartphone frame container.
 * Renders a device shell with dynamic island, tactile side rails, and a live product surface.
 */
export default function PhoneMockup({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-full max-w-[330px] ${className}`}>
      {/* Outer chassis */}
      <div className="relative aspect-[9/19.2] rounded-[48px] border-[6px] border-slate-850 bg-slate-900 p-[7px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-700/60">
        {/* Screen Bezel */}
        <div className="relative h-full w-full rounded-[40px] border border-slate-200/60 bg-white overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-5 w-26 rounded-full bg-slate-950 flex items-center justify-end px-3 ring-1 ring-slate-800/80">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-sky-500/40" />
            </div>
          </div>

          {/* Status Bar */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 pt-2.5 text-[10px] font-mono font-medium text-slate-800">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-[9px] font-sans font-semibold">5G</span>
              <div className="flex items-end gap-0.5 h-2">
                <span className="w-0.5 h-1 bg-slate-800 rounded-sm" />
                <span className="w-0.5 h-1.5 bg-slate-800 rounded-sm" />
                <span className="w-0.5 h-2 bg-slate-800 rounded-sm" />
              </div>
              <div className="w-4 h-2 rounded-[2px] border border-slate-800 p-0.5 flex items-center">
                <div className="h-full w-full bg-emerald-500 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="absolute inset-0 pt-7 flex flex-col">{children}</div>

          {/* Home indicator bar at bottom */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-28 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* Side physical buttons (Mute/Volume + Power) */}
      <div className="absolute -left-[9px] top-24 h-7 w-[3px] rounded-l-md bg-slate-700" />
      <div className="absolute -left-[9px] top-36 h-12 w-[3px] rounded-l-md bg-slate-700" />
      <div className="absolute -left-[9px] top-52 h-12 w-[3px] rounded-l-md bg-slate-700" />
      <div className="absolute -right-[9px] top-32 h-16 w-[3px] rounded-r-md bg-slate-700" />
    </div>
  );
}

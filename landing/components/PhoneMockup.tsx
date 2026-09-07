/**
 * PhoneMockup — stylised iPhone frame that contains a child slot.
 * Renders a fixed-aspect device shell with notch, side rail, and a live "scanning" frame
 * the children can sit inside.
 */
export default function PhoneMockup({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-full max-w-[320px] ${className}`}>
      {/* outer frame */}
      <div className="relative aspect-[9/19] rounded-[42px] border-[3px] border-ink bg-ink p-[6px] shadow-brutal-lg">
        {/* inner bezel */}
        <div className="relative h-full w-full rounded-[36px] border-[2px] border-ink/40 bg-bone overflow-hidden">
          {/* notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 h-5 w-24 rounded-full bg-ink" />
          {/* status bar */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 pt-2.5 text-[10px] font-mono text-ink/70">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              <span>· 5G · 100%</span>
            </span>
          </div>
          {/* child slot */}
          <div className="absolute inset-0 pt-7">{children}</div>
        </div>
      </div>
      {/* side rail (silent switch + volume) */}
      <div className="absolute -left-1 top-24 h-10 w-1 rounded-l-sm bg-ink" />
      <div className="absolute -left-1 top-40 h-16 w-1 rounded-l-sm bg-ink" />
      <div className="absolute -left-1 top-60 h-16 w-1 rounded-l-sm bg-ink" />
      <div className="absolute -right-1 top-32 h-20 w-1 rounded-r-sm bg-ink" />
    </div>
  );
}

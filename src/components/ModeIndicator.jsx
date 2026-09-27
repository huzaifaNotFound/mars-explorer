export default function ModeIndicator({ mode }) {
  return (
    <div className="absolute bottom-0 right-0 z-50 flex items-center space-x-4 bg-bg-surface px-6 py-3 rounded-tl-sm font-mono text-base text-text-primary border border-white/10 pointer-events-none transition-all duration-300 ease-in-out">
      <style>{`
        @keyframes modeIndicatorFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div key={mode} className="flex items-center space-x-4" style={{ animation: "modeIndicatorFadeIn 300ms ease-out" }}>
        {mode === "globe" ? (
          <>
            {/* Left / Down / Right stay in normal flow (one line).
                Up floats directly above this cluster via absolute positioning,
                so it's sized to just itself - no leftover empty space beside it. */}
            <div className="relative flex items-center gap-1">
              {/* Small tab sharing the bar's own bg/border, so the up key reads as
                  a slight protrusion of the same shape rather than a separate
                  floating badge. -mb-px overlaps the bar's top border to hide the seam. */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px bg-bg-surface border border-white/10 border-b-0 rounded-t-sm px-2 pt-2 mb-2">
                <span className="flex bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V5" />
                    <path d="M6 11l6-6 6 6" />
                  </svg>
                </span>
              </div>

              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="M11 6l-6 6 6 6" />
                </svg>
              </span>

              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M18 13l-6 6-6-6" />
                </svg>
              </span>

              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>

            <span className="text-text-muted whitespace-nowrap">Rotate the Globe</span>

            {/* Esc */}
            <div className="flex items-center space-x-1 whitespace-nowrap">
              <span className="bg-accent-primary/20 text-accent-green px-2 py-0.5 rounded border border-accent-green/30">
                Esc
              </span>
              <span className="text-text-muted ml-2">
                Navigate missions
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1 whitespace-nowrap">
              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="M11 6l-6 6 6 6" />
                </svg>
              </span>

              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </span>

              <span className="text-text-muted pr-1 ml-2">Move</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded border border-accent-secondary/30">
                Enter
              </span>

              <span className="text-text-muted pr-1 ml-2">Select</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded border border-accent-primary/30">
                Esc
              </span>

              <span className="text-text-muted ml-2">Globe view</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
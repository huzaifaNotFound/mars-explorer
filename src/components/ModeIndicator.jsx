

export default function ModeIndicator({ mode }) {
  return (
    <div className="absolute bottom-0 right-0 transform z-50 flex items-center space-x-4 bg-bg-surface px-6 py-3 rounded-tl-sm font-mono text-base text-text-primary border border-white/10  pointer-events-none transition-all duration-300">
      {mode === 'globe' ? (
        <>
          <span className="text-accent-primary tracking-wide">Globe view</span>
          <span className="w-px h-5 bg-white/20"></span>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded border border-accent-primary/30 shadow-[0_0_8px_rgba(217,98,47,0.2)]">Esc</span>
              <span className="text-text-muted">Navigate missions</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <span className="text-accent-secondary font-semibold tracking-wide capitalize">Navigate mode</span>
          <span className="w-px h-5 bg-white/20"></span>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">←</span>
              <span className="bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded border border-accent-secondary/30">→</span>
              <span className="text-text-muted pr-1">Move</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded border border-accent-secondary/30">Enter</span>
              <span className="text-text-muted pr-1">Select</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded border border-accent-primary/30">Esc</span>
              <span className="text-text-muted">Globe view</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

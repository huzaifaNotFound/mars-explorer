function ResetBtn({ globeRef, globeContainerRef, resetButtonRef, onReset, pressedKeys }) {
  const handleReset = () => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 800);

    onReset?.();

    requestAnimationFrame(() => {
      globeContainerRef.current?.focus();
    });
  };

  const rPressed = !!pressedKeys?.has("r");

  return (
    <>
      <img className="absolute top-8 left-12 h-15" src="/nasa.png" alt="Nasa Text" />
      <span className="absolute top-10.5 left-60 font-mono text-base text-text-muted capitalize">
        PLANATERY EXPLORATION
      </span>
      <span className="absolute top-17 left-60 font-mono text-base text-text-muted capitalize">A SEARCH FOR LIFE</span>

      <div className="absolute bottom-28 left-12 z-6 font-inter text-text-primary bg-bg-primary rounded-sm border border-white/15 p-5">
        <div className="text-lg mb-3 font-space">Mars</div>

        <div className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1 text-base">
          <span className="text-text-muted font-mono">Diameter</span>
          <span className="text-text- font-mono">6,779 km</span>

          <span className="text-text-muted font-mono">Day Length</span>
          <span className="text-text- font-mono">24h 39m 35s (called sol)</span>

          <span className="text-text-muted font-mono">Gravity</span>
          <span className="text-text- font-mono">3.71 m/s²</span>

          <span className="text-text-muted font-mono">Avg. Temp.</span>
          <span className="text-text- font-mono">-63 °C</span>

          <span className="text-text-muted font-mono">Moons</span>
          <span className="text-text- font-mono">Phobos, Deimos</span>
        </div>
      </div>

      <div className="absolute bottom-7 left-12 z-10">
        <button
          ref={resetButtonRef}
          tabIndex={-1}
          onClick={handleReset}
          title="Reset view (R)"
          id="btn"
          className="
                relative
                font-mono
                flex items-center gap-1.5
                px-4.5 py-2.5
        bg-bg-primary
            rounded-sm
            border border-accent-amber/30
          text-text-primary
            text-base font-medium
            cursor-pointer
            backdrop-blur-[6px]
            tracking-wider
            transition-all duration-200 ease-in-out

            focus-visible:outline-2
            focus-visible:outline-dashed
         focus-visible:outline-text-primary
            focus-visible:outline-offset-4
          focus-visible:bg-bg-surface
            focus-visible:shadow-[0_0_10px_rgba(138,102,89,0.25)]
            focus-visible:-translate-y-px
             group "
        >
          <span
            id="r"
            className={`absolute -top-5 -right-5 flex items-center justify-center w-8 h-7 px-1 text-sm font-mono font-semibold leading-none rounded border border-accent-amber pointer-events-none group-focus:-translate-y-1 group-focus:translate-x-1 transition-all duration-400 ease-in-out ${
              rPressed
                ? "bg-accent-amber/60 text-text-primary scale-90"
                : "bg-accent-amber/20 text-accent-amber"
            }`}
          >
            R
          </span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset Globe View
        </button>
      </div>
    </>
  );
}

export default ResetBtn;
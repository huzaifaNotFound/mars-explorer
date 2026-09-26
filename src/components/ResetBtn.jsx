

function ResetBtn({globeRef}){
    const handleReset = () => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 800);
      };
      
      return(
<>
        <img className="absolute top-8 right-107 h-12" src="/nasa.png" alt="Nasa Text" />
        <span className="absolute top-20.5 right-85 font-mono text-lg text-text-muted">Planetary Exploration</span>

        <div className="absolute top-6 right-6 z-6 font-inter text-text-primary bg-bg-primary rounded-sm border border-white/15 p-5">
    <div className="text-lg mb-3 font-space">Mars</div>

    <div className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1 text-sm">
        <span className="text-text-muted font-mono">Diameter</span>
        <span className="text-text- font-mono">6,779 km</span>

        <span className="text-text-muted font-mono">Day Length</span>
        <span className="text-text- font-mono">24h 37m</span>

        <span className="text-text-muted font-mono">Gravity</span>
        <span className="text-text- font-mono">3.71 m/s²</span>

        <span className="text-text-muted font-mono">Avg. Temp.</span>
        <span className="text-text- font-mono">-63 °C</span>

        <span className="text-text-muted font-mono">Moons</span>
        <span className="text-text- font-mono">Phobos, Deimos</span>    
    </div>
</div>

      <button
      onClick={handleReset}
        title="Reset view"
        id="btn"
        className="font-inter absolute bottom-6 right-6 z-10 flex items-center gap-1.5 px-3.5 py-2 bg-bg-primary rounded-sm border border-white/15 text-text-primary text-xs font-medium cursor-pointer backdrop-blur-[6px] tracking-wider transition-colors duration-200 ease-in-out"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.14)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        }}
      >
        
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        Reset Globe View
      </button>
</>
      )
}

export default ResetBtn;
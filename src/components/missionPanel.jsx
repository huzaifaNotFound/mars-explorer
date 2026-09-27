import { useEffect, useRef, useState } from 'react';

export default function MissionPanel({ mission, onClose }) {
  const panelRef = useRef(null);
  const [activeMission, setActiveMission] = useState(mission);
  
  // For unmounting logic
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (mission) {
      setActiveMission(mission);
      setShouldRender(true);
      // Wait a frame before applying the visible class to trigger CSS transition
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      // Remove from DOM completely after animation finishes (500ms)
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mission]);

  useEffect(() => {
    if (!isVisible) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Focus the panel when it opens
    panel.focus();

    const handleKeyDown = (e) => {
      // Find all interactive items inside this panel
      const focusableElements = panel.querySelectorAll(
        'button, a[href], [tabindex="0"]'
      );
      const focusableArray = Array.from(focusableElements);
      
      if (focusableArray.length === 0) return;

      const activeElement = document.activeElement;
      let currentIndex = focusableArray.indexOf(activeElement);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation(); // Prevent globe from moving
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % focusableArray.length : 0;
        focusableArray[nextIndex].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + focusableArray.length) % focusableArray.length : focusableArray.length - 1;
        focusableArray[prevIndex].focus();
      }
    };

    panel.addEventListener('keydown', handleKeyDown);
    return () => {
      panel.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  if (!shouldRender || !activeMission) return null;

  return (
    <div 
      ref={panelRef}
      tabIndex={-1}
      className={`absolute top-0 right-0 h-full w-[400px] bg-bg-primary/95 backdrop-blur-md border-l border-white/10 p-8 flex flex-col z-40 overflow-y-auto text-text-primary font-inter shadow-2xl focus:outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "translate-x-0 pointer-events-auto" : "translate-x-[110%] pointer-events-none"
      }`}
    >
      <button 
        onClick={onClose} 
        tabIndex={isVisible ? 0 : -1}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 text-text-primary bg-bg-surface hover:bg-white/10 rounded-full border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.8)] z-50 hover:scale-110"
        aria-label="Close panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div className="mb-8 pl-1 mt-4">
        <h2 className="text-3xl font-space font-bold text-text-primary mb-2 tracking-tight">{activeMission.name}</h2>
        <div className="flex items-center space-x-3 text-sm text-text-muted font-medium font-mono">
          <span className="bg-bg-surface px-2 py-1 rounded border border-white/10">{activeMission.country}</span>
          <span>{activeMission.agency}</span>
        </div>
      </div>

      <div className="space-y-6 grow pl-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-surface p-4 rounded-xl border border-white/10">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1 font-mono font-semibold">Status</div>
            <div className="font-medium text-text-primary capitalize">{activeMission.status?.replace(/_/g, ' ')}</div>
          </div>

          <div className="bg-bg-surface p-4 rounded-xl border border-white/10">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1 font-mono font-semibold">Launch Date</div>
            <div className="font-medium text-text-primary">{activeMission.launchDate || activeMission.launch_date}</div>
          </div>
        </div>

        <div className="bg-bg-surface p-5 rounded-xl border border-white/10">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-3 font-mono font-semibold">Mission Overview</div>
          <p className="text-sm leading-relaxed text-text-primary/90">
            {activeMission.description}
          </p>
        </div>
        
        {activeMission.external_link && (
          <a 
            href={activeMission.external_link}
            target="_blank"
            rel="noreferrer"
            tabIndex={isVisible ? 0 : -1}
            className="flex items-center justify-center space-x-2 w-full bg-accent-primary/20 hover:bg-accent-primary/40 text-accent-primary text-sm font-semibold p-4 rounded-xl border border-accent-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-accent-amber focus:ring-offset-2 focus:ring-offset-bg-primary pointer-events-auto"
          >
            <span>View Full Documentation</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

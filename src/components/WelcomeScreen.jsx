import { useEffect } from "react";
export default function WelcomeScreen({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 ">
      <section className="w-[50vw] max-w-2xl min-w-[520px] border border-white/15 bg-bg-primary px-7 py-6 rounded-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="font-mono text-xs tracking-[0.18em] text-text-muted"> MARS / EXPLORER </span>
          <span className="font-mono text-xs text-text-muted"> ESC </span>
        </div>
        <div className="py-5">
          <h1 className="font-space text-3xl font-semibold tracking-tight text-text-primary"> Mars Explorer </h1>

          <p className="mt-1 font-mono text-xs text-accent-amber/80"> SURFACE MISSION ARCHIVE </p>
        </div>

    

        <div className="relative border border-white/15 bg-bg-surface ">
          <img src="/mars-globe.png" alt="Mars" draggable={false} className="block h-[220px] w-full object-cover" />

   

          <span className="absolute left-2 top-2 bg-bg-primary px-2 py-1 font-mono text-[10px] text-text-muted">
            MARS
          </span>

        
        </div>


        <div className="mt-5">
          <h2 className="font-mono text-sm text-accent-amber/90"> WELCOME </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-text-primary/85">
            Explore the surface of Mars through the missions that reached it. Navigate the globe, move between landing
            sites, and inspect mission information using your keyboard.
          </p>

          <p className="mt-3 max-w-xl text-sm leading-6 text-accent-red">
            This is a keyboard-only experience. Your cursor will not work here. Use the keyboard to explore.
          </p>
        </div>

    

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-mono text-[11px] tracking-wide text-text-muted"> KEYBOARD NAVIGATION ONLY </span>

          <span className="border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1.5 rounded-sm font-inter text-xs text-accent-amber">
            ESC TO BEGIN
          </span>
        </div>
      </section>
    </div>
  );
}

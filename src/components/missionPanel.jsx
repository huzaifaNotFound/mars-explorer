import { useEffect, useRef, useState } from "react";
import { Arrow, FOCUS_ON, HELP_BOX_RESERVE, PANEL_WIDTH } from "./ui";

// Keyboard-only app: nothing here is clickable. The keyboard hook drives it.
// `mission` is a globe point: { name, lat, lng, mission: <entry from surfacemissions.json> }

const NO_PHOTOS = [];
const keyOf = (point) => point?.name;

const formatDate = (s) => {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
};

function statusTone(status = "") {
  if (/active/i.test(status))
    return { pill: "border-accent-green/40 text-accent-green", dot: "bg-accent-green" };
  if (/^ended/i.test(status))
    return { pill: "border-white/15 text-text-muted", dot: "bg-text-muted" };
  return { pill: "border-accent-amber/40 text-accent-amber", dot: "bg-accent-amber" };
}

// Circular photo control: shows the same dashed outline as Reset while A/D are live.
function PhotoArrow({ dir, active }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-bg-primary/70 text-text-primary transition-all duration-200 ${
        dir === "left" ? "left-3" : "right-3"
      } ${active ? FOCUS_ON : "opacity-60"}`}
    >
      <Arrow dir={dir} />
    </span>
  );
}

const CSS = `
@media (prefers-reduced-motion: reduce) {
  .mp-root, .mp-swap { transition: none !important; }
}
`;

export default function MissionPanel({
  mission: point,
  focusZone = "view",
  pressedKeys,
  apiRef, // filled with { nextPhoto, prevPhoto } for the keyboard hook
  onPhotoCountChange,
}) {
  // `displayed` outlives `point` so content stays visible while the panel slides out.
  const [displayed, setDisplayed] = useState(null);
  const [open, setOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const displayedRef = useRef(null);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  // Open / close / switch mission (switching behaves exactly as before)
  useEffect(() => {
    let raf;
    let timer;

    if (point) {
      const current = displayedRef.current;
      if (!current) {
        setDisplayed(point);
        // two frames so the closed position paints before the slide-in starts
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => setOpen(true));
        });
      } else {
        setOpen(true);
        const changed = keyOf(current) !== keyOf(point);
        setSwapping(changed);
        if (changed) {
          // fade the old content out, swap, fade the new content in
          timer = setTimeout(() => {
            setDisplayed(point);
            setSwapping(false);
          }, 180);
        } else {
          setDisplayed(point);
        }
      }
    } else {
      setOpen(false);
      timer = setTimeout(() => {
        setDisplayed(null);
        setSwapping(false);
      }, 520);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [point]);

  const m = displayed?.mission;
  const photos = m?.photos ?? NO_PHOTOS;
  const displayedKey = keyOf(displayed);

  // New mission: back to the first photo
  useEffect(() => {
    setPhotoIndex(0);
  }, [displayedKey]);

  // Tell the help box whether A/D does anything
  useEffect(() => {
    onPhotoCountChange?.(open ? photos.length : 0);
  }, [open, photos.length, onPhotoCountChange]);

  // Let the keyboard hook drive the photo browser
  useEffect(() => {
    if (!apiRef) return;
    const count = photos.length;
    apiRef.current = {
      prevPhoto: () => setPhotoIndex((i) => (count > 1 ? (i - 1 + count) % count : i)),
      nextPhoto: () => setPhotoIndex((i) => (count > 1 ? (i + 1) % count : i)),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, photos.length]);

  if (!displayed || !m) return null;

  const canBrowse = photos.length > 1;
  const photoControlsActive = canBrowse && focusZone === "view";
  const linkActive = focusZone === "link";
  const tone = statusTone(m.status);
  const launched = formatDate(m.launch_date);
  const meta = [launched && `Launched ${launched}`, m.site].filter(Boolean).join(" · ");

  return (
    <aside
      aria-hidden={!open}
      className={`mp-root absolute inset-y-0 right-0 z-40 max-w-full border-l border-white/15 bg-bg-primary font-inter text-text-primary transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${PANEL_WIDTH} ${
        open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <style>{CSS}</style>

      {/* Full height. The bottom reserve keeps everything above the help box. */}
      <div className={`flex h-full flex-col overflow-hidden px-5 pt-5 ${HELP_BOX_RESERVE}`}>
        <div
          className={`mp-swap flex min-h-0 flex-1 flex-col gap-4 transition-all duration-200 ease-out ${
            swapping ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {/* Name */}
          <header className="shrink-0">
            <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded-sm border border-white/15 px-2 py-0.5">
                  {m.country}
                </span>
                <span className="truncate text-text-muted">{m.agency}</span>
              </span>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 ${tone.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {m.status}
              </span>
            </div>
            <h2 className="font-space text-2xl font-bold leading-tight tracking-tight">
              {m.name}
            </h2>
            {meta && <p className="mt-1.5 font-mono text-xs text-text-muted">{meta}</p>}
          </header>

          {/* Photos: only when the mission has some. Height flexes to fit the viewport. */}
          {photos.length > 0 && (
            <div className="relative max-h-56 min-h-20 flex-1 overflow-hidden rounded-sm border border-white/15 bg-bg-surface">
              {photos.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${m.name}, photo ${i + 1} of ${photos.length}`}
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
                    i === photoIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              {canBrowse && (
                <>
                  <PhotoArrow dir="left" active={photoControlsActive} />
                  <PhotoArrow dir="right" active={photoControlsActive} />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-bg-primary/70 px-2 py-0.5 font-mono text-xs text-text-muted">
                    {photoIndex + 1} / {photos.length}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Details */}
          <p className="shrink-0 text-sm leading-relaxed text-text-primary/90">{m.summary}</p>

          {/* Bullets */}
          {m.highlights?.length > 0 && (
            <ul className="shrink-0 space-y-2 border-t border-white/15 pt-4">
              {m.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 font-mono text-[13px] leading-5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent-amber" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Link: pinned to the bottom of the content area, just above the help box */}
          {m.external_link && (
            <div className="relative mt-auto shrink-0">
              <div
                className={`flex items-center justify-between gap-2 rounded-sm border border-accent-primary/30 px-4 py-2.5 font-mono text-base font-medium tracking-wider text-accent-primary transition-all duration-200 ease-in-out ${
                  linkActive ? `${FOCUS_ON} -translate-y-px bg-bg-surface` : "bg-bg-primary"
                }`}
              >
                <span>More info</span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>

              {/* L badge, same treatment as the R badge on Reset */}
              <span
                className={`absolute -right-3 -top-3 rounded bg-bg-primary transition-all duration-300 ease-in-out ${
                  linkActive ? "-translate-y-1 translate-x-1" : ""
                }`}
              >
                <span
                  className={`flex h-7 w-8 items-center justify-center rounded border border-accent-amber font-mono text-sm font-semibold leading-none transition-all duration-200 ${
                    pressedKeys?.has("l")
                      ? "scale-90 bg-accent-amber/60 text-text-primary"
                      : "bg-accent-amber/20 text-accent-amber"
                  }`}
                >
                  L
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
import { useEffect, useRef, useState } from "react";
import {
  Arrow,
  FOCUS_ON,
  FOCUS_VISIBLE,
  HELP_BOX_RESERVE,
  PANEL_WIDTH,
} from "./ui";

/* -------------------------------------------------------------------------- */
/* Photos                                                                     */
/* `images` can be an array of URLs, or a folder like "/images/viking1".       */
/* For a folder we look for 1.jpg, 2.jpg, ... until one is missing.           */
/* -------------------------------------------------------------------------- */
const PHOTO_EXT = "jpg";
const MAX_PHOTOS = 12;

function usePhotos(mission) {
  const [photos, setPhotos] = useState([]);
  const images = mission?.images;

  useEffect(() => {
    let cancelled = false;
    setPhotos([]);

    if (Array.isArray(images)) {
      setPhotos(images.filter(Boolean));
    } else if (typeof images === "string" && images.startsWith("/")) {
      const folder = images.replace(/\/$/, "");
      const found = [];
      const probe = (n) => {
        if (cancelled || n > MAX_PHOTOS) return;
        const src = `${folder}/${n}.${PHOTO_EXT}`;
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          found.push(src);
          setPhotos([...found]);
          probe(n + 1);
        };
        img.src = src; // a missing file simply ends the search
      };
      probe(1);
    }

    return () => {
      cancelled = true;
    };
  }, [images]);

  return photos;
}

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */
const keyOf = (m) => m?.id ?? m?.name;

const pretty = (s) => s?.replace(/_/g, " ").replace(/;\s*/g, " · ");

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

const formatCoords = (lat, lng) =>
  `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(2)}° ${
    lng >= 0 ? "E" : "W"
  }`;

function buildFacts(m) {
  const loc = m.surface_locations?.[0];
  const lat = m.lat ?? loc?.lat;
  const lng = m.lng ?? m.lon ?? loc?.lon;
  const region = m.region ?? loc?.region;

  const facts = [];
  const launched = formatDate(m.launchDate || m.launch_date);
  if (launched) facts.push(["Launched", launched]);
  if (m.type) facts.push(["Type", pretty(m.type)]);
  if (region) facts.push(["Site", region]);
  if (lat != null && lng != null) facts.push(["Coordinates", formatCoords(lat, lng)]);
  if (m.elevation != null)
    facts.push(["Elevation", `${Number(m.elevation).toLocaleString("en-US")} m`]);
  return facts;
}

function statusTone(status = "") {
  if (status === "active")
    return {
      pill: "border-accent-green/40 bg-accent-green/10 text-accent-green",
      dot: "bg-accent-green",
    };
  if (status.startsWith("ended"))
    return {
      pill: "border-white/15 bg-white/5 text-text-muted",
      dot: "bg-text-muted",
    };
  return {
    pill: "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
    dot: "bg-accent-amber",
  };
}

const keepFocusOnGlobe = (e) => e.preventDefault(); // mouse clicks must not steal keyboard focus

/* -------------------------------------------------------------------------- */
/* Small pieces                                                               */
/* -------------------------------------------------------------------------- */
function SectionTitle({ children }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-2 font-mono text-xs font-semibold tracking-wide text-accent-secondary">
      <span className="h-px w-4 bg-accent-secondary/60" />
      {children}
    </h3>
  );
}

function CircleButton({ dir, active, onClick, label }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onMouseDown={keepFocusOnGlobe}
      onClick={onClick}
      className={`absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-bg-primary/70 text-text-primary backdrop-blur-sm transition-all duration-200 hover:bg-bg-primary/90 ${
        dir === "left" ? "left-3" : "right-3"
      } ${FOCUS_VISIBLE} ${active ? FOCUS_ON : "opacity-70"}`}
    >
      <Arrow dir={dir} />
    </button>
  );
}

const CSS = `
@media (prefers-reduced-motion: reduce) {
  .mp-root, .mp-swap { transition: none !important; }
}
`;

const FADE_MASK =
  "linear-gradient(to bottom, black calc(100% - 20px), transparent)";

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */
export default function MissionPanel({
  mission,
  onClose,
  focusZone = "view",
  pressedKeys,
  apiRef, // filled with { nextPhoto, prevPhoto } for the keyboard hook
  onPhotoCountChange,
}) {
  // `displayed` outlives `mission` so content stays visible while the panel slides out.
  const [displayed, setDisplayed] = useState(null);
  const [open, setOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const displayedRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  // Open / close / switch mission
  useEffect(() => {
    let raf;
    let timer;

    if (mission) {
      const current = displayedRef.current;
      if (!current) {
        setDisplayed(mission);
        // two frames so the closed position paints before the transition starts
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => setOpen(true));
        });
      } else {
        setOpen(true);
        const changed = keyOf(current) !== keyOf(mission);
        setSwapping(changed);
        if (changed) {
          // fade the old content out, swap, fade the new content in
          timer = setTimeout(() => {
            setDisplayed(mission);
            setSwapping(false);
          }, 180);
        } else {
          setDisplayed(mission);
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
  }, [mission]);

  const photos = usePhotos(displayed);
  const displayedKey = keyOf(displayed);

  // New mission: first photo, scroll to top
  useEffect(() => {
    setPhotoIndex(0);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [displayedKey]);

  // Tell the help box whether A/D does anything
  useEffect(() => {
    onPhotoCountChange?.(open ? photos.length : 0);
  }, [open, photos.length, onPhotoCountChange]);

  const prevPhoto = () =>
    setPhotoIndex((i) => (photos.length > 1 ? (i - 1 + photos.length) % photos.length : i));
  const nextPhoto = () =>
    setPhotoIndex((i) => (photos.length > 1 ? (i + 1) % photos.length : i));

  // Let the keyboard hook drive the photo browser
  useEffect(() => {
    if (!apiRef) return;
    const count = photos.length;
    apiRef.current = {
      prevPhoto: () =>
        setPhotoIndex((i) => (count > 1 ? (i - 1 + count) % count : i)),
      nextPhoto: () => setPhotoIndex((i) => (count > 1 ? (i + 1) % count : i)),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, photos.length]);

  if (!displayed) return null;

  const canBrowse = photos.length > 1;
  const photoControlsActive = canBrowse && focusZone === "view";
  const linkActive = focusZone === "link";
  const facts = buildFacts(displayed);
  const tone = statusTone(displayed.status);

  return (
    <aside
      aria-hidden={!open}
      className={`mp-root absolute inset-y-0 right-0 z-40 max-w-full border-l border-white/15 bg-bg-surface/95 font-inter text-text-primary shadow-2xl backdrop-blur-md transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${PANEL_WIDTH} ${
        open
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-[110%] opacity-0"
      }`}
    >
      <style>{CSS}</style>

      {/* Soft nebula glow + faint scanlines. Decoration only. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent-primary/20 blur-3xl" />
        <div className="absolute -left-28 top-1/3 h-64 w-64 rounded-full bg-accent-secondary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-accent-primary/60" />
      </div>

      {/* Close */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close panel"
        onMouseDown={keepFocusOnGlobe}
        onClick={onClose}
        className={`absolute left-0 top-1/2 z-50 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-bg-surface text-text-primary shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all duration-200 hover:scale-110 hover:bg-white/10 ${FOCUS_VISIBLE}`}
      >
        <Arrow dir="right" />
      </button>

      {/* Full-height body. The bottom reserve keeps content above the help box. */}
      <div className={`relative flex h-full flex-col ${HELP_BOX_RESERVE}`}>
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-8 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]"
          style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
        >
          <div
            className={`mp-swap space-y-6 transition-all duration-200 ease-out ${
              swapping ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {/* Name */}
            <header>
              <h2 className="mb-3 font-space text-3xl font-bold tracking-tight">
                {displayed.mission ?? displayed.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {displayed.country && (
                  <span className="rounded border border-white/15 bg-white/5 px-2 py-1">
                    {displayed.country}
                  </span>
                )}
                {displayed.agency && (
                  <span className="text-text-muted">{displayed.agency}</span>
                )}
                {displayed.status && (
                  <span
                    className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 capitalize ${tone.pill}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {pretty(displayed.status)}
                  </span>
                )}
              </div>
            </header>

            {/* Photos */}
            <section>
              <SectionTitle>Photos</SectionTitle>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-bg-primary/50">
                {photos.length === 0 ? (
                  <div className="absolute inset-0 grid place-items-center font-mono text-xs text-text-muted">
                    No photos for this mission yet
                  </div>
                ) : (
                  photos.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${displayed.mission ?? displayed.name}, photo ${i + 1} of ${photos.length}`}
                      draggable={false}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
                        i === photoIndex ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))
                )}

                {canBrowse && (
                  <>
                    <CircleButton
                      dir="left"
                      label="Previous photo"
                      active={photoControlsActive}
                      onClick={prevPhoto}
                    />
                    <CircleButton
                      dir="right"
                      label="Next photo"
                      active={photoControlsActive}
                      onClick={nextPhoto}
                    />
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-bg-primary/70 px-2 py-0.5 font-mono text-[11px] text-text-muted backdrop-blur-sm">
                      {photoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>
            </section>

            {/* Details */}
            <section>
              <SectionTitle>Details</SectionTitle>
              <p className="text-sm leading-relaxed text-text-primary/90">
                {displayed.description}
              </p>
            </section>

            {/* Key facts */}
            {facts.length > 0 && (
              <section>
                <SectionTitle>Key facts</SectionTitle>
                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {facts.map(([label, value]) => (
                    <li key={label} className="flex items-start gap-3 py-2.5 text-sm">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent-primary" />
                      <span className="w-24 shrink-0 font-mono text-xs leading-5 text-text-muted">
                        {label}
                      </span>
                      <span className="text-text-primary">{value}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* More info */}
            {displayed.external_link && (
              <div className="relative pt-4">
                <a
                  href={displayed.external_link}
                  target="_blank"
                  rel="noreferrer noopener"
                  tabIndex={-1}
                  onMouseDown={keepFocusOnGlobe}
                  className={`flex items-center justify-between rounded-lg border border-accent-primary/30 bg-accent-primary/15 px-4 py-3.5 text-sm font-semibold text-accent-primary transition-all duration-200 hover:bg-accent-primary/25 ${FOCUS_VISIBLE} ${
                    linkActive ? FOCUS_ON : ""
                  }`}
                >
                  <span className="flex flex-col gap-0.5">
                    <span>More info</span>
                    <span className="text-xs font-normal text-text-muted">
                      Full mission documentation
                    </span>
                  </span>
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
                </a>
                {/* L badge, same treatment as the R badge on Reset */}
                <span
                  className={`pointer-events-none absolute right-1 top-0 flex h-7 w-8 items-center justify-center rounded border border-accent-amber font-mono text-sm font-semibold leading-none transition-all duration-300 ease-in-out ${
                    pressedKeys?.has("l")
                      ? "scale-90 bg-accent-amber/60 text-text-primary"
                      : "bg-accent-amber/20 text-accent-amber"
                  } ${linkActive ? "-translate-y-1 translate-x-1" : ""}`}
                >
                  L
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}


export const FOCUS_ON =
  "outline-2 outline-dashed outline-text-primary outline-offset-2";

const TONES = {
  secondary: {
    idle: "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30",
    down: "bg-accent-secondary/60 text-text-primary border-accent-secondary",
  },
  primary: {
    idle: "bg-accent-primary/20 text-accent-primary border-accent-primary/30",
    down: "bg-accent-primary/60 text-text-primary border-accent-primary",
  },
  green: {
    idle: "bg-accent-green/20 text-accent-green border-accent-green/30",
    down: "bg-accent-green/60 text-text-primary border-accent-green",
  },
  amber: {
    idle: "bg-accent-amber/20 text-accent-amber border-accent-amber/40",
    down: "bg-accent-amber/60 text-text-primary border-accent-amber",
  },
  red: {
    idle: "bg-accent-red/20 text-accent-red border-accent-red/40",
    down: "bg-accent-red/60 text-text-red border-accent-red",
  }
};

export function Keycap({ tone = "secondary", pressed = false, icon = false, className = "", children }) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex select-none items-center rounded border py-0.5 transition-all duration-200 ease-out ${
        icon ? "px-1.5" : "px-2"
      } ${
        pressed
          ? `${t.down} scale-90 shadow-[0_0_10px_rgba(255,255,255,0.25)]`
          : t.idle
      } ${className}`}
    >
      {children}
    </span>
  );
}

const ARROWS = {
  up: ["M12 19V5", "M6 11l6-6 6 6"],
  left: ["M19 12H5", "M11 6l-6 6 6 6"],
  down: ["M12 5v14", "M18 13l-6 6-6-6"],
  right: ["M5 12h14", "M13 6l6 6-6 6"],
};

export function Arrow({ dir, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ARROWS[dir].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
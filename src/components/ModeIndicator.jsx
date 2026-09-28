import { Arrow, Keycap, HELP_BOX_HEIGHT, PANEL_WIDTH } from "./ui";

const ARROW_KEY = {
  up: "ArrowUp",
  left: "ArrowLeft",
  down: "ArrowDown",
  right: "ArrowRight",
};

const CSS = `
@keyframes helpFade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.help-fade { animation: helpFade 250ms ease-out; }
@media (prefers-reduced-motion: reduce) { .help-fade { animation: none; } }
`;

function Hint({ label, children }) {
  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      {children}
      <span className="ml-1.5 text-text-muted">{label}</span>
    </div>
  );
}

/**
 * Always bottom-right, always the same size. Only the hints inside change.
 * mode:       "globe" | "navigate" | "panel"
 * focusZone:  "view" | "link" | "reset"
 */
export default function ModeIndicator({
  mode,
  focusZone = "view",
  pressedKeys,
  hasLink = false,
  photoCount = 0,
}) {
  const down = (k) => !!pressedKeys?.has(k);
  const context = focusZone === "view" ? mode : focusZone;

  const arrow = (dir) => (
    <Keycap key={dir} tone="secondary" pressed={down(ARROW_KEY[dir])}>
      <Arrow dir={dir} />
    </Keycap>
  );

  return (
    <div
      className={`pointer-events-none absolute bottom-0 right-0 z-50 max-w-full select-none border border-white/10 bg-bg-surface font-mono text-[13px] text-text-primary ${PANEL_WIDTH} ${HELP_BOX_HEIGHT}`}
    >
      <style>{CSS}</style>

      <div
        key={context}
        className="help-fade flex h-full items-center justify-center gap-5 px-4"
      >
        {context === "globe" && (
          <>
            <div className="relative flex items-center gap-1">
              <div className="absolute bottom-[calc(100%+20px)] left-1/2 -translate-x-1/2 rounded-t-sm border border-b-0 border-white/10 bg-bg-surface px-2 pb-1 pt-2">
                {arrow("up")}
              </div>
              {arrow("left")}
              {arrow("down")}
              {arrow("right")}
            </div>
            <span className="whitespace-nowrap text-text-muted">Rotate globe</span>
            <Hint label="Browse missions">
              <Keycap tone="green" pressed={down("Escape")}>Esc</Keycap>
            </Hint>
          </>
        )}

        {context === "navigate" && (
          <>
            <Hint label="Browse">
              {arrow("left")}
              {arrow("right")}
            </Hint>
            <Hint label="Open mission">
              <Keycap tone="primary" pressed={down("Enter")}>Enter</Keycap>
            </Hint>
            <Hint label="Globe view">
              <Keycap tone="green" pressed={down("Escape")}>Esc</Keycap>
            </Hint>
          </>
        )}

        {context === "panel" && (
          <>
            <Hint label="Missions">
              {arrow("left")}
              {arrow("right")}
            </Hint>
            {photoCount > 1 && (
              <Hint label="Photos">
                <Keycap tone="secondary" pressed={down("a")}>A</Keycap>
                <Keycap tone="secondary" pressed={down("d")}>D</Keycap>
              </Hint>
            )}
            {hasLink && (
              <Hint label="More info">
                <Keycap tone="amber" pressed={down("l")}>L</Keycap>
              </Hint>
            )}
            <Hint label="Close">
              <Keycap tone="green" pressed={down("Escape")}>Esc</Keycap>
            </Hint>
          </>
        )}

        {context === "link" && (
          <>
            <Hint label="Back">
              <Keycap tone="amber" pressed={down("l")}>L</Keycap>
            </Hint>
            <Hint label="Open link">
              <Keycap tone="primary" pressed={down("Enter")}>Enter</Keycap>
            </Hint>
          </>
        )}

        {context === "reset" && (
          <>
            <Hint label="Back">
              <Keycap tone="amber" pressed={down("r")}>R</Keycap>
            </Hint>
            <Hint label="Reset globe">
              <Keycap tone="primary" pressed={down("Enter")}>Enter</Keycap>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}
import { Arrow, Keycap, HELP_BOX_HEIGHT, HELP_BOX_WIDTH } from "./ui";

const ARROW_KEY = {
  up: "ArrowUp",
  left: "ArrowLeft",
  down: "ArrowDown",
  right: "ArrowRight",
};

const CSS = `
@keyframes modeIndicatorFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

// keys + label, same layout as the original help box
function Hint({ label, children }) {
  return (
    <div className="flex items-center space-x-1 whitespace-nowrap">
      {children}
      <span className="text-text-muted ml-2">{label}</span>
    </div>
  );
}

/**
 * Original help-box look, fixed size, always bottom-right.
 * Only the hints inside change.
 *   mode:       "globe" | "navigate" | "panel"
 *   focusZone:  "view" | "link" | "reset"
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
    <Keycap key={dir} icon tone="secondary" pressed={down(ARROW_KEY[dir])}>
      <Arrow dir={dir} className="w-5 h-5" />
    </Keycap>
  );

  return (
    <div
      className={`absolute bottom-0 right-0 z-50 flex items-center justify-center bg-bg-surface rounded-tl-sm font-mono text-base text-text-primary border border-white/10 pointer-events-none ${HELP_BOX_WIDTH} ${HELP_BOX_HEIGHT}`}
    >
      <style>{CSS}</style>

      <div
        key={context}
        className="flex items-center space-x-4"
        style={{ animation: "modeIndicatorFadeIn 300ms ease-out" }}
      >
        {context === "globe" && (
          <>
            <div className="relative flex items-center gap-1">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-bg-surface border border-white/10 border-b-0 rounded-t-sm px-2 pt-2 mb-2">
                {arrow("up")}
              </div>
              {arrow("left")}
              {arrow("down")}
              {arrow("right")}
            </div>
            <span className="text-text-muted whitespace-nowrap">Rotate the Globe</span>
            <Hint label="Navigate missions">
              <Keycap tone="green" pressed={down("Escape")}>Esc</Keycap>
            </Hint>
          </>
        )}

        {context === "navigate" && (
          <>
            <Hint label="Move">
              {arrow("left")}
              {arrow("right")}
            </Hint>
            <Hint label="Select">
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
              <Hint label="Link">
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
            <Hint label="Open">
              <Keycap tone="primary" pressed={down("Enter")}>Enter</Keycap>
            </Hint>
          </>
        )}

        {context === "reset" && (
          <>
            <Hint label="Back">
              <Keycap tone="amber" pressed={down("r")}>R</Keycap>
            </Hint>
            <Hint label="Reset">
              <Keycap tone="primary" pressed={down("Enter")}>Enter</Keycap>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}
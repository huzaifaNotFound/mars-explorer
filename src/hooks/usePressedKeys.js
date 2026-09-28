import { useEffect, useRef, useState } from "react";

// Very quick taps would flash too briefly to see, so a key stays
// highlighted for at least this long after it was pressed.
const MIN_VISIBLE_MS = 120;

// Returns a Set of currently held keys. Letters are lowercase ("a", "d", "l", "r")
// everything else uses e.key ("ArrowLeft", "Enter", "Escape").
export default function usePressedKeys() {
  const [pressed, setPressed] = useState(() => new Set());
  const downAt = useRef(new Map());
  const timers = useRef(new Map());
  useEffect(() => {
    const norm = (key) => (key.length === 1 ? key.toLowerCase() : key);

    const add = (k) =>
      setPressed((prev) => (prev.has(k) ? prev : new Set(prev).add(k)));

    const remove = (k) =>
      setPressed((prev) => {
        if (!prev.has(k)) return prev;
        const next = new Set(prev);
        next.delete(k);
        return next;
      });

    const onDown = (e) => {
      const k = norm(e.key);
      clearTimeout(timers.current.get(k));
      timers.current.delete(k);
      if (!downAt.current.has(k)) downAt.current.set(k, performance.now());
      add(k);
    };

    const onUp = (e) => {
      const k = norm(e.key);
      const held = performance.now() - (downAt.current.get(k) ?? 0);
      downAt.current.delete(k);
      clearTimeout(timers.current.get(k));
      timers.current.set(
        k,
        setTimeout(() => {
          timers.current.delete(k);
          remove(k);
        }, Math.max(0, MIN_VISIBLE_MS - held))
      );
    };

    const clearAll = () => {
      timers.current.forEach(clearTimeout)
      timers.current.clear();
      downAt.current.clear();
      setPressed(new Set());
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clearAll);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clearAll);
      clearAll();
    };
  }, []);

  return pressed;
}
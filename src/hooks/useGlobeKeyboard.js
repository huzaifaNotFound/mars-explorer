import { useCallback, useEffect, useRef, useState } from "react";
import usePressedKeys from "./usePressedKeys";

const SPEED = 0.6;
const DISCRETE = new Set(["r", "l", "a", "d", "e", "Escape", "Enter"]);
const ACTION_COOLDOWN_MS = 350;

export default function useGlobeKeyboard({
  globeRef,
  globeContainerRef,
  resetButtonRef,
  mode,
  setMode,
  focusedIndex,
  setFocusedIndex,
  selectedMission,
  setSelectedMission,
  marsPointsBase,
  panelApiRef,
  enabled = true,
}) {
  const pressedKeys = usePressedKeys();
  const [focusZone, setFocusZone] = useState("view");

  const keysPressed = useRef(new Set());
  const rafId = useRef(null);
  const lastActionAt = useRef(0);

  const zoneRef = useRef("view");
  const previousZoneRef = useRef("view");
  const panelOriginRef = useRef("navigate");

  const modeRef = useRef(mode);
  const focusedIndexRef = useRef(focusedIndex);
  const marsPointsBaseRef = useRef(marsPointsBase);
  const selectedMissionRef = useRef(selectedMission);

  useEffect(() => {
    modeRef.current = mode;
    focusedIndexRef.current = focusedIndex;
    marsPointsBaseRef.current = marsPointsBase;
    selectedMissionRef.current = selectedMission;
  }, [mode, focusedIndex, marsPointsBase, selectedMission]);

  const setZone = useCallback((z) => {
    zoneRef.current = z;
    setFocusZone(z);
  }, []);

  const applyMode = useCallback(
    (m) => {
      modeRef.current = m;
      setMode(m);
    },
    [setMode]
  );

  const focusGlobe = useCallback(
    () => globeContainerRef.current?.focus(),
    [globeContainerRef]
  );

  const openMission = useCallback(
    (target) => {
      const points = marsPointsBaseRef.current;

      const index =
        typeof target === "number"
          ? target
          : points.findIndex((p) => p.name === target?.name);

      const point = points[index];

      if (!point) return;

      if (modeRef.current !== "panel") {
        panelOriginRef.current = modeRef.current;
      }

      focusedIndexRef.current = index;
      setFocusedIndex(index);

      selectedMissionRef.current = point;
      setSelectedMission(point);

      applyMode("panel");
      setZone("view");
      focusGlobe();
    },
    [
      applyMode,
      focusGlobe,
      setFocusedIndex,
      setSelectedMission,
      setZone,
    ]
  );

  const closePanel = useCallback(() => {
    selectedMissionRef.current = null;
    setSelectedMission(null);

    applyMode(panelOriginRef.current);
    setZone("view");
    focusGlobe();
  }, [applyMode, focusGlobe, setSelectedMission, setZone]);

  const exitToGlobe = useCallback(() => {
    selectedMissionRef.current = null;
    setSelectedMission(null);

    applyMode("globe");
    setZone("view");
    focusGlobe();
  }, [applyMode, focusGlobe, setSelectedMission, setZone]);

  const toggleReset = useCallback(() => {
    if (zoneRef.current === "reset") {
      setZone(previousZoneRef.current);
      focusGlobe();
    } else {
      previousZoneRef.current = zoneRef.current;
      resetButtonRef.current?.focus();
    }
  }, [focusGlobe, resetButtonRef, setZone]);

  const toggleLink = useCallback(() => {
    if (modeRef.current !== "panel") return;
    if (!selectedMissionRef.current?.mission?.external_link) return;

    setZone(zoneRef.current === "link" ? "view" : "link");
  }, [setZone]);

  const toggleZoom = useCallback(() => {
    if (modeRef.current !== "panel") return;

    if (zoneRef.current === "zoom") {
      setZone("view");
      return;
    }

    if (!panelApiRef?.current?.photoCount) return;

    setZone("zoom");
  }, [panelApiRef, setZone]);

  useEffect(() => {
    const btn = resetButtonRef?.current;

    if (!btn) return;

    const onFocus = () => {
      if (zoneRef.current === "reset") return;

      previousZoneRef.current = zoneRef.current;
      setZone("reset");
    };

    const onBlur = () => {
      if (zoneRef.current === "reset") {
        setZone(previousZoneRef.current);
      }
    };

    btn.addEventListener("focus", onFocus);
    btn.addEventListener("blur", onBlur);

    return () => {
      btn.removeEventListener("focus", onFocus);
      btn.removeEventListener("blur", onBlur);
    };
  }, [resetButtonRef, setZone]);

  useEffect(() => {
    const tick = () => {
      if (
        !enabled ||
        !globeRef.current ||
        keysPressed.current.size === 0 ||
        modeRef.current !== "globe" ||
        zoneRef.current !== "view"
      ) {
        rafId.current = null;
        return;
      }

      const pov = globeRef.current.pointOfView();

      let { lat, lng } = pov;

      if (keysPressed.current.has("ArrowUp")) {
        lat = Math.min(lat + SPEED, 90);
      }

      if (keysPressed.current.has("ArrowDown")) {
        lat = Math.max(lat - SPEED, -90);
      }

      if (keysPressed.current.has("ArrowLeft")) {
        lng -= SPEED;
      }

      if (keysPressed.current.has("ArrowRight")) {
        lng += SPEED;
      }

      globeRef.current.pointOfView({ lat, lng }, 0);

      rafId.current = requestAnimationFrame(tick);
    };

    const stepMission = (dir) => {
      const points = marsPointsBaseRef.current;

      if (!points.length) return;

      const next =
        (focusedIndexRef.current + dir + points.length) %
        points.length;

      focusedIndexRef.current = next;
      setFocusedIndex(next);

      if (modeRef.current === "panel") {
        selectedMissionRef.current = points[next];
        setSelectedMission(points[next]);
      }
    };

    const onKeyDown = (e) => {
      // Do absolutely nothing while the welcome screen is open.
      if (!enabled) return;

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const tag = document.activeElement?.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key =
        e.key.length === 1
          ? e.key.toLowerCase()
          : e.key;

      const isArrow = key.startsWith("Arrow");

      const mode = modeRef.current;
      const zone = zoneRef.current;

      const discrete =
        DISCRETE.has(key) ||
        (mode !== "globe" &&
          (key === "ArrowLeft" || key === "ArrowRight"));

      if (discrete && e.repeat) {
        if (isArrow) e.preventDefault();
        return;
      }

      if (discrete) {
        const now = performance.now();

        if (
          now - lastActionAt.current <
          ACTION_COOLDOWN_MS
        ) {
          e.preventDefault();
          return;
        }

        lastActionAt.current = now;
      }

      if (key === "r") {
        e.preventDefault();

        if (zone !== "zoom") {
          toggleReset();
        }

        return;
      }

      if (zone === "reset") {
        if (key === "Escape") {
          e.preventDefault();
          toggleReset();
        }

        return;
      }

      if (key === "Escape") {
        e.preventDefault();

        if (zone === "zoom") {
          setZone("view");
          return;
        }

        if (mode === "panel") {
          closePanel();
          return;
        }

        const pov = globeRef.current?.pointOfView();

        if (mode === "navigate") {
          if (pov) {
            globeRef.current.pointOfView(
              {
                lat: pov.lat,
                lng: pov.lng,
                altitude: 2.5,
              },
              800
            );
          }

          applyMode("globe");
          focusGlobe();

          return;
        }

        const points = marsPointsBaseRef.current;

        if (pov && points.length > 0) {
          let minIndex = 0;
          let minDistance = Infinity;

          points.forEach((point, index) => {
            const x =
              (point.lng - pov.lng) *
              Math.cos(
                ((pov.lat + point.lat) / 2) *
                  (Math.PI / 180)
              );

            const y = point.lat - pov.lat;

            const distanceSq = x * x + y * y;

            if (distanceSq < minDistance) {
              minDistance = distanceSq;
              minIndex = index;
            }
          });

          focusedIndexRef.current = minIndex;
          setFocusedIndex(minIndex);
        }

        applyMode("navigate");
        focusGlobe();

        return;
      }

      if (
        document.activeElement !==
        globeContainerRef.current
      ) {
        return;
      }

      if (mode === "panel") {
        if (key === "e") {
          e.preventDefault();
          toggleZoom();
          return;
        }

        if (zone === "zoom") {
          if (key === "ArrowRight") {
            e.preventDefault();
            panelApiRef?.current?.nextPhoto?.();
          } else if (key === "ArrowLeft") {
            e.preventDefault();
            panelApiRef?.current?.prevPhoto?.();
          }

          return;
        }

        if (key === "l") {
          e.preventDefault();
          toggleLink();
          return;
        }

        if (zone === "link") {
          if (key === "Enter") {
            e.preventDefault();

            const url =
              selectedMissionRef.current?.mission
                ?.external_link;

            if (url) {
              window.open(
                url,
                "_blank",
                "noopener,noreferrer"
              );
            }
          }

          return;
        }

        if (key === "ArrowRight") {
          e.preventDefault();
          stepMission(1);
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          stepMission(-1);
        } else if (key === "a") {
          panelApiRef?.current?.prevPhoto?.();
        } else if (key === "d") {
          panelApiRef?.current?.nextPhoto?.();
        }

        return;
      }

      if (mode === "navigate") {
        if (key === "ArrowRight") {
          e.preventDefault();
          stepMission(1);
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          stepMission(-1);
        } else if (key === "Enter") {
          e.preventDefault();
          openMission(focusedIndexRef.current);
        }

        return;
      }

      if (isArrow) {
        e.preventDefault();

        keysPressed.current.add(key);

        if (!rafId.current) {
          rafId.current = requestAnimationFrame(tick);
        }
      }
    };

    const onKeyUp = (e) => {
      keysPressed.current.delete(e.key);
    };

    const onBlur = () => {
      keysPressed.current.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      keysPressed.current.clear();
    };
  }, [
    globeRef,
    globeContainerRef,
    panelApiRef,
    applyMode,
    closePanel,
    focusGlobe,
    openMission,
    setFocusedIndex,
    setSelectedMission,
    toggleLink,
    toggleReset,
    toggleZoom,
    setZone,
    enabled,
  ]);

  return {
    pressedKeys,
    focusZone,
    openMission,
    closePanel,
    exitToGlobe,
  };
}
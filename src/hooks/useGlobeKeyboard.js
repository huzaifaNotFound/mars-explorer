import { useEffect, useRef } from "react";

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
}) {
  const keysPressed = useRef(new Set());
  const rafId = useRef(null);

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

  useEffect(() => {
    const SPEED = 0.6;

    const tick = () => {
      if (
        !globeRef.current ||
        keysPressed.current.size === 0 ||
        modeRef.current === "navigate"
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

    const onKeyDown = (e) => {
      const isDiscreteKey =
        e.key === "r" ||
        e.key === "R" ||
        e.key === "Escape" ||
        e.key === "Enter" ||
        (modeRef.current === "navigate" &&
          ["ArrowLeft", "ArrowRight"].includes(e.key));

      // Prevent browser key-repeat
      if (isDiscreteKey && e.repeat) {
        return;
      }

      if (e.key === "r" || e.key === "R") {
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();

          if (document.activeElement === resetButtonRef?.current) {
            // Reset button focused -> return focus to globe
            globeContainerRef.current?.focus();
          } else {
            // Otherwise focus reset button
            resetButtonRef.current?.focus();
          }

          return;
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();

        if (selectedMissionRef.current) {
          setSelectedMission(null);
          globeContainerRef.current?.focus();
          return;
        }
        if (modeRef.current === "navigate") {
          const pov = globeRef.current?.pointOfView();

          if (pov) {
            globeRef.current?.pointOfView(
              {
                lat: pov.lat,
                lng: pov.lng,
                altitude: 2.5,
              },
              800
            );
          }

          setMode("globe");
          globeContainerRef.current?.focus();

          return;
        }

        const pov = globeRef.current?.pointOfView();

        if (pov && marsPointsBaseRef.current.length > 0) {
          let minIndex = 0;
          let minDistance = Infinity;

          marsPointsBaseRef.current.forEach((point, index) => {
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

          setFocusedIndex(minIndex);
        }

        setMode("navigate");
        globeContainerRef.current?.focus();

        return;
      }
      if (document.activeElement !== globeContainerRef.current) {
        return;
      }
      if (modeRef.current === "navigate") {
        if (e.key === "ArrowRight") {
          e.preventDefault();

          setFocusedIndex(
            (prev) =>
              (prev + 1) %
              marsPointsBaseRef.current.length
          );
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();

          setFocusedIndex(
            (prev) =>
              (prev -
                1 +
                marsPointsBaseRef.current.length) %
              marsPointsBaseRef.current.length
          );
        } else if (e.key === "Enter") {
          e.preventDefault();

          setSelectedMission(
            marsPointsBaseRef.current[
              focusedIndexRef.current
            ]
          );
        }

        return;
      }

      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.key)
      ) {
        e.preventDefault();

        keysPressed.current.add(e.key);

        if (!rafId.current) {
          rafId.current = requestAnimationFrame(tick);
        }
      }
    };

    const onKeyUp = (e) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      keysPressed.current.clear();
    };
  }, [
    globeRef,
    globeContainerRef,
    resetButtonRef,
    setMode,
    setSelectedMission,
    setFocusedIndex,
  ]);
}
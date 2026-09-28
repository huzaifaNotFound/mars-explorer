import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import surfaceMissions from "../assets/surfacemissions.json";
import ResetBtn from "./ResetBtn";
import MissionPanel from "./missionPanel";
import ModeIndicator from "./ModeIndicator";
import useGlobeKeyboard from "../hooks/useGlobeKeyboard";

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0.0, "rgba(255,255,255,65)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const GLOW_SCALE = 0.05;
const MARKER_ALTITUDE = 0.02;

export default function MarsGlobe() {
  const globeRef = useRef();
  const glowTextureRef = useRef();
  const resetButtonRef = useRef();
  const globeContainerRef = useRef();
  const panelApiRef = useRef(null); // MissionPanel exposes next/prev photo here

  const [mode, setMode] = useState("globe"); // "globe" | "navigate" | "panel"
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedMission, setSelectedMission] = useState(null);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    globeContainerRef.current?.focus();
  }, []);

  useEffect(() => {
    glowTextureRef.current = createGlowTexture();
    return () => glowTextureRef.current?.dispose();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!globeRef.current) return;

      if (typeof globeRef.current.globeMaterial === "function") {
        const globeMaterial = globeRef.current.globeMaterial();
        globeMaterial.roughness = 1.0;
        globeMaterial.metalness = 0.0;

        const loader = new THREE.TextureLoader();
        loader.load("/textures/mars-texture.png", (bumpTex) => {
          globeMaterial.bumpMap = bumpTex;
          globeMaterial.bumpScale = 0.8;
          globeMaterial.needsUpdate = true;
        });
      }

      if (typeof globeRef.current.scene === "function") {
        const scene = globeRef.current.scene();
        const ambientLight = scene.children.find((c) => c.type === "AmbientLight");
        if (ambientLight) ambientLight.intensity = 0.3;

        const dirLight = scene.children.find((c) => c.type === "DirectionalLight");
        if (dirLight) {
          dirLight.intensity = 2.5;
          dirLight.position.set(1.5, 0.5, 1);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const marsPointsBase = useMemo(() => {
    return surfaceMissions.flatMap((mission) =>
      mission.surface_locations.map((location) => ({
        lat: location.lat,
        lng: location.lon,
        name: location.name,
        mission: mission.name,
        missionId: mission.id,
        kind: location.kind,
        accuracy: location.accuracy,
        country: mission.country,
        launchDate: mission.launch_date,
        agency: mission.agency,
        description: mission.description,
        status: mission.status,
        external_link: mission.external_link,
        // new: used by the redesigned panel
        images: mission.images,
        type: mission.type,
        elevation: mission.elevation,
        region: location.region,
      })),
    );
  }, []);

  const marsPoints = useMemo(() => {
    return marsPointsBase.map((point, index) => ({
      ...point,
      // keep the current mission highlighted while its panel is open too
      isFocused: (mode === "navigate" || mode === "panel") && index === focusedIndex,
    }));
  }, [marsPointsBase, mode, focusedIndex]);

  // Fly to the focused mission when browsing, and when switching missions in the panel
  useEffect(() => {
    if ((mode === "navigate" || mode === "panel") && globeRef.current && marsPointsBase.length > 0) {
      const point = marsPointsBase[focusedIndex];
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 500);
    }
  }, [focusedIndex, mode, marsPointsBase]);

  const makeGlowObject = useCallback(() => {
    const radius = globeRef.current?.getGlobeRadius?.() ?? 100;
    const size = radius * GLOW_SCALE;

    const material = new THREE.SpriteMaterial({
      map: glowTextureRef.current,
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, 1);
    return sprite;
  }, []);

  const { pressedKeys, focusZone, openMission, closePanel, exitToGlobe } = useGlobeKeyboard({
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
  });

  return (
    <div
      className="relative w-full h-full outline-none pointer-events-auto"
      tabIndex={-1}
      ref={globeContainerRef}
    >
      <Globe
        ref={globeRef}
        globeImageUrl="/textures/mars-color.png"
        bumpImageUrl="/textures/mars-texture.png"
        backgroundColor="#05070a"
        backgroundImageUrl="/starsbg1.jpg"
        animateIn={true}
        enablePointerInteraction={true}
        showAtmosphere={true}
        atmosphereColor="#cb7b52"
        atmosphereAltitude={0.12}
        objectsData={marsPoints}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={MARKER_ALTITUDE}
        objectFacesSurface={false}
        objectThreeObject={makeGlowObject}
        onObjectClick={(point) => openMission(point)}
        htmlElementsData={marsPoints}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.01}
        htmlElement={(d) => {
          const outer = document.createElement("div");
          outer.style.pointerEvents = "none";

          const wrapper = document.createElement("div");
          wrapper.style.display = "flex";
          wrapper.style.alignItems = "center";
          wrapper.style.whiteSpace = "nowrap";
          wrapper.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

          if (d.isFocused) {
            wrapper.style.transform = "translateY(20px) scale(1.4)";
            wrapper.style.zIndex = "10";
          } else {
            wrapper.style.transform = "translateY(20px) scale(1)";
            wrapper.style.zIndex = "1";
          }

          const label = document.createElement("span");
          label.textContent = d.name;
          label.style.color = d.isFocused ? "#D8B766" : "#ECEAE6";
          label.style.fontSize = "12px";
          label.style.fontFamily = "'JetBrains Mono', system-ui, sans-serif";
          label.style.fontWeight = d.isFocused ? "700" : "500";
          label.style.textShadow = d.isFocused ? "0 0 12px rgba(242,184,75,0.8)" : "0 0 4px rgba(0,0,0,0.8)";
          label.style.outline = d.isFocused ? "2px dashed #ECEAE6" : "none";
          label.style.outlineOffset = d.isFocused ? "4px" : "none";
          label.style.padding = d.isFocused ? "2px" : "none";

          wrapper.appendChild(label);
          outer.appendChild(wrapper);
          return outer;
        }}
        htmlElementVisibilityModifier={(el, isVisible) => {
          el.style.opacity = isVisible ? "1" : "0";
          el.style.pointerEvents = isVisible ? "auto" : "none";
        }}
      />

      <ResetBtn
        globeRef={globeRef}
        resetButtonRef={resetButtonRef}
        globeContainerRef={globeContainerRef}
        onReset={exitToGlobe}
        pressedKeys={pressedKeys}
      />

      <MissionPanel
        mission={selectedMission}
        onClose={closePanel}
        focusZone={focusZone}
        pressedKeys={pressedKeys}
        apiRef={panelApiRef}
        onPhotoCountChange={setPhotoCount}
      />

      <ModeIndicator
        mode={mode}
        focusZone={focusZone}
        pressedKeys={pressedKeys}
        hasLink={!!selectedMission?.external_link}
        photoCount={photoCount}
      />
    </div>
  );
}
import { useRef, useEffect, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import surfaceMissions from "../assets/surfacemissions.json";
import {modeChange} from "../keyboardSystem"
import ResetBtn from "./ResetBtn";


function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0.0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.95)");
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

  const marsPoints = useMemo(() => {
  const points = surfaceMissions.flatMap((mission) =>
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
    }))
  );

  return points;
}, []);

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

  //Arrow keyss
  const keysPressed = useRef(new Set());
  const rafId = useRef(null);

  useEffect(() => {
    const SPEED = 0.6; 

    const tick = () => {
      if (!globeRef.current || keysPressed.current.size === 0) {
        rafId.current = null;
        return;
      }

      const pov = globeRef.current.pointOfView();
      let { lat, lng } = pov;

      if (keysPressed.current.has("ArrowUp"))    lat = Math.min(lat + SPEED, 90);
      if (keysPressed.current.has("ArrowDown"))  lat = Math.max(lat - SPEED, -90);
      if (keysPressed.current.has("ArrowLeft"))   lng -= SPEED;
      if (keysPressed.current.has("ArrowRight"))  lng += SPEED;

      globeRef.current.pointOfView({ lat, lng }, 0);
      rafId.current = requestAnimationFrame(tick);
    };

    const onKeyDown = (e) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      keysPressed.current.add(e.key);
      if (!rafId.current) rafId.current = requestAnimationFrame(tick);
    };

    const onKeyUp = (e) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  

  return (
    <div className="relative w-full h-full">
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
        htmlElementsData={marsPoints}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.01}
        htmlElement={(d) => {
          const wrapper = document.createElement("div");
          wrapper.style.pointerEvents = "none";
          wrapper.style.display = "flex";
          wrapper.style.alignItems = "center";
          wrapper.style.gap = "4px";
          wrapper.style.whiteSpace = "nowrap";
          wrapper.style.transition = "opacity 0.3s ease";

          // dot
          const dot = document.createElement("span");
          dot.style.width = "5px";
          dot.style.height = "5px";
          dot.style.borderRadius = "50%";
          dot.style.backgroundColor = "#ECEAE6";
          dot.style.flexShrink = "0";
          wrapper.appendChild(dot);

          // label
          const label = document.createElement("span");
          label.textContent = d.name;
          label.style.color = "#ECEAE6";
          label.style.fontSize = "11px";
          label.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
          label.style.fontWeight = "500";
          label.style.textShadow = "0 0 4px rgba(0,0,0,0.8)";
          wrapper.appendChild(label);

          return wrapper;
        }}
        htmlElementVisibilityModifier={(el, isVisible) => {
          el.style.opacity = isVisible ? "1" : "0";
          el.style.pointerEvents = isVisible ? "auto" : "none";
        }}
      />

      <ResetBtn globeRef={globeRef}/>
    </div>
  );
}
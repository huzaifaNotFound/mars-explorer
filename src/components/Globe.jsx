import { useRef, useEffect } from "react";
import Globe from "react-globe.gl";
import surfaceMissions from "../assets/surfacemissions.json";
import * as THREE from "three";

export default function MarsGlobe() {
  const globeRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!globeRef.current) return;

      if (typeof globeRef.current.globeMaterial === "function") {
        const globeMaterial = globeRef.current.globeMaterial();
        globeMaterial.roughness = 0.9;
        globeMaterial.metalness = 0.0;
      }

      if (typeof globeRef.current.scene === "function") {
        const scene = globeRef.current.scene();
        const ambientLight = scene.children.find((c) => c.type === "AmbientLight");
        if (ambientLight) {
          ambientLight.intensity = 0.3;
        }

        const dirLight = scene.children.find((c) => c.type === "DirectionalLight");
        if (dirLight) {
          dirLight.intensity = 2.5;
          dirLight.position.set(1.5, 0.5, 1);
        }
      }
    }, 100);

    return () => clearTimeout(timer); 
  }, []);

  const marsPoints = surfaceMissions.flatMap((mission) =>
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
    })),
  );

  return (
    <div className="w-full h-full">   
<Globe
  ref={globeRef}
  globeImageUrl="/textures/mars-color.png"
  bumpImageUrl="/textures/mars-color.png"
  bumpScale={0.8}
  backgroundColor="#05070a"
  backgroundImageUrl="/starsbg1.jpg"
  animateIn={true}
  enablePointerInteraction={true}
  showAtmosphere={true}   
  atmosphereColor="#cb7b52"
  atmosphereAltitude={0.12}

  pointsData={marsPoints}
  pointLat="lat"
  pointLng="lng"
  pointAltitude={0}
  pointRadius={0.5}
  pointColor={() => "white"}

  labelsData={marsPoints}
  labelLat="lat"
  labelLng="lng"
  labelText="name"
  labelSize={1.3}
  labelDotRadius={0}
  labelColor={() => "rgba(255,255,255,0.9)"}
  labelAltitude={0}
  labelResolution={2}
/>
    </div>
  );
}

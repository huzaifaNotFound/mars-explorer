import { useRef, useEffect } from "react";
import Globe from "react-globe.gl";
import surfaceMissions from "../assets/surfacemissions.json"

export default function MarsGlobe() {
  const globeRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!globeRef.current) return;
      
      if (typeof globeRef.current.globeMaterial === 'function') {
        const globeMaterial = globeRef.current.globeMaterial();
        globeMaterial.roughness = 10;
        globeMaterial.metalness = 0.1;
      }

      if (typeof globeRef.current.scene === 'function') {
        const scene = globeRef.current.scene();
        const ambientLight = scene.children.find(c => c.type === 'AmbientLight');
        if (ambientLight) {
          ambientLight.intensity = 0.3;
        }

        const dirLight = scene.children.find(c => c.type === 'DirectionalLight');
        if (dirLight) {
          dirLight.intensity = 2.5; 
          dirLight.position.set(1.5, 0.5, 1); 
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const marsPoints = surfaceMissions.flatMap(mission =>
  mission.surface_locations.map(location => ({
    lat: location.lat,
    lng: location.lon,

    name: location.name,
    mission: mission.name,
    missionId: mission.id,
    kind: location.kind,
    accuracy: location.accuracy,
    country: mission.country,
    launchDate: mission.launch_date,
    agency: mission.agency
  }))  
);
  
  return ( 
     <div className="w-full h-full">
      <Globe
        ref={globeRef}
        globeImageUrl="/textures/mars-color.jpg"
        bumpImageUrl="/textures/texture-mars.jpg"
        bumpScale={0.8}

        backgroundColor="#05070a"
        animateIn={true}
        enablePointerInteraction={true} 
        showAtmosphere={true}
        atmosphereColor="#cb7b52"
        atmosphereAltitude={0.15}

        pointsData={marsPoints}
        pointLat="lat"
        pointLng="lng"

        pointAltitude={0.01}
        pointRadius={0.4}
        pointColor={() => "#ff6b4a"}

        pointLabel={(d) => `
          <div>
            <strong>${d.mission}</strong><br/>
            ${d.name}<br/>
            ${d.lat.toFixed(3)}°, ${d.lng.toFixed(3)}°
          </div>
        `}
      />
    </div>
  );
}


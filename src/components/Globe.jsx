import Globe from "react-globe.gl";
import surfaceMissions from "../assets/surfacemissions.json"





export default function MarsGlobe() {

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
        globeImageUrl="/textures/mars-color.jpg"
        bumpImageUrl="/textures/texture-mars.jpeg"
        bumpScale={0.15}

        backgroundColor="#05070a"
        animateIn={true}
        enablePointerInteraction={true}
        showAtmosphere={false}

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


import Globe from "react-globe.gl";

export default function MarsGlobe({ terrainEnabled = true }) {
  return (
    <div className="w-full h-full">
      <Globe
        width={window.innerWidth}
        height={window.innerHeight}
        globeImageUrl="/textures/mars-color.jpg"
        bumpImageUrl={
          terrainEnabled ? "/textures/mars-bump.jpeg" : null
        }
        bumpScale={0.15}
        backgroundColor="#05070a"
        animateIn={true}
        enablePointerInteraction={true}
      />
    </div>
  );
}
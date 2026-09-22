import { useEffect, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";

export default function MarsGlobe() {
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    const colorMap = loader.load('/textures/mars-color.jpg');
    colorMap.colorSpace = THREE.SRGBColorSpace; 
    const displacementMap = loader.load('/textures/texture-mars.jpg');
    
    const customMaterial = new THREE.MeshPhongMaterial({
      map: colorMap,
      bumpMap: displacementMap,
      bumpScale: 0.015,
      displacementMap: displacementMap,
      displacementScale: 3, 
    });

    setMaterial(customMaterial);
  }, []);

  return (
    <div className="w-full h-full">
      {material && (
        <Globe
          width={window.innerWidth}
          height={window.innerHeight}
          globeMaterial={material}
          backgroundColor="#05070a"
          animateIn={true}
          enablePointerInteraction={true}
          showAtmosphere={false}
        />
      )}
    </div> 
  );
}
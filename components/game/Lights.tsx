import React from 'react';
import { COLORS } from '../../constants';

interface LightsProps {}

const Lights: React.FC<LightsProps> = () => {
  return (
    <>
      <ambientLight intensity={0.5} color={COLORS.AMBIENT_LIGHT} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        color={COLORS.DIRECTIONAL_LIGHT}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 5, 0]} intensity={0.8} />
    </>
  );
};

export default Lights;
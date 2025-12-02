import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { BASKETBALL_RADIUS, COLORS } from '../../constants';

interface BasketballProps {}

const Basketball = forwardRef<THREE.Mesh, BasketballProps>((props, ref) => {
  return (
    <mesh ref={ref} {...props} name="basketball">
      <sphereGeometry args={[BASKETBALL_RADIUS, 32, 32]} />
      <meshStandardMaterial color={COLORS.BASKETBALL_ORANGE} />
    </mesh>
  );
});

export default Basketball;
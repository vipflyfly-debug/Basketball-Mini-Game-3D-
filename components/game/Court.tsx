import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { COLORS, COURT_SIZE } from '../../constants';

interface CourtProps {}

const Court: React.FC<CourtProps> = () => {
  return (
    <RigidBody type="fixed" colliders="cuboid" name="ground">
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[COURT_SIZE, COURT_SIZE]} />
        <meshStandardMaterial color={COLORS.COURT_BLUE} />
      </mesh>
    </RigidBody>
  );
};

export default Court;
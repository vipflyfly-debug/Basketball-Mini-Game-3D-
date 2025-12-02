import React from 'react';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { HOOP_HEIGHT, HOOP_RADIUS, HOOP_THICKNESS, BACKBOARD_WIDTH, BACKBOARD_HEIGHT, COLORS, BASKETBALL_RADIUS } from '../../constants';

interface HoopProps {}

const Hoop: React.FC<HoopProps> = () => {
  const polePosition: [number, number, number] = [0, HOOP_HEIGHT / 2, -HOOP_RADIUS * 2];
  const rimPosition: [number, number, number] = [0, HOOP_HEIGHT, 0];
  const backboardPosition: [number, number, number] = [0, HOOP_HEIGHT + BACKBOARD_HEIGHT / 2 - 0.1, -HOOP_RADIUS * 1.5]; // Adjusted Y for better alignment

  return (
    <>
      {/* Backboard */}
      <RigidBody type="fixed" colliders={false}>
        <mesh position={backboardPosition}>
          <boxGeometry args={[BACKBOARD_WIDTH, BACKBOARD_HEIGHT, 0.05]} />
          <meshStandardMaterial color={COLORS.BACKBOARD_WHITE} />
        </mesh>
        {/* Replaced Collider with CuboidCollider */}
        <CuboidCollider args={[BACKBOARD_WIDTH / 2, BACKBOARD_HEIGHT / 2, 0.5]} position={backboardPosition} name="hoopBackboard" />
      </RigidBody>

      {/* Rim */}
      <RigidBody type="fixed" colliders={false}>
        <mesh position={rimPosition} rotation-x={Math.PI / 2}>
          <torusGeometry args={[HOOP_RADIUS, HOOP_THICKNESS, 16, 32]} />
          <meshStandardMaterial color={COLORS.HOOP_RED} />
        </mesh>
        {/*
          Removed incorrect rotation={[Math.PI / 2, 0, 0]} from CylinderCollider.
          Adjusted args to create a horizontal disc with appropriate radius and thickness.
          args are [radius, halfHeight].
        */}
        <CylinderCollider args={[HOOP_RADIUS + BASKETBALL_RADIUS * 0.5, BASKETBALL_RADIUS * 0.5]} position={rimPosition} name="hoopRim" />
      </RigidBody>

      {/* Pole (Cosmetic, no collision needed for game rules) */}
      <mesh position={polePosition}>
        <cylinderGeometry args={[0.05, 0.05, HOOP_HEIGHT + 0.5, 16]} />
        <meshStandardMaterial color={COLORS.HOOP_RED} />
      </mesh>
    </>
  );
};

export default Hoop;
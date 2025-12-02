import React, { forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Basketball from './game/Basketball';
import Hoop from './game/Hoop';
import Court from './game/Court';
import Lights from './game/Lights';
import {
  BASKETBALL_RADIUS,
  HOOP_HEIGHT,
  SHOT_POWER_MULTIPLIER,
  RESET_POS_X_MIN,
  RESET_POS_X_MAX,
  RESET_POS_Z_MIN,
  RESET_POS_Z_MAX,
  RESET_POS_Y,
  HOOP_RADIUS,
  MAX_SHOT_DIRECTION_DEGREES, // Ensure this is imported for shoot function
} from '../constants';
import { GameCanvasRef } from '../types';

interface GameCanvasProps {
  onShotMade: () => void;
  onShotMissed: () => void;
  gameActive: boolean;
}

const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({ onShotMade, onShotMissed, gameActive }, ref) => {
  const basketballRef = useRef<THREE.Mesh | null>(null);
  const basketballRigidBodyRef = useRef<any>(null); // Use 'any' for Rapier's RigidBody API
  const isScoredRef = useRef(false); // To prevent multiple scores per shot for a single throw

  const resetBallPosition = useCallback(() => {
    console.log("resetBallPosition called.");
    if (basketballRigidBodyRef.current) {
      const randomX = Math.random() * (RESET_POS_X_MAX - RESET_POS_X_MIN) + RESET_POS_X_MIN;
      const randomZ = Math.random() * (RESET_POS_Z_MAX - RESET_POS_Z_MIN) + RESET_POS_Z_MIN;
      // Spawn slightly higher to avoid initial ground clipping AND add a tiny vertical randomness
      const newPosition = new THREE.Vector3(randomX, RESET_POS_Y + 0.5 + Math.random() * 0.1, randomZ); 
      
      console.log(`Ball RigidBody exists. Current pos (before reset): ${JSON.stringify(basketballRigidBodyRef.current.translation())}`);
      console.log(`Attempting to set ball to new position: ${JSON.stringify(newPosition)}`);

      basketballRigidBodyRef.current.setTranslation(newPosition, true);
      basketballRigidBodyRef.current.setLinvel(new THREE.Vector3(0, 0, 0), true);
      basketballRigidBodyRef.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
      basketballRigidBodyRef.current.wakeUp(); // Explicitly wake up the body to ensure it updates

      console.log(`Ball reset completed. New physical pos: ${JSON.stringify(basketballRigidBodyRef.current.translation())}`);
    } else {
      console.error("resetBallPosition: basketballRigidBodyRef.current is null.");
    }
  }, []);

  useImperativeHandle(ref, () => ({
    shoot: (power, directionY, directionX) => {
      console.log(`shoot called with power: ${power}, dirY: ${directionY}, dirX: ${directionX}`);
      if (!gameActive || !basketballRigidBodyRef.current) {
        console.warn("Shoot prevented: game not active or rigid body not available.");
        return;
      }

      const currentPos = basketballRigidBodyRef.current.translation();
      const origin = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);

      // Convert degrees to radians for shot direction
      const angleYRad = THREE.MathUtils.degToRad(directionY); // Horizontal rotation
      const angleXRad = THREE.MathUtils.degToRad(directionX); // Vertical rotation

      // Calculate the base direction vector (straight towards the hoop)
      const hoopPosition = new THREE.Vector3(0, HOOP_HEIGHT, 0);
      let direction = new THREE.Vector3().subVectors(hoopPosition, origin).normalize();

      // Apply horizontal rotation (around Y-axis)
      const rotationMatrixY = new THREE.Matrix4().makeRotationY(-angleYRad);
      direction.applyMatrix4(rotationMatrixY);

      // Apply vertical rotation (around X-axis relative to the ball's current 'forward' direction)
      const pitchDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
      const upVector = new THREE.Vector3(0, 1, 0);
      const rightVector = new THREE.Vector3().crossVectors(pitchDirection, upVector).normalize();
      const rotationMatrixX = new THREE.Matrix4().makeRotationAxis(rightVector, angleXRad);
      direction.applyMatrix4(rotationMatrixX);
      
      // Fine-tune vertical component based on shotDirectionX
      // Normalize angleXRad to a range of -1 to 1 for smooth transition
      // Adjusted to use simpler sine function for vertical component for more direct control
      direction.y = Math.max(0.1, Math.sin(angleXRad * Math.PI / 2)); // Ensure at least small upward
      direction.normalize(); // Re-normalize after adjusting y

      const force = direction.multiplyScalar(power * SHOT_POWER_MULTIPLIER);
      basketballRigidBodyRef.current.applyImpulse(force, true);
      isScoredRef.current = false; // Reset scoring state for new shot
      console.log(`Ball shot with force: ${JSON.stringify(force)}`);
    },
    resetBall: () => {
      console.log("resetBall (imperative handle) called.");
      resetBallPosition();
      isScoredRef.current = false; // Also reset scoring state on ball reset
    },
    clearScoreState: () => { // Method to clear score state from App.tsx
      console.log("clearScoreState called.");
      isScoredRef.current = false;
    }
  }));

  // Initial ball reset on mount
  React.useEffect(() => {
    let timeoutId: number | undefined;
    if (basketballRigidBodyRef.current) { // Check if ref is immediately available
        console.log("GameCanvas mounted. RigidBody ref available immediately. Calling resetBallPosition.");
        resetBallPosition();
        isScoredRef.current = false; // Ensure cleared on initial load
    } else { // Defer if not immediately available
        console.log("GameCanvas mounted. RigidBody ref not immediately available. Deferring resetBallPosition.");
        timeoutId = (window as any).setTimeout(() => {
            if (basketballRigidBodyRef.current) {
                console.log("Deferred resetBallPosition called after timeout.");
                resetBallPosition();
                isScoredRef.current = false;
            } else {
                console.error("Deferred resetBallPosition failed: basketballRigidBodyRef.current still null after 500ms timeout.");
            }
        }, 500); // Give it a bit more time for Rapier to initialize
    }

    return () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
    };
  }, [resetBallPosition]);

  const handleBallCollision = useCallback((event: any) => {
    // Safety check: ensure event and event.other are valid
    if (!event || !event.other) {
      console.warn("handleBallCollision: Invalid collision event received.");
      return;
    }

    // Only process collision if game is active and not already scored for this shot
    if (!gameActive || isScoredRef.current) return;

    // Get the object the ball collided with
    // Rapier event payload structure provides 'other' which contains the collider info
    const other = event.other;
    // Check both collider name (set explicitly on Collider components in Hoop.tsx) 
    // and rigid body name (set on RigidBody components in Court.tsx)
    const colliderName = other.colliderObject?.name || other.rigidBodyObject?.name;
    
    // Get ball's current position for potential height checks
    const ballPos = basketballRigidBodyRef.current?.translation();

    console.log(`Collision detected with: ${colliderName}`); // Debug log

    // Score if ball hits the backboard OR the rim
    // Logic simplified: Any contact with these components counts as a score.
    if (colliderName === 'hoopBackboard') {
      onShotMade();
      isScoredRef.current = true;
      console.log(`SCORE! Hit ${colliderName}.`);
    } else if (colliderName === 'hoopRim') {
      // Basic height check for rim to prevent scoring from directly underneath
      if (ballPos && ballPos.y > HOOP_HEIGHT - HOOP_RADIUS * 0.5) {
        onShotMade();
        isScoredRef.current = true;
        console.log(`SCORE! Hit ${colliderName}. Ball Y: ${ballPos.y}, Threshold: ${HOOP_HEIGHT - HOOP_RADIUS * 0.5}`);
      } else {
        console.log(`MISS! Hit ${colliderName} too low. Ball Y: ${ballPos?.y}, Threshold: ${HOOP_HEIGHT - HOOP_RADIUS * 0.5}`);
        onShotMissed(); // Consider a low rim hit a miss
      }
    }
    // If ball hits the ground (and hasn't scored yet), it's a miss
    else if (colliderName === 'ground' && !isScoredRef.current) {
      onShotMissed();
      console.log('MISS! Ground hit.');
    }
  }, [gameActive, onShotMade, onShotMissed, HOOP_HEIGHT, HOOP_RADIUS]); // Added HOOP_HEIGHT, HOOP_RADIUS to dependency array for useCallback

  return (
    <Canvas
      shadows
      camera={{ position: [0, HOOP_HEIGHT + 2, 8], fov: 60 }} // Adjusted camera position for better view
      style={{ background: 'linear-gradient(to top, #77BBDD, #B0E0E6)' }} // Sky gradient
    >
      <PerspectiveCamera makeDefault position={[0, HOOP_HEIGHT + 2, 8]} fov={60} />
      <OrbitControls target={[0, HOOP_HEIGHT / 2, 0]} enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.1} />

      <Lights />

      <Physics gravity={[0, -9.81, 0]}>
        <RigidBody
          ref={basketballRigidBodyRef}
          colliders="ball"
          mass={0.5}
          restitution={0.7}
          friction={0.5}
          onCollisionEnter={handleBallCollision}
          canSleep={false} // Keep ball awake to detect all collisions
        >
          <Basketball ref={basketballRef} />
        </RigidBody>
        <Hoop />
        <Court />
      </Physics>
    </Canvas>
  );
});

export default GameCanvas;
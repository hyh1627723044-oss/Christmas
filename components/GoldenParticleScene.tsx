
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Center, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generatePositions } from '../utils/shapeGenerator';

const PARTICLE_COUNT = 5000;
const GLOW_PARTICLE_COUNT = 800;

interface ParticleProps {
  currentShape: ShapeType;
  onInteract: () => void;
}

const Particles: React.FC<ParticleProps> = ({ currentShape, onInteract }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const glowRef = useRef<THREE.Points>(null!);
  const fireworkStartTime = useRef<number>(0);
  
  const isFirework = currentShape === ShapeType.FIREWORK;
  
  const targetPositions = useMemo(() => generatePositions(currentShape), [currentShape]);
  const currentPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const glowPositions = useMemo(() => new Float32Array(GLOW_PARTICLE_COUNT * 3), []);
  
  useEffect(() => {
    // Initial setup
    const initial = generatePositions(currentShape);
    for (let i = 0; i < initial.length; i++) {
      currentPositions[i] = initial[i];
    }
  }, []);

  // Handle shape transitions
  useEffect(() => {
    if (isFirework && pointsRef.current) {
      fireworkStartTime.current = performance.now() / 1000;
      
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      // Start all particles at the bottom center for the "launch"
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -12; // Far bottom
        positions[i * 3 + 2] = 0;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      if (glowRef.current) {
        const gp = glowRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < GLOW_PARTICLE_COUNT; i++) {
          gp[i * 3] = 0;
          gp[i * 3 + 1] = -12;
          gp[i * 3 + 2] = 0;
        }
        glowRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  }, [currentShape, isFirework]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const now = state.clock.elapsedTime;
    
    let lerpSpeed = 0.045;
    let isRising = false;

    if (isFirework) {
      const elapsed = now - fireworkStartTime.current;
      const launchDuration = 1.0; // Seconds to reach center
      
      if (elapsed < launchDuration) {
        isRising = true;
        lerpSpeed = 0.15; // Faster during ascent
        const progress = elapsed / launchDuration;
        const currentY = -12 + progress * 12; // Travel from -12 to 0

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          // Clustered ascent with a bit of "rocket tail" jitter
          const tailJitter = (Math.random() - 0.5) * 0.5;
          positions[i * 3] += (0 - positions[i * 3]) * lerpSpeed;
          positions[i * 3 + 1] += (currentY - positions[i * 3 + 1]) * lerpSpeed + tailJitter;
          positions[i * 3 + 2] += (0 - positions[i * 3 + 2]) * lerpSpeed;
        }
      } else {
        // Burst phase
        lerpSpeed = 0.09;
        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
          const jitter = (Math.random() - 0.5) * 0.02;
          positions[i] += (targetPositions[i] - positions[i]) * lerpSpeed + jitter;
        }
      }
    } else {
      // Normal shape lerping
      for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const jitter = (Math.random() - 0.5) * 0.01;
        positions[i] += (targetPositions[i] - positions[i]) * lerpSpeed + jitter;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Glow/Radiance layer logic
    if (glowRef.current) {
      const gp = glowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < GLOW_PARTICLE_COUNT; i++) {
        const targetIdx = (i * 6) % (PARTICLE_COUNT * 3);
        // During rise, glow follows the head of the rocket
        const tx = isRising ? 0 : targetPositions[targetIdx];
        const ty = isRising ? positions[1] : targetPositions[targetIdx + 1];
        const tz = isRising ? 0 : targetPositions[targetIdx + 2];
        
        gp[i * 3] += (tx - gp[i * 3]) * (lerpSpeed * 0.8);
        gp[i * 3 + 1] += (ty - gp[i * 3 + 1]) * (lerpSpeed * 0.8);
        gp[i * 3 + 2] += (tz - gp[i * 3 + 2]) * (lerpSpeed * 0.8);
      }
      glowRef.current.geometry.attributes.position.needsUpdate = true;
      glowRef.current.rotation.y = pointsRef.current.rotation.y;
    }

    // Dynamic rotation
    const baseRot = currentShape === ShapeType.DIAMOND ? 0.8 : (isFirework && !isRising ? 1.5 : 0.3);
    pointsRef.current.rotation.y += delta * baseRot;
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onInteract(); }}>
      {/* Main Particles */}
      <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FFD700"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.9}
        />
      </Points>
      
      {/* Soft Radiance Layer */}
      <Points ref={glowRef} positions={glowPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FFFACD"
          size={0.45}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={currentShape === ShapeType.DIAMOND || isFirework ? 0.35 : 0.05}
        />
      </Points>
    </group>
  );
};

export const GoldenParticleScene: React.FC<ParticleProps> = ({ currentShape, onInteract }) => {
  return (
    <div className="w-full h-screen bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#020202']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#FFD700" intensity={6} />
        <pointLight position={[-10, -5, -10]} color="#fff" intensity={1} />
        <Center>
          <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.2}>
            <Particles currentShape={currentShape} onInteract={onInteract} />
          </Float>
        </Center>
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={7} 
          maxDistance={25}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

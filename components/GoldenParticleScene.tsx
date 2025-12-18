
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Center, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generatePositions } from '../utils/shapeGenerator';

const PARTICLE_COUNT = 5000;

interface ParticleProps {
  currentShape: ShapeType;
  onInteract: () => void;
}

const Particles: React.FC<ParticleProps> = ({ currentShape, onInteract }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const [targetPositions, setTargetPositions] = useState<Float32Array>(() => generatePositions(currentShape));
  const currentPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  
  // Initialize current positions
  useEffect(() => {
    const initial = generatePositions(currentShape);
    for (let i = 0; i < initial.length; i++) {
      currentPositions[i] = initial[i];
    }
  }, []);

  // When shape changes, generate new targets
  useEffect(() => {
    setTargetPositions(generatePositions(currentShape));
  }, [currentShape]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const lerpSpeed = 0.05;

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      positions[i] += (targetPositions[i] - positions[i]) * lerpSpeed;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.2;
  });

  return (
    <Points
      ref={pointsRef}
      positions={currentPositions}
      stride={3}
      frustumCulled={false}
      onClick={(e) => {
        e.stopPropagation();
        onInteract();
      }}
    >
      <PointMaterial
        transparent
        color="#FFD700"
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export const GoldenParticleScene: React.FC<ParticleProps> = ({ currentShape, onInteract }) => {
  return (
    <div className="w-full h-screen bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#FFD700" intensity={2} />
        <Center>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Particles currentShape={currentShape} onInteract={onInteract} />
          </Float>
        </Center>
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

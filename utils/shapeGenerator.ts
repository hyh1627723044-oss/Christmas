
import { ShapeType } from '../types';

const PARTICLE_COUNT = 5000;

export const generatePositions = (shape: ShapeType): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ShapeType.TREE: {
        const height = Math.random() * 10;
        const radius = (1 - height / 10) * 4;
        const angle = Math.random() * Math.PI * 2;
        x = Math.cos(angle) * radius * Math.sqrt(Math.random());
        y = height - 5;
        z = Math.sin(angle) * radius * Math.sqrt(Math.random());
        // Add some random star points on top
        if (i > PARTICLE_COUNT * 0.95) {
          const sAngle = Math.random() * Math.PI * 2;
          const sDist = Math.random() * 0.5;
          x = Math.cos(sAngle) * sDist;
          y = 5.2 + Math.random() * 0.5;
          z = Math.sin(sAngle) * sDist;
        }
        break;
      }
      case ShapeType.STAR: {
        const spikes = 5;
        const outerRadius = 5;
        const innerRadius = 2.5;
        const angle = Math.random() * Math.PI * 2;
        const section = Math.floor((angle / (Math.PI * 2)) * spikes * 2);
        const r = section % 2 === 0 ? outerRadius : innerRadius;
        const dist = Math.random() * r;
        x = Math.cos(angle) * dist;
        y = Math.sin(angle) * dist;
        z = (Math.random() - 0.5) * 1;
        break;
      }
      case ShapeType.FIREWORK: {
        const radius = 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.pow(Math.random(), 0.3); // Concentrated at shell
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ShapeType.HEART: {
        const t = Math.random() * Math.PI * 2;
        const r = 0.3;
        x = r * (16 * Math.pow(Math.sin(t), 3));
        y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        z = (Math.random() - 0.5) * 2;
        x *= 0.8;
        y *= 0.8;
        break;
      }
      case ShapeType.AIRPLANE: {
        const part = Math.random();
        if (part < 0.4) { // Body
          x = (Math.random() - 0.5) * 1.5;
          y = (Math.random() - 0.5) * 8;
          z = (Math.random() - 0.5) * 1.5;
        } else if (part < 0.8) { // Wings
          x = (Math.random() - 0.5) * 10;
          y = (Math.random() - 0.5) * 1.5;
          z = (Math.random() - 0.5) * 0.5;
        } else { // Tail
          x = (Math.random() - 0.5) * 3;
          y = -4 + Math.random() * 1.5;
          z = (Math.random() - 0.5) * 2;
        }
        break;
      }
      case ShapeType.TOOTHBRUSH: {
        const part = Math.random();
        if (part < 0.7) { // Handle
          x = (Math.random() - 0.5) * 1;
          y = (Math.random() - 0.5) * 10;
          z = (Math.random() - 0.5) * 0.5;
        } else { // Bristles
          x = (Math.random() - 0.5) * 1.5;
          y = 4 + Math.random() * 2;
          z = 0.5 + Math.random() * 1.5;
        }
        break;
      }
      case ShapeType.SOCK: {
        const part = Math.random();
        if (part < 0.6) { // Leg
          x = (Math.random() - 0.5) * 2.5;
          y = (Math.random() - 0.5) * 6;
          z = (Math.random() - 0.5) * 1.5;
        } else { // Foot
          x = (Math.random() - 0.5) * 2.5;
          y = -3 + (Math.random() - 0.5) * 2;
          z = 1.5 + Math.random() * 4;
        }
        break;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
};

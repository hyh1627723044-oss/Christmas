
import { ShapeType } from '../types';

const PARTICLE_COUNT = 5000;

export const generatePositions = (shape: ShapeType): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  // Helper for sampling a point on a triangle face
  const sampleTriangle = (v1: number[], v2: number[], v3: number[]) => {
    let r1 = Math.random();
    let r2 = Math.random();
    if (r1 + r2 > 1) {
      r1 = 1 - r1;
      r2 = 1 - r2;
    }
    const r3 = 1 - r1 - r2;
    return [
      r1 * v1[0] + r2 * v2[0] + r3 * v3[0],
      r1 * v1[1] + r2 * v2[1] + r3 * v3[1],
      r1 * v1[2] + r2 * v2[2] + r3 * v3[2]
    ];
  };

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
        if (i > PARTICLE_COUNT * 0.96) {
          const sAngle = Math.random() * Math.PI * 2;
          const sDist = Math.random() * 0.6;
          x = Math.cos(sAngle) * sDist;
          y = 5.2 + (Math.random() - 0.5) * 0.4;
          z = Math.sin(sAngle) * sDist;
        }
        break;
      }

      case ShapeType.DIAMOND: {
        const segments = 12;
        const radiusTable = 2.2;
        const radiusGirdle = 3.8;
        const heightCrown = 1.2;
        const heightPavilion = 4.5;
        const yGirdle = 0.5;
        const part = Math.random();
        if (part < 0.15) {
          const r = Math.sqrt(Math.random()) * radiusTable;
          const a = Math.random() * Math.PI * 2;
          x = Math.cos(a) * r;
          y = yGirdle + heightCrown;
          z = Math.sin(a) * r;
        } else {
          const seg = Math.floor(Math.random() * segments);
          const a1 = (seg / segments) * Math.PI * 2;
          const a2 = ((seg + 1) / segments) * Math.PI * 2;
          if (part < 0.5) {
            const vTable1 = [Math.cos(a1) * radiusTable, yGirdle + heightCrown, Math.sin(a1) * radiusTable];
            const vTable2 = [Math.cos(a2) * radiusTable, yGirdle + heightCrown, Math.sin(a2) * radiusTable];
            const vGirdle1 = [Math.cos(a1) * radiusGirdle, yGirdle, Math.sin(a1) * radiusGirdle];
            const vGirdle2 = [Math.cos(a2) * radiusGirdle, yGirdle, Math.sin(a2) * radiusGirdle];
            const tri = Math.random() > 0.5 ? sampleTriangle(vTable1, vTable2, vGirdle1) : sampleTriangle(vTable2, vGirdle1, vGirdle2);
            [x, y, z] = tri;
          } else {
            const vGirdle1 = [Math.cos(a1) * radiusGirdle, yGirdle, Math.sin(a1) * radiusGirdle];
            const vGirdle2 = [Math.cos(a2) * radiusGirdle, yGirdle, Math.sin(a2) * radiusGirdle];
            const vBottom = [0, yGirdle - heightPavilion, 0];
            const tri = sampleTriangle(vGirdle1, vGirdle2, vBottom);
            [x, y, z] = tri;
          }
        }
        break;
      }

      case ShapeType.MAGAZINE: {
        const w = 4.2; const h = 6.0; const d = 0.35;
        const side = Math.random();
        if (side < 0.85) {
            x = (Math.random() - 0.5) * w;
            y = (Math.random() - 0.5) * h;
            z = (Math.random() > 0.5 ? 1 : -1) * (d / 2);
            z += Math.pow(x + w/2, 2) * 0.02;
        } else {
            const edge = Math.random();
            if (edge < 0.33) { x = -w/2; y = (Math.random() - 0.5) * h; z = (Math.random() - 0.5) * d; }
            else if (edge < 0.66) { x = (Math.random() - 0.5) * w; y = (Math.random() > 0.5 ? 1 : -1) * (h/2); z = (Math.random() - 0.5) * d; }
            else { x = w/2; y = (Math.random() - 0.5) * h; z = (Math.random() - 0.5) * d; }
        }
        break;
      }

      case ShapeType.BELL: {
        const u = Math.random();
        const v = Math.random() * Math.PI * 2;
        const height = 5.5;
        const yPos = (u - 0.5) * height;
        const radius = 1.6 + Math.pow(Math.max(0, -yPos + 1.8), 1.6) * 0.75;
        x = Math.cos(v) * radius; y = yPos; z = Math.sin(v) * radius;
        if (i > PARTICLE_COUNT * 0.92) {
          x = (Math.random() - 0.5) * 0.8; y = -3.2 + (Math.random() - 0.5) * 0.8; z = (Math.random() - 0.5) * 0.8;
        }
        break;
      }

      case ShapeType.FIREWORK: {
        // --- 烟花算法：射线式爆炸 ---
        const numRays = 24; // 24条主要爆炸射线
        const rayIndex = i % numRays;
        
        // 为每条射线计算一个固定的方向
        const phi = Math.acos(2 * (rayIndex / numRays) - 1);
        const theta = Math.sqrt(numRays * Math.PI) * phi; 
        // 稍微加点随机抖动
        const jitteredPhi = phi + (Math.random() - 0.5) * 0.2;
        const jitteredTheta = theta + (Math.random() - 0.5) * 0.2;

        const maxRadius = 6.5 + Math.random() * 2.0;
        // 粒子沿着射线分布，靠近末端的粒子更多
        const t = Math.pow(Math.random(), 0.6); 
        const r = t * maxRadius;

        x = r * Math.sin(jitteredPhi) * Math.cos(jitteredTheta);
        y = r * Math.sin(jitteredPhi) * Math.sin(jitteredTheta);
        z = r * Math.cos(jitteredPhi);

        // 添加中心闪烁的核心粒子
        if (i % 10 === 0) {
           const coreR = Math.random() * 1.5;
           const a = Math.random() * Math.PI * 2;
           const b = Math.random() * Math.PI;
           x = coreR * Math.sin(b) * Math.cos(a);
           y = coreR * Math.sin(b) * Math.sin(a);
           z = coreR * Math.cos(b);
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

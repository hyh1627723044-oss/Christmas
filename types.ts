
export enum ShapeType {
  TREE = 'TREE',
  DIAMOND = 'DIAMOND',
  MAGAZINE = 'MAGAZINE',
  BELL = 'BELL',
  FIREWORK = 'FIREWORK'
}

export interface ParticleState {
  positions: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
}

export interface ChristmasBlessing {
  shape: ShapeType;
  message: string;
  title: string;
}

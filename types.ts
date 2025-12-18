
export enum ShapeType {
  TREE = 'TREE',
  STAR = 'STAR',
  FIREWORK = 'FIREWORK',
  HEART = 'HEART',
  AIRPLANE = 'AIRPLANE',
  TOOTHBRUSH = 'TOOTHBRUSH',
  SOCK = 'SOCK'
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
